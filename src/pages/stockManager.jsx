import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { drinks } from './drinksDB';
import { Package, PowerOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const StockManager = () => {
  const [outOfStockIds, setOutOfStockIds] = useState([]);
  const [isUpdating, setIsUpdating] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStockStatus = useCallback(async () => {
    try {
      setError(null);
      const { data, error: supabaseError } = await supabase
        .from('stock_status')
        .select('drink_id')
        .eq('is_available', false);

      if (supabaseError) throw supabaseError;

      if (data) {
        const ids = data.map(item => String(item.drink_id).trim());
        setOutOfStockIds(ids);
      }
    } catch (err) {
      console.error("❌ Fetch Error:", err);
      setError("Failed to sync with Database");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStockStatus();
    
    // Realtime Sync: If someone else changes stock, update this UI instantly
    const channel = supabase
      .channel('admin-stock-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stock_status' }, () => {
        fetchStockStatus();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchStockStatus]);

  const toggleStock = async (drinkId, currentlyAvailable) => {
    const sId = String(drinkId).trim();
    setIsUpdating(sId);
    const newAvailableStatus = !currentlyAvailable;

    try {
      const { error } = await supabase
        .from('stock_status')
        .upsert({ drink_id: sId, is_available: newAvailableStatus }, { onConflict: 'drink_id' });

      if (error) throw error;

      // Update local state immediately
      if (!newAvailableStatus) {
        setOutOfStockIds(prev => [...new Set([...prev, sId])]);
      } else {
        setOutOfStockIds(prev => prev.filter(id => id !== sId));
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsUpdating(null);
    }
  };

  if (isLoading) return (
    <div className="h-96 flex flex-col items-center justify-center space-y-4">
      <Loader2 className="animate-spin text-amber-500" size={40} />
      <p className="text-neutral-500 font-black uppercase text-[10px] tracking-widest">Verifying Inventory Status...</p>
    </div>
  );

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-6">
        <Package className="text-amber-500" />
        <h2 className="text-xl font-black uppercase italic text-white">Stock <span className="text-amber-500">Manager</span></h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {drinks.map((drink) => {
          const drinkIdStr = String(drink.id).trim();
          const isOutOfStock = outOfStockIds.includes(drinkIdStr);
          const isCurrentlyAvailable = !isOutOfStock;
          const updating = isUpdating === drinkIdStr;

          return (
            <div key={drink.id} className={`p-6 rounded-3xl border transition-all duration-500 ${isCurrentlyAvailable ? 'bg-zinc-900 border-white/5' : 'bg-red-500/5 border-red-500/20'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <img src={drink.img} className={`w-12 h-12 rounded-xl object-cover transition-all ${isOutOfStock && 'grayscale opacity-30 scale-90'}`} alt="" />
                  <div>
                    <h4 className={`font-bold uppercase text-xs ${isCurrentlyAvailable ? 'text-white' : 'text-neutral-500'}`}>{drink.name}</h4>
                    <p className={`text-[8px] font-black uppercase tracking-widest mt-1 ${isCurrentlyAvailable ? 'text-green-500' : 'text-red-500'}`}>
                      {isCurrentlyAvailable ? '● Online' : '○ Offline'}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => toggleStock(drink.id, isCurrentlyAvailable)}
                disabled={updating}
                className={`w-full py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${
                  isCurrentlyAvailable ? 'bg-white text-black hover:bg-red-500 hover:text-white' : 'bg-zinc-800 text-white hover:bg-green-500'
                }`}
              >
                {updating ? <Loader2 className="animate-spin mx-auto" size={14} /> : isCurrentlyAvailable ? "Mark Unavailable" : "Mark Available"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StockManager;