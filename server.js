const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Read index.html to check if we need to create a self-signed cert
const certPath = path.join(__dirname, 'cert.pem');
const keyPath = path.join(__dirname, 'key.pem');

// Function to create self-signed certificate if it doesn't exist
function ensureCertificate() {
  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    return;
  }

  console.log('🔐 Generating self-signed SSL certificate...');
  const { execSync } = require('child_process');
  
  try {
    // Generate self-signed certificate (valid for 365 days)
    execSync(`openssl req -x509 -newkey rsa:2048 -nodes -out "${certPath}" -keyout "${keyPath}" -days 365 -subj "/CN=localhost"`, {
      stdio: 'inherit'
    });
    console.log('✅ Certificate generated successfully!');
  } catch (err) {
    console.error('❌ Failed to generate certificate. Make sure OpenSSL is installed.');
    console.error('On Windows, you can install it via: choco install openssl');
    process.exit(1);
  }
}

// Serve static files with proper MIME types
function requestHandler(req, res) {
  // Log requests
  console.log(`${req.method} ${req.url}`);

  let filePath = path.join(__dirname, decodeURIComponent(req.url));
  
  // Default to index.html for root
  if (filePath.endsWith('/')) {
    filePath = path.join(filePath, 'index.html');
  }

  // Prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  // Check if file exists
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Try index.html as fallback for SPA routing
      const indexPath = path.join(__dirname, 'index.html');
      fs.stat(indexPath, (err, stats) => {
        if (err || !stats.isFile()) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
          return;
        }
        serveFile(indexPath, res);
      });
      return;
    }

    serveFile(filePath, res);
  });

  function serveFile(filepath, response) {
    const ext = path.extname(filepath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.json': 'application/json',
      '.css': 'text/css; charset=utf-8',
      '.png': 'image/png',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon'
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filepath, (err, content) => {
      if (err) {
        response.writeHead(500, { 'Content-Type': 'text/plain' });
        response.end('Internal Server Error');
        return;
      }

      // Add headers for PWA support
      response.writeHead(200, {
        'Content-Type': contentType,
        'Service-Worker-Allowed': '/',
        'Cache-Control': 'no-cache, must-revalidate'
      });
      response.end(content);
    });
  }
}

// Ensure certificate exists
ensureCertificate();

// Create HTTPS server
const options = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath)
};

const httpsServer = https.createServer(options, requestHandler);

// Also create HTTP server to redirect to HTTPS
const httpServer = http.createServer((req, res) => {
  res.writeHead(301, { 'Location': `https://localhost:8443${req.url}` });
  res.end();
});

const HTTPS_PORT = 8443;
const HTTP_PORT = 8080;

httpsServer.listen(HTTPS_PORT, () => {
  console.log(`\n🚀 IRL Gjemsel Local Server`);
  console.log(`================================`);
  console.log(`✅ HTTPS Server running at https://localhost:${HTTPS_PORT}`);
  console.log(`✅ HTTP redirect running at http://localhost:${HTTP_PORT}\n`);
  console.log(`📱 On your Android phone:`);
  console.log(`   - Find your computer's IP address (ipconfig on Windows)`);
  console.log(`   - Visit https://<YOUR_IP>:${HTTPS_PORT} on Chrome`);
  console.log(`   - Tap the menu icon and select "Install app"\n`);
  console.log(`🔍 On localhost:`);
  console.log(`   - Visit https://localhost:${HTTPS_PORT}\n`);
  console.log(`⚠️  Browser will warn about self-signed certificate (this is normal)\n`);
});

httpServer.listen(HTTP_PORT, () => {
  console.log(`✅ HTTP redirect active at http://localhost:${HTTP_PORT}`);
});

// Handle server errors
httpsServer.on('error', (err) => {
  console.error('HTTPS Server Error:', err);
});

httpServer.on('error', (err) => {
  console.error('HTTP Server Error:', err);
});

console.log('Press Ctrl+C to stop the server');
