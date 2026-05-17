import express from "express";
import archiver from "archiver";
import fs from "fs";
import path from "path";

const app = express();
const PORT = 3001;

const PACK_DIRS = ["mods", "config", "defaultconfigs"];

app.get("/modpack", (req, res) => {
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", "attachment; filename=Modpack.zip");

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);

    PACK_DIRS.forEach(dir => {
        const fullPath = path.join(process.cwd(), dir);
        if (fs.existsSync(fullPath)) {
            archive.directory(fullPath, dir);
        }
    });

    archive.finalize();
});

app.listen(PORT, () => {
    console.log(`Backend lancé sur http://localhost:${PORT}`);
});
