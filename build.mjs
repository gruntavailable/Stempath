import { copyFile, cp, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectDirectory = dirname(fileURLToPath(import.meta.url));
const sourceDirectory = join(projectDirectory, "src");
const outputDirectory = join(projectDirectory, "dist");
const assets = ["index.html", "styles.css", "app.js"];

await mkdir(outputDirectory, { recursive: true });
await Promise.all(assets.map((asset) => copyFile(join(sourceDirectory, asset), join(outputDirectory, asset))));
await cp(join(sourceDirectory, "assets"), join(outputDirectory, "assets"), { recursive: true });
process.stdout.write("Built STEM PATH into dist/\n");
