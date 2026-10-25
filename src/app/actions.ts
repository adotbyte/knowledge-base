'use server';

import prisma from './prisma';
import { revalidatePath } from 'next/cache';
import { GoogleGenAI } from '@google/genai';
import { writeFile, mkdir, access } from 'fs/promises';
import { constants } from 'fs';
import { join } from 'path';
import { redirect } from 'next/navigation';

// 1. CREATE NOTE
export async function createNote(formData: FormData) {
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const tagsString = formData.get('tags') as string; 
  const files = formData.getAll('files') as File[];

  if (!title || !content) {
    throw new Error('Title and content are required.');
  }

  const tagNames = tagsString 
    ? tagsString.split(',').map(tag => tag.trim()).filter(Boolean) 
    : [];

  // Sukuriame užrašą DB
  const note = await prisma.note.create({
    data: {
      title,
      content,
      userId: "admin",
      tags: {
        connectOrCreate: tagNames.map((tagName) => ({
          where: { name: tagName },
          create: { name: tagName },
        })),
      },
    },
  });

  // Tvarkome failus
  if (files && files.length > 0 && files[0].size > 0) {
    const uploadDir = join(process.cwd(), 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const apiKey = process.env.GEMINI_API_KEY;
    const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

    for (const file of files) {
      if (file.size === 0) continue;
      
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const filePath = join(uploadDir, uniqueName);
      await writeFile(filePath, buffer);

      let aiDescription = '';

      // Jei tai paveikslėlis ir turime AI raktą, analizuojame
      if (ai && file.type.startsWith('image/')) {
        try {
          const base64Image = buffer.toString('base64');
          
          const response = await ai.interactions.create({
            model: 'gemini-3.8-flash',
            input: [
              { type: 'text', text: 'Describe this image briefly. If it contains text or code, extract it. If it is an error message, suggest a fix. Respond in Lithuanian.' },
              { type: 'image', data: base64Image, mime_type: file.type }
            ],
          });
          
          if (response.output_text) {
            aiDescription = `\n\n---\n### 🖼️ AI Image Analysis (${file.name})\n${response.output_text}`;
          }
        } catch (e) {
          console.error('AI Image Analysis failed:', e);
        }
      }
            // Papildomas patikrinimas, ar failas tikrai yra
      try {
        await access(filePath, constants.F_OK);
      } catch (e) {
        console.error('Failas nebuvo įrašytas:', e);
        continue;
      }

      await prisma.attachment.create({
        data: {
          name: file.name,
          url: `/api/uploads/${uniqueName}`,
          type: file.type,
          size: file.size,
          noteId: note.id,
        },
      });

      if (aiDescription) {
        await prisma.note.update({
          where: { id: note.id },
          data: { content: note.content + aiDescription },
        });
      }
    }
  }

  revalidatePath('/', 'page');
}

// 2. DELETE NOTE
export async function deleteNote(formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) return;

  await prisma.note.delete({
    where: { id: id, userId: "admin" },
  });

  revalidatePath('/', 'page');
}

// 3. TOGGLE SHARE
export async function toggleShare(formData: FormData) {
  const id = formData.get('id') as string;
  const isPublic = formData.get('isPublic') === 'true';
  if (!id) return;

  await prisma.note.update({
    where: { id, userId: "admin" },
    data: { isPublic: !isPublic },
  });

  revalidatePath('/', 'page');
}

