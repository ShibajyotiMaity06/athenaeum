export default function OrnateDivider({
  className = "",
  glyph
}: {
  className?: string;
  glyph?: string;
}) {
  return (
    <div
      className={`ornate-divider ${className}`}
      aria-hidden="true"
      {...(glyph ? { "data-glyph": glyph } : {})}
      style={glyph ? undefined : undefined}
    >
      {glyph ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4 text-[13px] leading-none text-brass"
        >
          {glyph}
        </span>
      ) : null}
    </div>
  );
}
