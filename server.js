/**
 * จานเด็ด SPU (SPU Best Dishes & Canteen Review System)
 * Backend HTTP & REST API Server (Node.js Localhost Server)
 * 
 * รันเซิร์ฟเวอร์: node server.js หรือคลิกไฟล์ start-server.bat
 * เข้าใช้งานผ่านเบราว์เซอร์: http://localhost:3000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const { handleApiRequest } = require('./server/routes/api');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // Collect request body for POST/PUT
  let bodyBuffer = '';
  req.on('data', chunk => {
    bodyBuffer += chunk;
  });

  req.on('end', () => {
    let body = {};
    if (bodyBuffer) {
      try {
        body = JSON.parse(bodyBuffer);
      } catch (e) {
        body = { raw: bodyBuffer };
      }
    }

    // 1. API Route Handling (/api/*)
    if (pathname.startsWith('/api/')) {
      const handled = handleApiRequest(req, res, pathname, parsedUrl.query, body);
      if (handled) return;

      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ status: 'error', message: 'API Endpoint not found' }));
      return;
    }

    // 2. Static File Serving (Block private/backend/test files)
    if (pathname === '/') {
      pathname = '/index.html';
    }

    const decodedPath = decodeURIComponent(pathname);
    const normalizedRel = path.normalize(decodedPath).replace(/^(\.\.[\/\\])+/, '');
    const lowerRel = normalizedRel.replace(/\\/g, '/').toLowerCase();
    const blockedPrefixes = ['/server/', '/tests/', '/node_modules/', '/.'];
    const blockedExact = ['/server.js', '/package.json', '/package-lock.json', '/firestore.rules', '/start-server.bat'];
    if (
      blockedPrefixes.some(p => lowerRel.startsWith(p) || lowerRel.includes('/.')) ||
      blockedExact.includes(lowerRel) ||
      lowerRel.endsWith('.bat')
    ) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ status: 'error', message: 'Forbidden' }));
      return;
    }

    const rootDir = path.resolve(__dirname);
    const filePath = path.resolve(rootDir, normalizedRel.replace(/^[\/\\]+/, ''));
    if (!filePath.startsWith(rootDir + path.sep)) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ status: 'error', message: 'Forbidden' }));
      return;
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(`
          <div style="font-family: sans-serif; text-align: center; padding: 4rem;">
            <h2>404 - ไม่พบไฟล์ที่ร้องขอ</h2>
            <p>ไม่พบไฟล์: <code>${pathname}</code></p>
            <a href="/" style="color: #f43f5e; font-weight: bold;">กลับสู่หน้าหลัก จานเด็ด SPU</a>
          </div>
        `);
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.statusCode = 200;
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'no-cache');

      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    });
  });
});

server.listen(PORT, () => {
  console.log(`
========================================================================
  🍛✨ จานเด็ด SPU (Sripatum University Best Dishes) Localhost Server
========================================================================
  🚀 เซิร์ฟเวอร์กำลังทำงานบนพอร์ต: http://${HOST}:${PORT}
  📁 ที่ตั้งโปรเจกต์: ${__dirname}
  📊 REST API Health Check: http://${HOST}:${PORT}/api/health
  👥 สถิติผู้เข้าชมเว็บไซต์: http://${HOST}:${PORT}/api/stats
  🎓 บัญชีแอดมิน: admin@spu.ac.th | รหัสผ่าน: password123
========================================================================
  กด Ctrl + C เพื่อหยุดการทำงานของเซิร์ฟเวอร์
`);
});
