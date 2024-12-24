const Hook = require("require-in-the-middle");
const shimmer = require("shimmer");

/**
 * Example logging/instrumentation. 
 * Replace this with your own logger or logic.
 */
function logExpressMethod(method, args) {
  console.log(`[Patch] express.${method} called with args:`, args);
}

// Intercepts `require("express")` calls
Hook(["express"], function (exports, name, basedir) {
  // `exports` is the express module.
  // We can patch `exports.application.<method>` for get, post, put, etc.

  const METHODS_TO_PATCH = ["get", "post", "put", "delete", "patch"]; 
  // Add "update" here *only* if your code or some library uses `app.update` (not standard in Express).

  METHODS_TO_PATCH.forEach((method) => {
    if (typeof exports.application[method] === "function") {
      shimmer.wrap(exports.application, method, function (originalMethod) {
        return function patchedMethod(...args) {
          // Log or instrument
          logExpressMethod(method, args);

          // Check if there's a route handler in the arguments
          // e.g. app.get('/path', handler)
          // The last argument might be the actual middleware/handler
          // or you might have multiple handlers. For simplicity, we patch the first function we see.
          for (let i = 0; i < args.length; i++) {
            if (typeof args[i] === "function") {
              const originalHandler = args[i];
              args[i] = function patchedHandler(req, res, next) {
                console.log(`[Patch] Inside patched ${method.toUpperCase()} handler for route:`, args[0]);
                // Do more instrumentation here as needed
                return originalHandler(req, res, next);
              };
              // break after patching the first function if you only want to patch the single route handler
              break;
            }
          }

          // Call the original Express method
          return originalMethod.apply(this, args);
        };
      });
      console.log(`[Patch] express.${method} method patched.`);
    }
  });

  // Return the patched express module
  return exports;
});
