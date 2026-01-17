import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileDown, Loader2 } from "lucide-react";

interface DownloadConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (fileName: string) => void;
    defaultFileName: string;
    extension: string;
    isProcessing?: boolean;
    title?: string;
    description?: string;
}

export function DownloadConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    defaultFileName,
    extension,
    isProcessing = false,
    title = "Ready to Download",
    description = "Enter a name for your file."
}: DownloadConfirmDialogProps) {
    const [fileName, setFileName] = useState(defaultFileName);

    const handleConfirm = () => {
        if (!fileName.trim()) return;
        onConfirm(fileName.trim());
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !isProcessing && !open && onClose()}>
            <DialogContent className="sm:max-w-md bg-slate-950 border-slate-800 text-slate-100">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2 text-blue-400">
                        <FileDown className="w-5 h-5" />
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center space-x-2 py-4">
                    <div className="grid flex-1 gap-2">
                        <Label htmlFor="filename" className="sr-only">
                            Filename
                        </Label>
                        <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900/50 px-3 ring-offset-slate-950 focus-within:ring-2 focus-within:ring-blue-500/50">
                            <Input
                                id="filename"
                                value={fileName}
                                onChange={(e) => setFileName(e.target.value)}
                                className="border-0 bg-transparent p-0 text-slate-100 placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0 h-10"
                                placeholder="filename"
                                autoFocus
                            />
                            <span className="text-sm font-bold text-slate-600 select-none pl-2">
                                {extension.startsWith('.') ? extension : `.${extension}`}
                            </span>
                        </div>
                    </div>
                </div>

                <DialogFooter className="sm:justify-end gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        disabled={isProcessing}
                        className="text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isProcessing || !fileName.trim()}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            "Download"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
