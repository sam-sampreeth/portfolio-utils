import {
    CalendarClock,
    Clock3,
    Hourglass,
    FileText,
    ClockFading,
    Palette,
    Globe,
    Smile,
    Keyboard,
    MousePointer2,
    Gamepad2,
    Speaker,
    Mic,
    Webcam,
    Cpu,
    Scan,
    FileLock,
    CalendarDays,
    Files,
    FileArchive,
    Scissors,
    FileDown,
    Image as ImageIcon,
    RefreshCw,
    FileCode,
    Fingerprint,
    Binary,
    Eraser,
    Replace,
    PenTool,
    Presentation,
    Table,
    Calculator as CalculatorIcon,
    Thermometer,
    ImageDown,
    ScanLine,
    Crop,
    RotateCw,
    Repeat,
    Info,
    FileCheck,
    GalleryHorizontalEnd,
    LayoutDashboard,
    Blend,
    SquareDashedBottom,
    ArrowLeftRight,
    Code2,
    PipetteIcon,
    Shuffle,
    Braces,
    AlignLeft,
    Regex,
    KeyRound,
    TextCursor,
    ListOrdered,
    CaseUpper,
    SmilePlus,
    Asterisk,
    NotebookPen,
    StickyNote,
    Grid2X2,
    LayoutDashboardIcon,
    Gauge,
    Timer,
} from "lucide-react";


export interface Tool {
    id: string;
    name: string;
    desc: string;
    path: string;
    icon?: any;
    iconSize?: number;
}

export interface Category {
    id: string;
    title: string;
    description: string;
    icon: any;
    color: string;
    tools: Tool[];
}

