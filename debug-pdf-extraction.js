
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';

// Node environment setup
const CMAP_URL = "./node_modules/pdfjs-dist/cmaps/";
const CMAP_PACKED = true;
const STANDARD_FONT_DATA_URL = "./node_modules/pdfjs-dist/standard_fonts/";

async function debugPdf() {
    try {
        const data = new Uint8Array(fs.readFileSync('test_image.pdf'));

        console.log("Loading document...");
        const loadingTask = pdfjsLib.getDocument({
            data,
            cMapUrl: CMAP_URL,
            cMapPacked: CMAP_PACKED,
            standardFontDataUrl: STANDARD_FONT_DATA_URL,
        });

        const pdf = await loadingTask.promise;
        console.log(`PDF loaded. Pages: ${pdf.numPages}`);

        for (let i = 1; i <= pdf.numPages; i++) {
            console.log(`\n--- Page ${i} ---`);
            const page = await pdf.getPage(i);
            const ops = await page.getOperatorList();

            console.log(`Operators found: ${ops.fnArray.length}`);

            // Log all image related operators
            for (let j = 0; j < ops.fnArray.length; j++) {
                const fn = ops.fnArray[j];
                const args = ops.argsArray[j];

                if (fn === pdfjsLib.OPS.paintImageXObject) {
                    const imgName = args[0];
                    console.log(`[OP] paintImageXObject: ${imgName}`);

                    // Check availability
                    const hasLocal = page.objs.has(imgName);
                    const hasCommon = page.commonObjs.has(imgName);
                    console.log(`    - In Page Objs? ${hasLocal}`);
                    console.log(`    - In Common Objs? ${hasCommon}`);

                    try {
                        let img = null;
                        if (hasLocal) {
                            console.log("    - Getting from local...");
                            page.objs.get(imgName, (res) => { console.log("      -> Local RESOLVED:", res ? "YES (Data present)" : "NO"); });
                        }
                        if (hasCommon) {
                            console.log("    - Getting from common...");
                            page.commonObjs.get(imgName, (res) => { console.log("      -> Common RESOLVED:", res ? "YES (Data present)" : "NO"); });
                        }
                    } catch (e) {
                        console.log("    - Access Error:", e.message);
                    }

                } else if (fn === pdfjsLib.OPS.paintInlineImageXObject) {
                    console.log(`[OP] paintInlineImageXObject found`);
                } else if (fn === pdfjsLib.OPS.paintXObject) {
                    console.log(`[OP] paintXObject: ${args[0]}`); // Could be a form containing images
                }
            }
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

debugPdf();
