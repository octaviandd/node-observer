import Watcher from '../core/Watcher';

class MetricWatcher extends Watcher {
  type: string;
  content: any[];
  should_display_on_index: boolean;

  constructor() {
    super();
    this.type = 'metric';
    this.content = [];
    this.should_display_on_index = true;
  }
}

export default MetricWatcher;