const Hook = require("require-in-the-middle");
const shimmer = require("shimmer");
const { watchers } = require("../logger");

Hook(["pino"], function (exports, name, basedir) {
  // The `exports` here is the top-level function from "pino".
  // We can wrap that function to intercept any Pino logger creation.

  // 1. Save the original pino function
  const originalPino = exports;

  // 2. Create a patched version of the pino function
  function patchedPino(...args) {
    // Call the original pino function to get a logger instance
    const loggerInstance = originalPino(...args);

    // 3. Patch logger methods like `info`, `warn`, `error`, etc.
    ["info", "warn", "error", "debug", "trace", "fatal"].forEach((method) => {
      if (typeof loggerInstance[method] === "function") {
        shimmer.wrap(loggerInstance, method, function (originalMethod) {
          return function patchedMethod(...logArgs) {
            // Here you can instrument or log the calls
            console.log(`[Patch] Pino ${method.toUpperCase()} called with args:`, logArgs);

            watchers.logging.addContent({
              package: "pino",
              method: method,
              args: logArgs,
              timestamp: new Date(),
            });

            // Call the original method
            return originalMethod.apply(this, logArgs);
          };
        });
      }
    });

    // Return the patched logger instance
    return loggerInstance;
  }

  // 4. Return the patched pino function so `require("pino")` uses our version
  return patchedPino;
});
