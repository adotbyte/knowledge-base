'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { Turnstile } from '@marsidev/react-turnstile';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface LoginFormProps {
  translations: {
    title: string;
    subtitle: string;
    github: string;
    google: string;
    demo: string;
    privacy: string;
    loading: string;
  };
  language: string;
}

export default function LoginForm({ translations, language }: LoginFormProps) {
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  
  // Būsena, kad neleistume spausti mygtukų, kol vyksta patikrinimas
  const [isVerifying, setIsVerifying] = useState(false);

  const isLoading = isGitHubLoading || isGoogleLoading || isVerifying;

  // Pagalbinė funkcija, kuri patikrina žetoną mūsų serveryje
  const verifyTurnstile = async (): Promise<boolean> => {
    if (!turnstileToken) {
      alert('Prašome pirmiausia užbaigti saugumo patikrinimą.');
      return false;
    }

    setIsVerifying(true);
    try {
      const res = await fetch('/api/turnstile/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: turnstileToken }),
      });
      
      const data = await res.json();
      
      if (!data.success) {
        alert('Saugumo patikrinimas nepavyko. Bandykite dar kartą.');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Klaida tikrinant Turnstile:', error);
      alert('Įvyko serverio klaida. Bandykite vėliau.');
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  const handleGitHubLogin = async () => {
    if (!isVerified || isLoading) return;
    
    setIsGitHubLoading(true);
    try {
      const isValid = await verifyTurnstile();
      if (!isValid) {
        setIsGitHubLoading(false);
        return;
      }
      
      // Jei patikrinimas sėkmingas, leidžiame prisijungti
      await signIn('github', { callbackUrl: '/' });
    } catch (error) {
      console.error('Login failed:', error);
      setIsGitHubLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!isVerified || isLoading) return;
    
    setIsGoogleLoading(true);
    try {
      const isValid = await verifyTurnstile();
      if (!isValid) {
        setIsGoogleLoading(false);
        return;
      }
      
      // Jei patikrinimas sėkmingas, leidžiame prisijungti
      await signIn('google', { callbackUrl: '/' });
    } catch (error) {
      console.error('Login failed:', error);
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl dark:bg-gray-800">
        {/* ✅ KALBOS PERJUNGIKLIS */}
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{translations.title}</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{translations.subtitle}</p>
        </div>

        {/* Cloudflare Turnstile */}
        <div className="flex justify-center">
          <Turnstile
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
            options={{ language: language }}
            onSuccess={(token) => {
              setTurnstileToken(token);
              setIsVerified(true);
            }}
            onError={() => {
              setTurnstileToken(null);
              setIsVerified(false);
            }}
            onExpire={() => {
              setTurnstileToken(null);
              setIsVerified(false);
            }}
          />
        </div>

        <div className="space-y-4">
          {/* GitHub */}
          <button
            onClick={handleGitHubLogin}
            disabled={isLoading || !isVerified}
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-gray-900 px-4 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            {isGitHubLoading ? (
              <span>{translations.loading}</span>
            ) : (
              <>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.837 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                {translations.github}
              </>
            )}
          </button>

          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading || !isVerified}
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGoogleLoading ? (
              <span>{translations.loading}</span>
            ) : (
              <>{translations.google}</>
            )}
          </button>
        </div>

        {/* DEMO NUORODA */}
        <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
          <Link
            href="/demo"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {translations.demo}
          </Link>
        </div>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          <Link
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline transition-colors hover:text-blue-600 dark:hover:text-blue-400"
          >
            {translations.privacy}
          </Link>
        </p>
      </div>
    </div>
  );
}