'use server';

import prisma from './prisma';
import { revalidatePath } from 'next/cache';
import { GoogleGenAI } from '@google/genai';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

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

  // Sukuriame užrašą DB su fiksuotu "admin" vartotoju
  const note = await prisma.note.create({
    data: {
      title,
      content,
      userId: "admin", // <-- Fiksuotas vartotojas
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
    const uploadDir = join(process.cwd(), 'public', 'uploads');
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
          url: `/uploads/${uniqueName}`,
          type: file.type,
          size: file.size,
          noteId: note.id,
        },
      });
    }
  }

  revalidatePath('/');
}

// 2. DELETE NOTE
export async function deleteNote(formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) return;

  await prisma.note.delete({
    where: { id: id, userId: "admin" },
  });

  revalidatePath('/');
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

  revalidatePath('/');
}

// 4. UPDATE NOTE
export async function updateNote(id: string, formData: FormData) {
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const tagsString = formData.get('tags') as string;

  if (!title || !content) {
    throw new Error('Title and content are required.');
  }

  const tagNames = tagsString 
    ? tagsString.split(',').map(tag => tag.trim()).filter(Boolean) 
    : [];

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

  revalidatePath('/');
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

  revalidatePath('/');
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

  revalidatePath('/');
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

  revalidatePath('/');
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

  // Promptas, kuris liepia AI grąžinti struktūrizuotą atsakymą
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