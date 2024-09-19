import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
// ^^^ Worker is a class allowing creation of new threads to run tasks in parallel
// ^^^ isMainThread is a boolean indicating if the code is running in the main thread
// ^^^ parentPort is a communication channel, lets workers send messages back to main thread
// ^^^ workerData is data passed from main thread to worker when worker is spawned

// Unsure if this part is needed or if it would help with url implementation
/*
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
*/

if (isMainThread) { //differentiates between main program/thread and worker threads (background parallel processing thing)
  // Spawns workers for parallel tasks
  // we're in main thread
  const runInThreadPool = (tasks: Function[]) => { // defines function (runInThreadPool) and takes our array of tasks, run them in parallel w/ worker threads
    const workers = tasks.map(task => { // runs provided code per task in parallel
        // ^^^ map function makes new array, each elem is a Promise (Promise is a value available after asynch task done, manages tasks when finish or error)
      return new Promise((resolve, reject) => { //resolve/reject based on worker completion or error
        // __filename to rerun current file
        const worker = new Worker(__filename, { workerData: task }); //__filename is file currently being executed
        // creates new worker thread using current file. Task is passed to worker through workerData
        worker.on('message', resolve); // listens for message from worker thread. Worker finish tasks -> send result back using parentPort.postMessage(),
        // ^^^triggers event, Promise is resolved
        worker.on('error', reject); // if errors in worker thread, Promise is rejected, error sent to main thread

      });
    });
    return Promise.all(workers);
    // waits for all worker threads to finish. Returns a Promise to resolve all tasks completed successfully. If any fails, reject w/ an error
  };

  //REPLACE TASKS BELOW WITH ACTUAL METRIC FUNCTIONS
  const tasks = [task1, task2, task3];  // REPLACE THESE, array of tasks we're running in parallel (our metrics)
  runInThreadPool(tasks).then(results => { //calls runInThreadPool func, pass in tasks list, returns Promise that resolves when all tasks done
    console.log('All tasks complete:', results);
    // ^^^ once all tasks complete, do the .then part, then log results
  });
} else { //if not main thread, run this
  // Worker thread
  const task = workerData;// Get task passed from main thread
  const result = workerData(); //execute the task (metric calc)
  parentPort.postMessage(result); //send result back to main thread
}
