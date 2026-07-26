import sharp from "sharp";
import pngToIco from "png-to-ico";
import { writeFile } from "node:fs/promises";

const sizes = [16, 24, 32, 48, 64, 128, 256];

const pngImages = await Promise.all(
    sizes.map(function (size) {
        return sharp("assets/icon.svg")
            .resize(size, size)
            .png()
            .toBuffer();
    })
);

const icon = await pngToIco(pngImages);

await writeFile("assets/icon.ico", icon);

console.log("Windows icon created: assets/icon.ico");