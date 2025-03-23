import { Express, Router } from "express";
import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";

const DEFAULT_BASE_PATH = "/api";
const SUPPORTED_EXTENSIONS = new Set([
  ".js",
  ".ts",
  ".mjs",
  ".mts",
  ".cjs",
  ".cts",
  ".jsx",
  ".tsx",
]);

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

const formatRoutePath = (relativePath: string): string => {
  return relativePath
    .replace(/\\/g, "/") // Ensure consistent path separators
    .replace(/\[\[\.\.\.([^\]]+)\]\]/g, ":$1*?") // Optional catch-all
    .replace(/\[\.\.\.([^\]]+)\]/g, ":$1*") // Catch-all
    .replace(/\[([^\]]+)\]/g, ":$1") // Dynamic route
    .replace(/\((.*?)\)\//g, ""); // Remove route groups
};

const registerRoute = (
  app: Express,
  routePath: string,
  routeModule: { router: Router },
  method?: string
) => {
  console.info(`Attempting to register route: ${routePath}`);
  if (typeof routeModule === "function") {
    if (method) {
      app[method.toLowerCase()](routePath, routeModule);
      console.info(`[ROUTE] [${method}] Registered: ${routePath}`);
    } else {
      app.use(routePath, routeModule);
      console.info(`[ROUTE] Registered: ${routePath}`);
    }
  } else if (routeModule.router instanceof Router) {
    app.use(routePath, routeModule.router);
    console.info(`[ROUTER] Registered: ${routePath}`);
  } else {
    console.warn(`[WARN] Skipping non-route export: ${routePath}`);
  }
};

const scanRoutes = async (
  app: Express,
  dir: string,
  basePath: string = DEFAULT_BASE_PATH
) => {
  const processFile = async (filePath: string, relativePath: string) => {
    const file = path.basename(filePath); // Extract the base filename (with extension)
    const fileNameWithoutExt = path.basename(file, path.extname(file)); // Filename without extension

    let method = "GET"; // Default to GET if no method is matched

    if (SUPPORTED_EXTENSIONS.has(path.extname(file))) {
      try {
        console.log(`[DEBUG] Processing file: ${filePath}`);

        const routeModule = await import(pathToFileURL(filePath).href);

        // Match method like GET.someRoute.ts, get.someRoute.ts, etc. (case insensitive)
        const methodMatch = file.match(/^([a-zA-Z]+)[.-]/); // Match any HTTP method (e.g., GET, get, POST, post)
        console.log(
          `[DEBUG] Method match: ${
            methodMatch ? methodMatch[1] : "No method found"
          }`
        );

        let routePath: string | undefined;

        if (methodMatch && HTTP_METHODS.has(methodMatch[1].toUpperCase())) {
          // Normalize method to uppercase
          method = methodMatch[1].toUpperCase();
          console.log(`[DEBUG] Found method: ${method}`);

          // Remove the method prefix (e.g., GET. or post.) from the filename
          let updatedFileName = fileNameWithoutExt.replace(
            new RegExp(`^${methodMatch[1]}[.-]`, "i"), // Match the method prefix case insensitively
            ""
          );

          console.log(
            `[DEBUG] Updated filename without method prefix: ${updatedFileName}`
          );

          // Remove .ts extension from the filename
          updatedFileName = updatedFileName.replace(/\.ts$/, "");

          // Preserve dynamic parts like [id], [...path], etc.
          updatedFileName = updatedFileName.replace(/\[(.*?)\]/g, ":$1"); // Converts [id] to :id

          // Use the updated filename without method prefix and .ts extension
          routePath = formatRoutePath(path.join(basePath, updatedFileName));

          console.log(
            `[DEBUG] Final route path after removing method prefix and .ts: ${routePath}`
          );
        } else {
          // If no method found, use the default method (GET)
          console.log(`[DEBUG] Defaulting to method: ${method}`);
          routePath = formatRoutePath(
            path.join(basePath, relativePath.replace(path.extname(file), ""))
          );

          console.log(
            `[DEBUG] Final route path with default method and .ts removed: ${routePath}`
          );
        }

        // Register the route with the correct method
        console.log(
          `[DEBUG] Registering route: ${routePath} with method: ${method}`
        );
        registerRoute(
          app,
          routePath,
          routeModule.default || routeModule,
          method
        );
      } catch (error) {
        console.error(`[ERROR] Failed to load route from ${filePath}:`, error);
      }
    } else {
      console.log(`[DEBUG] Skipping unsupported file extension: ${file}`);
    }
  };

  const processDirectory = async (
    directoryPath: string,
    relativePath: string
  ) => {
    let files;
    try {
      files = await fs.readdir(directoryPath);
    } catch (error) {
      console.error(
        `[ERROR] Unable to read directory: ${directoryPath}`,
        error
      );
      return;
    }

    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      try {
        const stat = await fs.stat(filePath);
        if (stat.isDirectory()) {
          if (/^[_@.]/.test(file)) continue; // Ignore private, parallel, intercept folders
          // Recursively process subdirectories, including `tests` and other nested directories
          await processDirectory(filePath, path.join(relativePath, file)); // Pass along relative path
        } else {
          await processFile(filePath, path.join(relativePath, file)); // Include the directory structure
        }
      } catch (error) {
        console.warn(`[WARN] Skipping inaccessible file: ${filePath}`, error);
      }
    }
  };

  await processDirectory(dir, "");
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