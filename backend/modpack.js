const express = require("express");
const archiver = require("archiver");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { PassThrough } = require("stream");

const app = express();
const PORT = 3001;

const PACK_DIRS = ["mods", "config", "defaultconfigs"];

function buildModpackArchive() {
    return new Promise((resolve, reject) => {
        const archive = archiver("zip", { zlib: { level: 9 } });
        const output = new PassThrough();
        const chunks = [];

        output.on("data", chunk => {
            chunks.push(chunk);
        });

        output.on("end", () => {
            resolve(Buffer.concat(chunks));
        });

        output.on("error", reject);
        archive.on("error", reject);
        archive.pipe(output);

        PACK_DIRS.forEach(dir => {
            const fullPath = path.join(process.cwd(), dir);

            if (fs.existsSync(fullPath)) {
                archive.directory(fullPath, dir);
            }
        });

        archive.finalize();
    });
}

app.get("/modpack", async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition, Content-Length, X-Modpack-SHA256");

    try {
        const archiveBuffer = await buildModpackArchive();
        const sha256 = crypto.createHash("sha256").update(archiveBuffer).digest("hex");

        res.status(200);
        res.setHeader("Content-Type", "application/zip");
        res.setHeader("Content-Disposition", 'attachment; filename="modpack.zip"');
        res.setHeader("X-Modpack-SHA256", sha256);
        res.setHeader("Content-Length", archiveBuffer.length);
        res.send(archiveBuffer);
    } catch (error) {
        console.error("Erreur pendant la generation du modpack :", error);
        res.status(500).json({ error: "Impossible de generer le modpack." });
    }
});

app.listen(PORT, () => {
    console.log(`Backend lance sur http://localhost:${PORT}`);
});
