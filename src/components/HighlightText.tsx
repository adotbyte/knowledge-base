export default function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query || query.trim().length === 0) {
    return <>{text}</>;
  }

  // Padalijame tekstą pagal paieškos žodį (nekeičiant didžiųjų/mažųjų raidžių)
  const parts = text.split(new RegExp(`(${query})`, 'gi'));

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={index}
            className="rounded bg-yellow-200 px-0.5 text-gray-900 dark:bg-yellow-900/50 dark:text-white"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
}
