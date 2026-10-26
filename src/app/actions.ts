'use server';

import prisma from './prisma';
import { revalidatePath } from 'next/cache';
import { GoogleGenAI } from '@google/genai';
import { writeFile, mkdir, access } from 'fs/promises';
import { constants } from 'fs';
import { join } from 'path';
import { redirect } from 'next/navigation';

// Pagalbinė funkcija vartotojo ID gauti
async function getUserId() {
  // Cloudflare Access jau mus apsaugojo, todėl naudojame fiksuotą vartotoją
  return "admin";
}

// 1. CREATE NOTE
export async function createNote(formData: FormData) {
  const userId = await getUserId();
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

  const note = await prisma.note.create({
    data: {
      title,
      content,
      userId: userId, // <-- Dinaminis ID
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

    for (const file of files) {
      if (file.size === 0) continue;
      
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const filePath = join(uploadDir, uniqueName);
      
      // 1. PIRMA įrašome failą į diską
      await writeFile(filePath, buffer);

      try {
        await access(filePath, constants.F_OK);
      } catch (e) {
        console.error('Failas nebuvo įrašytas:', e);
        continue;
      }

      // 2. Įrašome į duomenų bazę (tai turi įvykti prieš AI)
      const attachment = await prisma.attachment.create({
        data: {
          name: file.name,
          url: `/api/uploads/${uniqueName}`,
          type: file.type,
          size: file.size,
          noteId: note.id,
        },
      });

      // 3. TIK DABAR bandome AI analizę (jei ji lūžta, failas jau yra saugus)
      let aiDescription = '';
      const apiKey = process.env.GEMINI_API_KEY;
      const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

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

      // PDF analizė (įjungta)
      if (ai && file.type === 'application/pdf') {
        try {
          const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
          
          // Nurodome worker failo kelią
          pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
          
          const uint8Array = new Uint8Array(buffer);
          const pdf = await pdfjs.getDocument({ data: uint8Array }).promise;
          
          const page = await pdf.getPage(1);
          const textContent = await page.getTextContent();
          const extractedText = textContent.items
            .map((item: any) => item.str)
            .join(' ')
            .substring(0, 4000);

          const response = await ai.interactions.create({
            model: 'gemini-3.8-flash',
            input: `You are a helpful assistant. I will provide you with text extracted from a PDF document. Please summarize its contents in 3-4 bullet points in Lithuanian. If it's an invoice or document with key data, extract the main numbers, dates, and names.\n\nPDF CONTENT:\n${extractedText}`,
          });

          if (response.output_text) {
            aiDescription = `\n\n---\n### 📄 AI PDF Analysis (${file.name})\n${response.output_text}`;
          }
        } catch (e) {
          console.error('AI PDF Analysis failed:', e);
        }
      }

      // 4. Jei AI ką nors aprašė, pridedame prie užrašo turinio
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
  const userId = await getUserId();
  const id = formData.get('id') as string;
  if (!id) return;

  await prisma.note.delete({
    where: { id: id, userId: userId },
  });

  revalidatePath('/', 'page');
}

// 3. TOGGLE SHARE
export async function toggleShare(formData: FormData) {
  const userId = await getUserId();
  const id = formData.get('id') as string;
  const isPublic = formData.get('isPublic') === 'true';
  if (!id) return;

  await prisma.note.update({
    where: { id, userId: userId },
    data: { isPublic: !isPublic },
  });

  revalidatePath('/', 'page');
}

// 4. UPDATE NOTE
export async function updateNote(id: string, formData: FormData) {
  const userId = await getUserId();
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const tagsString = formData.get('tags') as string;
  const files = formData.getAll('files') as File[];

  if (!title || !content) {
    throw new Error('Title and content are required.');
  }

  const oldNote = await prisma.note.findUnique({
    where: { id, userId: userId },
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

  await prisma.note.update({
    where: { id: id, userId: userId },
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
  const userId = await getUserId();
  const id = formData.get('id') as string;
  if (!id) return;

  const note = await prisma.note.findUnique({
    where: { id, userId: userId },
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
  const userId = await getUserId();
  const id = formData.get('id') as string;
  if (!id) return;

  const note = await prisma.note.findUnique({
    where: { id, userId: userId },
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
  const userId = await getUserId();
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
      userId: userId,
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
  const userId = await getUserId();
  const notes = await prisma.note.findMany({
    where: { userId: userId },
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
  const userId = await getUserId();
  const notes = await prisma.note.findMany({
    where: { userId: userId },
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
  await getUserId(); // Patikriname, ar prisijungęs
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
  await getUserId();
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
  await getUserId();
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
  await getUserId();
  const id = formData.get('id') as string;
  const isPublic = formData.get('isPublic') === 'true';
  if (!id) return;

  await prisma.attachment.update({
    where: { id },
    data: { isPublic: !isPublic },
  });

  revalidatePath('/');
}

// Globali paieška
export async function searchNotes(query: string) {
  await getUserId();
  if (!query || query.trim().length === 0) return [];

  const notes = await prisma.note.findMany({
    where: {
      userId: (await getUserId()), // <-- Dinaminis ID
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
        { tags: { some: { name: { contains: query, mode: 'insensitive' } } } },
        { attachments: { some: { name: { contains: query, mode: 'insensitive' } } } },
      ],
    },
    select: {
      id: true,
      title: true,
      content: true,
      attachments: { select: { name: true } },
    },
    take: 10,
  });

  return notes;
}

// --- DOCKER MANAGEMENT ACTIONS ---

export async function getDockerContainers() {
  await getUserId();
  try {
    const res = await fetch('http://socket-proxy:2375/containers/json?all=true', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch containers');
    
    const data = await res.json();
    return data.map((c: any) => ({
      id: c.Id,
      name: c.Names[0].replace('/', ''),
      state: c.State,
      status: c.Status,
      image: c.Image,
    }));
  } catch (error) {
    console.error('Docker fetch error:', error);
    return [];
  }
}

export async function controlContainer(containerId: string, action: 'start' | 'stop' | 'restart') {
  await getUserId();
  try {
    const res = await fetch(`http://socket-proxy:2375/containers/${containerId}/${action}`, {
      method: 'POST',
    });

    if (!res.ok) {
      throw new Error(`Failed to ${action} container`);
    }

    revalidatePath('/docker');
    return { success: true };
  } catch (error) {
    console.error(`Docker ${action} error:`, error);
    return { success: false, error: 'Action could not be performed' };
  }
}