const Hook = require("require-in-the-middle");
const shimmer = require("shimmer");
const { watchers } = require('../logger');

/**
 * Logging or instrumentation logic.
 */
function logExpressMethod(method, args) {
  // Skip logging for demonstration, or keep it if you want to see everything
  console.log(`[Patch] express.${method} called with args:`, args);
  console.log("Current watchers object:", watchers);

  if (watchers?.requests) {
      console.log("[Patch] Logging request to watchers.requests object.");
     watchers.requests.addContent({
      method,
      args
    });
  } else {
    console.log("[Patch] No watchers.requests object found. Skipping logging.");
  }
}

/**
 * Hook "express" to patch .get, .post, etc.
 */
Hook(["express"], function (exports, name, basedir) {
  const METHODS_TO_PATCH = ["get", "post", "put", "delete", "patch"];
  
  METHODS_TO_PATCH.forEach((method) => {
    if (typeof exports.application[method] === "function") {
      shimmer.wrap(exports.application, method, function (originalMethod) {
        return function patchedMethod(...args) {
          // args[0] might be a path ("/test") or an internal string (e.g. "env")
          // If it's a string that doesn't start with "/", it's likely an internal setting. Skip instrumentation.
          if (typeof args[0] === "string" && !args[0].startsWith("/")) {
            // Just call the original method and skip logging
            return originalMethod.apply(this, args);
          }

          // Otherwise, it's probably a route definition -> log and patch
          logExpressMethod(method, args);

          // Patch the first function we find among the arguments (the route handler)
          for (let i = 0; i < args.length; i++) {
            if (typeof args[i] === "function") {
              const originalHandler = args[i];
              args[i] = function patchedHandler(req, res, next) {
                console.log(`[Patch] Inside patched ${method.toUpperCase()} handler for route:`, args[0]);
                console.log(watchers)
                if (watchers?.requests) {
                   watchers.requests.addContent({
                    method,
                    route: args[0]
                  });
                } else {
                  console.log("[Patch] No watchers.requests object found. Skipping logging.");
                }
                // do more instrumentation if needed
                return originalHandler(req, res, next);
              };
              break;
            }
          }

          return originalMethod.apply(this, args);
        };
      });
      console.log(`[Patch] express.${method} method patched.`);
    }
  });

  return exports;
});
