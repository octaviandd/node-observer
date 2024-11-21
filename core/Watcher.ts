import { Request, Response } from 'express';

class Watcher {
  constructor() {
  }

  /**
   * Returns index entries.
   * @param res
   * @param req
   * @returns JSON
   */
  index(res: Response, req: Request) {
    return res.status(200).json({ message: 'Index' });
  }

  /**
   * Return class view.
   * @param res
   * @param req
   * @returns
   */
  view(res: Response, req: Request) {
    return res.status(200).json({ message: 'View' });
  }

  status() {
    if (!global.config.observatoryEnabled) {
      return 'disabled';
    } else if (!global.config.observatoryPaused) {
      return 'paused';
    }

    return 'enabled'
  }
}

export default Watcher;