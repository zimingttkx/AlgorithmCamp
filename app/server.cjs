const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5177;
const DIST_DIR = path.join(__dirname, 'dist');
const BASE_PATH = '/AlgorithmCamp';

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml'
};

const server = http.createServer((req, res) => {
  let url = req.url;
  if (url.startsWith(BASE_PATH)) {
    url = url.substring(BASE_PATH.length) || '/';
  }
  
  let filePath = path.join(DIST_DIR, url === '/' ? 'index.html' : url);
  
  // Handle SPA routes - serve index.html for non-file paths
  if (!path.extname(filePath) || !fs.existsSync(filePath)) {
    filePath = path.join(DIST_DIR, 'index.html');
  }
  
  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'text/plain';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}${BASE_PATH}/`);
});
