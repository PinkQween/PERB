import { Express, Router } from "express";
import fs from "fs/promises";
import path from "path";

const DEFAULT_BASE_PATH = "/api";

const HTTP_METHODS = new Set([
  "GET",
  "POST",
  "PUT",
  "DELETE",
  "TRACE",
  "OPTIONS",
  "CONNECT",
  "HEAD",
]);

const scanFiles = async (
  dir: string,
  files: string[] = []
): Promise<string[]> => {
  const filePaths = await fs.readdir(dir);

  for (const file of filePaths) {
    const fullPath = path.join(dir, file);
    const stat = await fs.stat(fullPath);

    if (stat.isDirectory()) {
      files = await scanFiles(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }

  return files;
};

const traverse = (pathDir: string, name: string) => {
  const fullPath = path.join(pathDir, name);
  const segments = fullPath.split(path.sep);

  let ignoring = false;
  let result: string[] = [];

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];

    if (ignoring && i < segments.length - 2) continue;

    if (segment.includes("(.)")) {
      // Same-level interception, skip
      continue;
    } else if (segment.includes("(..)")) {
      // Move up levels based on occurrences of (..)
      const upLevels = segment.split("(..)").length - 1;
      for (let j = 0; j < upLevels; j++) {
        result.pop();
      }
    } else if (segment.includes("(...)")) {
      // Reset to root
      result = [];
    } else if (segment.startsWith("[[...") && segment.endsWith("]]")) {
      // Optional catch-all
      result.push("*?");
    } else if (segment.startsWith("[...") && segment.endsWith("]")) {
      // Required catch-all
      result.push("*");
    } else if (segment.startsWith("[") && segment.endsWith("]")) {
      // Dynamic segment
      result.push(`:${segment.slice(1, -1)}`);
    } else if (segment.startsWith("(") && segment.endsWith(")")) {
      // Ignore group
      continue;
    } else if (segment.startsWith("_")) {
      ignoring = true;
    } else {
      result.push(segment);
    }
  }

  if (result.length < 2) {
    result.unshift("");
  }

  return result.join("/");
};

const processPath = (baseDir: string, file: string, base: string) => {
  const fileName = file.split("/").at(-1);

  const baseDirResolved = path.resolve(baseDir);

  const pathDir = file.split(baseDirResolved)[1].replace(/\/[^/]+$/, "");

  const method = fileName.split(".")[0].toUpperCase();
  const name = fileName.split(".").slice(1, -1).join();

  if (!HTTP_METHODS.has(method)) {
    console.error(`[ERROR] Unsupported method in file: ${file}`);
    return;
  }

  const webPath = base + traverse(pathDir, name);

  return { method, path: webPath }
}

const scanRoutes = async (app: Express, dir: string, baseWebPath: string) => {
  const files = await scanFiles(dir);

  files.forEach(async (file) => {
    const route: Router = (await import(file)).default;

    const { method, path } = processPath(dir, file, baseWebPath);

    if (!(method && route)) {
      return
    }

    app[method.toLowerCase()](path, route);

    console.info(`[ROUTE] [${method}] Registered: ${path}`);
  });
};

const loadRoutes = async (
  app: Express,
  baseDir: string,
  basePath: string = DEFAULT_BASE_PATH
) => {
  try {
    await scanRoutes(app, baseDir, basePath);
    console.info("[ROUTES] Route loading complete.");
  } catch (error) {
    console.error("[ROUTES] Route loading failed:", error);
  }
};

export default loadRoutes;