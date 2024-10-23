const { program } = require("commander");
const http = require("http");
const fs = require("fs").promises;
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

fs.mkdir(cacheDir, { recursive: true })
  .then(() => console.log(`Cache directory ready: ${cacheDir}`))
  .catch((err) => {
    console.error("Error creating cache directory:", err);
    process.exit(1);
  });



async function handleGet(req, res, statusCode) {
  const imagePath = path.join(cacheDir, `${statusCode}.jpg`);

  try {
    const image = await fs.readFile(imagePath);
  
    res.writeHead(200, { "Content-Type": "image/jpeg" });
    res.end(image);
  } catch (err) {
    if (err.code === "ENOENT") {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    } else {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    }
  }
}


const server = http.createServer(async (req, res) => {
  const urlParts = req.url.split("/");
  const statusCode = urlParts[1];

  if (!/^\d{3}$/.test(statusCode)) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    return res.end("Not Found");
  }

  switch (req.method) {
    case "GET":
      await handleGet(req, res, statusCode);
      break;
    default:
      res.writeHead(405, { "Content-Type": "text/plain" });
      res.end("Method Not Allowed");
      break;
  }
});

server.listen(port, options.host, () => {
  console.log(`Server started on http://${options.host}:${port}`);
});
