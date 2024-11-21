class BaseCollector {
  collectorName: string;
  collectorType: string;
  should_display_on_index: boolean;

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
  

  /**
   * Validate the log entry
   * @param {*} log 
   * @returns boolean
   */
 

  /**
   * Get the logs
   * @returns Array
   */
  

  /**
   * Filter logs
   * @param {*} filter 
   * @returns 
   */
 

  /**
   * Clear logs
   */
  
 
}

export default BaseCollector;