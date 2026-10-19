// Labelled input with an inline accessible error (alert) and a polite status line.
type Props = {
  label: string;
  name: string;
  value: string;
  error: string;
  info?: string;
  type?: string;
  autoComplete?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
};

export default function Field({
  label, name, value, error, info = '', type = 'text', autoComplete, onChange, onBlur,
}: Props) {
  const describedBy = error ? `${name}-error` : info ? `${name}-info` : undefined;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className="rounded border px-3 py-2 aria-invalid:border-red-600"
      />
      <p id={`${name}-info`} role="status" className="text-sm text-gray-600">
        {error ? '' : info}
      </p>
      {error && (
        <p id={`${name}-error`} role="alert" className="text-sm text-red-600">
          ⚠ {error}
        </p>
      )}
    </div>
  );
}