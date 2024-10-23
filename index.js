const { program } = require("commander");
const http = require("http");
const fs = require("fs");
const path = require("path");

program
  .requiredOption("-h, --host <host>")
  .requiredOption("-p, --port <port>")
  .requiredOption("-c, --cache <cache>")
  .parse();

const options = program.opts();




if (!/^([a-zA-Z0-9.-]+|\*)$/.test(options.host)) {
  console.error("Host must be a valid hostname or IP address.");
  process.exit(1);
}



const port = parseInt(options.port, 10);

if (isNaN(port) || port < 1 || port > 65535) {
  console.error("Port must be an integer between 1 and 65535.");
  process.exit(1);
}




const cacheDir = path.resolve(options.cache);

try {
  fs.accessSync(cacheDir);
} catch (err) {
  fs.mkdirSync(cacheDir, { recursive: true });
  console.log(`Cache directory created: ${cacheDir}`);
}



const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello!");
});



server.listen(port, options.host, () => {
  console.log(`Server started on http://${options.host}:${port}`);
});
