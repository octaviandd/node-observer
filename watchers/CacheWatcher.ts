import Watcher from '../core/Watcher';

class CacheWatcher extends Watcher {
  type: string;
  content: any[];

  constructor() {
    super();
    this.type = 'cache';
    this.content = [];
  }
}

export default CacheWatcher;