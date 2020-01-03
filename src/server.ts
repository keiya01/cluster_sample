import http from "http";

const pid = process.pid;

const server = http.createServer((_, res) => {
  // 重い処理を再現するためにループ処理を実行している
  for(let i = 1e7; i > 0; i--) {}
  res.end(`Recieved request from ${pid}`);
});

server.listen(process.argv[2] || 3000, () => {
  console.log(`Started in ${pid}`);
});

// exit イベントを発生させるためにランダムな時間でエラーを発生させている
setTimeout(() => {
  throw new Error("Worker clashed");
}, Math.ceil(Math.random() * 100) * 1000);
