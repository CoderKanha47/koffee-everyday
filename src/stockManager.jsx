import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { drinks } from './drinksDB';
import { Package, Power, PowerOff, AlertTriangle } from 'lucide-react';

const StockManager = () => {
  const [outOfStockIds, setOutOfStockIds] = useState([]);
  const [isUpdating, setIsUpdating] = useState(null);

  // Load current out-of-stock items
  useEffect(() => {
    fetchStockStatus();
  }, []);

  const fetchStockStatus = async () => {
    const { data } = await supabase.from('stock_status').select('drink_id').eq('is_available', false);
    if (data) setOutOfStockIds(data.map(item => item.drink_id));
  };

  const toggleStock = async (drinkId, currentStatus) => {
    setIsUpdating(drinkId);
    const newStatus = !currentStatus;

    const { error } = await supabase
      .from('stock_status')
      .upsert({
        drink_id: drinkId, // This is a number
        is_available: newStatus
      }, { onConflict: 'drink_id' });

    if (!error) {
      setOutOfStockIds(prev =>
        // Ensure we treat drinkId as a number here too
        newStatus ? prev.filter(id => id !== drinkId) : [...prev, drinkId]
      );
    }
    setIsUpdating(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-amber-500/10 p-3 rounded-2xl">
          <Package className="text-amber-500" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Inventory <span className="text-amber-500">Master</span></h2>
          <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest">Live Menu Availability</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {drinks.map((drink) => {
          const isAvailable = !outOfStockIds.includes(drink.id);
          const loading = isUpdating === drink.id;

          return (
            <div
              key={drink.id}
              className={`p-5 rounded-3xl border transition-all duration-500 ${isAvailable
                  ? 'bg-zinc-900/50 border-white/5'
                  : 'bg-red-500/5 border-red-500/20'
                }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4">
                  <img src={drink.img} className={`w-12 h-12 rounded-xl object-cover ${!isAvailable && 'grayscale opacity-50'}`} alt="" />
                  <div>
                    <h4 className={`font-black uppercase italic text-sm ${!isAvailable ? 'text-neutral-500' : 'text-white'}`}>
                      {drink.name}
                    </h4>
                    <p className="text-[10px] text-neutral-500 font-bold uppercase">{drink.category}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${isAvailable ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                  {isAvailable ? 'In Stock' : 'Sold Out'}
                </div>
              </div>

              <button
                onClick={() => toggleStock(drink.id, isAvailable)}
                disabled={loading}
                className={`w-full py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 ${isAvailable
                    ? 'bg-white text-black hover:bg-red-500 hover:text-white'
                    : 'bg-zinc-800 text-white hover:bg-green-500'
                  }`}
              >
                {loading ? (
                  <span className="animate-pulse">Updating...</span>
                ) : isAvailable ? (
                  <><PowerOff size={14} /> Mark Unavailable</>
                ) : (
                  <><Power size={14} /> Mark Available</>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {!drinks.length && (
        <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
          <AlertTriangle className="mx-auto text-neutral-700 mb-4" size={48} />
          <p className="text-neutral-600 font-black uppercase italic">No items found in database</p>
        </div>
      )}
    </div>
  );
};

export default StockManager;