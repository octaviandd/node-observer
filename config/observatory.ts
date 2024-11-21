export { }

// Extend the global object to include the config property
declare global {
  namespace NodeJS {
    interface Global {
      config: typeof config;
    }
  }
}


// Define your configuration variables
const config = {
 observatoryEnabled: true,
 observatoryPaused: false,
  // ...other config variables
};

// Attach the config to the global object
global.config = config;

// ...existing code...
