import BaseCollector from '../core/Watcher';

class ExceptionWatcher extends BaseCollector {
  type: string;
  content: any[];
  should_display_on_index: boolean;

  constructor() {
    super();
    this.type = 'exception';
    this.content = [];
    this.should_display_on_index = true;
  }
}

export default ExceptionWatcher;