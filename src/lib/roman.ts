export function toRoman(num: number): string {
  if (!Number.isInteger(num) || num <= 0) return String(num);
  const map: [number, string][] = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]
  ];
  let n = num;
  let out = "";
  for (const [value, glyph] of map) {
    while (n >= value) {
      out += glyph;
      n -= value;
    }
  }
  return out;
}
