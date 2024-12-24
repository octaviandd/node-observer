const Hook = require("require-in-the-middle");
const shimmer = require("shimmer");
const { watchers } = require("../logger");

// Intercepts loading of "bunyan"
Hook(["bunyan"], function (exports, name, basedir) {
  // The `exports` object is the "bunyan" module.
  // We'll wrap "createLogger" to patch its returned loggers.

  // 1. Save the original createLogger
  const originalCreateLogger = exports.createLogger;

  // 2. Patch createLogger
  shimmer.wrap(exports, "createLogger", function (originalFn) {
    return function patchedCreateLogger(...loggerArgs) {
      // Call the original createLogger
      const loggerInstance = originalFn.apply(this, loggerArgs);

      // 3. Patch logger methods: info, warn, error, debug, trace, fatal
      ["info", "warn", "error", "debug", "trace", "fatal"].forEach((method) => {
        if (typeof loggerInstance[method] === "function") {
          shimmer.wrap(loggerInstance, method, function (originalMethod) {
            return function patchedMethod(...args) {
              // Instead of console.log, call watchers.logging.addContent
              watchers.logging.addContent({
                level: method,
                package: "bunyan",
                message: args[0], // The first arg is often the message
                time: new Date(),
              });

              // Continue calling the original method
              return originalMethod.apply(this, args);
            };
          });
        }
      });

      return loggerInstance;
    };
  });

  // Return the patched bunyan module
  return exports;
});
