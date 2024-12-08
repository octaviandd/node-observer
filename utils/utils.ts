/** @format */

export const parseHeaders = <T extends Record<string, string>>(
  headersString: string
): { method: string; path: string; version: string; headers: T } => {
  const [startLine, ...headerLines] = headersString.split("\r\n");

  // Parse the start line (HTTP method, path, version)
  const [method, path, version] = startLine.split(" ");

  // Parse the headers
  const headers = {} as T;
  headerLines.forEach((line) => {
    const [key, value] = line.split(": ");
    if (key && value) {
      headers[key as keyof T] = value as unknown as T[keyof T];
    }
  });

  return {
    method,
    path,
    version,
    headers,
  };
};
