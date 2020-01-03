import cluster from "cluster";
import os from "os";

if(cluster.isMaster) {
  const cpus = os.cpus().length;
  console.log(`Clustering to ${cpus} cpus`);
  for(let i = 0; i < cpus; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code) => {
    if(code !== 0 && !worker.exitedAfterDisconnect) {
      console.log("Worker was restarted");
      cluster.fork();
    }
  });

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
  require("./server");
}
