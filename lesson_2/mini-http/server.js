const { error } = require('console');
const http = require('http');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;

function createSend(req, res, start) {
    return (status, body, headers = {}) => {
        const payload = typeof body === 'string' ? body: JSON.stringify(body);
        const isJSON = typeof body === 'object';

        res.writeHead(status, {
            'Content-type': isJSON ? 'application/json' : 'text/html',
            ...headers
        });
        res.end(payload);

        const duration = Date.now() - start;
        console.log(`${req.method} ${req.url} ${status}, duration - ${duration}ms`);
    }
}

const readBody = (req) => 
    new Promise((resolve, reject) => {
        let data = '';
        req.on('data', (chunk) => {
            data += chunk;

            if (data.length > 1e6) {
                req.connection.detroy();
                reject(new Error('payload is too large'));
            }
        });
        req.on('end', () => resolve(data));
        req.on('error', reject);
    });

const server = http.createServer(async (req, res) => {
    const start = Date.now();
    const send = createSend(req, res, start);

    try {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const { pathname, searchParams } = url;

        if (req.method === 'GET' && pathname === '/') {
            return send(200, `
                <html>
                    <head><title>NODE.JS SERVER</title></head>
                    <body>
                        <h1>Сервер на node.js без фреймворков</h1>
                    </body>
                </html>
            `);
        }
        
        if (req.method === 'GET' && pathname === '/about') {
            return send(200, `
                <html>
                    <head><title>ABOUT</title></head>
                    <body>
                        <h1>About</h1>
                        <p>Сервер использует только встроенные модули node.js</p>
                    </body>
                </html>
            `); 
        }

        if (req.method === 'GET' && pathname === '/time') {
            return send(200, {
                now: new Date().toString(),
                tz: Intl.DateTimeFormat().resolvedOptions().timeZone
            }); 
        }

        if(req.method === 'GET' && pathname === '/api/random') {
            const min = Number(searchParams.get('min')) || 0;
            const max = Number(searchParams.get('max')) || 100;

            if (Number.isNaN(min) || Number.isNaN(max) || min > max) {
                return send(400, { error: 'Invalid range'});
            }

            const random = Math.floor(Math.random() * (max - min + 1)) + min;

            return send(200, { random });
        }

        if (req.method === 'POST' && pathname === '/echo') {
            const raw = await readBody(req);
            let json = null;
            try {
                json = raw ? JSON.parse(raw) : {};
            } catch {
                return send(res, 400, { error: 'Invalid JSON' });
            }

            return send(201, {
                received: json,
                headers: req.headers,
                method: req.method,
                url: req.url,
            });
        }

        send(res, 404, { error: 'Not Found' });
    } catch (err) {
        console.log(err);
        send(500, { error: 'Internal Server Error'});
    }
        
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

const shutdown = () => {
    console.log('\nServer is shutting down');
    server.close(() => {
        console.log('Server stopped');
        process.exit(0);
    });
    setTimeout(() => process.exit(1), 5000).unref();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
