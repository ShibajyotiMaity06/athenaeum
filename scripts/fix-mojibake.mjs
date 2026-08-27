import fs from "node:fs";

const files = [
  "src/app/account/page.tsx",
  "src/app/api/payments/sandbox/route.ts",
  "src/app/api/payments/verify/route.ts",
  "src/components/CheckoutClient.tsx"
];

// Mojibake sequences (UTF-8 read as Latin-1) → correct characters
const MAP = [
  [/\u00E2\u20AC\u201D/g, "\u2014"], // â€” -> —
  [/\u00E2\u20AC\u201C/g, "\u2013"], // â€“ -> –
  [/\u00E2\u20AC\u00A6/g, "\u2026"], // â€¦ -> …
  [/\u00C2\u00B7/g, "\u00B7"], // Â· -> ·
  [/\u00C2\u00A0/g, " "], // Â(nbsp) -> space
  [/\u00E2\u009C\u00B6/g, "\u2736"], // âœ¶ -> ✶
  [/\u00E2\u009D\u00A7/g, "\u2767"], // â�§ -> ❧
  [/\u00C2(?=[A-Za-z\s])/g, ""] // stray Â
];

let touched = 0;
for (const f of files) {
  let s = fs.readFileSync(f, "utf8");
  const before = s;
  for (const [re, to] of MAP) s = s.replace(re, to);
  if (s !== before) {
    fs.writeFileSync(f, s, "utf8");
    console.log("repaired:", f);
    touched++;
  }
}
console.log("files repaired:", touched);

// verify none left anywhere in src
function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = d + "/" + f;
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (/\.(tsx?|css)$/.test(f)) {
      const s = fs.readFileSync(p, "utf8");
      if (/\u00E2\u20AC|\u00C2\u00B7/.test(s)) console.log("STILL BAD:", p);
    }
  }
}
walk("src");
console.log("scan done");
