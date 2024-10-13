const http = require('http');
const { Command } = require('commander');
const program = new Command();

program
    .requiredOption('-h, --host <type>', 'server host')
    .requiredOption('-p, --port <number>', 'server port')
    .requiredOption('-c, --cache <path>', 'cache directory path');

program.parse(process.argv);

const { host, port, cache } = program;

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Server is running');
});

server.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}/`);
});
