import express from "express";
import path from "path";
import fs from "fs";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "url";

import { createZip } from "./utils/zip.js";
import { sha256File } from "./utils/hash.js";
import { log, error } from "./utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

const DATA_DIR = "/var/www/hitomix/backend/data";
const OUTPUT_ZIP = path.join(DATA_DIR, "modpack.zip");

const modpackLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: { error: "Rate limit atteint, réessaie dans une minute." }
});

app.get("/modpack", modpackLimiter, async (req, res) => {
    try {
        log("Génération du ZIP…");

        const folders = [
            { name: "mods",           path: path.join(DATA_DIR, "mods") },
            { name: "config",         path: path.join(DATA_DIR, "config") },
            { name: "defaultconfigs", path: path.join(DATA_DIR, "defaultconfigs") },
            { name: "resourcepacks",  path: path.join(DATA_DIR, "resourcepacks") }
        ];

        await createZip(OUTPUT_ZIP, folders);

        const signature = await sha256File(OUTPUT_ZIP);

        log("ZIP généré.");
        log("SHA256 :", signature);

        res.setHeader("X-Modpack-SHA256", signature);
        res.download(OUTPUT_ZIP, "modpack.zip");
    } catch (err) {
        error("Erreur :", err);
        res.status(500).json({ error: "Erreur lors de la génération du modpack." });
    }
});

app.get("/", (req, res) => {
    res.send("Backend Hitomix opérationnel.");
});

app.listen(PORT, () => {
    log(`Backend modpack lancé sur http://localhost:${PORT}`);
});
