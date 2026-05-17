import fs from "fs";
import archiver from "archiver";

export async function createZip(outputPath, folders) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outputPath);
        const archive = archiver("zip", { zlib: { level: 9 } });

        output.on("close", () => resolve());
        archive.on("error", err => reject(err));

        archive.pipe(output);

        for (const folder of folders) {
            if (fs.existsSync(folder.path)) {
                archive.directory(folder.path, folder.name);
            }
        }

        archive.finalize();
    });
}
