const Hook = require("require-in-the-middle");
const shimmer = require("shimmer");
const { watchers } = require("../logger");
//
// 1. Hook the "winston" module
//
Hook(["winston"], function (exports, name, basedir) {
  // `exports` is the Winston module
  // We can patch Winston's logger creation functions or the default logger.

  //
  // 2. Patch `createLogger`, so every logger instance gets patched
  //
  shimmer.wrap(exports, "createLogger", function (originalCreateLogger) {
    return function patchedCreateLogger(...loggerArgs) {
      const loggerInstance = originalCreateLogger.apply(this, loggerArgs);

      // 3. Patch logger methods like `info`, `warn`, `error`
      ["info", "warn", "error", "debug", "verbose", "silly", "log"].forEach((method) => {
        if (typeof loggerInstance[method] === "function") {
          shimmer.wrap(loggerInstance, method, function (originalMethod) {
            return function patchedMethod(...args) {
              // Here you can instrument or log the log calls
              console.log(`[Patch] Winston ${method.toUpperCase()} called with args:`, args);

              watchers.logging.addContent({
                level: method,
                package: "winston",
                message: args[0],   // The first arg is often the log message
                time: new Date(),
              });

              // Continue calling the original Winston method
              return originalMethod.apply(this, args);
            };
          });
        }
      });

      return loggerInstance;
    };
  });

  //
  // 4. Patch the default logger (e.g., `winston.info(...)`) if needed
  //
  if (exports.default && typeof exports.default === "object") {
    // Winston exports a default logger with methods like info, warn, error, etc.
    ["info", "warn", "error", "debug", "verbose", "silly", "log"].forEach((method) => {
      if (typeof exports.default[method] === "function") {
        shimmer.wrap(exports.default, method, function (originalMethod) {
          return function patchedMethod(...args) {
            console.log(`[Patch] Default Winston ${method.toUpperCase()} called with args:`, args);

            watchers.logging.addContent({
              level: method,
              package: "winston",
              message: args[0],
              time: new Date(),
            });

            return originalMethod.apply(this, args);
          };
        });
      }
    });
  }

  // 5. Return the patched module
  return exports;
});
