import express from "express";
import cors from "cors";
import https from "https";
import fs from "fs";
import path from "path";
import loadRoutes from "@server/utils/routeLoader";

// Configuration
const PORT = process.env.PORT || 443;
const CERT_PATH = "certs/server.crt";
const KEY_PATH = "certs/server.key";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(process.cwd(), "../dist"))); // Use import.meta.dir for Bun compatibility

loadRoutes(app, path.join(__dirname, "src/api/routes"));

// Load SSL Certificates
let credentials;
try {
  credentials = {
    key: fs.readFileSync(KEY_PATH, "utf8"),
    cert: fs.readFileSync(CERT_PATH, "utf8"),
  };
} catch (error) {
  console.error(`[ERROR] Failed to load SSL certificates: ${error.message}`);
  process.exit(1);
}

app.listen(80, () => {
  console.log(`[INFO] Server running at http://localhost:80`);
});

// Create HTTPS Server
const server = https.createServer(credentials, app);

// Start Server
server.listen(PORT, () => {
  console.log(`[INFO] Server running at https://localhost:${PORT}`);
});