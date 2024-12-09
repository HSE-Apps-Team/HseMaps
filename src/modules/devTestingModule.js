    export class Stats {
      constructor(trials, func, ...args) {
          this.count = 0;
          this.mean = 0;
          this.M2 = 0;  // Sum of squares of differences from the mean
          this.min = Infinity;
          this.max = -Infinity;
          for (let i = 0; i < trials; i++) {
              this.addValue(measureExecutionTime(func, ...args));
          }
      }
  
      addValue(value) {
          this.count++;
          
          const delta = value - this.mean;
          this.mean += delta / this.count;
          this.M2 += delta * (value - this.mean);
          
          if (value < this.min) {
              this.min = value;
          }
          if (value > this.max) { 
              this.max = value;
          }
      }
  
      getMean() {
          return this.mean;
      }
  
      getVariance() {
          return this.count > 1 ? this.M2 / this.count : 0;
      }
  
      getStdDev() {
          return Math.sqrt(this.getVariance());
      }
  
      getMin() {
          return this.min;
      }
  
      getMax() {
          return this.max;
      }
  }

  function measureExecutionTime(func, ...args) {
    const start = performance.now();
    const result = func(...args);
    const end = performance.now();
    return end-start;
  }
  function flipKeyValuePairWithMultiNodes(obj) {
    let flipped = {};
    
    for (let node in obj) {
        if (obj.hasOwnProperty(node)) {
            obj[node].forEach(room => {
                if (!flipped[room]) {
                    flipped[room] = [];
                }
                flipped[room].push(node);
            });
        }
    }
    
    return flipped;
}

