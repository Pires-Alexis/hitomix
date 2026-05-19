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

const DATA_DIR = "/var/www/hitomix/backend/";
const OUTPUT_DIR = path.join(DATA_DIR, "pack");
const OUTPUT_ZIP = path.join(OUTPUT_DIR, "modpack.zip");

const modpackLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: { error: "Rate limit atteint, reessaie dans une minute." }
});

async function removeFileIfExists(filePath) {
    try {
        await fs.promises.unlink(filePath);
        log("ZIP supprime :", filePath);
    } catch (err) {
        if (err.code !== "ENOENT") {
            throw err;
        }
    }
}

app.get("/modpack", modpackLimiter, async (req, res) => {
    try {
        log("Generation du ZIP...");
        log("Fichier ZIP cible :", OUTPUT_ZIP);

        const folders = [
            { name: "mods", path: path.join(DATA_DIR, "data/mods") },
            { name: "config", path: path.join(DATA_DIR, "data/config") },
            { name: "defaultconfigs", path: path.join(DATA_DIR, "data/defaultconfigs") },
            { name: "resourcepacks", path: path.join(DATA_DIR, "data/resourcepacks") }
        ];

        log("Dossiers sources :", folders);

        await fs.promises.mkdir(OUTPUT_DIR, { recursive: true });
        await removeFileIfExists(OUTPUT_ZIP);
        await createZip(OUTPUT_ZIP, folders);

        const signature = await sha256File(OUTPUT_ZIP);

        log("ZIP genere.");
        log("SHA256 :", signature);

        res.setHeader("X-Modpack-SHA256", signature);
        res.download(OUTPUT_ZIP, "modpack.zip", async downloadError => {
            try {
                await removeFileIfExists(OUTPUT_ZIP);
            } catch (cleanupError) {
                error("Erreur pendant la suppression du ZIP :", cleanupError?.stack || cleanupError);
            }

            if (downloadError) {
                error("Erreur pendant l'envoi du ZIP :", downloadError?.stack || downloadError);
            }
        });
    } catch (err) {
        error("Erreur pendant la generation du modpack :", err?.stack || err);
        res.status(500).json({ error: "Erreur lors de la generation du modpack." });
    }
});

app.get("/", (req, res) => {
    res.send("Backend Hitomix operationnel.");
});

app.listen(PORT, () => {
    log(`Backend modpack lance sur http://localhost:${PORT}`);
});
