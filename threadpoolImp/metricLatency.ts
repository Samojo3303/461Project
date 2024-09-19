import { performance } from 'perf_hooks'; // getting perf_hooks module to get timestamps for helping us measure operations

// accepts metric function (metric calc function) to 
// measure latency (how long metric function takes to execute)
// takes in the metric calc from Sam and Harrison
const measureLatency = (metricFunction: Function) => { 
  // records start and end time and whatnot
    const startTime = performance.now(); // records how long function takes to run
    const result = metricFunction();
    const endTime = performance.now();
    const latency = endTime - startTime;
    
    // gives output of metric function and time (in milliseconds) to execute
    return { result, latency };
};

// *How to implement for future metrics:
// const metric1 = () => { /* logic for metric 1 */ };
// const { result, latency } = measureLatency(metric1);
// *outputs result + latency, displays value + rounding to 3 decimals
// console.log(`Metric result: ${result}, Latency: ${latency.toFixed(3)} ms`);
