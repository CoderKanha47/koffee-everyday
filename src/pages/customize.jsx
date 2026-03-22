import React, { useState, useEffect } from 'react';
import { User, Users, ChevronDown, X, ReceiptText, MapPin, Phone, Mail, CheckCircle2, ArrowRight, Coffee, ThermometerSnowflake, ThermometerSun, Cookie, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from './supabaseClient'; 

const Customize = () => {
    // 1. ALL STATE AT THE TOP (No duplicates)
    const [orderId, setOrderId] = useState(null);
    const [liveStatus, setLiveStatus] = useState('Order Placed');
    const [isAlone, setIsAlone] = useState(null);
    const [cupCount, setCupCount] = useState(1);
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);
    const [modalStep, setModalStep] = useState('receipt');
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '' });
    const [choices, setChoices] = useState({
        base: 'Milk',
        brand: 'NesCafe',
        sugar: 50,
        temp: 'Hot',
        addon: 'None'
    });

    // 2. REAL-TIME SUBSCRIPTION EFFECT
    useEffect(() => {
        if (!orderId) return;

        const channel = supabase
            .channel('order-updates')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'customized_orders',
                    filter: `id=eq.${orderId}`,
                },
                (payload) => {
                    setLiveStatus(payload.new.status);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [orderId]);

    // 3. LOGIC & CALCULATIONS
    const getSugarInfo = () => {
        if (choices.sugar < 10) return { msg: "Very Low sugar - Suitable for diabetic patients", color: "text-blue-400" };
        if (choices.sugar > 80) return { msg: "High sugar - Not recommended for diabetic patients", color: "text-red-400" };
        return { msg: "Optimal sugar content - sweet taste", color: "text-green-400" };
    };

    const getCosts = () => {
        let brandPrice = 20;
        const premiumBrands = ['BlueTokai', 'Sleepy Owl', 'Araku'];
        if (choices.brand === 'NesCafe') brandPrice = 25;
        else if (choices.brand === 'Tata') brandPrice = 30;
        else if (premiumBrands.includes(choices.brand)) brandPrice = 45;

        const basePrice = choices.base === 'Milk' ? 15 : 10;
        const addonPrice = choices.addon !== 'None' ? 50 : 0;
        const subtotalPerCup = brandPrice + basePrice + addonPrice;
        const deliveryCharge = 15;

        return {
            brandPrice, basePrice, addonPrice, subtotalPerCup,
            finalTotal: (subtotalPerCup * cupCount) + deliveryCharge
        };
    };

    const costs = getCosts();

    const handleFinalSubmit = async () => {
        setIsLoading(true);
        try {
            const orderToInsert = {
                customer_name: formData.name,
                phone: formData.phone,
                email: formData.email,
                address: formData.address,
                coffee_brand: choices.brand,
                base_type: choices.base,
                sugar_level: choices.sugar,
                is_hot: choices.temp === 'Hot',
                has_addons: choices.addon !== 'None',
                addon_name: choices.addon,
                quantity: cupCount,
                total_price: costs.finalTotal,
                status: 'Order Placed'
            };

            const { data, error } = await supabase
                .from('customized_orders')
                .insert([orderToInsert])
                .select(); 

            if (error) throw error;

            if (data && data.length > 0) {
                setOrderId(data[0].id);
            }

            setModalStep('success');
        } catch (error) {
            console.error('Order Error:', error.message);
            alert('Failed to place order: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-black text-white pt-24 pb-12 px-6 overflow-hidden">
            {/* Background & Overlay */}
            <div className="absolute inset-0 bg-cover bg-center opacity-40 z-0" style={{ backgroundImage: `url('/coffee6.jpg')` }} />
            <div className="absolute inset-0 bg-linear-to-b from-black via-black/80 to-black z-0" />

            <div className="relative z-10 max-w-3xl mx-auto bg-neutral-900/90 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-2xl">
                <h1 className="text-3xl font-black uppercase italic mb-2 tracking-tighter text-amber-500">
                    Brew <span className="text-white">Settings</span>
                </h1>

                <div className="space-y-10 mt-8">
                    {/* PARTY SIZE */}
                    <div className="space-y-4">
                        <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500">Party Size</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button onClick={() => { setIsAlone(true); setCupCount(1); }} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 ${isAlone === true ? 'border-amber-500 bg-amber-500/10' : 'border-white/5 bg-black/40 hover:border-white/20'}`}>
                                <div className="flex items-center gap-3 font-bold text-sm uppercase"><User size={20} /> Just me</div>
                            </button>
                            <button onClick={() => { setIsAlone(false); if (cupCount === 1) setCupCount(2); }} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 ${isAlone === false ? 'border-amber-500 bg-amber-500/10' : 'border-white/5 bg-black/40 hover:border-white/20'}`}>
                                <div className="flex items-center gap-3 font-bold text-sm uppercase"><Users size={20} /> Group Order</div>
                            </button>
                        </div>
                        {isAlone === false && (
                            <div className="mt-4 animate-in fade-in slide-in-from-top-2 relative">
                                <select value={cupCount} onChange={(e) => setCupCount(parseInt(e.target.value))} className="w-full bg-black/50 border-2 border-white/5 rounded-xl p-4 appearance-none focus:border-amber-500 outline-none font-bold">
                                    {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => <option key={num} value={num} className="bg-neutral-900">{num} Cups</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-500 pointer-events-none" />
                            </div>
                        )}
                    </div>

                    {/* BRAND SELECTION */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">Coffee Brand</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['NesCafe', 'Tata', 'Bru', 'BlueTokai', 'Sleepy Owl', 'Araku'].map((br) => (
                                <button key={br} onClick={() => setChoices({ ...choices, brand: br })} className={`py-3 rounded-xl border-2 transition-all font-bold uppercase text-[12px] tracking-widest ${choices.brand === br ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-white/5 bg-black/40 text-neutral-500 hover:border-white/20'}`}>
                                    {br}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* SUGAR SLIDER */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500">Sugar</label>
                            <span className="text-amber-500 font-black">{choices.sugar}%</span>
                        </div>
                        <input type="range" min="0" max="100" value={choices.sugar} onChange={(e) => setChoices({ ...choices, sugar: parseInt(e.target.value) })} className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                        <p className={`mt-3 text-[11px] font-medium italic ${getSugarInfo().color}`}>{getSugarInfo().msg}</p>
                    </div>

                    {/* TEMPERATURE & ADD-ONS */}
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-1">
                            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">Temp</label>
                            <div className="flex gap-4">
                                <button onClick={() => setChoices({ ...choices, temp: 'Cold' })} className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${choices.temp === 'Cold' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-black/50 border-white/5 text-neutral-500 opacity-60'}`}><ThermometerSnowflake size={20} /><span className="text-[12px] font-black uppercase">Cold</span></button>
                                <button onClick={() => setChoices({ ...choices, temp: 'Hot' })} className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${choices.temp === 'Hot' ? 'bg-orange-600/20 border-orange-500 text-orange-400' : 'bg-black/50 border-white/5 text-neutral-500 opacity-60'}`}><ThermometerSun size={20} /><span className="text-[12px] font-black uppercase">Hot</span></button>
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">Add-ons</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500"><Cookie size={20} /></div>
                                <select value={choices.addon} onChange={(e) => setChoices({ ...choices, addon: e.target.value })} className="w-full bg-black/40 border-2 border-white/5 pl-12 pr-4 py-4 rounded-2xl focus:border-amber-500 outline-none appearance-none text-white font-bold uppercase text-xs cursor-pointer">
                                    <option value="None" className="bg-neutral-900 text-white">None</option>
                                    <option value="Cookies" className="bg-neutral-900 text-white">Cookies (+₹50)</option>
                                    <option value="Sweets" className="bg-neutral-900 text-white">Sweets (+₹50)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-center md:text-left">
                            <p className="text-neutral-500 text-xs uppercase font-bold tracking-widest">Est. Total</p>
                            <p className="text-4xl font-black text-white tracking-tighter">₹{costs.finalTotal}</p>
                        </div>
                        <button disabled={isAlone === null} onClick={() => { setModalStep('receipt'); setIsReceiptOpen(true); }} className="w-full md:w-auto px-12 py-4 text-black font-black uppercase rounded-2xl transition-all flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 active:scale-95 disabled:bg-neutral-700 disabled:cursor-not-allowed shadow-[0_0_25px_-5px_rgba(245,158,11,0.4)]">
                            <CheckCircle2 size={20} /> Place Order
                        </button>
                    </div>
                </div>
            </div>

            {/* MODAL SYSTEM */}
            {isReceiptOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
                    <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => !isLoading && setIsReceiptOpen(false)} />
                    <div className="relative w-full max-w-md bg-white text-black rounded-3xl overflow-hidden shadow-2xl transition-all duration-300">
                        <div className="bg-zinc-900 p-6 text-white flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                {modalStep === 'receipt' ? <ReceiptText className="text-amber-500" /> : <MapPin className="text-amber-500" />}
                                <span className="font-black uppercase tracking-tighter italic text-xl">
                                    {modalStep === 'receipt' ? 'Summary' : modalStep === 'details' ? 'Delivery' : 'Confirmed'}
                                </span>
                            </div>
                            {!isLoading && <button onClick={() => setIsReceiptOpen(false)} className="hover:bg-white/10 p-1 rounded-full transition-colors"><X size={24} /></button>}
                        </div>

                        {modalStep === 'receipt' && (
                            <div className="p-8 font-mono text-sm">
                                <div className="border-b-2 border-dashed border-zinc-200 pb-4 mb-4">
                                    <div className="flex justify-between mb-1"><span>{choices.brand} Coffee</span><span>₹{costs.brandPrice}</span></div>
                                    <div className="flex justify-between mb-1"><span>Base: {choices.base}</span><span>₹{costs.basePrice}</span></div>
                                    {choices.addon !== 'None' && <div className="flex justify-between mb-1"><span>Add-on: {choices.addon}</span><span>₹{costs.addonPrice}</span></div>}
                                </div>
                                <div className="space-y-2 mb-6 text-zinc-600">
                                    <div className="flex justify-between text-black"><span>Subtotal (x{cupCount})</span><span className="font-bold">₹{costs.subtotalPerCup * cupCount}</span></div>
                                    <div className="flex justify-between text-blue-600 font-bold"><span>Delivery</span><span>+₹15</span></div>
                                </div>
                                <div className="bg-zinc-100 p-4 rounded-xl flex justify-between items-center border-2 border-zinc-200 mb-8">
                                    <span className="font-black uppercase text-xs">Final Total</span>
                                    <span className="text-2xl font-black">₹{costs.finalTotal}</span>
                                </div>
                                <button onClick={() => setModalStep('details')} className="w-full bg-zinc-900 text-white py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black">
                                    Confirm & Pay <ArrowRight size={18} />
                                </button>
                            </div>
                        )}

                        {modalStep === 'details' && (
                            <div className="p-8 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-zinc-400 flex items-center gap-1"><User size={12} /> Full Name</label>
                                    <input type="text" placeholder="Enter your name" className="w-full bg-zinc-100 border-2 border-transparent focus:border-amber-500 rounded-xl p-3 outline-none font-bold transition-all" onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-zinc-400 flex items-center gap-1"><Phone size={12} /> Phone Number</label>
                                    <input type="tel" placeholder="+91" className="w-full bg-zinc-100 border-2 border-transparent focus:border-amber-500 rounded-xl p-3 outline-none font-bold transition-all" onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-zinc-400 flex items-center gap-1"><Mail size={12} /> Email</label>
                                    <input type="email" placeholder="you@email.com" className="w-full bg-zinc-100 border-2 border-transparent focus:border-amber-500 rounded-xl p-3 outline-none font-bold transition-all" onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-zinc-400 flex items-center gap-1"><MapPin size={12} /> Address</label>
                                    <textarea placeholder="Delivery address..." rows="2" className="w-full bg-zinc-100 border-2 border-transparent focus:border-amber-500 rounded-xl p-3 outline-none font-bold resize-none transition-all" onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                                </div>
                                <button onClick={handleFinalSubmit} disabled={!formData.name || !formData.phone || !formData.address || isLoading} className="w-full bg-amber-500 text-black py-4 rounded-xl font-black uppercase tracking-widest mt-4 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
                                    {isLoading ? <Loader2 className="animate-spin" /> : "Complete Payment"}
                                </button>
                            </div>
                        )}

                        {modalStep === 'success' && (
                            <div className="p-12 text-center space-y-6">
                                <div className="relative inline-block">
                                    <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center border-4 border-amber-500 animate-pulse">
                                        <Coffee size={40} className="text-amber-500" />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tighter">Status: {liveStatus}</h2>
                                    <div className="w-full bg-zinc-100 h-2 rounded-full mt-4 overflow-hidden">
                                        <div 
                                            className="bg-amber-500 h-full transition-all duration-1000" 
                                            style={{ width: liveStatus === 'Order Placed' ? '33%' : liveStatus === 'Brewing' ? '66%' : '100%' }} 
                                        />
                                    </div>
                                </div>
                                <p className="text-zinc-500 text-sm">We are updating your order in real-time.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customize;