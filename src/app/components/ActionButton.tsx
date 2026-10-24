'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

export default function ActionButton({ 
  action, 
  children, 
  className,
  title // <-- PRIDĖJOME TITLE
}: { 
  action: (formData: FormData) => Promise<void | string>; 
  children: ReactNode; 
  className?: string;
  title?: string; // <-- NAUJAS PARAMETRAS
}) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    
    const formData = new FormData(e.currentTarget);
    
    try {
      await action(formData);
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <button 
        type="submit" 
        disabled={isPending}
        title={title} // <-- PRITAIKOME TITLE
        className={`${className} ${isPending ? 'opacity-70 cursor-not-allowed' : ''} flex items-center gap-1.5 transition-all`}
      >
        {isPending ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </>
        ) : (
          children
        )}
      </button>
    </form>
  );
}