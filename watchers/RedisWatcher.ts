import Watcher from '../core/Watcher';

class RedisWatcher extends Watcher {
  type: string;
  content: any[];
  should_display_on_index: boolean;

  constructor() {
    super();
    this.type = 'redis';
    this.content = [];
    this.should_display_on_index = true;
  }
}

export default RedisWatcher;