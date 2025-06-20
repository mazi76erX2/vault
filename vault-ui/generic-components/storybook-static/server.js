/* eslint-disable*/
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const os = require('os');

const isLocalDevelopment = process.argv.includes('-l');

const getNetworkIPs = () => {
    const interfaces = os.networkInterfaces();
    const ips = [];

    for (const [_, interfaceConfigs] of Object.entries(interfaces)) {
        for (const config of interfaceConfigs) {
            if (config.family === 'IPv4' && !config.internal) {
                ips.push(config.address);
            }
        }
    }

    return ips;
};

const server = http.createServer((req, res) => {
    let parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;

    // Normalize the path to prevent directory traversal
    let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');

    // Choose the appropriate base path based on the environment
    const basePath = isLocalDevelopment ? path.join(__dirname, 'storybook-static') : __dirname;

    let filePath = path.join(basePath, safePath);

    // If the path ends with '/', append 'index.html'
    if (pathname.endsWith('/')) {
        filePath = path.join(filePath, 'index.html');
    }

    fs.stat(filePath, (err, stats) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // If file not found, try serving index.html (for SPA routing)
                filePath = path.join(__dirname, 'storybook-static', 'index.html');
                fs.readFile(filePath, (err, content) => {
                    if (err) {
                        res.writeHead(404);
                        res.end('404 Not Found');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(content);
                    }
                });
            } else {
                res.writeHead(500);
                res.end('500 Internal Server Error');
            }
            return;
        }

        if (stats.isDirectory()) {
            filePath = path.join(filePath, 'index.html');
        }

        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('500 Internal Server Error');
            } else {
                const ext = path.extname(filePath).toLowerCase();
                let contentType = 'text/html';
                switch (ext) {
                    case '.js':
                        contentType = 'text/javascript';
                        break;
                    case '.css':
                        contentType = 'text/css';
                        break;
                    case '.json':
                        contentType = 'application/json';
                        break;
                    case '.png':
                        contentType = 'image/png';
                        break;
                    case '.jpg':
                        contentType = 'image/jpg';
                        break;
                }
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content);
            }
        });
    });
});



const PORT = 8080;
server.listen(PORT, '0.0.0.0', () => {
    // On local dev make use of node server.js -l to run the server in local development mode
    console.log(`Server running in ${isLocalDevelopment ? 'local development' : 'Docker'} mode`);
    console.log('Server running on:');
    console.log(`Local:http://localhost:${PORT}`);
    const networkIPs = getNetworkIPs();
    networkIPs.map((ip)=>{
        console.log(`Network:http://${ip}:${PORT}`);
    });

});
