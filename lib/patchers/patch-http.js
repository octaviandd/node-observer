const shimmer = require("shimmer");
const http = require("http");
const https = require("https");
const { watchers } = require("../logger");

// Example logger or instrumentation
function logHttpRequest(scheme, options) {
  console.log(`[Patch] ${scheme}.request called with:`, options);
  watchers.http.addContent({
    scheme,
    options,
    timestamp: new Date(),
  });
}

// Patch the `http.request` method
shimmer.wrap(http, "request", function (originalRequest) {
  return function patchedHttpRequest(...args) {
    // The `args` can be (options[, callback]) or (url[, options][, callback])
    // We'll do minimal parsing here:

    let options = args[0];

    // If the user called http.request(URL_string, ...)
    // Node automatically converts the URL to an options object internally.
    // You may do more robust logic here if you want to handle strings vs objects differently.
    if (typeof options === "string") {
      // For demonstration:
      options = { url: options };
    }

    // Log or instrument
    logHttpRequest("http", options);

    // Call the original http.request
    const req = originalRequest.apply(this, args);

    // You can also wrap `req.on('response', ...)` or manipulate req/response here
    return req;
  };
});

// Patch the `https.request` method
shimmer.wrap(https, "request", function (originalRequest) {
  return function patchedHttpsRequest(...args) {
    let options = args[0];

    if (typeof options === "string") {
      options = { url: options };
    }

    logHttpRequest("https", options);

    const req = originalRequest.apply(this, args);
    return req;
  };
});

// You can also patch `http.get` / `https.get` similarly,
// since `get` is just a convenience that internally calls `request`.

shimmer.wrap(http, "get", function (originalGet) {
  return function patchedHttpGet(...args) {
    console.log("[Patch] http.get called with:", args);
    // `http.get` calls `http.request` internally, so this is mostly
    // an additional place to log or manipulate if needed.
    return originalGet.apply(this, args);
  };
});

shimmer.wrap(https, "get", function (originalGet) {
  return function patchedHttpsGet(...args) {
    console.log("[Patch] https.get called with:", args);
    return originalGet.apply(this, args);
  };
});

console.log("Patched http and https modules successfully.");
