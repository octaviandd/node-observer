import Watcher from '../core/Watcher';

class CacheWatcher extends Watcher {
  type: string;
  content: any[];
  should_display_on_index: boolean;

  constructor() {
    super();
    this.type = 'cache';
    this.should_display_on_index = true;
    this.content = [];
  }
}

export default CacheWatcher;