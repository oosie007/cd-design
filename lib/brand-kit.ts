import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

export async function loadJSON(filename: string): Promise<any> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, filename), 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function loadText(filename: string): Promise<string> {
  try {
    return await fs.readFile(path.join(DATA_DIR, filename), 'utf-8');
  } catch {
    return '';
  }
}

export function generateStylesheet(tokens: any): string {
  const lines: string[] = [];

  lines.push('/* Chubb Brand Kit — Auto-generated stylesheet */');
  lines.push('/* Drop this into your project for brand-correct colors, typography, and spacing */');
  lines.push('');
  lines.push('/* Font: Lato — primary brand typeface */');
  lines.push("@import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap');");
  lines.push('');
  lines.push(':root {');

  const families = tokens.typography?.fontFamilies || {};
  for (const [, val] of Object.entries(families) as any[]) {
    lines.push(`  ${val.cssToken}: ${val.name}, ${val.fallback};`);
  }
  lines.push('');
  const weights = tokens.typography?.fontWeights || {};
  for (const [, val] of Object.entries(weights) as any[]) {
    lines.push(`  ${val.cssToken}: ${val.value};`);
  }
  lines.push('');
  const scale = tokens.typography?.typeScale || {};
  for (const [key, val] of Object.entries(scale) as any[]) {
    lines.push(`  ${val.token}: ${val.size};`);
    lines.push(`  --font-line-height-${key}: ${val.lineHeight};`);
  }
  lines.push('');
  for (const group of ['neutral', 'primary', 'utility']) {
    const items = tokens.colors?.[group] || {};
    for (const [, val] of Object.entries(items) as any[]) {
      lines.push(`  ${val.cssToken}: ${val.value};`);
    }
    lines.push('');
  }
  const spacing = tokens.spacing || {};
  for (const [, val] of Object.entries(spacing) as any[]) {
    lines.push(`  ${val.cssToken}: ${val.value};`);
  }
  lines.push('}');
  lines.push('');
  lines.push('body {');
  lines.push('  font-family: var(--font-family-body);');
  lines.push('  font-size: var(--font-size-body-regular);');
  lines.push('  line-height: var(--font-line-height-body-regular);');
  lines.push('  color: var(--color-neutral-black);');
  lines.push('  -webkit-font-smoothing: antialiased;');
  lines.push('  -moz-osx-font-smoothing: grayscale;');
  lines.push('}');

  return lines.join('\n');
}

function getCategoryEntries(tokens: any, category?: string): [string, string][] {
  const entries: [string, string][] = [];
  if (!category || category === 'colors') {
    for (const group of ['neutral', 'primary', 'utility']) {
      const items = tokens.colors?.[group] || {};
      for (const [, val] of Object.entries(items) as any[]) {
        entries.push([val.cssToken, val.value]);
      }
    }
  }
  if (!category || category === 'typography') {
    const families = tokens.typography?.fontFamilies || {};
    for (const [, val] of Object.entries(families) as any[]) {
      entries.push([val.cssToken, `${val.name}, ${val.fallback}`]);
    }
    const scale = tokens.typography?.typeScale || {};
    for (const [key, val] of Object.entries(scale) as any[]) {
      entries.push([val.token, val.size]);
      entries.push([`--font-line-height-${key}`, val.lineHeight]);
    }
    const weights = tokens.typography?.fontWeights || {};
    for (const [, val] of Object.entries(weights) as any[]) {
      entries.push([val.cssToken, String(val.value)]);
    }
  }
  if (!category || category === 'spacing') {
    const spacingTokens = tokens.spacing || {};
    for (const [, val] of Object.entries(spacingTokens) as any[]) {
      entries.push([val.cssToken, val.value]);
    }
  }
  return entries;
}

export function tokensToCSS(tokens: any, category?: string): string {
  const lines: string[] = [':root {'];
  for (const [token, value] of getCategoryEntries(tokens, category)) {
    lines.push(`  ${token}: ${value};`);
  }
  lines.push('}');
  return lines.join('\n');
}

