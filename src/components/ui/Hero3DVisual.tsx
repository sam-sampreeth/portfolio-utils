import { motion } from "framer-motion";

export const Hero3DVisual = () => {
    return (
        <div className="w-full h-[400px] flex items-center justify-center relative perspective-[1000px]">
            {/* Central Glow */}
            <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full transform scale-50" />

            <div className="relative w-64 h-64 transform-style-3d">
                {/* Core Sphere */}
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.8, 1, 0.8]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 blur-sm shadow-[0_0_50px_rgba(59,130,246,0.5)] z-20"
                >
                    <div className="absolute inset-0 bg-white/20 rounded-full blur-md" />
                </motion.div>

                {/* Ring 1 - Vertical Spin */}
                <motion.div
                    animate={{ rotateX: 360, rotateY: 180 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-[1px] border-white/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_#3b82f6]" />
                </motion.div>

                {/* Ring 2 - Horizontal/Diagonal Spin */}
                <motion.div
                    animate={{ rotateX: 180, rotateY: 360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-[-20px] rounded-full border-[1px] border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    <div className="absolute bottom-10 right-4 w-3 h-3 bg-purple-400 rounded-full shadow-[0_0_10px_#a855f7]" />
                </motion.div>

                {/* Ring 3 - Large Outer Ring */}
                <motion.div
                    animate={{ rotateZ: 360, rotateX: 45 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-[-50px] rounded-full border-[1px] border-dashed border-white/10"
                    style={{ transformStyle: 'preserve-3d' }}
                />

                {/* Ring 4 - Counter Rotation */}
                <motion.div
                    animate={{ rotateY: -360, rotateZ: -45 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-[-35px] rounded-full border-[1px] border-white/5"
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    <div className="absolute top-1/2 right-0 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_white]" />
                </motion.div>
            </div>
        </div>
    );
};