export const toolsConfig: Category[] = [
    {
        id: "time",
        title: "Time & Date",
        description: "Accurate clocks, timers, and date calculations: all running locally for precise time tracking, scheduling, and timezone conversions.",
        icon: CalendarClock,
        color: "from-blue-500 to-cyan-500",
        tools: [
            { id: "clock", name: "Digital Clock", desc: "A clean digital clock with full-screen mode that syncs once and verifies system time accuracy locally.", path: "/time/clock", icon: Clock3 },
            { id: "stopwatch", name: "Stopwatch", desc: "A precise stopwatch with start, pause, stop, lap tracking, and reset controls for accurate time measurement.", path: "/time/stopwatch", icon: Timer },
            { id: "timer", name: "Timer", desc: "A flexible countdown timer with quick presets, custom durations, editable presets, and completion notifications.", path: "/time/timer", icon: Hourglass },
            { id: "pomodoro", name: "Pomodoro Timer", desc: "Focus sessions with customizable work and break intervals, distraction-free mode, and cycle tracking.", path: "/time/pomodoro", icon: ClockFading },
            { id: "converter", name: "Timezone Converter", desc: "Convert times across timezones in live or manual mode, including UTC/GMT event times, with clear offsets.", path: "/time/converter", icon: Globe },
            { id: "calculator", name: "Date & Time Calculator", desc: "Add, subtract, or compare dates and times with clear duration breakdowns and precise calculations.", path: "/time/calculator", icon: CalendarDays },
        ]
    },
    {
        id: "hardware",
        title: "Hardware & Device",
        description: "Test and validate your hardware devices locally - from input accuracy to audio, video, and display health.",
        icon: Cpu,
        color: "from-slate-500 to-slate-700",
        tools: [
            { id: "keyboard", name: "Keyboard Tester", desc: "Test keyboard input in real time to detect stuck keys, rollover limits, and ghosting across common layouts.", path: "/hardware/keyboard", icon: Keyboard },
            { id: "mouse", name: "Mouse Tester", desc: "Check mouse buttons, scroll behavior, and pointer responsiveness with real-time feedback.", path: "/hardware/mouse", icon: MousePointer2 },
            { id: "controller", name: "Controller Tester", desc: "Inspect gamepad inputs including buttons, triggers, and analog sticks with live state visualization for Xbox and PS Controllers.", path: "/hardware/controller", icon: Gamepad2 },
            { id: "speaker", name: "Speaker / Headphone Tester", desc: "Test speakers using channel separation, frequency sweeps, and sample audio for clarity and balance.", path: "/hardware/speaker", icon: Speaker },
            { id: "mic", name: "Microphone Tester", desc: "Analyze microphone input with live waveform, level metering, and basic noise detection.", path: "/hardware/mic", icon: Mic },
            { id: "webcam", name: "Webcam Tester", desc: "Preview webcam output with resolution checks, frame rate monitoring, and flash calibration.", path: "/hardware/webcam", icon: Webcam },
            { id: "pixels", name: "Dead Pixel Checker", desc: "Detect dead or stuck pixels using solid color screens and full-screen diagnostic mode.", path: "/hardware/pixels", icon: Scan },
        ]
    },
    {
        id: "files",
        title: "File Tools",
        description: "A complete set of privacy-first tools for converting, compressing, organizing, and inspecting files - all processed locally.",
        icon: Files,
        color: "from-emerald-500 to-teal-500",
        tools: [
            // PDF Tools
            { id: "pdf-to-word", name: "PDF to Word", desc: "Convert PDF files to editable DOCX format.", path: "/files/pdf-to-word", icon: FileText },
            { id: "pdf-to-ppt", name: "PDF to PPT", desc: "Convert PDF pages into PowerPoint slides.", path: "/files/pdf-to-ppt", icon: Presentation },
            { id: "pdf-to-excel", name: "PDF to Excel", desc: "Extract tables from PDFs into spreadsheets.", path: "/files/pdf-to-excel", icon: Table },
            { id: "pdf-merge", name: "PDF Merge", desc: "Combine multiple PDF files into one.", path: "/files/pdf-merge", icon: Files },
            { id: "pdf-split", name: "PDF Split", desc: "Split PDFs or extract selected pages.", path: "/files/pdf-split", icon: Scissors },
            { id: "pdf-password", name: "Lock / Unlock PDF", desc: "Protect or remove passwords from PDF files.", path: "/files/pdf-password", icon: FileLock },
            { id: "pdf-organize", name: "Organize PDF", desc: "Reorder, rotate, or delete PDF pages.", path: "/files/pdf-organize", icon: GalleryHorizontalEnd },
            { id: "pdf-compress", name: "PDF Compress", desc: "Reduce PDF file size while preserving quality.", path: "/files/pdf-compress", icon: FileDown },
            { id: "pdf-extract-images", name: "PDF to Images", desc: "Convert PDF pages into image files.", path: "/files/pdf-extract-images", icon: ImageIcon },

            // Image Tools
            { id: "img-compress", name: "Image Compress", desc: "Compress images to reduce file size.", path: "/files/img-compress", icon: ImageDown },
            { id: "img-resize", name: "Resize Image", desc: "Resize images by dimensions or scale.", path: "/files/img-resize", icon: ScanLine },
            { id: "img-crop", name: "Crop Image", desc: "Crop images to a selected area.", path: "/files/img-crop", icon: Crop },
            { id: "img-rotate", name: "Rotate Image", desc: "Rotate or flip images.", path: "/files/img-rotate", icon: RotateCw },
            { id: "img-converter", name: "Image Converter", desc: "Convert images between supported formats.", path: "/files/img-converter", icon: Repeat },
            { id: "file-metadata", name: "View/Strip Image Metadata", desc: "View or remove metadata such as EXIF data.", path: "/files/file-metadata", icon: Info },

            // { id: "redact", name: "Redact Content", desc: "Sensitive info removal", path: "/files/redact", icon: ShieldCheck },
            { id: "file-converter", name: "Format Converter", desc: "Convert between popular types", path: "/files/file-converter", icon: RefreshCw },

            // Word Tools
            { id: "word-to-pdf", name: "Word to PDF", desc: "Convert DOCX files to PDF format.", path: "/files/word-to-pdf", icon: FileText },
            { id: "word-compress", name: "Word Compress", desc: "Reduce the size of Word documents.", path: "/files/word-compress", icon: FileDown },
            { id: "word-extract", name: "Extract Images", desc: "Extract embedded images from DOCX files.", path: "/files/word-extract", icon: ImageIcon },
            { id: "word-merge", name: "Word Merge", desc: "Combine multiple Word documents.", path: "/files/word-merge", icon: Files },

            // PPT Tools
            { id: "ppt-to-pdf", name: "PPT to PDF", desc: "Convert PowerPoint presentations to PDF.", path: "/files/ppt-to-pdf", icon: Presentation },
            { id: "ppt-compress", name: "PPT Compress", desc: "Reduce PPTX file size.", path: "/files/ppt-compress", icon: FileDown },
            { id: "ppt-merge", name: "PPT Merge", desc: "Merge multiple presentations into one.", path: "/files/ppt-merge", icon: Files },
            { id: "ppt-export", name: "Export as Images", desc: "Export slides as image files.", path: "/files/ppt-export", icon: ImageIcon },

            // OTHER File Utilities

            { id: "file-hash", name: "File Hash", desc: "Generate MD5, SHA-1, or SHA-256 checksums.", path: "/files/file-hash", icon: Fingerprint },
            { id: "file-check", name: "Corrupt File Check", desc: "Verify file integrity and detect corruption.", path: "/files/file-check", icon: FileCheck },
            { id: "zip-manager", name: "ZIP Manager", desc: "Create or extract ZIP archives.", path: "/files/zip-manager", icon: FileArchive },
            { id: "text-extract", name: "Extract Text", desc: "Extract text from PDF, Word, or PPT files.", path: "/files/text-extract", icon: FileText },
        ]
    },
    {
        id: "frontend",
        title: "Frontend Helpers",
        description: "Visual design and CSS helper tools for building, previewing, and fine-tuning frontend styles locally.",
        icon: Palette,
        color: "from-orange-500 to-yellow-500",
        tools: [
            { id: "ui-visualizer", name: "UI Visualizer", desc: "Preview font, color, and layout combinations on a live mock interface.", path: "/frontend/ui-visualizer", icon: LayoutDashboard },
            { id: "color", name: "Color Format Converter", desc: "Convert colors between HEX, RGB, HSL formats.", path: "/frontend/color", icon: Shuffle },
            { id: "gradient", name: "Gradient Generator", desc: "Create and export CSS linear and radial gradients visually.", path: "/frontend/gradient", icon: Blend },
            { id: "shadow", name: "Box Shadow Generator", desc: "Generate CSS box-shadow values with live visual preview.", path: "/frontend/shadow", icon: SquareDashedBottom },
            { id: "units", name: "CSS Units Converter", desc: "Convert between CSS units such as px, rem, em, vw, and vh.", path: "/frontend/units", icon: ArrowLeftRight },
            { id: "image-picker", name: "Image Color Picker", desc: "Pick and inspect colors directly from uploaded images.", path: "/frontend/image-picker", icon: PipetteIcon },
            { id: "svg", name: "SVG Viewer", desc: "Preview and optimize SVGs", path: "/frontend/svg", icon: Code2 },
        ]
    },
    {
        id: "dev",
        title: "Developer Tools",
        description: "Essential developer utilities for formatting, validating, encoding, and generating data - all running locally.",
        icon: Braces,
        color: "from-purple-500 to-pink-500",
        tools: [
            { id: "json", name: "JSON Formatter", desc: "Validate, format, and beautify JSON with error highlighting.", path: "/dev/json", icon: FileCode },
            { id: "beautifier", name: "Code Beautifier", desc: "Format and beautify JavaScript, TypeScript, HTML, and CSS code.", path: "/dev/beautifier", icon: AlignLeft },
            { id: "regex", name: "Regex Tester", desc: "Test regular expressions with live matches and groups.", path: "/dev/regex", icon: Regex },
            { id: "generators", name: "ID Generators (UUID, NanoID, Hash, Random)", desc: "Generate UUIDs, NanoIDs, hashes, and random values.", path: "/dev/generators", icon: Fingerprint },
            { id: "base64", name: "Base64 Encoder", desc: "Encode or decode Base64 data and text.", path: "/dev/base64", icon: Binary },
            { id: "jwt", name: "JWT Encoder / Decoder", desc: "Encode, decode, and inspect JSON Web Tokens.", path: "/dev/jwt", icon: KeyRound },
        ]
    },
    {
        id: "text",
        title: "Text Tools",
        description: "Tools for analyzing, cleaning, transforming, and generating text content locally.",
        icon: TextCursor,
        color: "from-rose-500 to-orange-500",
        tools: [
            { id: "counter", name: "Character Counter", desc: "Count characters, words, lines, and paragraphs in real time.", path: "/text/counter", icon: ListOrdered },
            { id: "transformer", name: "Text Transformer", desc: "Convert text case and apply common text transformations.", path: "/text/transformer", icon: CaseUpper },
            { id: "spaces", name: "Remove Extra Spaces", desc: "Remove unnecessary spaces and normalize text formatting.", path: "/text/spaces", icon: Eraser },
            { id: "replace", name: "Find & Replace", desc: "Search and replace text in bulk with preview.", path: "/text/replace", icon: Replace },
            { id: "lorem-ipsum", name: "Lorem Ipsum Generator", desc: "Generate placeholder Lorem Ipsum text for layouts and mockups.", path: "/text/lorem-ipsum", icon: AlignLeft },
        ]
    },
    {
        id: "emoji",
        title: "Emoji & Symbols",
        description: "Quick access to emojis and Unicode symbols for writing, messaging, and design.",
        icon: SmilePlus,
        color: "from-yellow-400 to-orange-500",
        tools: [
            { id: "picker", name: "Emoji Picker", desc: "Browse, search, and copy emojis quickly.", path: "/emoji/picker", icon: Smile },
            { id: "unicodes", name: "Unicode Symbols", desc: "Browse and copy special Unicode characters and symbols.", path: "/emoji/unicodes", icon: Asterisk },
        ]
    },
    {
        id: "notes",
        title: "Notes & Canvas",
        description: "Lightweight tools for capturing notes and sketching ideas locally.",
        icon: NotebookPen,
        color: "from-teal-400 to-emerald-600",
        tools: [
            { id: "notepad", name: "Quick Notepad", desc: "Write and save quick notes locally with automatic persistence.", path: "/notes/notepad", icon: StickyNote },
            { id: "whiteboard", name: "Quick Whiteboard", desc: "Freehand sketching canvas for quick diagrams and ideas.", path: "/notes/whiteboard", icon: PenTool },
        ]
    },
    {
        id: "others",
        title: "Other Utilities",
        description: "General-purpose utilities that don't fit a single category but are useful in everyday workflows.",
        icon: Grid2X2,
        color: "from-gray-500 to-slate-500",
        tools: [
            { id: "homepage", name: "OS-style Homepage", desc: "A customizable, OS-style dashboard for quick access to tools and links.", path: "/others/homepage", icon: LayoutDashboardIcon },
            { id: "speedtest", name: "Network Speed Test", desc: "Test network speed including download, upload, jitter and latency.", path: "/others/speedtest", icon: Gauge },
            { id: "scientific-calculator", name: "Scientific Calculator", desc: "Advanced calculator with scientific and trigonometric functions.", path: "/others/scientific-calculator", icon: CalculatorIcon },
            { id: "temperature-converter", name: "Temperature Converter", desc: "Convert temperatures between Celsius, Fahrenheit, and Kelvin.", path: "/others/temperature-converter", icon: Thermometer },
        ]
    }
];
