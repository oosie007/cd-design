# CD Design — Chubb Brand Kit MCP

Chubb brand kit MCP server on Streamable HTTP, ready for Vercel deployment.

## Tools

- `get_brand_stylesheet` — Complete drop-in CSS with brand tokens
- `get_brand_tokens` — Tokens in CSS, JSON, or Tailwind format
- `get_icon` — Search icons by name
- `get_logo` — Get Chubb logo SVG (full, compact, powered-by)
- `validate_brand_colors` — Check if a color is on-brand

## Run locally

```bash
npm install
npm run dev
```

MCP endpoint: `http://localhost:3000/api/mcp`

## Deploy to Vercel

```bash
vercel
```

Add to Cursor `mcp.json`:

```json
{
  "mcpServers": {
    "chubb-brand-kit": {
      "url": "https://your-deployment.vercel.app/api/mcp"
    }
  }
}
```

## Optional: Add auth

Use `withMcpAuth` from mcp-handler to add API key or OAuth protection.
