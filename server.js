// ⚠️ DÉVELOPPEMENT LOCAL UNIQUEMENT
// Ce fichier est utilisé UNIQUEMENT pour servir le frontend localement pendant le développement
// EN PRODUCTION: Netlify héberge le frontend statique - CE FICHIER N'EST PAS UTILISÉ

// Simple HTTP Server for PHENIX Frontend (LOCAL DEVELOPMENT ONLY)
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5500;

console.log(`
╔════════════════════════════════════════════════════════════════╗
║  🚀 PHENIX TECH-SERVICES Frontend Server (DEV LOCAL)          ║
╠════════════════════════════════════════════════════════════════╣
║  ✓ Serveur: http://localhost:${PORT}                             ║
║  ✓ Backend: https://backend-phenix.onrender.com/api            ║
║  ✓ Mode: DÉVELOPPEMENT LOCAL UNIQUEMENT                        ║
║                                                                ║
║  ⚠️  NE PAS UTILISER EN PRODUCTION!                           ║
║  En production, Netlify héberge le frontend statiquement.     ║
╚════════════════════════════════════════════════════════════════╝
`);

const server = http.createServer((req, res) => {
    // Route par défaut
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    
    // Déterminer le type de contenu
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // Fichier non trouvé - servir index.html pour les SPA
                fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(content, 'utf-8');
                });
            } else {
                res.writeHead(500);
                res.end('Erreur serveur: ' + err.code + ' ..\n');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Frontend serveur lancé sur http://localhost:${PORT}`);
    console.log(`📁 Répertoire racine: ${__dirname}`);
});
