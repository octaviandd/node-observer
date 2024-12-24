const Hook = require("require-in-the-middle");
const shimmer = require("shimmer");
const { watchers } = require("../logger");

// Intercepts `require("log4js")`
Hook(["log4js"], function (exports, name, basedir) {
  // `exports` is the log4js module.
  // We'll patch `getLogger` so that we can intercept the returned logger instance.

  const originalGetLogger = exports.getLogger;

  // Wrap the getLogger function
  shimmer.wrap(exports, "getLogger", function (originalFn) {
    return function patchedGetLogger(...loggerArgs) {
      // Call the original getLogger
      const loggerInstance = originalFn.apply(this, loggerArgs);

      // Patch each logging method
      ["info", "warn", "error", "debug", "trace", "fatal", "mark"].forEach((method) => {
        if (typeof loggerInstance[method] === "function") {
          shimmer.wrap(loggerInstance, method, function (originalMethod) {
            return function patchedMethod(...args) {
              // Instrument or log the calls as you wish
              console.log(`[Patch] Log4js ${method.toUpperCase()} called with args:`, args);

              watchers.logging.addContent({
                package: "log4js",
                method,
                args,
                timestamp: new Date(),
              });
              // Then call the original method
              return originalMethod.apply(this, args);
            };
          });
        }
      });

      return loggerInstance;
    };
  });

  // Return the patched module so that any subsequent `require("log4js")`
  // uses our modified version.
  return exports;
});
