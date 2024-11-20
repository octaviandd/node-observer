import BaseCollector from '../core/BaseCollector.js';


class ModelsCollector extends BaseCollector {
  constructor() {
    this.type = 'model';
    this.content = [];
  }

  index(req, res){
    // Return index view for CacheCollector
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
  }

  collect() {
    this.models = this.getModels();
  }

  getModels() {
    return this.getFiles(this.modelsPath);
  }
}

export default ModelsCollector;