export function tokensToJSON(tokens: any, category?: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [token, value] of getCategoryEntries(tokens, category)) {
    result[token] = value;
  }
  return result;
}

export function tokensToTailwind(tokens: any, category?: string): any {
  const config: Record<string, any> = { theme: { extend: {} } };
  if (!category || category === 'colors') {
    const colors: Record<string, string> = {};
    for (const group of ['neutral', 'primary', 'utility']) {
      const entries = tokens.colors?.[group] || {};
      for (const [key, val] of Object.entries(entries) as any[]) {
        const name = group === 'neutral' ? `neutral-${key}` : `${group}-${key}`;
        colors[name] = val.value;
      }
    }
    config.theme.extend.colors = colors;
  }
  if (!category || category === 'typography') {
    const scale = tokens.typography?.typeScale || {};
    const fontSize: Record<string, [string, string]> = {};
    for (const [key, val] of Object.entries(scale) as any[]) {
      fontSize[key] = [val.size, val.lineHeight];
    }
    config.theme.extend.fontSize = fontSize;
    const families = tokens.typography?.fontFamilies || {};
    const fontFamily: Record<string, string[]> = {};
    for (const [key, val] of Object.entries(families) as any[]) {
      fontFamily[key] = [val.name, ...val.fallback.split(', ')];
    }
    config.theme.extend.fontFamily = fontFamily;
  }
  if (!category || category === 'spacing') {
    const spacingTokens = tokens.spacing || {};
    const spacing: Record<string, string> = {};
    for (const [key, val] of Object.entries(spacingTokens) as any[]) {
      spacing[key] = val.value;
    }
    config.theme.extend.spacing = spacing;
  }
  return config;
}

function hexDistance(hex1: string, hex2: string): number {
  const r1 = parseInt(hex1.slice(1, 3), 16);
  const g1 = parseInt(hex1.slice(3, 5), 16);
  const b1 = parseInt(hex1.slice(5, 7), 16);
  const r2 = parseInt(hex2.slice(1, 3), 16);
  const g2 = parseInt(hex2.slice(3, 5), 16);
  const b2 = parseInt(hex2.slice(5, 7), 16);
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

function normalizeHex(input: string): string | null {
  let hex = input.trim().toLowerCase();
  if (hex.startsWith('#')) hex = hex.slice(1);
  if (/^[0-9a-f]{6}$/.test(hex)) return `#${hex}`;
  if (/^[0-9a-f]{3}$/.test(hex)) {
    return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
  }
  const rgbMatch = input.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0');
    const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0');
    const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }
  return null;
}

export function validateBrandColor(tokens: any, input: string): object {
  const brandColors: { token: string; value: string; name: string }[] = [];
  for (const group of ['neutral', 'primary', 'utility']) {
    const items = tokens.colors?.[group] || {};
    for (const [key, val] of Object.entries(items) as any[]) {
      brandColors.push({ token: val.cssToken, value: val.value, name: `${group}-${key}` });
    }
  }
  if (input.startsWith('--')) {
    const match = brandColors.find((c) => c.token === input);
    if (match) return { onBrand: true, token: match.token, value: match.value, name: match.name };
    return { onBrand: false, message: `Token "${input}" not found in brand palette.` };
  }
  const hex = normalizeHex(input);
  if (!hex) {
    return { error: `Cannot parse "${input}". Use hex (#RRGGBB), rgb(r,g,b), or token name (--token).` };
  }
  const exact = brandColors.find((c) => c.value.toLowerCase() === hex.toLowerCase());
  if (exact) return { onBrand: true, token: exact.token, value: exact.value, name: exact.name };
  let closest = brandColors[0];
  let minDist = Infinity;
  for (const c of brandColors) {
    const dist = hexDistance(hex, c.value);
    if (dist < minDist) {
      minDist = dist;
      closest = c;
    }
  }
  return {
    onBrand: false,
    input: hex,
    suggestion: `Closest brand color: ${closest.name} (${closest.token}: ${closest.value})`,
    distance: Math.round(minDist),
  };
}
