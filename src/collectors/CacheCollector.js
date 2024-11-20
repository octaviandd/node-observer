import BaseCollector from "../core/BaseCollector";

class CacheCollector extends BaseCollector {
  constructor() {
    this.type = 'cache';
    this.content = [];
  }

  index(req, res){
    // Return index view for CacheCollector
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
  }

  view(key) {
    return this.get(key);
  }

  collect(key, value) {
    this.cache[key] = value;
  }

  get(key) {
    return this.cache[key];
  }
}

export default CacheCollector;