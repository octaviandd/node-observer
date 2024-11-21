import BaseCollector from '../core/Watcher';

class ExceptionWatcher extends BaseCollector {
  type: string;
  content: any[];

  constructor() {
    super();
    this.type = 'exception';
    this.content = [];
  }
}

export default ExceptionWatcher;