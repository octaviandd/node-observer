import RequestCollector from '../collectors/RequestsCollector.js';

const requestCollector = new RequestCollector();

function requestLogger(req, res, next){
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    requestCollector.addLog({
      method: req.method,
      url: req.url,
      timestamp: new Date(),
      status: res.statusCode,
      duration,
      ipAddress: req.ip,
      memoryUsage: process.memoryUsage(),
      middleware: req.middleware,
      controllerAction: req.controllerAction,
      hostname: req.hostname,
      payload: req.body,
      session: req.session,
      response: res.body,
      headers: req.headers,
      body: res.body,
    });

    console.log(`Request to ${req.path} took ${duration}ms`);
  });
  
  next();
}


export { requestLogger, requestCollector };