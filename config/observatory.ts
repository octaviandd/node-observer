export { };

// Extend the global object to include the config property
// Define your configuration variables
const config = {
  observatoryEnabled: true,
  observatoryPaused: false,
  // ...other config variables
};

// Attach the config to the global object
(global as any).config = config;
