import http from "http";

const pid = process.pid;

const server = http.createServer((_, res) => {
  for(let i = 1e7; i > 0; i--) {}
  res.end(`Recieved request from ${pid}`);
});

server.listen(process.argv[2] || 3000, () => {
  console.log(`Started in ${pid}`);
});

setTimeout(() => {
  throw new Error("Worker clashed");
}, Math.ceil(Math.random() * 10) * 1000);
