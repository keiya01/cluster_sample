import cluster from "cluster";
import os from "os";

// マスタープロセスの時のみ実行される
if(cluster.isMaster) {
  const cpus = os.cpus().length;
  console.log(`Clustering to ${cpus} cpus`);

  // マスタープロセスから CPU の数だけ新しいインスタンスを fork する
  for(let i = 0; i < cpus; i++) {
    cluster.fork();
  }

  // エラーが発生して worker が exit したときに新しいインスタンスを fork する
  cluster.on("exit", (worker, code, signal) => {
    if(code !== 0 && !worker.exitedAfterDisconnect) {
      console.log("Worker was restarted: ", worker.process.pid, code, signal);
      cluster.fork();
    }
  });

  /** 
   * ユーザー定義の signal を受け取る
   * ここでは SIGUSR2 を受け取ったときにそれぞれの worker をリスタートするように
   * 実装している(サーバーをアップデートするときなどにダウンタイムなくリスタートするため)
  */
  process.on("SIGUSR2", () => {
    const workers = Object.keys(cluster.workers);
    const restartWorker = (i: number) => {
      if(i >= workers.length) return;

      const worker = cluster.workers[workers[i]];
      if(!worker) return;

      console.log(`Stopping worker is ${worker.process.pid}`);
      worker.disconnect();

      worker.on("disconnect", () => {
        const newWorker = cluster.fork();
        newWorker.on("listening", () => {
          restartWorker(i + 1);
        });
      });
    }
    restartWorker(0);
  });
} else if(cluster.isWorker) {
  /**
   * マスタープロセスでの処理が終わるとワーカープロセスに切り替わる
   * ワーカープロセスでサーバーを起動させる
  */
  require("./server");
}
