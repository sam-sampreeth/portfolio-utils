
import { PDFDocument, PDFName } from 'pdf-lib';
import fs from 'fs';

async function debugPdfLib() {
    try {
        const data = fs.readFileSync('test_image.pdf');
        const pdfDoc = await PDFDocument.load(data);
        const pages = pdfDoc.getPages();

        console.log(`PDF Loaded. Pages: ${pages.length}`);

        let imgCount = 0;

        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            // Correctly lookup Resources
            const resourcesRef = page.node.get(PDFName.of('Resources'));
            const resources = pdfDoc.context.lookup(resourcesRef);

            if (!resources) {
                console.log("No resources on page");
                continue;
            }

            const xObjects = resources.lookup(PDFName.of('XObject'));
            if (!xObjects) {
                console.log("No XObjects in resources");
                // Log keys
                // console.log("Keys:", resources.keys().map(k => k.toString()));
                continue;
            }

            console.log("XObjects found. Iterating...");

            xObjects.entries().forEach(([key, ref]) => {
                const xObject = pdfDoc.context.lookup(ref);
                if (!xObject) return;

                // Images are streams, so properties are in .dict
                // If it's not a stream (rare for images?), it's the dict itself
                const dict = xObject.dict || xObject;

                const subtype = dict.get(PDFName.of('Subtype'));
                if (subtype && subtype.toString() === '/Image') {
                    imgCount++;
                    const filter = dict.lookup(PDFName.of('Filter'));
                    const width = dict.lookup(PDFName.of('Width'));
                    const height = dict.lookup(PDFName.of('Height'));

                    console.log(`\nFound Image: ${key.toString()}`);
                    console.log(`  - Width: ${width.toString()}`);
                    console.log(`  - Height: ${height.toString()}`);
                    console.log(`  - Filter: ${filter ? filter.toString() : 'None'}`);

                    if (filter && filter.toString() === '/DCTDecode') {
                        console.log("  -> JPEG Detected! (Easy to extract)");
                    } else if (filter && filter.toString() === '/FlateDecode') {
                        console.log("  -> PNG/Raw Detected! (Requires decompression)");
                    } else if (filter && filter.toString() === '/JPXDecode') {
                        console.log("  -> JPEG 2000 Detected!");
                    }
                }
            });
        }

        console.log(`\nTotal Images Found: ${imgCount}`);

    } catch (e) {
        console.error("Error:", e);
    }
}

debugPdfLib();
