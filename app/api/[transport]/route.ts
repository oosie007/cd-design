import { createMcpHandler } from 'mcp-handler';
import { z } from 'zod';
import {
  loadJSON,
  loadText,
  generateStylesheet,
  tokensToCSS,
  tokensToJSON,
  tokensToTailwind,
  validateBrandColor,
} from '@/lib/brand-kit';

const handler = createMcpHandler(
  (server) => {
    server.tool(
      'get_brand_stylesheet',
      'Get a complete, drop-in CSS stylesheet with Chubb brand tokens (colors, typography, spacing, font imports). Ready to paste into any project.',
      {},
      async () => {
        const tokens = await loadJSON('brand-tokens.json');
        const css = generateStylesheet(tokens);
        return { content: [{ type: 'text', text: css }] };
      }
    );

    server.tool(
      'get_brand_tokens',
      'Get Chubb brand tokens in CSS, JSON, or Tailwind format. Optionally filter by category (colors, typography, spacing).',
      {
        format: z.enum(['css', 'json', 'tailwind']).optional(),
        category: z.enum(['colors', 'typography', 'spacing']).optional(),
      },
      async ({ format = 'css', category }) => {
        const tokens = await loadJSON('brand-tokens.json');
        let output: string;
        if (format === 'json') {
          output = JSON.stringify(tokensToJSON(tokens, category), null, 2);
        } else if (format === 'tailwind') {
          output =
            '// tailwind.config.js\nmodule.exports = ' +
            JSON.stringify(tokensToTailwind(tokens, category), null, 2);
        } else {
          output = tokensToCSS(tokens, category);
        }
        return { content: [{ type: 'text', text: output }] };
      }
    );

    server.tool(
      'get_icon',
      'Search for icons by name. Returns matching icon names and their available variants (size, style). Use with <ds-icon name="iconName"> web component.',
      { search: z.string().optional() },
      async ({ search = '' }) => {
        const registry = await loadJSON('icon-registry.json');
        const searchLower = search.toLowerCase();
        const icons = registry.icons || [];
        const results = searchLower
          ? icons.filter((icon: { name: string }) =>
              icon.name.toLowerCase().includes(searchLower)
            )
          : icons;
        if (results.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: `No icons found matching "${search}". Try a broader term.`,
              },
            ],
          };
        }
        const output = results.slice(0, 20).map((icon: { name: string; variants: unknown }) => ({
          name: icon.name,
          variants: icon.variants,
          usage: `<ds-icon name="${icon.name}" size="24px"></ds-icon>`,
        }));
        const text = JSON.stringify(
          { total: results.length, showing: Math.min(results.length, 20), icons: output },
          null,
          2
        );
        return { content: [{ type: 'text', text }] };
      }
    );

    server.tool(
      'get_logo',
      'Get Chubb logo SVG. Available variants: "full" (157×16px), "compact" (98×10px), "powered-by" (with text). SVGs use currentColor for theme adaptation.',
      { variant: z.enum(['full', 'compact', 'powered-by']).optional() },
      async ({ variant = 'full' }) => {
        const logos = await loadJSON('logos.json');
        const logo = logos.logos?.[variant];
        if (!logo) {
          return {
            content: [
              {
                type: 'text',
                text: `Unknown variant "${variant}". Available: full, compact, powered-by`,
              },
            ],
          };
        }
        return {
          content: [{ type: 'text', text: JSON.stringify(logo, null, 2) }],
        };
      }
    );

    server.tool(
      'validate_brand_colors',
      'Check if a color value is on-brand. Accepts hex (#000ECC), rgb(0,14,204), or token name (--color-primary-blue). Returns whether it matches and suggests the closest brand color if not.',
      { value: z.string() },
      async ({ value }) => {
        const tokens = await loadJSON('brand-tokens.json');
        const result = validateBrandColor(tokens, value);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }
    );

    server.tool(
      'get_layout_stylesheet',
      'Get generic semantic CSS for any app (Next.js, Angular, etc.): header-dark | header-light, sidebar, main, cards, tables, metrics, filters, status badges. Use with get_brand_stylesheet tokens. Import AFTER tokens. Framework-agnostic.',
      {},
      async () => {
        const css = await loadText('layout.css');
        return { content: [{ type: 'text', text: css }] };
      }
    );

    server.tool(
      'get_layout_guidelines',
      'Get reference patterns for composing layouts. Returns guidelines for claims portal, underwriter workbench, sales portal, internal admin—pick one and adapt. Use when deciding structure for a new app.',
      { pattern: z.enum(['claims-portal', 'underwriter-workbench', 'sales-portal', 'internal-admin']).optional() },
      async ({ pattern }) => {
        const guidelines = await loadJSON('layout-guidelines.json');
        if (pattern) {
          const p = guidelines.patterns?.find((x: { id: string }) => x.id === pattern);
          return {
            content: [
              { type: 'text', text: p ? JSON.stringify({ pattern: p, headerVariants: guidelines.headerVariants }, null, 2) : `Pattern "${pattern}" not found. Available: ${guidelines.patterns?.map((x: { id: string }) => x.id).join(', ')}` },
            ],
          };
        }
        return { content: [{ type: 'text', text: JSON.stringify(guidelines, null, 2) }] };
      }
    );

    server.tool(
      'get_admin_layout_stylesheet',
      '[Deprecated: use get_layout_stylesheet] Same as get_layout_stylesheet. Kept for backward compatibility.',
      {},
      async () => {
        const css = await loadText('layout.css');
        return { content: [{ type: 'text', text: css }] };
      }
    );

    server.tool(
      'get_nextjs_setup',
      'Get everything needed to build a Next.js app with Chubb styling. Returns globals.css (Tailwind + tokens, no font @import), layout CSS, and build instructions. Generic—works for claims, admin, sales, underwriter portals. Call get_layout_guidelines first to pick a pattern.',
      {},
      async () => {
        const tokens = await loadJSON('brand-tokens.json');
        const tokensCSS = tokensToCSS(tokens);
        const layoutCSS = await loadText('layout.css');

        const globalsCss = `/* Chubb UI MCP — Next.js globals.css */
/* DO NOT add @import url() for fonts — use next/font in layout.tsx */

@import "tailwindcss";

/* Chubb brand tokens */
${tokensCSS}

body {
  font-family: var(--font-family-body);
  font-size: var(--font-size-body-regular);
  line-height: var(--font-line-height-body-regular);
  color: var(--color-neutral-black);
  background: #F5F6FA;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

*:focus-visible {
  outline: 2px solid var(--color-utility-focus-focusstate);
  outline-offset: 2px;
}

/* Chubb layout — generic semantic classes */
${layoutCSS}
`;

        const instructions = `## Next.js + Chubb Layout — Build Instructions

### 1. globals.css
Replace src/app/globals.css with the content from this tool (globalsCss field).

### 2. layout.tsx — Load Lato via next/font
\`\`\`tsx
import { Lato } from "next/font/google";
const lato = Lato({ weight: ["300", "400", "700"], subsets: ["latin"], variable: "--font-lato" });
// In body: className={\`\${lato.variable}\`} style={{ fontFamily: "var(--font-lato), var(--font-family-body)" }}
\`\`\`

### 3. Pick a pattern (get_layout_guidelines)
Call get_layout_guidelines to see reference patterns: claims-portal, underwriter-workbench, sales-portal, internal-admin. Adapt the structure to your app.

### 4. Generic layout classes

**Headers**
- header-dark (or topnav): primary color bar, compact. header-logo, header-title, header-right, header-avatar
- header-light (or navbar): white bar, search. header-logo, header-search, header-actions, avatar

**Layout**
- app-layout, app-layout-header-dark | app-layout-header-light
- app-sidebar, sidebar-section-label, sidebar-item, nav-item, nav-count
- app-main, app-main-with-sidebar

**Components**
- Cards: card, card-header, card-body | list-card | metric-card (blue|teal|orange|green)
- Entity: entity-header, entity-name, entity-meta, ref-id, entity-name, entity-meta-line
- Data: data-table, status (open|review|approved|denied|closed), type-badge, priority, amount
- Actions: row-actions, action-btn-primary, action-btn-ghost
- Filters: filters-bar, filter-select, filter-tag | search-bar, filter-chip
- Panels: panel, panel-section, activity-item, mini-stat, assignee-row

**Buttons**
btn btn-primary | btn-outline | btn-secondary

### 5. Logo
Use get_logo (full variant) for Chubb logo in header-logo.
`;

        const output = JSON.stringify(
          {
            globalsCss,
            instructions,
            note: 'Paste globalsCss into src/app/globals.css. Call get_layout_guidelines to pick a pattern. Use generic semantic classes (header-dark, metric-card, ref-id, etc.).',
          },
          null,
          2
        );
        return { content: [{ type: 'text', text: output }] };
      }
    );

    server.tool(
      'get_angular_setup',
      'Get everything needed to build an Angular app with Chubb styling. Returns styles to add to styles.css (or global styles), layout CSS, and build instructions. Generic—works for any portal type. Call get_layout_guidelines first to pick a pattern.',
      {},
      async () => {
        const tokens = await loadJSON('brand-tokens.json');
        const tokensCSS = tokensToCSS(tokens);
        const layoutCSS = await loadText('layout.css');

        const stylesCss = `/* Chubb UI MCP — Angular global styles */
/* Add to src/styles.css (after Tailwind if used) */

/* Chubb brand tokens */
${tokensCSS}

body {
  font-family: var(--font-family-body);
  font-size: var(--font-size-body-regular);
  line-height: var(--font-line-height-body-regular);
  color: var(--color-neutral-black);
  background: #F5F6FA;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

*:focus-visible {
  outline: 2px solid var(--color-utility-focus-focusstate);
  outline-offset: 2px;
}

/* Chubb layout — generic semantic classes */
${layoutCSS}
`;

        const instructions = `## Angular + Chubb Layout — Build Instructions

### 1. Fonts
Add Lato to index.html or use @import in styles.css:
\`\`\`html
<link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
\`\`\`
Or in styles.css: @import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap');

### 2. Global styles
Add the content from stylesCss to src/styles.css (ensure it's in angular.json styles array).

### 3. Pick a pattern
Call get_layout_guidelines to see reference patterns. Adapt to your app type.

### 4. Use semantic classes
Same generic classes as Next.js: header-dark | header-light, app-sidebar, metric-card, ref-id, status, etc. Apply in component templates via class="...".
`;

        const output = JSON.stringify(
          {
            stylesCss,
            instructions,
            note: 'Add stylesCss to src/styles.css. Use generic semantic classes. Call get_layout_guidelines to pick a pattern.',
          },
          null,
          2
        );
        return { content: [{ type: 'text', text: output }] };
      }
    );
  },
  { serverInfo: { name: 'chubb-brand-kit', version: '1.0.0' } },
  { basePath: '/api', maxDuration: 60 }
);

export { handler as GET, handler as POST, handler as DELETE };
