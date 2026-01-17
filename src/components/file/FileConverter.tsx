import { useState, useRef } from "react";
import {
    ArrowRightLeft,
    Download,
    Loader2,
    FileType,
    ShieldCheck,
    X,
    AlertCircle,
    ArrowRight
} from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import mammoth from "mammoth";
// @ts-ignore
import html2pdf from "html2pdf.js";
import JSZip from "jszip";
import { Document, Packer, Paragraph, TextRun } from "docx";
import * as XLSX from "xlsx";
import { pptxToHtml } from "@jvmr/pptx-to-html";
import { toPng } from "html-to-image";
import { DownloadConfirmDialog } from "@/components/common/DownloadConfirmDialog";
import { saveAs } from "file-saver";

// Setup PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

type ConversionStatus = "idle" | "converting" | "done" | "error";

interface ExtendedFile extends File {
    id: string;
    preview?: string;
}

interface ConversionResult {
    fileId: string;
    blob: Blob;
    url: string;
    format: string;
}

// Supported Conversions Configuration
const CONVERSION_MAP: Record<string, { label: string; value: string }[]> = {
    'image/png': [
        { label: 'JPG', value: 'image/jpeg' },
        { label: 'WEBP', value: 'image/webp' },
        { label: 'ICO', value: 'image/x-icon' },
        { label: 'PDF', value: 'application/pdf' },
    ],
    'image/jpeg': [
        { label: 'PNG', value: 'image/png' },
        { label: 'WEBP', value: 'image/webp' },
        { label: 'PDF', value: 'application/pdf' },
    ],
    'image/webp': [
        { label: 'PNG', value: 'image/png' },
        { label: 'JPG', value: 'image/jpeg' },
        { label: 'PDF', value: 'application/pdf' },
    ],
    'application/pdf': [
        { label: 'Word (DOCX)', value: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
        { label: 'Excel (XLSX)', value: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
        { label: 'Images (ZIP)', value: 'application/zip' }, // Returns ZIP of images
        { label: 'Text (TXT)', value: 'text/plain' },
    ],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [ // DOCX
        { label: 'PDF', value: 'application/pdf' },
        { label: 'Text (TXT)', value: 'text/plain' },
    ],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': [ // PPTX
        { label: 'PDF', value: 'application/pdf' },
        { label: 'Images (ZIP)', value: 'application/zip' },
    ],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [ // XLSX
        { label: 'PDF', value: 'application/pdf' },
        { label: 'Text (TXT)', value: 'text/plain' },
    ],
    'application/vnd.ms-excel': [ // XLS
        { label: 'PDF', value: 'application/pdf' },
        { label: 'Text (TXT)', value: 'text/plain' },
    ],
    'text/plain': [
        { label: 'PDF', value: 'application/pdf' },
    ]
};

export function FileConverter() {
    const [files, setFiles] = useState<ExtendedFile[]>([]);
    const [status, setStatus] = useState<Record<string, ConversionStatus>>({});
    const [results, setResults] = useState<Record<string, ConversionResult>>({});
    const [targetFormat, setTargetFormat] = useState<Record<string, string>>({});

    // Dialog State
    const [downloadDialog, setDownloadDialog] = useState<{
        isOpen: boolean;
        fileId: string | null;
    }>({ isOpen: false, fileId: null });

    const handleDownloadClick = (fileId: string) => {
        setDownloadDialog({ isOpen: true, fileId });
    };

    const handleDownloadConfirm = (fileName: string) => {
        const fileId = downloadDialog.fileId;
        if (!fileId || !results[fileId]) return;

        const result = results[fileId];
        const ext = getFormatExt(result.format);
        saveAs(result.blob, `${fileName}.${ext}`);

        setDownloadDialog({ isOpen: false, fileId: null });
        toast.success("File saved!");
    };

    const handleFiles = (newFiles: File[]) => {
        const extendedFiles = newFiles.map(f => Object.assign(f, {
            id: Math.random().toString(36).substring(7),
            preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined
        }));
        setFiles(prev => [...prev, ...extendedFiles]);

        // Smart Default Formats
        const newTargets: Record<string, string> = {};
        extendedFiles.forEach(f => {
            const options = CONVERSION_MAP[f.type] || [];
            if (options.length > 0) {
                newTargets[f.id] = options[0].value;
            } else {
                newTargets[f.id] = 'unsupported';
            }
        });
        setTargetFormat(prev => ({ ...prev, ...newTargets }));
    };

    const removeFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
        setResults(prev => {
            const newResults = { ...prev };
            delete newResults[id];
            return newResults;
        });
        setStatus(prev => {
            const newStatus = { ...prev };
            delete newStatus[id];
            return newStatus;
        });
    };

    const convertImage = async (file: ExtendedFile, format: string) => {
        return new Promise<Blob>((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) { reject("Canvas error"); return; }

                // Fill white background for transparent images converting to JPEG
                if (format === 'image/jpeg') {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }

                ctx.drawImage(img, 0, 0);
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject("Conversion failed");
                }, format, 0.9);
            };
            img.onerror = () => reject("Image load error");
            img.src = file.preview || URL.createObjectURL(file);
        });
    };

    const convertImageToPdf = async (file: ExtendedFile): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const doc = new jsPDF({
                    orientation: img.width > img.height ? 'l' : 'p',
                    unit: 'px',
                    format: [img.width, img.height]
                });
                doc.addImage(img, 'JPEG', 0, 0, img.width, img.height);
                resolve(doc.output('blob'));
            };
            img.onerror = reject;
            img.src = file.preview || URL.createObjectURL(file);
        });
    };

    const convertTextToPdf = async (file: File): Promise<Blob> => {
        const text = await file.text();
        const doc = new jsPDF();

        const splitText = doc.splitTextToSize(text, 180);
        let y = 10;
        const pageHeight = doc.internal.pageSize.height;

        splitText.forEach((line: string) => {
            if (y > pageHeight - 10) {
                doc.addPage();
                y = 10;
            }
            doc.text(line, 10, y);
            y += 7;
        });

        return doc.output('blob');
    };

    const convertPdfToImages = async (file: File): Promise<Blob | null> => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const zip = new JSZip();

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2 }); // High quality
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context!, viewport, canvas }).promise;

            // Add to zip
            const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/jpeg', 0.9));
            if (blob) zip.file(`page_${i}.jpg`, blob);
        }

        return zip.generateAsync({ type: 'blob' });
    };

    const convertPdfToWord = async (file: File): Promise<Blob> => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        const docChildren: Paragraph[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const items: any[] = textContent.items;

            // Sort items by Y (descending) then X (ascending)
            items.sort((a: any, b: any) => {
                const yDiff = b.transform[5] - a.transform[5];
                if (Math.abs(yDiff) > 5) return yDiff;
                return a.transform[4] - b.transform[4];
            });

            let lastY = -1;
            let currentLineText = "";

            items.forEach((item: any) => {
                const y = item.transform[5];
                const text = item.str;

                if (lastY === -1) lastY = y;

                if (Math.abs(y - lastY) > 10) {
                    if (currentLineText.trim()) {
                        docChildren.push(new Paragraph({
                            children: [new TextRun(currentLineText)]
                        }));
                    }
                    currentLineText = text;
                    lastY = y;
                } else {
                    currentLineText += (currentLineText ? " " : "") + text;
                }
            });

            if (currentLineText.trim()) {
                docChildren.push(new Paragraph({
                    children: [new TextRun(currentLineText)]
                }));
            }

            // Page break simulation
            if (i < pdf.numPages) {
                docChildren.push(new Paragraph({
                    children: [new TextRun({ text: "", break: 1 })]
                }));
            }
        }

        const doc = new Document({
            sections: [{
                properties: {},
                children: docChildren,
            }],
        });

        return await Packer.toBlob(doc);
    };

    const convertPdfToExcel = async (file: File): Promise<Blob> => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        const workbook = XLSX.utils.book_new();

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            // @ts-ignore
            const items = textContent.items.filter((item: any) => item.str.trim().length > 0);

            // 1. Sort by Y (Top to Bottom)
            items.sort((a: any, b: any) => b.transform[5] - a.transform[5]);

            // 2. Group into Rows
            const rows: any[][] = [];
            let currentRow: any[] = [];
            let currentY = -1;

            items.forEach((item: any) => {
                const y = item.transform[5];
                if (currentY === -1 || Math.abs(currentY - y) < 5) {
                    currentRow.push(item);
                    currentY = y;
                } else {
                    rows.push(currentRow);
                    currentRow = [item];
                    currentY = y;
                }
            });
            if (currentRow.length > 0) rows.push(currentRow);

            // 3. Detect Global Columns
            const allX = items.map((item: any) => item.transform[4]);
            const uniqueX = allX.sort((a: any, b: any) => a - b);
            const columnBuckets: number[] = [];

            uniqueX.forEach((x: number) => {
                const match = columnBuckets.find(bucket => Math.abs(bucket - x) < 10);
                if (!match) columnBuckets.push(x);
            });
            columnBuckets.sort((a, b) => a - b);

            // 4. Map Rows to Grid
            const sheetData: any[][] = rows.map(row => {
                const rowData = new Array(columnBuckets.length).fill("");
                row.forEach((item: any) => {
                    const x = item.transform[4];
                    let bestColIndex = 0;
                    let minDist = Infinity;

                    columnBuckets.forEach((bucket, index) => {
                        const dist = Math.abs(bucket - x);
                        if (dist < minDist) {
                            minDist = dist;
                            bestColIndex = index;
                        }
                    });

                    if (minDist < 50) {
                        const val = item.str.trim();
                        const num = Number(val.replace(/,/g, ''));
                        if (!isNaN(num) && val !== "") rowData[bestColIndex] = num;
                        else rowData[bestColIndex] = val;
                    }
                });
                return rowData;
            });

            const apiSheet = XLSX.utils.aoa_to_sheet(sheetData);
            XLSX.utils.book_append_sheet(workbook, apiSheet, `Page ${i}`);
        }

        const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    };

    const convertPdfToText = async (file: File): Promise<Blob> => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += `--- Page ${i} ---\n${pageText}\n\n`;
        }

        return new Blob([fullText], { type: 'text/plain' });
    };

    const convertDocxToText = async (file: File): Promise<Blob> => {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return new Blob([result.value], { type: 'text/plain' });
    };

    // For DOCX to PDF, we need a DOM element. We'll use a hidden ref in the component.
    const hiddenPrintRef = useRef<HTMLDivElement>(null);

    const convertDocxToPdf = async (file: File): Promise<Blob> => {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });

        if (!hiddenPrintRef.current) throw new Error("DOM not ready");

        // Mount HTML
        hiddenPrintRef.current.innerHTML = result.value;

        const opt = {
            margin: 10,
            filename: 'document.pdf',
            image: { type: 'jpeg', quality: 0.98 } as any,
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        } as any;

        const pdfBlob = await html2pdf().set(opt).from(hiddenPrintRef.current).output('blob');

        // Cleanup
        hiddenPrintRef.current.innerHTML = "";

        return pdfBlob;
    };

    const convertPptToPdf = async (file: File): Promise<Blob> => {
        if (!hiddenPrintRef.current) throw new Error("DOM not ready");
        const container = hiddenPrintRef.current;
        container.innerHTML = "";

        const arrayBuffer = await file.arrayBuffer();

        // Render PPTX to HTML
        // Assuming Landscape A4: 1123 x 794
        const slidesHtml = await pptxToHtml(arrayBuffer, {
            width: 1123,
            height: 794,
            scaleToFit: true
        });

        // Append slides
        slidesHtml.forEach((slideHtml: string) => {
            const slideWrapper = document.createElement("div");
            slideWrapper.className = "pptx-slide-page";
            slideWrapper.style.marginBottom = "20px";
            slideWrapper.style.pageBreakAfter = "always";
            slideWrapper.innerHTML = slideHtml;
            container.appendChild(slideWrapper);
        });

        // Generate PDF
        const opt = {
            margin: 10,
            filename: 'presentation.pdf',
            image: { type: 'jpeg', quality: 0.98 } as any,
            html2canvas: { scale: 1.5, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
            pagebreak: { mode: ['css', 'legacy'] }
        } as any;

        const pdfBlob = await html2pdf().set(opt).from(container).output('blob');

        container.innerHTML = ""; // Cleanup
        return pdfBlob;
    };

    const convertPptToImages = async (file: File): Promise<Blob> => {
        if (!hiddenPrintRef.current) throw new Error("DOM not ready");
        const container = hiddenPrintRef.current;
        container.innerHTML = "";

        const arrayBuffer = await file.arrayBuffer();
        const slidesHtml = await pptxToHtml(arrayBuffer, {
            width: 1280,
            height: 720,
            scaleToFit: true
        });

        slidesHtml.forEach((slideHtml: string) => {
            const slideWrapper = document.createElement("div");
            slideWrapper.className = "pptx-slide-page-img";
            slideWrapper.style.background = "white";
            slideWrapper.style.marginBottom = "20px";
            // Ensure specific dimensions for consistent capture
            slideWrapper.style.width = "1280px";
            slideWrapper.style.height = "720px";
            slideWrapper.innerHTML = slideHtml;
            container.appendChild(slideWrapper);
        });

        // Wait for DOM to settle
        await new Promise(r => setTimeout(r, 500));

        const zip = new JSZip();
        const slides = container.querySelectorAll('.pptx-slide-page-img');

        for (let i = 0; i < slides.length; i++) {
            const node = slides[i] as HTMLElement;
            // Capture
            const dataUrl = await toPng(node, {
                backgroundColor: '#ffffff',
                pixelRatio: 1.5,
                width: 1280,
                height: 720
            });
            const base64Info = dataUrl.split(',')[1];
            zip.file(`Slide_${i + 1}.png`, base64Info, { base64: true });
        }

        container.innerHTML = ""; // Cleanup
        return zip.generateAsync({ type: 'blob' });
    };

    const convertExcelToText = async (file: File): Promise<Blob> => {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        let combinedText = "";

        workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const text = XLSX.utils.sheet_to_txt(worksheet);
            combinedText += `--- Sheet: ${sheetName} ---\n\n${text}\n\n`;
        });

        return new Blob([combinedText], { type: "text/plain;charset=utf-8" });
    };

    const convertExcelToPdf = async (file: File): Promise<Blob> => {
        if (!hiddenPrintRef.current) throw new Error("DOM not ready");
        const container = hiddenPrintRef.current;
        container.innerHTML = "";

        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);

        // Styling for the table in PDF
        const style = document.createElement('style');
        style.innerHTML = `
            table { border-collapse: collapse; width: 100%; margin-bottom: 20px; font-size: 12px; font-family: sans-serif; }
            th, td { border: 1px solid #ccc; padding: 4px 8px; text-align: left; }
            .sheet-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; margin-top: 30px; color: #333; }
        `;
        container.appendChild(style);

        workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const html = XLSX.utils.sheet_to_html(worksheet);

            // Extract ONLY the table from the generated HTML (it wraps in a full HTML doc sometimes)
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            const table = tempDiv.querySelector('table');

            if (table) {
                const title = document.createElement('div');
                title.className = 'sheet-title';
                title.textContent = sheetName;
                container.appendChild(title);
                container.appendChild(table);
            }
        });

        const opt = {
            margin: 10,
            filename: 'spreadsheet.pdf',
            image: { type: 'jpeg', quality: 0.98 } as any,
            html2canvas: { scale: 1.5, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
            pagebreak: { mode: ['css', 'legacy'] }
        } as any;

        const pdfBlob = await html2pdf().set(opt).from(container).output('blob');

        container.innerHTML = "";
        return pdfBlob;
    };

    const processConversion = async (file: ExtendedFile) => {
        const target = targetFormat[file.id];
        if (!target || target === 'unsupported') {
            toast.error("Format not supported");
            return;
        }

        setStatus(prev => ({ ...prev, [file.id]: "converting" }));

        try {
            let resultBlob: Blob | null = null;
            const srcType = file.type;

            // Image -> Image
            if (srcType.startsWith('image/') && target.startsWith('image/')) {
                resultBlob = await convertImage(file, target);
            }
            // Image -> PDF
            else if (srcType.startsWith('image/') && target === 'application/pdf') {
                resultBlob = await convertImageToPdf(file);
            }
            // PDF -> Images (ZIP)
            else if (srcType === 'application/pdf' && target === 'application/zip') {
                resultBlob = await convertPdfToImages(file);
            }
            // PDF -> Word
            else if (srcType === 'application/pdf' && target === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                resultBlob = await convertPdfToWord(file);
            }
            // PDF -> Excel
            else if (srcType === 'application/pdf' && target === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                resultBlob = await convertPdfToExcel(file);
            }
            // PDF -> Text
            else if (srcType === 'application/pdf' && target === 'text/plain') {
                resultBlob = await convertPdfToText(file);
            }
            // DOCX -> Text
            else if (srcType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && target === 'text/plain') {
                resultBlob = await convertDocxToText(file);
            }
            // DOCX -> PDF
            else if (srcType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && target === 'application/pdf') {
                resultBlob = await convertDocxToPdf(file);
            }
            // Text -> PDF
            else if (srcType === 'text/plain' && target === 'application/pdf') {
                resultBlob = await convertTextToPdf(file);
            }
            // PPT -> PDF
            else if (srcType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' && target === 'application/pdf') {
                resultBlob = await convertPptToPdf(file);
            }
            // PPT -> Images
            else if (srcType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' && target === 'application/zip') {
                resultBlob = await convertPptToImages(file);
            }
            // Excel -> PDF
            else if ((srcType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || srcType === 'application/vnd.ms-excel') && target === 'application/pdf') {
                resultBlob = await convertExcelToPdf(file);
            }
            // Excel -> Text
            else if ((srcType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || srcType === 'application/vnd.ms-excel') && target === 'text/plain') {
                resultBlob = await convertExcelToText(file);
            }
            else {
                throw new Error("Conversion path not implemented");
            }

            if (!resultBlob) throw new Error("Conversion produced no output");

            const url = URL.createObjectURL(resultBlob);
            setResults(prev => ({
                ...prev,
                [file.id]: { fileId: file.id, blob: resultBlob!, url, format: target }
            }));
            setStatus(prev => ({ ...prev, [file.id]: "done" }));
            toast.success("Converted!");

        } catch (error) {
            console.error(error);
            setStatus(prev => ({ ...prev, [file.id]: "error" }));
            toast.error("Conversion failed");
        }
    };

    const getFormatExt = (mime: string) => {
        if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx';
        if (mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return 'xlsx';
        if (mime === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') return 'pptx';
        if (mime === 'text/plain') return 'txt';
        if (mime === 'application/pdf') return 'pdf';
        if (mime === 'application/zip') return 'zip';
        return mime.split('/')[1] || 'bin';
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + ['B', 'KB', 'MB', 'GB'][i];
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-blue-500/30">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                                <ArrowRightLeft className="w-6 h-6 text-blue-400" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-white uppercase">
                                Format Converter
                            </h1>
                        </div>
                        <p className="text-slate-400 max-w-lg leading-relaxed">
                            Convert files between different formats instantly.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-widest shadow-sm">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        <span>Client-Side for Images</span>
                    </div>
                </div>

                {/* Upload & Workspace */}
                <div className="space-y-6">
                    <motion.div
                        layout
                        className="group relative overflow-hidden rounded-[2rem] bg-slate-900/50 border border-slate-800 transition-all hover:border-blue-500/30 hover:bg-slate-900/80 p-8"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative">
                            <FileUpload
                                onChange={handleFiles}
                                multiple={true}
                                label="Drop files here to convert"
                                hideMetadata={true}
                            />
                        </div>
                    </motion.div>

                    <AnimatePresence>
                        {files.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="grid grid-cols-1 gap-4"
                            >
                                {files.map(file => {
                                    const availableFormats = CONVERSION_MAP[file.type] || [];
                                    const isUnsupported = availableFormats.length === 0;

                                    return (
                                        <div key={file.id} className="relative flex flex-col md:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800 group hover:border-slate-700 transition-all">

                                            {/* Remove Button */}
                                            <button
                                                onClick={() => removeFile(file.id)}
                                                className="absolute top-2 right-2 p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all md:hidden z-10"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>

                                            {/* Left: Preview & File Info */}
                                            <div className="flex items-center gap-4 w-full md:w-auto flex-1">
                                                <div className="w-16 h-16 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                                                    {file.preview ? (
                                                        <img src={file.preview} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <FileType className="w-8 h-8 text-slate-600" />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="font-bold text-slate-200 truncate pr-2 max-w-[200px]" title={file.name}>
                                                        {file.name}
                                                    </h4>
                                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-1">
                                                        <span className="uppercase bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                                                            {getFormatExt(file.type)}
                                                        </span>
                                                        <span>•</span>
                                                        <span>{formatSize(file.size)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Center: Conversion Logic */}
                                            <div className="w-full md:w-auto flex items-center justify-between md:justify-center gap-4 py-2 md:py-0 border-t md:border-t-0 border-b md:border-b-0 border-slate-800/50">
                                                <div className="flex items-center gap-3">
                                                    <ArrowRight className="w-4 h-4 text-slate-600 hidden md:block" />
                                                    {isUnsupported ? (
                                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider">
                                                            <AlertCircle className="w-3 h-3" />
                                                            <span>Unsupported</span>
                                                        </div>
                                                    ) : (
                                                        <Select
                                                            value={targetFormat[file.id] || ''}
                                                            onValueChange={(val) => setTargetFormat(prev => ({ ...prev, [file.id]: val }))}
                                                            disabled={status[file.id] === 'converting' || status[file.id] === 'done'}
                                                        >
                                                            <SelectTrigger className="w-[160px] h-10 bg-slate-950 border-slate-800 text-slate-300 rounded-xl focus:ring-blue-500/30">
                                                                <SelectValue placeholder="Select Format" />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-slate-950 border-slate-800 text-slate-300">
                                                                {availableFormats.map(opt => (
                                                                    <SelectItem
                                                                        key={opt.value}
                                                                        value={opt.value}
                                                                        className="focus:bg-blue-600 focus:text-white cursor-pointer"
                                                                    >
                                                                        {opt.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Right: Actions */}
                                            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                                                {status[file.id] === 'done' ? (
                                                    <Button
                                                        onClick={() => handleDownloadClick(file.id)}
                                                        className="h-10 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                                                    >
                                                        <Download className="w-4 h-4" /> Save
                                                    </Button>
                                                ) : status[file.id] === 'converting' ? (
                                                    <div className="h-10 px-6 flex items-center gap-2 text-blue-400 font-bold bg-blue-500/10 rounded-xl border border-blue-500/20">
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        <span className="text-xs uppercase tracking-wider">Converting</span>
                                                    </div>
                                                ) : status[file.id] === 'error' ? (
                                                    <div className="h-10 px-6 flex items-center gap-2 text-red-400 font-bold bg-red-500/10 rounded-xl border border-red-500/20">
                                                        <AlertCircle className="w-4 h-4" />
                                                        <span className="text-xs uppercase tracking-wider">Failed</span>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        onClick={() => processConversion(file)}
                                                        disabled={isUnsupported}
                                                        className={cn(
                                                            "h-10 px-6 font-bold rounded-xl transition-all shadow-lg",
                                                            isUnsupported
                                                                ? "bg-slate-800 text-slate-500 shadow-none"
                                                                : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20"
                                                        )}
                                                    >
                                                        Convert
                                                    </Button>
                                                )}

                                                <button
                                                    onClick={() => removeFile(file.id)}
                                                    className="hidden md:flex p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-2"
                                                    title="Remove"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Hidden Container for HTML2PDF ops */}
            <div
                ref={hiddenPrintRef}
                className="fixed top-0 left-0 -z-50 pointer-events-none w-[210mm] bg-white text-black p-[20mm]"
            />

            <DownloadConfirmDialog
                isOpen={downloadDialog.isOpen}
                onClose={() => setDownloadDialog({ isOpen: false, fileId: null })}
                onConfirm={handleDownloadConfirm}
                defaultFileName={downloadDialog.fileId && files.find(f => f.id === downloadDialog.fileId)
                    ? `converted_${files.find(f => f.id === downloadDialog.fileId)!.name.split('.')[0]}`
                    : "converted_file"
                }
                extension={downloadDialog.fileId && results[downloadDialog.fileId]
                    ? getFormatExt(results[downloadDialog.fileId].format)
                    : "bin"
                }
                isProcessing={false}
                title="Save Converted File"
                description="Enter a name for your converted file."
            />
        </div>
    );
}
