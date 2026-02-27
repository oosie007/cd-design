import { createMcpHandler } from 'mcp-handler';
import { z } from 'zod';
import {
  loadJSON,
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
  },
  { serverInfo: { name: 'chubb-brand-kit', version: '1.0.0' } },
  { basePath: '/api', maxDuration: 60 }
);

export { handler as GET, handler as POST, handler as DELETE };
