import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import QRCode from "qrcode";
import jsQR from "jsqr";
import { Jimp } from "jimp";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Environment validation ──────────────────────────────────────────────────
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
  console.warn(
    "\n⚠️  WARNING: GEMINI_API_KEY is not set or is still a placeholder.\n" +
    "   AI-powered features will not work.\n" +
    "   Set a real key in your .env file.\n"
  );
} else {
  console.log("✅ GEMINI_API_KEY loaded successfully.");
}

// ── SQLite Database setup ───────────────────────────────────────────────────
const db = new Database(path.join(__dirname, "products.db"));

// Create the products table if it doesn't already exist
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id           TEXT PRIMARY KEY,
    name         TEXT NOT NULL,
    manufacturer TEXT NOT NULL,
    batchNumber  TEXT NOT NULL,
    expiryDate   TEXT,
    secretToken  TEXT NOT NULL,
    createdAt    TEXT NOT NULL
  )
`);

console.log("✅ SQLite database connected — products.db");

// ── Prepared statements ─────────────────────────────────────────────────────
const insertProduct = db.prepare(`
  INSERT INTO products (id, name, manufacturer, batchNumber, expiryDate, secretToken, createdAt)
  VALUES (@id, @name, @manufacturer, @batchNumber, @expiryDate, @secretToken, @createdAt)
`);

const findProductById = db.prepare(`
  SELECT * FROM products WHERE id = ? AND secretToken = ?
`);

const getAllProducts = db.prepare(`
  SELECT * FROM products ORDER BY createdAt DESC
`);

// ── Express app ─────────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// Multer for QR code verification upload
const upload = multer({ storage: multer.memoryStorage() });

// ── Product interface ───────────────────────────────────────────────────────
interface Product {
  id: string;
  name: string;
  manufacturer: string;
  batchNumber: string;
  expiryDate: string;
  secretToken: string;
  createdAt: string;
}

// ── API Routes ──────────────────────────────────────────────────────────────

// Generate a new product QR code and save to DB
app.post("/api/products/generate", async (req, res) => {
  try {
    const { name, manufacturer, batchNumber, expiryDate } = req.body;

    if (!name || !manufacturer || !batchNumber) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const id = Math.random().toString(36).substring(2, 10).toUpperCase();
    const secretToken = Math.random().toString(36).substring(2, 15);

    const newProduct: Product = {
      id,
      name,
      manufacturer,
      batchNumber,
      expiryDate: expiryDate || "",
      secretToken,
      createdAt: new Date().toISOString(),
    };

    // Persist to SQLite
    insertProduct.run(newProduct);

    // Generate QR code containing the secret token and ID
    const qrData = JSON.stringify({ id, token: secretToken });
    const qrCodeBase64 = await QRCode.toDataURL(qrData);

    // Return product without secretToken for security
    const { secretToken: _, ...safeProduct } = newProduct;

    res.json({
      message: "Product generated successfully",
      product: safeProduct,
      qrCode: qrCodeBase64,
    });
  } catch (error) {
    console.error("Error generating product:", error);
    res.status(500).json({ error: "Failed to generate product" });
  }
});

// Verify a product by scanning its QR image
app.post("/api/products/verify", upload.single("qrImage"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No QR image uploaded" });
    }

    // Read image using Jimp
    const image = await Jimp.read(req.file.buffer);
    const { data, width, height } = image.bitmap;

    // Decode QR code
    const decoded = jsQR(new Uint8ClampedArray(data), width, height);

    if (!decoded) {
      return res.status(400).json({
        authentic: false,
        message: "Could not decode QR code. Please ensure the image is clear.",
      });
    }

    try {
      const { id, token } = JSON.parse(decoded.data);

      // Verify against SQLite database
      const product = findProductById.get(id, token) as Product | undefined;

      if (product) {
        const { secretToken: _, ...safeProduct } = product;
        res.json({
          authentic: true,
          message: "Product is AUTHENTIC",
          product: safeProduct,
        });
      } else {
        res.json({
          authentic: false,
          message: "FAKE PRODUCT DETECTED! This QR code is not registered in our system.",
          details: "The security token or product ID is invalid.",
        });
      }
    } catch (e) {
      res.status(400).json({
        authentic: false,
        message: "Invalid QR code format. This is not a valid product tag.",
      });
    }
  } catch (error) {
    console.error("Error verifying product:", error);
    res.status(500).json({ error: "Verification failed" });
  }
});

// List all registered products (without secretToken)
app.get("/api/products", (req, res) => {
  const rows = getAllProducts.all() as Product[];
  const safeRows = rows.map(({ secretToken: _, ...p }) => p);
  res.json(safeRows);
});

// ── Start server ─────────────────────────────────────────────────────────────
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: { port: 24679 } },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}\n`);
  });
}

startServer();
