const {watchers} = require("../logger");

export function fetchPatch(logger) {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async function (url, options = {}) {
    const startTime = Date.now();

    const req = new Request(url, options);
    try {
      const response = await originalFetch(url, options);
      const duration = Date.now() - startTime;
      const memoryUsage = process.memoryUsage();

      const responseCopy = response.clone();

      watchers.http.addContent({
        method: req.method,
        url: req.url,
        timestamp: new Date(),
        status: response.status,
        duration,
        memoryUsage,
        payload: req.body || "N/A",
        options,
        headers: Object.fromEntries(response.headers.entries()),
        response: await responseCopy.json(),
      });

      return response;
    } catch (error) {
      console.error(`Fetch failed:`, error);
      throw error;
    }
  };
  return;
}