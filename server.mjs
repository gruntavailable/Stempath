import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import industryChoicesApi from "./api/industry-choices.js";

const projectDirectory = fileURLToPath(new URL(".", import.meta.url));
const rootDirectory = resolve(projectDirectory, process.argv[2] || "src");
const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 4173);

try {
  const localEnvironment = await readFile(join(projectDirectory, ".env.local"), "utf8");
  for (const line of localEnvironment.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match || process.env[match[1]] !== undefined) continue;
    const value = match[2].replace(/^(?:"(.*)"|'(.*)')$/, (_, doubleQuoted, singleQuoted) => doubleQuoted ?? singleQuoted);
    process.env[match[1]] = value;
  }
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

const server = createServer(async (request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url || "/", "http://localhost").pathname);
  } catch {
    response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Bad request");
    return;
  }

  if (pathname === "/api/industry-choices") {
    try {
      if (Number(request.headers["content-length"] || 0) > 4096) {
        response.writeHead(413, { "Content-Type": "application/json; charset=utf-8" });
        response.end(JSON.stringify({ error: "Dữ liệu gửi lên quá lớn." }));
        return;
      }
      const chunks = [];
      for await (const chunk of request) chunks.push(chunk);
      const body = Buffer.concat(chunks);
      const apiRequest = new Request(new URL(request.url || "/", `http://${request.headers.host || "localhost"}`), {
        method: request.method || "GET",
        headers: { "content-type": request.headers["content-type"] || "application/json" },
        body: body.length ? body : undefined,
      });
      const apiResponse = await industryChoicesApi.fetch(apiRequest);
      response.writeHead(apiResponse.status, Object.fromEntries(apiResponse.headers.entries()));
      response.end(Buffer.from(await apiResponse.arrayBuffer()));
    } catch {
      response.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
      response.end(JSON.stringify({ error: "Không thể cập nhật thống kê chung lúc này." }));
    }
    return;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD", "Content-Type": "text/plain; charset=utf-8" });
    response.end("Method not allowed");
    return;
  }

  try {
    const requestedPath = resolve(rootDirectory, `.${pathname}`);
    const relativePath = relative(rootDirectory, requestedPath);
    if (relativePath.startsWith("..") || isAbsolute(relativePath)) {
      response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Forbidden");
      return;
    }

    const requestedStats = await stat(requestedPath);
    const filePath = requestedStats.isDirectory() ? join(requestedPath, "index.html") : requestedPath;
    const body = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": contentTypes[extname(filePath).toLowerCase()] || "application/octet-stream",
      "Content-Length": body.length,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
    });
    response.end(request.method === "HEAD" ? undefined : body);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});

server.listen(port, host, () => {
  process.stdout.write(`Serving ${rootDirectory} at http://${host}:${port}/\n`);
});
