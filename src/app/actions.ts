'use server';
import { redirect } from 'next/navigation';
import { auth } from '../auth';
import prisma from './prisma';
import { revalidatePath } from 'next/cache';
import { GoogleGenAI } from '@google/genai';

// 1. CREATE NOTE (with tags)
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function createNote(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const tagsString = formData.get('tags') as string;
  const files = formData.getAll('files') as File[]; // <-- Gauname failus

  if (!title || !content) throw new Error('Title and content are required.');

  const tagNames = tagsString ? tagsString.split(',').map(tag => tag.trim()).filter(Boolean) : [];

  // 1. Sukuriame užrašą DB
  const note = await prisma.note.create({
    data: {
      title,
      content,
      userId: session.user.id,
      tags: {
        connectOrCreate: tagNames.map((tagName) => ({
          where: { name: tagName },
          create: { name: tagName },
        })),
      },
    },
  });

  // 2. Tvarkome failus, jei jų yra
  if (files && files.length > 0 && files[0].size > 0) {
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true }); // Sukuriame katalogą, jei jo nėra

    for (const file of files) {
      if (file.size === 0) continue;

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Sugeneruojame unikalų failo pavadinimą, kad neperrašytume esamų
      const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const filePath = join(uploadDir, uniqueName);

      await writeFile(filePath, buffer);

      // Išsaugome nuorodą DB
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
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const id = formData.get('id') as string;

  if (!id) return;

  await prisma.note.delete({
    where: {
      id: id,
      userId: session.user.id,
    },
  });

   revalidatePath('/');
}
// 3. Update note
export async function updateNote(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

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
    where: {
      id: id,
      userId: session.user.id, // Security: ensure user owns the note
    },
    data: {
      title,
      content,
      // Overwrite tags: disconnect all old ones, connect or create new ones
      tags: {
        set: [], // Disconnect all existing tags
        connectOrCreate: tagNames.map((tagName) => ({
          where: { name: tagName },
          create: { name: tagName },
        })),
      },
    },
  });
  revalidatePath('/');
  redirect('/');
}

// 4. Exporting

export async function exportNotes() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // Fetch all notes with their tags
  const notes = await prisma.note.findMany({
    where: { userId: session.user.id },
    include: { tags: true },
    orderBy: { createdAt: 'desc' },
  });

  // Generate a single Markdown string
  let markdownContent = `# My Knowledge Base Export\n\nExported on: ${new Date().toLocaleString()}\n\n---\n\n`;

  notes.forEach((note) => {
    markdownContent += `## ${note.title}\n\n`;
    if (note.tags.length > 0) {
      markdownContent += `**Tags:** ${note.tags.map(t => `#${t.name}`).join(', ')}\n\n`;
    }
    markdownContent += `${note.content}\n\n---\n\n`;
  });

  // Return the string so the client can download it
  return markdownContent;
}

// 5 Sharing
export async function toggleShare(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const id = formData.get('id') as string;
  const isPublic = formData.get('isPublic') === 'true'; // Gauname dabartinę būseną

  if (!id) return;

  await prisma.note.update({
    where: { id, userId: session.user.id },
    data: { isPublic: !isPublic }, // Perjungiame būseną
  });

  revalidatePath('/');
}
// Gemini AI
export async function summarizeNote(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const id = formData.get('id') as string;
  if (!id) return;

  const note = await prisma.note.findUnique({
    where: { id, userId: session.user.id },
  });

  if (!note) throw new Error('Note not found');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is missing');

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are a helpful assistant. Please summarize the following note in 2-3 bullet points in the same language as the note. Note title: "${note.title}". Note content: "${note.content}"`;

  try {
    // NAUJASIS API BŪDAS: naudojame interactions.create ir gemini-3.8-flash
    const response = await ai.interactions.create({
      model: 'gemini-3.8-flash',
      input: prompt,
    });

    // Ištraukiame tekstą iš atsakymo
    const summary = response.output_text;

    // Išsaugome santrauką atgal į užrašą
    await prisma.note.update({
      where: { id: note.id },
      data: { content: `${note.content}\n\n---\n### 🤖 AI Summary\n${summary}` },
    });

    revalidatePath('/');
  } catch (error) {
    console.error('AI Error:', error);
    throw new Error('Failed to generate summary');
  }
}

