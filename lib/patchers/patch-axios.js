const Hook = require("require-in-the-middle");
const shimmer = require("shimmer");
const {watchers} = require("../logger");

/**
 * Example logging function. In a real project, you'd use your own logger.
 */
function logAxiosCall(method, args) {
  console.log(`[Patch] axios.${method} called with`, args);
  watchers.logging.addContent({
    package: "axios",
    method,
    args,
    timestamp: new Date(),
  });
}

// Intercepts any require("axios") call
Hook(["axios"], function (exports, name, basedir) {
  //
  // Patch `axios.request`
  //
  if (typeof exports.request === "function") {
    shimmer.wrap(exports, "request", function (originalRequest) {
      return function patchedRequest(configOrUrl, config) {
        // Log or instrument the request here
        logAxiosCall("request", arguments);

        // Proceed with the original request
        return originalRequest.apply(this, arguments);
      };
    });
    console.log("[Patch] axios.request method patched.");
  }

  //
  // Patch common convenience methods: get, post, put, patch, delete, head, options
  //
  ["get", "post", "put", "patch", "delete", "head", "options"].forEach(
    (method) => {
      if (typeof exports[method] === "function") {
        shimmer.wrap(exports, method, function (originalMethod) {
          return function patchedMethod(...args) {
            logAxiosCall(method, args);
            return originalMethod.apply(this, args);
          };
        });
        console.log(`[Patch] axios.${method} method patched.`);
      }
    }
  );

  //
  // Patch axios.create if you use custom Axios instances
  //
  if (typeof exports.create === "function") {
    shimmer.wrap(exports, "create", function (originalCreate) {
      return function patchedCreate(...args) {
        const instance = originalCreate.apply(this, args);
        // Patch the instance’s methods just like above
        patchAxiosInstance(instance);
        console.log("[Patch] axios.create method patched.");
        return instance;
      };
    });
  }

  // Return the patched module so that subsequent require("axios") calls use it
  return exports;
});

/**
 * Helper function to patch a custom axios instance (returned by axios.create()).
 * This function replicates the same patching logic on the instance’s prototype.
 */
function patchAxiosInstance(instance) {
  // Patch instance.request
  if (typeof instance.request === "function") {
    shimmer.wrap(instance, "request", function (originalRequest) {
      return function patchedRequest(configOrUrl, config) {
        logAxiosCall("instance.request", arguments);
        return originalRequest.apply(this, arguments);
      };
    });
    console.log("[Patch] axios instance.request method patched.");
  }

  // Patch instance.<method> (get, post, put, etc.)
  ["get", "post", "put", "patch", "delete", "head", "options"].forEach(
    (method) => {
      if (typeof instance[method] === "function") {
        shimmer.wrap(instance, method, function (originalMethod) {
          return function patchedInstanceMethod(...args) {
            logAxiosCall(`instance.${method}`, args);
            return originalMethod.apply(this, args);
          };
        });
        console.log(`[Patch] axios instance.${method} method patched.`);
      }
    }
  );
}
