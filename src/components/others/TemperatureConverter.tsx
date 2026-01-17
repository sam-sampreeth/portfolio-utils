import React, { useState } from 'react';
import { Thermometer, RotateCcw } from 'lucide-react';

const TemperatureConverter: React.FC = () => {
    const [celsius, setCelsius] = useState<string>('');
    const [fahrenheit, setFahrenheit] = useState<string>('');
    const [kelvin, setKelvin] = useState<string>('');

    const convertFromCelsius = (c: string) => {
        setCelsius(c);
        if (c === '') {
            setFahrenheit('');
            setKelvin('');
            return;
        }
        const val = parseFloat(c);
        if (!isNaN(val)) {
            setFahrenheit((val * 9 / 5 + 32).toFixed(2));
            setKelvin((val + 273.15).toFixed(2));
        } else {
            setFahrenheit('Error');
            setKelvin('Error');
        }
    };

    const convertFromFahrenheit = (f: string) => {
        setFahrenheit(f);
        if (f === '') {
            setCelsius('');
            setKelvin('');
            return;
        }
        const val = parseFloat(f);
        if (!isNaN(val)) {
            setCelsius(((val - 32) * 5 / 9).toFixed(2));
            setKelvin(((val - 32) * 5 / 9 + 273.15).toFixed(2));
        } else {
            setCelsius('Error');
            setKelvin('Error');
        }
    };

    const convertFromKelvin = (k: string) => {
        setKelvin(k);
        if (k === '') {
            setCelsius('');
            setFahrenheit('');
            return;
        }
        const val = parseFloat(k);
        if (!isNaN(val)) {
            setCelsius((val - 273.15).toFixed(2));
            setFahrenheit(((val - 273.15) * 9 / 5 + 32).toFixed(2));
        } else {
            setCelsius('Error');
            setFahrenheit('Error');
        }
    };

    const handleReset = () => {
        setCelsius('');
        setFahrenheit('');
        setKelvin('');
    };

    return (
        <div className="min-h-screen bg-slate-950 p-4 sm:p-8 font-sans flex items-center justify-center relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-900/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-900/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-2xl w-full z-10">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 shadow-lg shadow-blue-500/10">
                            <Thermometer className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">Temperature Converter</h1>
                            <p className="text-slate-400 text-sm font-medium">Real-time conversion across units</p>
                        </div>
                    </div>
                    <button
                        onClick={handleReset}
                        className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        title="Reset"
                    >
                        <RotateCcw size={20} />
                    </button>
                </div>

                {/* Converters Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Celsius */}
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
                        <label className="block text-blue-300 text-xs font-bold uppercase tracking-wider mb-2 ml-1">Celsius</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={celsius}
                                onChange={(e) => convertFromCelsius(e.target.value)}
                                placeholder="0"
                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-5 text-2xl font-mono text-white placeholder-slate-700 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                            />
                            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">°C</span>
                        </div>
                    </div>

                    {/* Fahrenheit */}
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden group hover:border-orange-500/30 transition-all duration-300">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-colors" />
                        <label className="block text-orange-300 text-xs font-bold uppercase tracking-wider mb-2 ml-1">Fahrenheit</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={fahrenheit}
                                onChange={(e) => convertFromFahrenheit(e.target.value)}
                                placeholder="32"
                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-5 text-2xl font-mono text-white placeholder-slate-700 outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
                            />
                            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">°F</span>
                        </div>
                    </div>

                    {/* Kelvin */}
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
                        <label className="block text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2 ml-1">Kelvin</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={kelvin}
                                onChange={(e) => convertFromKelvin(e.target.value)}
                                placeholder="273.15"
                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-5 text-2xl font-mono text-white placeholder-slate-700 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                            />
                            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">K</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemperatureConverter;
