#!/usr/bin/env node
// Strabo's Epiphany — static-first history map server.
// Matches BoohawTCG's single-file pattern: HTTP statics + a thin API.

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function sendFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let pathname = url.pathname;

  if (pathname === '/') pathname = '/index.html';

  const apiMatch = pathname.match(/^\/api\/(events|religions|empires)$/);
  if (apiMatch) {
    const file = `${apiMatch[1]}.json`;
    fs.readFile(path.join(ROOT, 'data', file), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end(file === 'events.json' ? '[]' : '{"type":"FeatureCollection","features":[]}');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(data);
    });
    return;
  }

  const resolved = path.join(ROOT, pathname);
  if (!resolved.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('forbidden');
    return;
  }
  sendFile(res, resolved);
});

server.listen(PORT, () => {
  console.log(`strabos-epiphany listening on :${PORT}`);
});
