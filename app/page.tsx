export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Chubb Brand Kit MCP</h1>
      <p>MCP server running at <code>/api/mcp</code></p>
      <p>
        Add to Cursor mcp.json:{' '}
        <code style={{ background: '#f0f0f0', padding: '0.25rem 0.5rem' }}>
          {`"url": "https://your-deployment.vercel.app/api/mcp"`}
        </code>
      </p>
    </main>
  );
}
