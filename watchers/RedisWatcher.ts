import Watcher from '../core/Watcher';

class RedisWatcher extends Watcher {
  type: string;
  content: any[];

  constructor() {
    super();
    this.type = 'redis';
    this.content = [];
  }
}

export default RedisWatcher;