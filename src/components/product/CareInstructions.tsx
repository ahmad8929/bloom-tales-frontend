export function CareInstructions({ instructions }: { instructions: string[] }) {
  if (instructions.length === 0) return null;

  return (
    <div className="border border-border bg-card p-6">
      <p className="eyebrow mb-4">Care Instructions</p>
      <ul className="space-y-2.5">
        {instructions.map((instruction, index) => (
          <li
            key={index}
            className="flex items-start gap-3 font-sans text-sm leading-relaxed text-text-muted"
          >
            <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-gold" />
            {instruction}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Normalize care instructions (string with newlines or array) into clean lines. */
export function parseCareInstructions(raw: string | string[] | undefined): string[] {
  if (!raw) return [];
  if (typeof raw === 'string') {
    return raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }
  return raw.map((line) => String(line).trim()).filter(Boolean);
}
