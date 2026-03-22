import React, { useState } from 'react';
import { Lock, Coffee, ArrowLeft } from 'lucide-react';
import { supabase } from './supabaseClient';

const KitchenLogin = ({ onLoginSuccess, onBack }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        // Supabase Auth call
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError("Invalid Kitchen ID or Password");
        } else {
            onLoginSuccess(data.user);
        }
    };

    return (
        <div className="fixed inset-0 bg-black z-100 flex items-center justify-center p-6">
            <div className="max-w-md w-full space-y-8 bg-zinc-900 p-10 rounded-3xl border border-white/5 shadow-2xl">
                <div className="text-center">
                    <div className="w-16 h-16 bg-amber-500 rounded-2xl mx-auto flex items-center justify-center rotate-3 mb-6">
                        <Lock size={32} className="text-black" />
                    </div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Enter <span className="text-amber-500">Kitchen</span></h2>
                    <p className="text-neutral-500 text-xs mt-2 uppercase tracking-widest font-bold">This Page is only for The Adminstrator | Please Head back to Cafe</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <input 
                        type="email" 
                        placeholder="Kitchen ID (Email)" 
                        className="w-full bg-black border border-white/10 p-4 rounded-xl text-white outline-none focus:border-amber-500 transition-colors"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input 
                        type="password" 
                        placeholder="Secret Key" 
                        className="w-full bg-black border border-white/10 p-4 rounded-xl text-white outline-none focus:border-amber-500 transition-colors"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {error && <p className="text-red-500 text-xs font-bold text-center uppercase tracking-tight">{error}</p>}
                    
                    <button className="w-full py-4 bg-amber-500 text-black font-black uppercase rounded-xl active:scale-95 transition-transform">
                        Verify Identity
                    </button>
                </form>

                <button onClick={onBack} className="w-full flex items-center justify-center gap-2 text-neutral-500 hover:text-white text-xs font-bold uppercase tracking-widest">
                    <ArrowLeft size={14} /> Back to Cafe
                </button>
            </div>
        </div>
    );
};

export default KitchenLogin;