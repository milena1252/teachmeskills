const http = require('http');
const fs = require('fs');
const { Transform, pipeline } = require('stream');
const EventEmitter = require('events');

class Logger extends EventEmitter {
    log(message) {
        console.log(`[INFO]: ${message}`);
        this.emit('info', message);
    }
    error(message) {
        console.error(`[ERROR]: ${message}`);
        this.emit('error', message);
    }
    warn(message) {
        console.warn(`[WARN]: ${message}`);
        this.emit('warn', message);
    }
}

const logger = new Logger();

logger.on('info', (msg) => {
    console.log(`Событие INFO: ${msg}`);
});

logger.on('error', (msg) => {
    console.log(`Событие ERROR: ${msg}`);
});

logger.on('warn', (msg) => {
    console.log(`Событие WARN: ${msg}`);
});


const PORT = 3000;

class UpperCaseStream extends Transform {
    _transform(chunk, encoding, callback) {
        callback(null, chunk.toString().toUpperCase());
    }
}

const server = http.createServer((req, res) => {
    logger.log(`Получен запрос: ${req.method} ${req.url}`);

    if (req.method === 'GET' && req.url === '/') {
        res.writeHead(200, { 'content-type': 'text/plain, charset=utf-8' });
        
        logger.log('Начало обработки файла data.txt');

        const src = fs.createReadStream('data.txt');
        const upper = new UpperCaseStream();

        pipeline(src, upper, res, (err) => {
            if(err) {
                logger.error(`Ошибка обработки файла: ${err.message}`);
                console.error('pipeline err:', err.message);
                if(!res.headersSent) {
                    res.writeHead(500, { 'content-type': 'text/plain, charset=utf-8' });
                }

                if(!res.writableEnded) {
                    res.end('Ошибка обработки файла');
                }
            } else {
                logger.log('Файл успешно обработан');
            }
        })
    } else {
        logger.warn(`Неизвестный маршрут: ${req.method} ${req.url}`);
        res.writeHead(404, { 'content-type': 'text/plain, charset=utf-8' });
        res.end('NOT FOUND');
    }
});

server.listen(PORT, () => {
    console.log('HTTP сервер запущен');
})