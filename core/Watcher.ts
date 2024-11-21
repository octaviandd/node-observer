import { Request, Response } from 'express';

const Watcher = {
  index: (res: Response, req: Request) => {
    return res.status(200).json({ message: 'Index' });
  },
  view: (res: Response, req: Request) => {
    return res.status(200).json({ message: 'View' });
  },
  status: () => {
    if (!(global as any).config.observatoryEnabled) {
      return 'disabled';
    } else if (!(global as any).config.observatoryPaused) {
      return 'paused';
    }

    return 'enabled'
  }
}


export default Watcher;