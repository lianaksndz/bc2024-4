const http = require('http');
const { Command } = require('commander');
const fs = require('fs').promises;
const path = require('path');

// Використання Commander.js для обробки аргументів командного рядка
const program = new Command();
program
    .requiredOption('-h, --host <type>', 'server host')
    .requiredOption('-p, --port <number>', 'server port')
    .requiredOption('-c, --cache <path>', 'cache directory path');

program.parse(process.argv);
const { host, port, cache } = program;

// Створення веб-сервера
const server = http.createServer(async (req, res) => {
    const statusCode = req.url.substring(1); // Отримуємо HTTP-код з URL (наприклад, /200)
    const fileName = path.join(cache, `${statusCode}.jpg`); // Формуємо шлях до кешованого файлу

    if (req.method === 'GET') {
        try {
            // Перевіряємо, чи є файл у кеші
            const file = await fs.readFile(fileName);
            res.writeHead(200, { 'Content-Type': 'image/jpeg' });
            res.end(file);
        } catch (err) {
            // Якщо файл не знайдено, повертаємо код 404
            res.statusCode = 404;
            res.end('Not Found');
        }
    } else if (req.method === 'PUT') {
        // Обробка PUT-запиту для збереження нового зображення у кеші
        let body = [];
        req.on('data', chunk => {
            body.push(chunk);
        }).on('end', async () => {
            try {
                await fs.writeFile(fileName, Buffer.concat(body));
                res.statusCode = 201; // Created
                res.end('Created');
            } catch (err) {
                res.statusCode = 500; // Internal Server Error
                res.end('Error saving file');
            }
        });
    } else if (req.method === 'DELETE') {
        // Обробка DELETE-запиту для видалення файлу з кешу
        try {
            await fs.unlink(fileName);
            res.statusCode = 200; // OK
            res.end('Deleted');
        } catch (err) {
            res.statusCode = 404; // Not Found
            res.end('Not Found');
        }
    } else {
        // Метод не підтримується
        res.statusCode = 405; // Method Not Allowed
        res.end('Method Not Allowed');
    }
});

// Запуск сервера на основі параметрів командного рядка
server.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}/`);
});
