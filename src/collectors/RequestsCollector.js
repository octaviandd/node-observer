import BaseCollector from '../core/BaseCollector.js';
import connection from "../../database/connection";

class RequestsCollector extends BaseCollector {
  constructor(){
    super();
    this.content = [];
    this.type = 'request';
  }

  async index(req, res){
    // Return index view for RequestsCollector
    const data = await connection('observatory_entries').where('type', 'request').select('*');
    res.render('index', { title: 'Requests', data });
  }

  view(req, res){
    // Return view for RequestsCollector
    const requestId = req.params.id;
    res.render('view', { title: 'Request Collector', data: this.content });
  }

  collect(req){
    const log = {
      method: req.method,
      url: req.url,
      timestamp: new Date(),
      status: req.status,
      duration: req.duration,
      ipAddress: req.ipAddress,
      memoryUsage: req.memoryUsage,
      middleware: req.middleware,
      controllerAction: req.controllerAction,
      hostname: req.hostname,
      payload: req.payload,
      session: req.session,
      response: req.response,
      headers: req.headers,
      body: req.body,
    }

    this.content = JSON.stringify(log);
  }

  getLogs(){
    return this.content;
  }

  getRequestsByStatus(status){
    return this.content.filter(log => log.status === status);
  }

  getRequestsByMethod(method){
    return this.content.filter(log => log.method === method);
  }

  getRequestCount(){
    return this.content.length;
  }

  getRequestByTag(tag){
    return this.content.filter(log => log.tags.includes(tag));
  }
}


export default RequestsCollector;