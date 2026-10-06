const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 4173;
const ROOT = __dirname;

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
};

function send(res, status, filePath) {
  const ext = path.extname(filePath);
  const contentType = CONTENT_TYPES[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end('Internal Server Error');
      return;
    }
    res.writeHead(status, { 'Content-Type': contentType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0].split('#')[0];
  let filePath = path.join(ROOT, decodeURIComponent(urlPath));

  // Prevent path traversal outside ROOT
  if (!filePath.startsWith(ROOT)) {
    filePath = path.join(ROOT, 'index.html');
  }

  if (urlPath === '/' || urlPath === '') {
    send(res, 200, path.join(ROOT, 'index.html'));
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Unknown path serves index.html (single-page app)
      send(res, 200, path.join(ROOT, 'index.html'));
      return;
    }
    send(res, 200, filePath);
  });
});

server.listen(PORT, () => {
  console.log(`CAMT Study Room Booking running at http://localhost:${PORT}`);
});
