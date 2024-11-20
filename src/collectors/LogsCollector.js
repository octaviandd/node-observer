import BaseCollector from '../core/BaseCollector.js';


class LogsCollector extends BaseCollector {
  constructor() {
    this.type = 'log';
    this.content = [];
  }

  index(req, res){
    // Return index view for CacheCollector
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
  }

  captureMessage(message) {
    this.capture(message);
  }
}

export default LogsCollector;