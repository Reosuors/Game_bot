const http = require('http');

function startKeepAliveServer() {
    const port = process.env.PORT || 3000;

    const server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('⚡ البوت الخارق شغال تمام! ✅');
    });

    server.listen(port, () => {
        console.log(`🌐 سيرفر الفحص (Keep Alive) شغال على المنفذ ${port}`);
    });

    return server;
}

module.exports = { startKeepAliveServer };
