import React, { useState, useEffect } from 'react';
import { ShoppingCart, X, Plus, Minus, Trash2, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { drinks } from './drinksDB';
import { supabase } from './supabaseClient';

const Catalogue = () => {
  // 1. STATE HOOKS
  const [orderId, setOrderId] = useState(null);
  const [liveStatus, setLiveStatus] = useState('Order Placed');
  const [outOfStockIds, setOutOfStockIds] = useState([]);
  const [filter, setFilter] = useState("All");
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('cart');
  const [isLoading, setIsLoading] = useState(false);
  const [userContact, setUserContact] = useState({ name: '', phone: '', address: '' });

  const categories = ['All', 'Hot', 'Cold', 'Specialty'];

  // 2. REALTIME STOCK SUBSCRIPTION
  useEffect(() => {
    const getInitialStock = async () => {
      const { data } = await supabase
        .from('stock_status')
        .select('drink_id')
        .eq('is_available', false);

      if (data) setOutOfStockIds(data.map(d => Number(d.drink_id)));
    };
    getInitialStock();

    const stockChannel = supabase
      .channel('public:stock_status')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'stock_status' },
        (payload) => {
          const drink_id = Number(payload.new.drink_id);
          const is_available = payload.new.is_available;

          if (is_available === false) {
            setOutOfStockIds(prev => [...new Set([...prev, drink_id])]);
          } else {
            setOutOfStockIds(prev => prev.filter(id => id !== drink_id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(stockChannel);
    };
  }, []);

  // 3. ORDER TRACKING SUBSCRIPTION
  useEffect(() => {
    if (!orderId) return;

    const orderChannel = supabase
      .channel(`track-${orderId}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
        (payload) => {
          setLiveStatus(payload.new.status);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(orderChannel);
    };
  }, [orderId]);

  // 4. LOGIC HELPERS
  const filteredDrinks = filter === 'All' ? drinks : drinks.filter(d => d.category === filter);
  const isPhoneValid = /^\d{10}$/.test(userContact.phone);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const clearCart = () => {
    if (window.confirm("Empty your shopping bag?")) {
      setCart([]);
      setCheckoutStep('cart');
      setIsCartOpen(false);
    }
  };

  const addToCart = (drink) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === drink.id);
      if (existing) {
        return prev.map(item => item.id === drink.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...drink, qty: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item =>
      item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
    ).filter(item => item.qty > 0));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          customer_name: userContact.name,
          phone: userContact.phone,
          address: userContact.address,
          total_price: cartTotal,
          status: 'Order Placed',
          order_details: { items: cart }
        }])
        .select();

      if (!error && data) {
        setOrderId(data[0].id);
        setCheckoutStep('success');
        setCart([]);
      } else {
        throw error;
      }
    } catch (err) {
      alert("Submission failed: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-28 pb-20 px-6 relative">
      {/* FLOATING CART TRIGGER */}
      {cart.length > 0 && !isCartOpen && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-8 right-8 z-40 bg-amber-500 text-black p-4 rounded-full shadow-2xl flex items-center gap-2 hover:scale-110 transition-transform active:scale-95"
        >
          <ShoppingCart size={24} />
          <span className="font-black pr-2">{cart.reduce((a, b) => a + b.qty, 0)}</span>
        </button>
      )}

      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter text-white mb-4">
              Signature <span className="text-amber-500">Catalogue</span>
            </h1>
            <p className="text-neutral-400 max-w-xl">Curated masterpieces roasted locally.</p>
          </div>

          <div className="flex gap-2 bg-zinc-900 p-1 rounded-lg border border-white/5">
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-2 text-xs font-bold uppercase transition-all rounded-md ${filter === cat ? 'bg-amber-500 text-black' : 'text-neutral-500 hover:text-white'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* DRINK GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-white">
          {filteredDrinks.map((drink) => {
            const isSoldOut = outOfStockIds.includes(Number(drink.id));

            return (
              <div key={drink.id} className="group bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden hover:border-amber-500/50 transition-all duration-500">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={drink.img}
                    alt={drink.name}
                    className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${isSoldOut ? 'grayscale opacity-40 blur-[2px]' : ''}`}
                  />
                  {isSoldOut && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <span className="bg-red-600 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-xl border border-white/20">Sold Out</span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className={`text-xl font-bold ${isSoldOut ? 'text-neutral-500' : 'text-white'}`}>{drink.name}</h3>
                    <span className={`text-2xl font-black ${isSoldOut ? 'text-neutral-700' : 'text-white'}`}>₹{drink.price}</span>
                  </div>

                  <button
                    onClick={() => addToCart(drink)}
                    disabled={isSoldOut}
                    className={`w-full py-3 font-bold uppercase rounded-xl transition-all flex items-center justify-center gap-2 ${isSoldOut
                      ? 'bg-zinc-800 text-neutral-600 cursor-not-allowed'
                      : 'bg-white text-black hover:bg-amber-500 active:scale-95'
                      }`}
                  >
                    {isSoldOut ? 'Unavailable' : <><ShoppingCart size={18} /> Add to Order</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CART DRAWER (Simplified for brevity, but logically identical) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { if (checkoutStep !== 'success') setIsCartOpen(false); }} />
          <div className="relative max-w-md w-full bg-zinc-950 border-l border-white/10 shadow-2xl h-full overflow-y-auto p-8 text-white">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">
                {checkoutStep === 'cart' && <>Your <span className="text-amber-500">Bag</span></>}
                {checkoutStep === 'details' && <>Delivery <span className="text-amber-500">Info</span></>}
                {checkoutStep === 'success' && <>Order <span className="text-amber-500">Confirmed</span></>}
              </h2>
              {checkoutStep !== 'success' && (
                <button onClick={() => setIsCartOpen(false)} className="text-neutral-500 hover:text-white"><X size={28} /></button>
              )}
            </div>

            {/* Step 1: Cart Items */}
            {checkoutStep === 'cart' && (
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-4 bg-zinc-900/40 p-3 rounded-2xl border border-white/5">
                    <img src={item.img} className="w-16 h-16 object-cover rounded-xl" alt="" />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-bold text-sm">{item.name}</h4>
                        <button onClick={() => removeFromCart(item.id)} className="text-neutral-600 hover:text-red-500"><X size={14} /></button>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-amber-500 font-black">₹{item.price * item.qty}</p>
                        <div className="flex items-center gap-2 bg-black/40 rounded-lg p-1">
                          <button onClick={() => updateQty(item.id, -1)} className="p-1"><Minus size={12} /></button>
                          <span className="text-xs font-bold">{item.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="p-1"><Plus size={12} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {cart.length > 0 && (
                  <button onClick={() => setCheckoutStep('details')} className="w-full py-4 bg-amber-500 text-black font-black uppercase rounded-2xl mt-4">
                    Proceed to Details
                  </button>
                )}
              </div>
            )}

            {/* Step 2: Form */}
            {checkoutStep === 'details' && (
              <div className="space-y-4">
                <input type="text" placeholder="Name" className="w-full bg-zinc-900 p-4 rounded-xl border border-white/10" value={userContact.name} onChange={e => setUserContact({...userContact, name: e.target.value})} />
                <input type="tel" placeholder="Phone" className="w-full bg-zinc-900 p-4 rounded-xl border border-white/10" value={userContact.phone} onChange={e => setUserContact({...userContact, phone: e.target.value})} />
                <textarea placeholder="Address" className="w-full bg-zinc-900 p-4 rounded-xl border border-white/10" value={userContact.address} onChange={e => setUserContact({...userContact, address: e.target.value})} />
                <button onClick={handleFinalSubmit} disabled={isLoading || !isPhoneValid} className="w-full py-4 bg-amber-500 text-black font-black uppercase rounded-2xl">
                  {isLoading ? <Loader2 className="animate-spin mx-auto" /> : "Confirm Order"}
                </button>
              </div>
            )}

            {/* Step 3: Success Tracking */}
            {checkoutStep === 'success' && (
              <div className="text-center space-y-6 pt-10">
                <div className="w-20 h-20 bg-amber-500/20 border-2 border-amber-500 rounded-full flex items-center justify-center mx-auto text-amber-500">
                  {liveStatus === 'Ready' ? <CheckCircle2 size={40} /> : <Loader2 size={40} className="animate-spin" />}
                </div>
                <h3 className="text-2xl font-black italic uppercase">{liveStatus}</h3>
                <button 
                  onClick={() => { setIsCartOpen(false); setCheckoutStep('cart'); setOrderId(null); }}
                  className="w-full py-4 bg-white text-black font-black uppercase rounded-2xl"
                >
                  Back to Menu
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalogue;