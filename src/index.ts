import cluster from "cluster";
import os from "os";

if(cluster.isMaster) {
  const cpus = os.cpus().length;
  console.log(`Clustering to ${cpus} cpus`);
  for(let i = 0; i < cpus; i++) {
    cluster.fork();
  }
} else {
  require("./server");
}
