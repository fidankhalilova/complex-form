// Summary of failed fields as links that move focus to the matching input.
type Item = { name: string; label: string; message: string };

export default function ErrorSummary({ items }: { items: Item[] }) {
  if (!items.length) return null;

  const focusField = (e: React.MouseEvent, name: string) => {
    e.preventDefault();
    document.getElementById(name)?.focus();
  };

  return (
    <div role="alert" aria-labelledby="summary-title" className="rounded border border-red-600 p-4">
      <h2 id="summary-title" className="mb-2 font-semibold text-red-600">
        ⚠ Please fix {items.length} {items.length === 1 ? 'error' : 'errors'}
      </h2>
      <ul className="list-disc pl-5 text-sm">
        {items.map(({ name, label, message }) => (
          <li key={name}>
            <a href={`#${name}`} onClick={(e) => focusField(e, name)} className="underline">
              {label}: {message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}