import connection from "../../database/connection";

class BaseCollector {
  constructor() {
    this.collectorName = 'observatory_entries';
    this.collectorType = 'base';
    this.should_display_on_index = true;
  }

  capture() {
    throw new Error('Method not implemented');
  }

  /**
   * Add log to the collector
   * @param {Object} log 
   */
  addLog(log) {
    if(this.validateLog(log)) {
      this.content.push(log);
    } else {
      throw new Error('Invalid log');
    }
  }

  /**
   * Validate the log entry
   * @param {*} log 
   * @returns boolean
   */
  validateLog(log) {
    return typeof log === 'object' && log !== null;
  }

  /**
   * Get the logs
   * @returns Array
   */
  getContent() {
    return this.content;
  }

  /**
   * Filter logs
   * @param {*} filter 
   * @returns 
   */
  filterContent(filter) {
    return this.content.filter(filter);
  }

  /**
   * Clear logs
   */
  clearLogs() {
    this.content = [];
  }

  paginateContent(page, limit) {
    return this.content.slice(page * limit, (page + 1) * limit);
  }
}

export default BaseCollector;