import React, { useState, useEffect, useRef } from 'react';
import {
    Calculator as CalculatorIcon,
    Delete,
    History,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Helper to evaluate safe math expressions
const evaluateExpression = (expr: string): string => {
    try {
        // Replace visual symbols with JS operators
        let cleanExpr = expr
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/π/g, 'Math.PI')
            .replace(/e/g, 'Math.E')
            .replace(/\^/g, '**')
            .replace(/√\(([^)]+)\)/g, 'Math.sqrt($1)') // catch sqrt(x)
            .replace(/sin\(/g, 'Math.sin(')
            .replace(/cos\(/g, 'Math.cos(')
            .replace(/tan\(/g, 'Math.tan(')
            .replace(/log\(/g, 'Math.log10(')
            .replace(/ln\(/g, 'Math.log(');

        // Very basic validation to prevent unsafe code execution
        if (/[^0-9+\-*/().\sMathPIE**,]/g.test(cleanExpr)) {
            throw new Error("Invalid characters");
        }

        // eslint-disable-next-line no-new-func
        const result = new Function(`return ${cleanExpr}`)();

        if (!isFinite(result) || isNaN(result)) return "Error";

        // Format to avoid long decimals
        return parseFloat(result.toFixed(8)).toString();
    } catch (err) {
        return "Error";
    }
};

const ScientificCalculator: React.FC = () => {
    const [input, setInput] = useState<string>('');
    const [result, setResult] = useState<string>('');
    const [mode, setMode] = useState<'simple' | 'scientific'>('simple');
    const [history, setHistory] = useState<string[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const endOfHistoryRef = useRef<HTMLDivElement>(null);

    const handlePress = (val: string) => {
        if (result !== '' && result !== 'Error' && !['+', '-', '×', '÷', '^'].includes(val)) {
            // New calculation starting if last wasn't an operator append
            setInput(val);
            setResult('');
        } else {
            // If we had a result and press an operator, use result as start of next
            if (result !== '' && result !== 'Error' && ['+', '-', '×', '÷', '^'].includes(val)) {
                setInput(result + val);
                setResult('');
            } else {
                setInput(prev => prev + val);
            }
        }
    };

    const handleClear = () => {
        setInput('');
        setResult('');
    };

    const handleDelete = () => {
        setInput(prev => prev.slice(0, -1));
    };

    const handleCalculate = () => {
        if (!input) return;
        const res = evaluateExpression(input);
        setResult(res);
        if (res !== 'Error') {
            setHistory(prev => [...prev.slice(-9), `${input} = ${res}`]);
        }
    };

    const handleFunction = (func: string) => {
        if (result !== '' && result !== 'Error') {
            setInput(`${func}(${result})`);
            setResult('');
        } else {
            setInput(prev => `${prev}${func}(`);
        }
    };

    useEffect(() => {
        if (showHistory && endOfHistoryRef.current) {
            endOfHistoryRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [history, showHistory]);

    // Button Component
    const CalcButton = ({
        label,
        onClick,
        primary = false,
        secondary = false,
        wide = false
    }: {
        label: React.ReactNode,
        onClick: () => void,
        primary?: boolean,
        secondary?: boolean,
        wide?: boolean
    }) => (
        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`
                ${wide ? 'col-span-2' : ''}
                h-14 sm:h-16 rounded-2xl font-semibold text-lg sm:text-xl transition-all duration-200
                flex items-center justify-center shadow-lg border border-white/5
                ${primary
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:from-blue-500 hover:to-blue-600 shadow-blue-500/20'
                    : secondary
                        ? 'bg-slate-800 text-blue-300 hover:bg-slate-700'
                        : 'bg-slate-900/80 text-slate-200 hover:bg-slate-800'
                }
            `}
        >
            {label}
        </motion.button>
    );

    return (
        <div className="min-h-screen bg-slate-950 p-4 sm:p-8 font-sans flex items-center justify-center relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-md w-full z-10">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <CalculatorIcon className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Calculator</h1>
                            <p className="text-slate-400 text-xs font-medium">
                                {mode === 'simple' ? 'Simple Mode' : 'Scientific Mode'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Calculator Body */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">

                    {/* Display */}
                    <div className="bg-black/40 rounded-2xl p-4 mb-6 text-right relative min-h-[120px] flex flex-col justify-end border border-white/5 shadow-inner">
                        {/* History Toggle */}
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="absolute top-2 left-2 p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-blue-400 transition-colors"
                        >
                            <History size={18} />
                        </button>

                        <AnimatePresence>
                            {showHistory && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="absolute inset-x-0 top-12 bottom-0 bg-slate-900/95 backdrop-blur-md z-20 mx-2 mb-2 rounded-xl p-3 overflow-y-auto text-sm border border-white/10"
                                >
                                    <h3 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">History</h3>
                                    <div className="space-y-2">
                                        {history.length === 0 && <p className="text-slate-600 text-center py-4">No history yet</p>}
                                        {history.map((item, i) => (
                                            <div key={i} className="flex flex-col items-end border-b border-white/5 pb-1">
                                                <span className="text-slate-400 text-xs">{item.split('=')[0]}</span>
                                                <span className="text-blue-300 font-mono">{item.split('=')[1]}</span>
                                            </div>
                                        ))}
                                        <div ref={endOfHistoryRef} />
                                    </div>
                                    {history.length > 0 && (
                                        <button
                                            onClick={() => setHistory([])}
                                            className="w-full mt-3 py-1 text-xs text-red-400 hover:bg-red-500/10 rounded"
                                        >
                                            Clear History
                                        </button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="text-slate-400 text-sm sm:text-base font-mono break-all h-6 mb-1 overflow-hidden">
                            {input || '0'}
                        </div>
                        <div className="text-3xl sm:text-4xl font-bold text-white font-mono break-all tracking-wider">
                            {result || (input ? '' : '0')}
                        </div>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex justify-center mb-4">
                        <div className="bg-slate-950 p-1 rounded-full border border-white/5 inline-flex">
                            <button
                                onClick={() => setMode('simple')}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${mode === 'simple' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Simple
                            </button>
                            <button
                                onClick={() => setMode('scientific')}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${mode === 'scientific' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Scientific
                            </button>
                        </div>
                    </div>

                    {/* Keypad */}
                    <div className={`grid gap-3 ${mode === 'scientific' ? 'grid-cols-5' : 'grid-cols-4'}`}>
                        {/* Function Keys Row 1 (Scientific Only) */}
                        {mode === 'scientific' && (
                            <>
                                <CalcButton label="sin" onClick={() => handleFunction('sin')} secondary />
                                <CalcButton label="cos" onClick={() => handleFunction('cos')} secondary />
                                <CalcButton label="tan" onClick={() => handleFunction('tan')} secondary />
                                <CalcButton label="log" onClick={() => handleFunction('log')} secondary />
                                <CalcButton label="ln" onClick={() => handleFunction('ln')} secondary />
                            </>
                        )}

                        {/* Function Keys Row 2 (Scientific Only) */}
                        {mode === 'scientific' && (
                            <>
                                <CalcButton label="(" onClick={() => handlePress('(')} secondary />
                                <CalcButton label=")" onClick={() => handlePress(')')} secondary />
                                <CalcButton label="π" onClick={() => handlePress('π')} secondary />
                                <CalcButton label="e" onClick={() => handlePress('e')} secondary />
                                <CalcButton label="^" onClick={() => handlePress('^')} secondary />
                            </>
                        )}

                        {/* Mixed Row (Scientific: Functions + Standard) */}
                        {mode === 'scientific' ? (
                            <>
                                <CalcButton label="√" onClick={() => handleFunction('√')} secondary />
                                <CalcButton label="7" onClick={() => handlePress('7')} />
                                <CalcButton label="8" onClick={() => handlePress('8')} />
                                <CalcButton label="9" onClick={() => handlePress('9')} />
                                <CalcButton label="÷" onClick={() => handlePress('÷')} secondary />
                            </>
                        ) : (
                            <>
                                <CalcButton label="C" onClick={handleClear} secondary />
                                <CalcButton label="%" onClick={() => handlePress('/100')} secondary />
                                <CalcButton label={<Delete size={20} />} onClick={handleDelete} secondary />
                                <CalcButton label="÷" onClick={() => handlePress('÷')} secondary />
                            </>
                        )}

                        {/* Row with 4-5-6 or similar */}
                        {mode === 'scientific' ? (
                            <>
                                <CalcButton label="%" onClick={() => handlePress('/100')} secondary />
                                <CalcButton label="4" onClick={() => handlePress('4')} />
                                <CalcButton label="5" onClick={() => handlePress('5')} />
                                <CalcButton label="6" onClick={() => handlePress('6')} />
                                <CalcButton label="×" onClick={() => handlePress('×')} secondary />
                            </>
                        ) : (
                            <>
                                <CalcButton label="7" onClick={() => handlePress('7')} />
                                <CalcButton label="8" onClick={() => handlePress('8')} />
                                <CalcButton label="9" onClick={() => handlePress('9')} />
                                <CalcButton label="×" onClick={() => handlePress('×')} secondary />
                            </>
                        )}

                        {/* Row with 1-2-3 */}
                        {mode === 'scientific' ? (
                            <>
                                <CalcButton label="C" onClick={handleClear} secondary />
                                <CalcButton label="1" onClick={() => handlePress('1')} />
                                <CalcButton label="2" onClick={() => handlePress('2')} />
                                <CalcButton label="3" onClick={() => handlePress('3')} />
                                <CalcButton label="-" onClick={() => handlePress('-')} secondary />
                            </>
                        ) : (
                            <>
                                <CalcButton label="4" onClick={() => handlePress('4')} />
                                <CalcButton label="5" onClick={() => handlePress('5')} />
                                <CalcButton label="6" onClick={() => handlePress('6')} />
                                <CalcButton label="-" onClick={() => handlePress('-')} secondary />
                            </>
                        )}

                        {/* Bottom Row */}
                        {mode === 'scientific' ? (
                            <>
                                <CalcButton label={<Delete size={20} />} onClick={handleDelete} secondary />
                                <CalcButton label="0" onClick={() => handlePress('0')} />
                                <CalcButton label="." onClick={() => handlePress('.')} />
                                <CalcButton label="=" onClick={handleCalculate} primary />
                                <CalcButton label="+" onClick={() => handlePress('+')} secondary />
                            </>
                        ) : (
                            <>
                                <CalcButton label="1" onClick={() => handlePress('1')} />
                                <CalcButton label="2" onClick={() => handlePress('2')} />
                                <CalcButton label="3" onClick={() => handlePress('3')} />
                                <CalcButton label="+" onClick={() => handlePress('+')} secondary />

                                <CalcButton label="0" onClick={() => handlePress('0')} wide />
                                <CalcButton label="." onClick={() => handlePress('.')} />
                                <CalcButton label="=" onClick={handleCalculate} primary />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScientificCalculator;
