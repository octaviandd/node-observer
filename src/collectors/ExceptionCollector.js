import BaseCollector from '../core/BaseCollector.js';


class ExceptionCollector extends BaseCollector {
  constructor() {
    this.type = 'exception';
    this.content = [];
  }

  index(req, res){
    // Return index view for CacheCollector
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
  }

  captureException(exception) {
    this.capture(exception);
  }
}

export default ExceptionCollector;