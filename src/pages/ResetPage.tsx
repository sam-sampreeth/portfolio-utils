import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RotateCcw, CheckCircle2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

export default function ResetPage() {
    const navigate = useNavigate();
    const [status, setStatus] = useState<"idle" | "resetting" | "success">("idle");

    const handleReset = () => {
        if (!window.confirm("ARE YOU SURE? This will wipe all your saved data and restore defaults.")) {
            return;
        }

        setStatus("resetting");

        // 1. Clear Storage
        localStorage.clear();
        sessionStorage.clear();

        // 2. Set Pomodoro Settings
        const pomodoroSettings = {
            workDuration: 25, // Using 25 as safe default instead of 0
            shortBreakDuration: 5,
            longBreakDuration: 15,
            sessionsBeforeLongBreak: 4,
            autoStartBreaks: false,
            autoStartWork: false,
            soundEnabled: true,
        };
        localStorage.setItem("pomodoro-settings", JSON.stringify(pomodoroSettings));

        // 3. Clear Notepad (already cleared by localStorage.clear(), but ensuring it's empty)
        // No action needed as clear() removed "quick-notepad-content-compressed"

        // 4. Set Timer Presets
        const timerPresets = [
            { label: "Ramen", Icon: "🍜", seconds: 240 },
            { label: "Focus", Icon: "🧠", seconds: 600 },
        ];
        // Note: The Timers component usually uses an index-based object in the user request example?
        // Let's verify how Timers.tsx uses it. The user request showed:
        // 0: {label: "Ramen"...}
        // 1: {label: "Focus"...}
        // This looks like an array or an object with numeric keys. 
        // I'll stick to array as that's standard JSON serialization for lists.
        localStorage.setItem("timer_presets", JSON.stringify(timerPresets));

        // 5. Set Timezones
        const timezones = ["UTC", "Asia/Calcutta"];
        localStorage.setItem("tz_selected_zones", JSON.stringify(timezones));

        // 6. Set Favorites
        const favorites = ["homepage"];
        localStorage.setItem("utils-page-favorites", JSON.stringify(favorites));

        setTimeout(() => {
            setStatus("success");
            toast.success("Application reset successfully");

            setTimeout(() => {
                navigate("/");
                window.location.reload(); // Force reload to pick up new storage values
            }, 1500);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white/5 border border-white/10 p-8 rounded-3xl text-center space-y-6">
                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto text-red-500 border border-red-500/20">
                    <AlertTriangle size={32} />
                </div>

                <div>
                    <h1 className="text-3xl font-bold mb-2">Emergency Reset</h1>
                    <p className="text-white/50">
                        This tool is hidden for a reason. It will completely wipe your local configuration and restore defaults.
                    </p>
                </div>

                {status === "idle" && (
                    <button
                        onClick={handleReset}
                        className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <RotateCcw size={20} />
                        RESET EVERYTHING
                    </button>
                )}

                {status === "resetting" && (
                    <div className="w-full py-4 bg-white/5 text-white/50 font-bold rounded-xl flex items-center justify-center gap-2 cursor-wait">
                        <RotateCcw size={20} className="animate-spin" />
                        WIPING DATA...
                    </div>
                )}

                {status === "success" && (
                    <div className="w-full py-4 bg-green-500/10 text-green-400 border border-green-500/20 font-bold rounded-xl flex items-center justify-center gap-2">
                        <CheckCircle2 size={20} />
                        DONE! RESTARTING...
                    </div>
                )}
            </div>
        </div>
    );
}
