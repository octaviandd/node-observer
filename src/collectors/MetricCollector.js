import BaseCollector from '../core/BaseCollector.js';


class MetricCollector extends BaseCollector {
  constructor() {
    this.type = 'metric';
    this.content = [];
  }

  index(req, res){
    // Return index view for CacheCollector
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
  }

  addMetric(metric) {
    this.metrics.push(metric);
  }

  getMetrics() {
    return this.metrics;
  }
}

export default MetricCollector;