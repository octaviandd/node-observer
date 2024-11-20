import BaseCollector from '../core/BaseCollector.js';


class RedisCollector extends BaseCollector {
  constructor() {
    this.type = 'redis';
    this.content = [];
  }

  index(req, res){
    // Return index view for CacheCollector
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
  }

  capture(redis) {
    this.capture(redis);
  }
}

export default RedisCollector;