// Gemini AI
export async function askKnowledgeBase(query: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // 1. Gauname visus vartotojo užrašus
  const notes = await prisma.note.findMany({
    where: { userId: session.user.id },
    include: { tags: true },
    orderBy: { createdAt: 'desc' },
    take: 15,
  });

  if (notes.length === 0) {
    return "Your knowledge base is empty. Create some notes first!";
  }

  // 2. Suformuojame kontekstą iš užrašų
  const context = notes.map(note => {
    const tags = note.tags.map(t => `#${t.name}`).join(', ');
    return `--- NOTE: ${note.title} (Tags: ${tags}) ---\n${note.content}`;
  }).join('\n\n');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is missing');

  const ai = new GoogleGenAI({ apiKey });

  // 3. Promptas, kuris liepia modeliui atsakyti TIK remiantis kontekstu
  const prompt = `You are a personal AI assistant for my Knowledge Base.
I will provide you with my personal notes and a question. 
Please answer the question using ONLY the information from the notes. 
If the answer is not in the notes, say "I couldn't find this information in your knowledge base."
Always mention which note title you used to find the answer.
Respond in the same language as the question.

MY NOTES:
${context}

QUESTION:
${query}`;

  try {
    const response = await ai.interactions.create({
      model: 'gemini-3.8-flash',
      input: prompt,
    });

    return response.output_text || "No response generated.";
  } catch (error) {
    console.error('AI Search Error:', error);
    throw new Error('Failed to generate answer');
  }
}

// AI asistent
export async function generateNote(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const topic = formData.get('topic') as string;
  if (!topic) throw new Error('Topic is required');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is missing');

  const ai = new GoogleGenAI({ apiKey });

  // Promptas, kuris liepia AI sugeneruoti pilną užrašą
  const prompt = `You are an expert software engineer and technical writer. 
Please write a comprehensive, well-structured Markdown note about the following topic: "${topic}".

Rules:
1. Start with a clear H1 title.
2. Use code blocks (\`\`\`) for commands, configurations, or code.
3. Include practical steps, explanations, and best practices.
4. Keep it concise but thorough.
5. Write the content in the same language as the topic (if the topic is in Lithuanian, write in Lithuanian).
6. Do NOT include any conversational filler (like "Here is your note:"). Just output the Markdown content directly.`;

  try {
    const response = await ai.interactions.create({
      model: 'gemini-3.8-flash',
      input: prompt,
    });

    const generatedContent = response.output_text || 'Failed to generate content.';
    
    // Sugeneruojame pavadinimą iš temos (pirmas 50 simbolių)
    const title = topic.length > 50 ? topic.substring(0, 50) + '...' : topic;

    // Išsaugome naują užrašą DB
    await prisma.note.create({
      data: {
        title: title,
        content: generatedContent,
        userId: session.user.id,
        // Automatiškai pridedame žymę "AI Generated"
        tags: {
          connectOrCreate: {
            where: { name: 'AI Generated' },
            create: { name: 'AI Generated' },
          },
        },
      },
    });

    revalidatePath('/');
  } catch (error) {
    console.error('AI Generate Error:', error);
    throw new Error('Failed to generate note');
  }
}

// Button „Improve Writing“ and „Fix Code“
export async function improveNote(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const id = formData.get('id') as string;
  if (!id) return;

  const note = await prisma.note.findUnique({
    where: { id, userId: session.user.id },
  });

  if (!note) throw new Error('Note not found');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is missing');

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are an expert technical writer and software engineer.
Please improve the following note. 
Fix any grammatical errors, format the code blocks properly, make the explanations clearer, and ensure the Markdown structure is perfect.
Do NOT change the core meaning of the note. Just make it better.
Return ONLY the improved Markdown content, without any conversational filler.

Note title: "${note.title}"
Note content:
${note.content}`;

  try {
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
  } catch (error) {
    console.error('AI Improve Error:', error);
    throw new Error('Failed to improve note');
  }
}