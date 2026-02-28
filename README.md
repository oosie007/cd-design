# CD Design — Chubb Brand Kit MCP

Generic Chubb brand and layout MCP for building **any** app—Next.js, Angular, or plain HTML. Use for sales portals, claims portals, underwriter workbenches, internal admin tools, or custom dashboards.

## Tools

| Tool | Purpose |
|------|---------|
| `get_brand_stylesheet` | Drop-in CSS with Chubb tokens |
| `get_brand_tokens` | Tokens in CSS, JSON, or Tailwind format |
| `get_icon` | Search icons by name |
| `get_logo` | Chubb logo SVG (full, compact, powered-by) |
| `validate_brand_colors` | Check if a color is on-brand |
| **`get_layout_stylesheet`** | Generic layout CSS (header, sidebar, cards, tables, metrics, filters) |
| **`get_layout_guidelines`** | Reference patterns—claims, underwriter, sales, admin (guidelines, not prescriptive) |
| `get_nextjs_setup` | Next.js: globals.css + layout + instructions |
| `get_angular_setup` | Angular: styles + layout + instructions |
| `get_admin_layout_stylesheet` | *(Deprecated)* Same as get_layout_stylesheet |

## Quick start

1. **Pick a pattern** — Call `get_layout_guidelines` to see reference patterns (claims-portal, underwriter-workbench, sales-portal, internal-admin). Use as a guideline, not a template.
2. **Get layout CSS** — Call `get_layout_stylesheet` for generic semantic CSS.
3. **Get framework setup** — Call `get_nextjs_setup` or `get_angular_setup` for framework-specific integration.

## Generic layout

The MCP provides **framework-agnostic** layout primitives. Adapt them to your domain.

### Header variants

| Class | Description |
|-------|-------------|
| `header-dark` (alias: `topnav`) | Primary color bar, compact (52px). For focused internal tools. |
| `header-light` (alias: `navbar`) | White bar with accent border, search, avatar (60px). For portals with global search. |

### Layout

- `app-layout`, `app-layout-header-dark`, `app-layout-header-light`
- `app-sidebar`, `app-main`, `app-main-with-sidebar`
- `sidebar-section-label`, `sidebar-item` (or `nav-item`), `nav-count`

### Components (generic)

- **Cards**: `card`, `list-card`, `metric-card` (blue|teal|orange|green)
- **Entity**: `entity-header`, `entity-name`, `ref-id`, `entity-meta-line`
- **Data**: `data-table`, `status` (open|review|approved|closed), `type-badge`, `priority`, `amount`
- **Actions**: `row-actions`, `action-btn-primary`, `action-btn-ghost`
- **Filters**: `filters-bar`, `filter-select`, `filter-tag`, `search-bar`
- **Panels**: `panel`, `panel-section`, `activity-item`, `mini-stat`, `assignee-row`

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
