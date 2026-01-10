import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock as ClockIcon } from "lucide-react";

const TIMEZONES = [
    { name: "IST (India)", zone: "Asia/Kolkata" },
    { name: "UTC", zone: "UTC" },
    { name: "EST (New York)", zone: "America/New_York" },
    { name: "PST (San Francisco)", zone: "America/Los_Angeles" },
    { name: "GMT (London)", zone: "Europe/London" },
];

export function DigitalClock() {
    const [time, setTime] = useState(new Date());
    const [selectedZone, setSelectedZone] = useState(TIMEZONES[0]);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date, zone: string) => {
        return new Intl.DateTimeFormat("en-US", {
            timeZone: zone,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        }).format(date);
    };

    const formatDate = (date: Date, zone: string) => {
        return new Intl.DateTimeFormat("en-US", {
            timeZone: zone,
            dateStyle: "full",
        }).format(date);
    };

    return (
        <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 relative overflow-hidden h-full">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <ClockIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold">Digital Clock</h3>
                        <p className="text-xs text-muted-foreground">{selectedZone.name}</p>
                    </div>
                </div>

                <select
                    className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-white"
                    value={selectedZone.zone}
                    onChange={(e) => setSelectedZone(TIMEZONES.find(z => z.zone === e.target.value) || TIMEZONES[0])}
                >
                    {TIMEZONES.map(z => <option key={z.zone} value={z.zone} className="bg-neutral-900">{z.name}</option>)}
                </select>
            </div>

            <div className="flex flex-col items-center justify-center py-10">
                <motion.div
                    key={selectedZone.zone + time.getSeconds()}
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 1 }}
                    className="text-6xl md:text-7xl font-mono font-bold tracking-tighter text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                >
                    {formatTime(time, selectedZone.zone)}
                </motion.div>
                <div className="mt-4 text-muted-foreground font-medium">
                    {formatDate(time, selectedZone.zone)}
                </div>
            </div>
        </div>
    );
}
