'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { generateNote } from '../actions';

export default function GenerateNoteButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsGenerating(true);
    
    const formData = new FormData(e.currentTarget);
    try {
      await generateNote(formData);
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      alert('Failed to generate note.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Modalinis langas, kuris bus įterptas tiesiai į <body>, apeinant visus tėvinius CSS
  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-200">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <span>✨</span> AI Note Generator
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Enter a topic, and the AI ​​will write a complete note for you, including code and explanations..
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="topic"
            placeholder="E.g., How to install PostgreSQL with Docker"
            required
            className="w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm text-gray-900 dark:text-white"
            autoFocus
          />
          
          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="px-4 py-2 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-2"
            >
              {isGenerating ? (
                <span className="animate-pulse">Generating...</span>
              ) : (
                'Generate'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors shadow-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Generate with AI
      </button>

      {/* Naudojame createPortal, kad modalinis langas atsidurtų pačiame <body> viršuje */}
      {mounted && isOpen ? createPortal(modalContent, document.body) : null}
    </>
  );
}