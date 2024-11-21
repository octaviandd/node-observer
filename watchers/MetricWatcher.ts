import Watcher from '../core/Watcher';

class MetricWatcher extends Watcher {
  type: string;
  content: any[];

  constructor() {
    super();
    this.type = 'metric';
    this.content = [];
  }
}

export default MetricWatcher;