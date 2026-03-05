import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs/promises";
import path from "path";

const app = express();
const PORT = 3000;
const DATA_FILE = path.resolve("data.json");

app.use(express.json());

// Initialize data file if it doesn't exist
async function initData() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify({ topics: [], notes: [] }));
  }
}

// API Routes
app.get("/api/data", async (req, res) => {
  const data = await fs.readFile(DATA_FILE, "utf-8");
  res.json(JSON.parse(data));
});

app.post("/api/data", async (req, res) => {
  await fs.writeFile(DATA_FILE, JSON.stringify(req.body, null, 2));
  res.json({ success: true });
});

async function startServer() {
  await initData();

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
