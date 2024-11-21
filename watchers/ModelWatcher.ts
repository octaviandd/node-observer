import Watcher from '../core/Watcher';

class ModelsWatcher extends Watcher {
  type: string;
  content: any[];

  constructor() {
    super();
    this.type = 'model';
    this.content = [];
  }
}

export default ModelsWatcher;