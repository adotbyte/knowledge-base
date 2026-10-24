'use client';

import { ReactNode, useState } from 'react';

export default function DeleteConfirmButton({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mygtukas, kuris atidaro modalinį langą */}
      <button 
        type="button" // Svarbu: type="button", kad neisiųstų formos iš karto
        onClick={() => setIsOpen(true)}
        className="text-gray-400 hover:text-red-500 transition-colors p-1" 
        title="Delete note"
      >
        {children}
      </button>

      {/* Modalinis langas (rodomas tik jei isOpen === true) */}
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Ištrinti užrašą?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Ar tikrai norite ištrinti šį užrašą? Šio veiksmo atšaukti negalėsite.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Atšaukti
              </button>
              
              {/* Šis mygtukas iš tikrųjų išsiunčia formą */}
              <button
                type="submit" // Būtent šis mygtukas perduoda formą į Server Action
                className="px-4 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                Taip, ištrinti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}