// 4. UPDATE NOTE
export async function updateNote(id: string, formData: FormData) {
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const tagsString = formData.get('tags') as string;
  const files = formData.getAll('files') as File[];

  if (!title || !content) {
    throw new Error('Title and content are required.');
  }

  // 1. Išsaugome senąją versiją prieš atnaujinimą
  const oldNote = await prisma.note.findUnique({
    where: { id, userId: "admin" },
  });

  if (oldNote) {
    await prisma.noteVersion.create({
      data: {
        title: oldNote.title,
        content: oldNote.content,
        noteId: oldNote.id,
      },
    });
  }

  const tagNames = tagsString 
    ? tagsString.split(',').map(tag => tag.trim()).filter(Boolean) 
    : [];

  // 2. Atnaujiname užrašą
  await prisma.note.update({
    where: { id: id, userId: "admin" },
    data: {
      title,
      content,
      tags: {
        set: [],
        connectOrCreate: tagNames.map((tagName) => ({
          where: { name: tagName },
          create: { name: tagName },
        })),
      },
    },
  });

  // 3. Tvarkome naujus failus
  if (files && files.length > 0 && files[0].size > 0) {
    const uploadDir = join(process.cwd(), 'uploads');
    await mkdir(uploadDir, { recursive: true });

    for (const file of files) {
      if (file.size === 0) continue;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const filePath = join(uploadDir, uniqueName);
      await writeFile(filePath, buffer);

      await prisma.attachment.create({
        data: {
          name: file.name,
          url: `/api/uploads/${uniqueName}`,
          type: file.type,
          size: file.size,
          noteId: id,
        },
      });
    }
  }

  revalidatePath('/', 'page');
  redirect('/');
}

// 5. AI SUMMARIZE
export async function summarizeNote(formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) return;

  const note = await prisma.note.findUnique({
    where: { id, userId: "admin" },
  });

  if (!note) throw new Error('Note not found');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is missing');

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `You are a helpful assistant. Please summarize the following note in 2-3 bullet points in the same language as the note. Note title: "${note.title}". Note content: "${note.content}"`;

  const response = await ai.interactions.create({
    model: 'gemini-3.8-flash',
    input: prompt,
  });

  const summary = response.output_text || "No response generated.";

  await prisma.note.update({
    where: { id: note.id },
    data: { content: `${note.content}\n\n---\n### 🤖 AI Summary\n${summary}` },
  });
}

// 6. AI IMPROVE
export async function improveNote(formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) return;

  const note = await prisma.note.findUnique({
    where: { id, userId: "admin" },
  });

  if (!note) throw new Error('Note not found');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is missing');

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `You are an expert technical writer. Improve the following note. Fix grammar, format code blocks, make explanations clearer. Return ONLY the improved Markdown content. Note title: "${note.title}"\nNote content:\n${note.content}`;

  const response = await ai.interactions.create({
    model: 'gemini-3.8-flash',
    input: prompt,
  });

  const improvedContent = response.output_text || note.content;

  await prisma.note.update({
    where: { id: note.id },
    data: { content: improvedContent },
  });
}

// 7. AI GENERATE NOTE
export async function generateNote(formData: FormData) {
  const topic = formData.get('topic') as string;
  if (!topic) throw new Error('Topic is required');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is missing');

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `You are an expert software engineer. Write a comprehensive Markdown note about: "${topic}". Use code blocks for commands. Do NOT include conversational filler. Just output the Markdown content.`;

  const response = await ai.interactions.create({
    model: 'gemini-3.8-flash',
    input: prompt,
  });

  const generatedContent = response.output_text || 'Failed to generate content.';
  const title = topic.length > 50 ? topic.substring(0, 50) + '...' : topic;

  await prisma.note.create({
    data: {
      title: title,
      content: generatedContent,
      userId: "admin",
      tags: {
        connectOrCreate: {
          where: { name: 'AI Generated' },
          create: { name: 'AI Generated' },
        },
      },
    },
  });

  revalidatePath('/', 'page');
}

// 8. ASK AI (RAG)
export async function askKnowledgeBase(query: string) {
  const notes = await prisma.note.findMany({
    where: { userId: "admin" },
    include: { tags: true },
    orderBy: { createdAt: 'desc' },
    take: 15,
  });

  if (notes.length === 0) return "Your knowledge base is empty.";

  const context = notes.map(note => {
    const tags = note.tags.map(t => `#${t.name}`).join(', ');
    return `--- NOTE: ${note.title} (Tags: ${tags}) ---\n${note.content}`;
  }).join('\n\n');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is missing');

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `You are a personal AI assistant. Answer the question using ONLY the information from the notes. If not found, say "I couldn't find this information." Mention the note title you used. Respond in the same language as the question.\n\nMY NOTES:\n${context}\n\nQUESTION:\n${query}`;

  const response = await ai.interactions.create({
    model: 'gemini-3.8-flash',
    input: prompt,
  });

  return response.output_text || "No response generated.";
}

