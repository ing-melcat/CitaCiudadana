const http = require("http");
const https = require("https");

function request(options) {
  const method = String(options.method || "GET").toUpperCase();
  const url = new URL(options.url);
  const client = url.protocol === "https:" ? https : http;
  const headers = { ...(options.headers || {}) };
  let body = null;

  if (options.data !== undefined && options.data !== null) {
    body = JSON.stringify(options.data);
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
    headers["Content-Length"] = Buffer.byteLength(body);
  }

  return new Promise((resolve, reject) => {
    const req = client.request(
      url,
      {
        method,
        headers,
        timeout: options.timeout || 20000,
      },
      (res) => {
        const chunks = [];

        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const raw = Buffer.concat(chunks).toString("utf8");
          const contentType = res.headers["content-type"] || "";
          let data = raw;

          if (contentType.includes("application/json") && raw) {
            try {
              data = JSON.parse(raw);
            } catch (error) {
              data = raw;
            }
          }

          const response = {
            status: res.statusCode,
            data,
            headers: res.headers,
          };

          if (res.statusCode >= 400) {
            const error = new Error(`HTTP ${res.statusCode}`);
            error.response = response;
            reject(error);
            return;
          }

          resolve(response);
        });
      }
    );

    req.on("timeout", () => {
      req.destroy(new Error(`Request timeout: ${method} ${url.href}`));
    });

    req.on("error", reject);

    if (body) {
      req.write(body);
    }

    req.end();
  });
}

request.get = (url, options = {}) =>
  request({
    ...options,
    method: "GET",
    url,
  });

request.post = (url, data, options = {}) =>
  request({
    ...options,
    method: "POST",
    url,
    data,
  });

module.exports = request;
