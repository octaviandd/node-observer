import Watcher from '../core/Watcher';

class QueryWatcher extends Watcher {
  type: string;
  content: any[];

  constructor() {
    super();
    this.type = 'query';
    this.content = [];
  }
}

export default QueryWatcher;