// 9. EXPORT NOTES
export async function exportNotes() {
  const notes = await prisma.note.findMany({
    where: { userId: "admin" },
    include: { tags: true },
    orderBy: { createdAt: 'desc' },
  });

  let markdownContent = `# My Knowledge Base Export\n\nExported on: ${new Date().toLocaleString()}\n\n---\n\n`;

  notes.forEach((note) => {
    markdownContent += `## ${note.title}\n\n`;
    if (note.tags.length > 0) {
      markdownContent += `**Tags:** ${note.tags.map(t => `#${t.name}`).join(', ')}\n\n`;
    }
    markdownContent += `${note.content}\n\n---\n\n`;
  });

  return markdownContent;
}

// Review Code
export async function reviewCode(formData: FormData) {
  const code = formData.get('code') as string;
  const language = formData.get('language') as string || 'unknown';

  if (!code) throw new Error('Code is required');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is missing');

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are an expert code reviewer. Analyze the following ${language} code.
Provide your response in Markdown format with the following sections:
1. **Summary**: A brief overview of what the code does.
2. **Issues**: Any bugs, security vulnerabilities, or bad practices (if none, say "No major issues found").
3. **Improvements**: Suggestions for optimization, readability, or performance.
4. **Refactored Code**: (Optional) Provide an improved version of the code.

CODE TO REVIEW:
\`\`\`${language}
${code}
\`\`\`

Respond in the same language as the code comments (if any). Be concise but thorough.`;

  try {
    const response = await ai.interactions.create({
      model: 'gemini-3.8-flash',
      input: prompt,
    });

    return response.output_text || "No response generated.";
  } catch (error) {
    console.error('AI Code Review Error:', error);
    throw new Error('Failed to review code');
  }
}

// AI Config Generator
export async function generateConfig(formData: FormData) {
  const serviceName = formData.get('serviceName') as string;
  const requirements = formData.get('requirements') as string || '';

  if (!serviceName) throw new Error('Service name is required');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is missing');

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are a DevOps expert. Generate a production-ready configuration for the following service: "${serviceName}".
Requirements: ${requirements || 'Standard secure setup'}.

Please provide:
1. A complete \`docker-compose.yml\` file (with proper environment variables, volumes, and networks).
2. Any required \`.env\` variables.
3. A brief explanation of the key security or performance settings.

Return the response in Markdown format with code blocks.`;

  const response = await ai.interactions.create({
    model: 'gemini-3.8-flash',
    input: prompt,
  });

  return response.output_text || "No response generated.";
}

// AI Code Explainer
export async function explainCode(formData: FormData) {
  const code = formData.get('code') as string;
  if (!code) throw new Error('Code is required');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is missing');

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Explain the following code to a junior developer. 
Break it down line by line or block by block. Explain WHY it's written this way.
Use simple language (Lithuanian).

CODE:
\`\`\`
${code}
\`\`\``;

  const response = await ai.interactions.create({
    model: 'gemini-3.8-flash',
    input: prompt,
  });

  return response.output_text || "No response generated.";
}

// File share
export async function toggleFileShare(formData: FormData) {
  const id = formData.get('id') as string;
  const isPublic = formData.get('isPublic') === 'true';
  if (!id) return;

  await prisma.attachment.update({
    where: { id },
    data: { isPublic: !isPublic },
  });

  revalidatePath('/');
}

// Globali paieška (dažnai vadinama Command Palette arba Cmd + K meniu) 
export async function searchNotes(query: string) {
  if (!query || query.trim().length === 0) return [];

  const notes = await prisma.note.findMany({
    where: {
      userId: "admin",
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
        { tags: { some: { name: { contains: query, mode: 'insensitive' } } } },
      ],
    },
    select: {
      id: true,
      title: true,
      content: true,
    },
    take: 10, // Rodome tik 10 geriausių rezultatų
  });

  return notes;
}
