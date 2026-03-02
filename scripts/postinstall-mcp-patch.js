#!/usr/bin/env node
/**
 * Apply MCP SDK patches: protocolVersion fallback, clientInfo optional.
 * Replaces patch-package for reliable Vercel deploys.
 */
const fs = require('fs');
const path = require('path');

const sdkPath = path.join(__dirname, '../node_modules/@modelcontextprotocol/sdk');
if (!fs.existsSync(sdkPath)) {
  console.warn('MCP SDK not found, skipping patch');
  process.exit(0);
}

const replacements = [
  {
    file: 'dist/cjs/server/index.js',
    from: 'const requestedVersion = request.params.protocolVersion;',
    to: 'const requestedVersion = request.params.protocolVersion ?? request.params.version;',
  },
  {
    file: 'dist/esm/server/index.js',
    from: 'const requestedVersion = request.params.protocolVersion;',
    to: 'const requestedVersion = request.params.protocolVersion ?? request.params.version;',
  },
  {
    file: 'dist/cjs/types.js',
    from: 'clientInfo: exports.ImplementationSchema',
    to: 'clientInfo: exports.ImplementationSchema.optional()',
  },
  {
    file: 'dist/esm/types.js',
    from: 'clientInfo: ImplementationSchema',
    to: 'clientInfo: ImplementationSchema.optional()',
  },
];

let applied = 0;
for (const { file, from, to } of replacements) {
  const filePath = path.join(sdkPath, file);
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes(to)) continue; // already patched
  if (content.includes(from)) {
    content = content.replace(from, to);
    fs.writeFileSync(filePath, content);
    applied++;
  }
}
console.log(`MCP SDK patch: applied ${applied}/${replacements.length} replacements`);
