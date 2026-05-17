import rateLimit from "express-rate-limit";
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createZip } from "./utils/zip.mjs";
import { sha256File } from "./utils/hash.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

const DATA_DIR = "/var/www/hitomix/backend";
const OUTPUT_ZIP = path.join(DATA_DIR, "modpack.zip");
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20,             // 20 requêtes / minute
    message: { error: "Trop de requêtes, réessaie plus tard." },
    standardHeaders: true,
    legacyHeaders: false
});

app.use(limiter);
// -----------------------------
// 🔥 Route principale : modpack + SHA256
// -----------------------------
app.get("/modpack", async (req, res) => {
    try {
        console.log("[modpack] Génération du ZIP…");

        const folders = [
            { name: "mods", path: path.join(DATA_DIR, "mods") },
            { name: "config", path: path.join(DATA_DIR, "config") },
            { name: "defaultconfigs", path: path.join(DATA_DIR, "defaultconfigs") },
            { name: "resourcepacks", path: path.join(DATA_DIR, "resourcepacks") }
        ];

        // Génération du ZIP
        await createZip(OUTPUT_ZIP, folders);

        // Calcul du hash SHA256
        const signature = await sha256File(OUTPUT_ZIP);

        console.log("[modpack] ZIP généré.");
        console.log("[modpack] SHA256 :", signature);

        // En-tête HTTP pour envoyer la signature
        res.setHeader("X-Modpack-SHA256", signature);

        // Téléchargement du ZIP
        res.download(OUTPUT_ZIP, "modpack.zip");
    } catch (err) {
        console.error("[modpack] Erreur :", err);
        res.status(500).json({ error: "Erreur lors de la génération du modpack." });
    }
});
