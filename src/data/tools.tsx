import {
    Clock,
    Monitor,
    FileText,
    Palette,
    Wrench,
    Type,
    Smile,
    Edit3,
    MousePointer2,
    Gamepad2,
    Speaker,
    Mic,
    Webcam,
    Square,
    Zap,
    Files,
    FileArchive,
    Scissors,
    FileDown,
    Image as ImageIcon,
    ShieldCheck,
    Sparkles,
    RefreshCw,
    Timer,
    Pipette,
    Layers,
    Box,
    Layout,
    FileCode,
    Terminal,
    Fingerprint,
    Binary,
    Coins,
    BookOpen,
    Eraser,
    Replace,
    PenTool,
    MoreHorizontal,
    Presentation,
    Table,
    FileType2,
    Calculator as CalculatorIcon,
    Thermometer,
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
        description: "Global clocks, stopwatch, and precision timers.",
        icon: Clock,
        color: "from-blue-500 to-cyan-500",
        tools: [
            { id: "clock", name: "Digital Clock", desc: "A clean digital clock with full-screen mode that syncs once and verifies system time accuracy locally.", path: "/time/clock", icon: Clock },
            { id: "stopwatch", name: "Stopwatch", desc: "A precise stopwatch with start, pause, stop, lap tracking, and reset controls for accurate time measurement.", path: "/time/stopwatch", icon: Timer },
            { id: "timer", name: "Timer", desc: "A flexible countdown timer with quick presets, custom durations, editable presets, and completion notifications.", path: "/time/timer", icon: Timer },
            { id: "pomodoro", name: "Pomodoro Timer", desc: "Focus sessions with customizable work and break intervals, distraction-free mode, and cycle tracking.", path: "/time/pomodoro", icon: Timer },
            { id: "converter", name: "Timezone Converter", desc: "Convert times across timezones in live or manual mode, including UTC/GMT event times, with clear offsets.", path: "/time/converter", icon: RefreshCw },
            { id: "calculator", name: "Date & Time Calculator", desc: "Add, subtract, or compare dates and times with clear duration breakdowns and precise calculations.", path: "/time/calculator", icon: Edit3 },
        ]
    },
    {
        id: "hardware",
        title: "Hardware & Device",
        description: "Verify your peripherals and display health.",
        icon: Monitor,
        color: "from-slate-500 to-slate-700",
        tools: [
            { id: "keyboard", name: "Keyboard Tester", desc: "Test your keyboard in real time to detect stuck keys, key rollover, and ghosting across Windows and Mac layouts", path: "/hardware/keyboard", icon: Type },
            { id: "mouse", name: "Mouse Tester", desc: "Buttons & scroll speed", path: "/hardware/mouse", icon: MousePointer2 },
            { id: "controller", name: "Controller Tester", desc: "Gamepad input check", path: "/hardware/controller", icon: Gamepad2 },
            { id: "speaker", name: "Speaker Tester", desc: "Precision Audio Lab with 3D spatial panning, frequency sweeps, and acoustic samples.", path: "/hardware/speaker", icon: Speaker },
            { id: "mic", name: "Microphone Tester", desc: "Professional Voice Studio with real-time spectral analysis, noise floor detection, and pro-level metering.", path: "/hardware/mic", icon: Mic },
            { id: "webcam", name: "Webcam Tester", desc: "Optical Diagnostic Lab with FPS tracking, resolution validation, and pro-grade flash calibration.", path: "/hardware/webcam", icon: Webcam },
            { id: "pixels", name: "Dead Pixel Checker", desc: "Chromatic Shield with pure spectral shifts, full-screen diagnostic mode, and interactive HUD.", path: "/hardware/pixels", icon: Square },
        ]
    },
    {
        id: "files",
        title: "File Tools",
        description: "Complete suite for PDF, Image, and Document manipulation.",
        icon: FileText,
        color: "from-emerald-500 to-teal-500",
        tools: [
            { id: "pdf-to-word", name: "PDF to Word", desc: "Convert PDF to DOCX", path: "/files/pdf-to-word", icon: FileText },
            { id: "pdf-to-ppt", name: "PDF to PPT", desc: "Convert PDF to PowerPoint", path: "/files/pdf-to-ppt", icon: Presentation },
            { id: "pdf-to-excel", name: "PDF to Excel", desc: "Convert PDF to Spreadsheet", path: "/files/pdf-to-excel", icon: Table },
            { id: "pdf-merge", name: "PDF Merge", desc: "Combine multiple PDFs", path: "/files/pdf-merge", icon: Files },
            { id: "pdf-split", name: "PDF Split", desc: "Extract PDF pages", path: "/files/pdf-split", icon: Scissors },
            { id: "pdf-password", name: "Lock / Unlock PDF", desc: "Remove passwords or encrypt PDF", path: "/files/pdf-password", icon: ShieldCheck },
            { id: "pdf-organize", name: "Organize PDF", desc: "Reorder and delete pages", path: "/files/pdf-organize", icon: Layers },
            { id: "pdf-compress", name: "PDF Compress", desc: "Reduce file size", path: "/files/pdf-compress", icon: FileDown },
            { id: "pdf-extract-images", name: "PDF to Images", desc: "Convert pages to images", path: "/files/pdf-extract-images", icon: ImageIcon },
            { id: "img-compress", name: "Image Compress", desc: "Optimize PNG/JPG/WEBP", path: "/files/img-compress", icon: ImageIcon },
            { id: "img-resize", name: "Resize Image", desc: "Change dimensions & scale", path: "/files/img-resize", icon: ImageIcon },
            { id: "img-crop", name: "Crop Image", desc: "Trim and focus area", path: "/files/img-crop", icon: Scissors },
            { id: "img-rotate", name: "Rotate Image", desc: "Turn 90° or flip", path: "/files/img-rotate", icon: RefreshCw },
            { id: "img-converter", name: "Image Converter", desc: "Convert between all supported formats", path: "/files/img-converter", icon: RefreshCw },
            { id: "file-metadata", name: "View/Strip Image Metadata", desc: "Hash, info, encoding", path: "/files/file-metadata", icon: FileType2 },
            { id: "redact", name: "Redact Content", desc: "Sensitive info removal", path: "/files/redact", icon: ShieldCheck },
            { id: "file-converter", name: "Format Converter", desc: "Convert between popular types", path: "/files/file-converter", icon: RefreshCw },

            // WORD Tools
            { id: "word-to-pdf", name: "Word to PDF", desc: "Convert DOCX to PDF", path: "/files/word-to-pdf", icon: FileText },
            { id: "word-compress", name: "Word Compress", desc: "Reduce DOCX size", path: "/files/word-compress", icon: FileDown },
            { id: "word-extract", name: "Extract Images", desc: "Get images from DOCX", path: "/files/word-extract", icon: ImageIcon },
            { id: "word-merge", name: "Word Merge", desc: "Combine multiple DOCX", path: "/files/word-merge", icon: Files },

            // PPT Tools
            { id: "ppt-to-pdf", name: "PPT to PDF", desc: "Convert PowerPoint to PDF", path: "/files/ppt-to-pdf", icon: Presentation },
            { id: "ppt-compress", name: "PPT Compress", desc: "Reduce PPTX size", path: "/files/ppt-compress", icon: FileDown },
            { id: "ppt-merge", name: "PPT Merge", desc: "Combine presentations", path: "/files/ppt-merge", icon: Files },
            { id: "ppt-export", name: "Export as Images", desc: "Slides to JPG/PNG", path: "/files/ppt-export", icon: ImageIcon },

            // OTHER File Utilities

            { id: "file-hash", name: "File Hash", desc: "Generate MD5, SHA checksums", path: "/files/file-hash", icon: Fingerprint },
            { id: "file-check", name: "Corrupt File Check", desc: "Verify file integrity", path: "/files/file-check", icon: ShieldCheck },
            { id: "zip-manager", name: "ZIP Manager", desc: "Create & extract ZIP files", path: "/files/zip-manager", icon: FileArchive },
            { id: "text-extract", name: "Extract Text", desc: "From PDF, Word, PPT", path: "/files/text-extract", icon: FileText },
        ]
    },
    {
        id: "frontend",
        title: "Frontend Helpers",
        description: "Design tools and CSS utilities.",
        icon: Palette,
        color: "from-orange-500 to-yellow-500",
        tools: [
            { id: "ui-visualizer", name: "UI Visualizer", desc: "Test font and color combinations on a live mock website", path: "/frontend/ui-visualizer", icon: Layout },
            { id: "color", name: "Color Format Converter", desc: "Hex, RGB, HSL", path: "/frontend/color", icon: Pipette },
            { id: "gradient", name: "Gradient Generator", desc: "Visual CSS gradients", path: "/frontend/gradient", icon: Layers },
            { id: "shadow", name: "Box Shadow Generator", desc: "Neumorphic & glass shadows", path: "/frontend/shadow", icon: Box },
            { id: "units", name: "CSS Units Converter", desc: "PX, REM, EM, VW", path: "/frontend/units", icon: RefreshCw },
            { id: "image-picker", name: "Image Color Picker", desc: "Extract pixel colors", path: "/frontend/image-picker", icon: ImageIcon },
            { id: "svg", name: "SVG Viewer", desc: "Preview and optimize SVGs", path: "/frontend/svg", icon: ImageIcon },
        ]
    },
    {
        id: "dev",
        title: "Developer Tools",
        description: "Formatting, encoding, and data generation.",
        icon: Wrench,
        color: "from-purple-500 to-pink-500",
        tools: [
            { id: "json", name: "JSON Formatter", desc: "Validate and beautify", path: "/dev/json", icon: FileCode },
            { id: "beautifier", name: "Code Beautifier", desc: "Format JS/TS/CSS/HTML", path: "/dev/beautifier", icon: Sparkles },
            { id: "regex", name: "Regex Tester", desc: "Test expressions live", path: "/dev/regex", icon: Terminal },
            { id: "generators", name: "ID Generators (UUID, NanoID, Hash, Random)", desc: "UUID, NanoID, Hash, Random", path: "/dev/generators", icon: Fingerprint },
            { id: "base64", name: "Base64 Encoder", desc: "Convert binary data", path: "/dev/base64", icon: Binary },
            { id: "jwt", name: "JWT Encoder / Decoder", desc: "Sign and inspect tokens", path: "/dev/jwt", icon: Coins },
        ]
    },
    {
        id: "text",
        title: "Text Tools",
        description: "Content analysis and manipulation.",
        icon: Type,
        color: "from-rose-500 to-orange-500",
        tools: [
            { id: "counter", name: "Character Counter", desc: "Words, Lines, Paragraphs", path: "/text/counter", icon: Type },
            { id: "transformer", name: "Text Transformer", desc: "Case conversion & Styling", path: "/text/transformer", icon: Type },
            { id: "spaces", name: "Remove Extra Spaces", desc: "Clean up text", path: "/text/spaces", icon: Eraser },
            { id: "replace", name: "Find & Replace", desc: "Bulk text updates", path: "/text/replace", icon: Replace },
            { id: "lorem-ipsum", name: "Lorem Ipsum Generator", desc: "Generate placeholder text", path: "/text/lorem-ipsum", icon: FileText },
        ]
    },
    {
        id: "emoji",
        title: "Emoji & Symbols",
        description: "Quick access to icons and special characters.",
        icon: Smile,
        color: "from-yellow-400 to-orange-500",
        tools: [
            { id: "picker", name: "Emoji Picker", desc: "Find emojis quickly", path: "/emoji/picker", icon: Smile },
            { id: "unicodes", name: "Unicode Symbols", desc: "Special characters", path: "/emoji/unicodes", icon: Type },
        ]
    },
    {
        id: "notes",
        title: "Notes & Canvas",
        description: "Quick ideas and sketching tools.",
        icon: Edit3,
        color: "from-teal-400 to-emerald-600",
        tools: [
            { id: "notepad", name: "Quick Notepad", desc: "Persisted local notes", path: "/notes/notepad", icon: BookOpen },
            { id: "whiteboard", name: "Quick Whiteboard", desc: "Freehand sketching", path: "/notes/whiteboard", icon: PenTool },
        ]
    },
    {
        id: "others",
        title: "Other Utilities",
        description: "Miscellaneous tools and helpers.",
        icon: MoreHorizontal,
        color: "from-gray-500 to-slate-500",
        tools: [
            { id: "homepage", name: "OS-style Homepage", desc: "Custom tool dashboard", path: "/others/homepage", icon: Monitor },
            { id: "speedtest", name: "Network Speed Test", desc: "Download, Upload, Ping", path: "/others/speedtest", icon: Zap },
            { id: "scientific-calculator", name: "Scientific Calculator", desc: "Advanced math with scientific functions", path: "/others/scientific-calculator", icon: CalculatorIcon },
            { id: "temperature-converter", name: "Temperature Converter", desc: "Celsius, Fahrenheit, Kelvin", path: "/others/temperature-converter", icon: Thermometer },
        ]
    }
];
