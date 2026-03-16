import React, { useState } from 'react';
import { Coffee, ThermometerSnowflake, ThermometerSun, Cookie, ChevronRight, CheckCircle2 } from 'lucide-react';

const Customize = () => {
    const [choices, setChoices] = useState({
        base: 'Milk',
        brand: 'Nestle',
        sugar: 50,
        temp: 'Hot',
        addon: 'None'
    });

    // Dynamic Sugar Messaging & Pricing Logic
    const getSugarInfo = () => {
        if (choices.sugar < 10) return { msg: "Very Low sugar added - taste may be affected (Suitable for high sugar/diabetic patients)", color: "text-blue-400" };
        if (choices.sugar > 80) return { msg: "Too much sugar - taste may be affected (Not recommended for high sugar/diabetic patients)", color: "text-red-400" };
        return { msg: "Optimal sugar content - sweet taste", color: "text-green-400" };
    };

    const calculateTotal = () => {
        let total = 50; // Base price
        if (choices.addon !== 'None') total += 50;
        if (choices.brand === 'Nestle') total += 20;
        return total;
    };

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12 px-6" 
        style={{ backgroundImage: `url('/coffee1.jpg')` }}>

            <div className="max-w-3xl mx-auto bg-neutral-900 p-8 rounded-3xl border border-white/10 shadow-2xl">
            
                <h1 className="text-3xl font-black uppercase italic mb-2 tracking-tighter text-amber-500">
                    How would you like to drink your coffee today?
                </h1>
                <p className="text-neutral-400 mb-8 italic">Craft your perfect cup, one step at a time.</p>

                <div className="space-y-10">

                    {/* 1. THE BASE */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">Step 1: Choose your base</label>
                        <div className="flex gap-4">
                            {['Water', 'Milk', 'Milk Powder'].map((b) => (
                                <button
                                    key={b}
                                    onClick={() => setChoices({ ...choices, base: b })}
                                    className={`flex-1 py-3 rounded-xl border-2 transition-all ${choices.base === b ? 'border-amber-500 bg-amber-500/10' : 'border-white/5 bg-black/40 hover:border-white/20'}`}
                                >
                                    {b}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 2. THE BRAND */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">
                            Step 2: Coffee Brand
                        </label>
                        <div className="flex gap-4">
                            {['Nestle', 'Tata', 'Others'].map((br) => (
                                <button
                                    key={br}
                                    type="button" // Prevents accidental form submissions
                                    onClick={() => setChoices({ ...choices, brand: br })}
                                    className={`flex-1 py-3 rounded-xl border-2 transition-all font-bold uppercase text-xs tracking-widest ${choices.brand === br
                                            ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                                            : 'border-white/5 bg-black/40 text-neutral-500 hover:border-white/20'
                                        }`}
                                >
                                    {br}
                                </button>
                            ))}
                        </div>

                        {/* CONDITIONAL ASSURANCE MESSAGE */}
                        {choices.brand === 'Others' && (
                            <div className="mt-4 p-3 bg-neutral-900/50 border border-amber-500/20 rounded-xl animate-in fade-in slide-in-from-top-2 duration-500">
                                <p className="text-[10px] md:text-xs text-amber-200/70 italic flex items-center gap-2">
                                    <span className="inline-block w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                                    Don't worry, the shop won't use low quality or uncertified seeds for coffee preparation.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* 3. SUGAR SLIDER */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Step 3: Sugar Quantity</label>
                        <input
                            type="range" min="0" max="100"
                            value={choices.sugar}
                            onChange={(e) => setChoices({ ...choices, sugar: parseInt(e.target.value) })}
                            className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                        <p className={`mt-3 text-sm font-medium italic ${getSugarInfo().color}`}>
                            {getSugarInfo().msg}
                        </p>
                    </div>

                    {/* 4. TEMPERATURE & ADD-ONS ROW */}
                    <div className="flex flex-col md:flex-row gap-8">

                        {/* TEMPERATURE SECTION */}
                        <div className="flex-1">
                            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">
                                Temperature
                            </label>
                            <div className="flex gap-4">
                                {/* COLD BUTTON */}
                                <button
                                    onClick={() => setChoices({ ...choices, temp: 'Cold' })}
                                    className={`flex-1 flex flex-row items-center justify-center gap-2 p-4 rounded-2xl transition-all border-2 ${choices.temp === 'Cold'
                                        ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                                        : 'bg-neutral-900 border-white/5 text-neutral-500 opacity-40 hover:opacity-100'
                                        }`}
                                >
                                    <div className="flex items-center gap-1">
                                        <ThermometerSnowflake size={20} />
                                        <Coffee size={16} className="opacity-70" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-tighter whitespace-nowrap">Cold Coffee</span>
                                </button>

                                {/* HOT BUTTON */}
                                <button
                                    onClick={() => setChoices({ ...choices, temp: 'Hot' })}
                                    className={`flex-1 flex flex-row items-center justify-center gap-2 p-4 rounded-2xl transition-all border-2 ${choices.temp === 'Hot'
                                        ? 'bg-orange-600/20 border-orange-500 text-orange-400'
                                        : 'bg-neutral-900 border-white/5 text-neutral-500 opacity-40 hover:opacity-100'
                                        }`}
                                >
                                    <div className="flex items-center gap-1">
                                        <ThermometerSun size={20} />
                                        <Coffee size={16} className="opacity-70" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-tighter whitespace-nowrap">Hot Coffee</span>
                                </button>
                            </div>
                        </div>

                        {/* ADD-ONS SECTION (RECOVERED) */}
                        <div className="flex-1">
                            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">
                                Add-ons
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 group-hover:scale-110 transition-transform">
                                    <Cookie size={20} />
                                </div>
                                <select
                                    value={choices.addon}
                                    onChange={(e) => setChoices({ ...choices, addon: e.target.value })}
                                    className="w-full bg-neutral-900 border-2 border-white/5 pl-12 pr-4 py-4 rounded-2xl focus:border-amber-500 outline-none appearance-none text-white font-bold uppercase text-xs cursor-pointer transition-all"
                                >
                                    <option value="None">No Add-ons</option>
                                    <option value="Cookies">Cookies (+₹50)</option>
                                    <option value="Sweets">Sweets (+₹50)</option>
                                </select>
                                {/* Custom Arrow for the Select */}
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                                    <ChevronRight size={16} className="rotate-90" />
                                </div>
                            </div>
                        </div>

                    </div>
                    {/* TOTAL & PAY */}
                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <p className="text-neutral-500 text-sm uppercase font-bold tracking-widest">Total Amount</p>
                            <p className="text-4xl font-black text-white">₹{calculateTotal()}</p>
                        </div>
                        <button className="w-full md:w-auto px-12 py-4 bg-amber-500 hover:bg-amber-600 text-black font-black uppercase rounded-2xl transition-transform active:scale-95 flex items-center justify-center gap-2">
                            <CheckCircle2 size={20} /> Place Your Order
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Customize;