import { Request, Response, NextFunction } from 'express';
import RequestWatcher from '../watchers/RequestWatcher';
const requestCollector = new RequestWatcher();

function requestLogger(req: Request, res: Response, next: NextFunction){
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    requestCollector.addContent({
      method: req.method,
      url: req.url,
      timestamp: new Date(),
      status: res.statusCode,
      duration,
      ipAddress: req.ip,
      memoryUsage: process.memoryUsage(),
      middleware: 'middleware',
      controllerAction: 'requestLogger',
      hostname: req.hostname,
      payload: req.body,
      session: 'session',
      response: 'response',
      headers: req.headers,
      body: 'body',
    });

    console.log(`Request to ${req.path} took ${duration}ms`);
  });

  next();
}


export { requestLogger };