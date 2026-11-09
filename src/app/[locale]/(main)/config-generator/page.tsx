import { setRequestLocale } from 'next-intl/server';
import ConfigGeneratorContent from './ConfigGeneratorContent';

// ✅ PRIVERČIAME PUSLAPĮ BŪTI DINAMINĮ
export const instant = false;

export default async function ConfigGeneratorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ConfigGeneratorContent />;
}
