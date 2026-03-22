import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import {
  Coffee, Package, CreditCard, LayoutDashboard,
  LogOut, CheckCircle, AlertTriangle, TrendingUp,
  Loader2, Trash2
} from 'lucide-react';
import StockManager from './StockManager'; // Adjust path if needed

const AdminDashboard = ({ onLogout }) => {
  // --- All Hooks must stay inside this block ---
  const [activeTab, setActiveTab] = useState('activities');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { id: 'activities', label: 'Kitchen Activities', icon: <Coffee size={20} /> },
    { id: 'payments', label: 'Payments & Revenue', icon: <CreditCard size={20} /> },
    { id: 'stocks', label: 'Display Stocks', icon: <Package size={20} /> },
  ];

  // 1. Unified Fetch Function
  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Fetch from Standard Orders
      const { data: stdData, error: err1 } = await supabase.from('orders').select('*');

      // Fetch from Customized Orders (Note: Ensure table name is 'customize_order' in Supabase)
      const { data: custData, error: err2 } = await supabase.from('customized_orders').select('*');

      if (err1) console.warn("Standard orders error:", err1.message);
      if (err2) console.warn("Custom orders error (check table name):", err2.message);

      const combined = [
        ...(stdData || []).map(o => ({ ...o, source: 'standard' })),
        ...(custData || []).map(o => ({ ...o, source: 'custom' }))
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setOrders(combined);
    } catch (error) {
      console.error("Critical Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Multi-Table Status Update
  const updateOrderStatus = async (id, newStatus, source) => {
    const table = source === 'custom' ? 'customized_orders' : 'orders';
    const { error } = await supabase
      .from(table)
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) fetchOrders();
  };

  useEffect(() => {
    fetchOrders();

    // Listen to both tables for real-time updates
    const stdChannel = supabase.channel('std-changes').on('postgres_changes',
      { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders()).subscribe();

    const custChannel = supabase.channel('cust-changes').on('postgres_changes',
      { event: '*', schema: 'public', table: 'customized_orders' }, () => fetchOrders()).subscribe();

    return () => {
      supabase.removeChannel(stdChannel);
      supabase.removeChannel(custChannel);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-100 flex text-white overflow-hidden font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-white/5 bg-zinc-950 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 text-amber-500 mb-10">
            <LayoutDashboard size={24} />
            <span className="font-black uppercase italic tracking-tighter text-xl">Command</span>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === item.id
                  ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                  : 'text-neutral-500 hover:bg-white/5 hover:text-white'
                  }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-white/5">
          <button onClick={onLogout} className="w-full flex items-center gap-4 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl text-xs font-bold uppercase transition-all">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden bg-zinc-950">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-black/50">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter">
            {menuItems.find(m => m.id === activeTab)?.label}
          </h2>
          <div className="bg-zinc-900 px-4 py-2 rounded-lg border border-white/5 text-[10px] font-bold text-neutral-400 uppercase">
            Live Connection: <span className="text-green-500">Active</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin text-amber-500" size={40} />
            </div>
          ) : (
            <>
              {activeTab === 'activities' && (
                <KitchenActivities orders={orders} onUpdateStatus={updateOrderStatus} />
              )}
              {activeTab === 'payments' && <PaymentStats orders={orders} />}
              {activeTab === 'stocks' && <StockManagement />}
              {/* Inside your tab content area */}
              {activeTab === 'stocks' && (
                <div className="p-6">
                  <StockManager />
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const KitchenActivities = ({ orders, onUpdateStatus }) => {
  const activeOrders = orders.filter(o => o.status !== 'Completed');

  if (activeOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-white/5 rounded-3xl">
        <Coffee className="text-zinc-800 mb-4" size={48} />
        <p className="text-zinc-600 uppercase font-black italic">No active orders</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {activeOrders.map((order) => (
        <div key={order.id} className="bg-zinc-900 rounded-3xl border border-white/5 p-6 flex flex-col justify-between hover:border-amber-500/30 transition-all shadow-xl group">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-black uppercase italic leading-none">{order.customer_name || 'Guest'}</h3>
                <p className="text-[10px] text-neutral-500 font-bold mt-1 uppercase tracking-widest">{order.phone}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'Ready' ? 'bg-green-500 text-black' : 'bg-amber-500 text-black'
                }`}>
                {order.status || 'Order Placed'}
              </span>
            </div>

            <div className="space-y-2 py-4 border-t border-white/5">
              {order.source === 'standard' ? (
                order.order_details?.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-neutral-300">{item.qty}x {item.name}</span>
                    <span className="text-amber-500 font-bold">₹{item.price * item.qty}</span>
                  </div>
                ))
              ) : (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-300 font-bold uppercase">{order.coffee_brand}</span>
                    <span className="text-amber-500 font-bold">₹{order.total_price}</span>
                  </div>
                  <div className="flex gap-2 flex-wrap mt-2">
                    <span className="text-[11px] bg-white/5 px-2 py-0.5 rounded text-neutral-400 uppercase tracking-normal">Sugar: {order.sugar_level}%</span>
                    <span className="text-[11px] bg-white/5 px-2 py-0.5 rounded text-neutral-400 uppercase tracking-normal">Quantity: {order.quantity}</span>
                    <span className="text-[11px] bg-white/5 px-2 py-0.5 rounded text-neutral-400 uppercase tracking-normal">{order.is_hot ? 'HOT' : 'COLD'}</span>
                    <span className="text-[11px] bg-white/5 px-2 py-0.5 rounded text-neutral-400 uppercase tracking-normal">{order.base_type}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-6">
            <button
              onClick={() => onUpdateStatus(order.id, 'Brewing', order.source)}
              className="py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
            >
              Brew
            </button>
            <button
              onClick={() => onUpdateStatus(order.id, 'Ready', order.source)}
              className="py-2.5 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-black rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
            >
              Ready
            </button>
            <button
              onClick={() => onUpdateStatus(order.id, 'Completed', order.source)}
              className="py-2.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-black rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
            >
              Done
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const PaymentStats = ({ orders }) => {
  const [dateFilter, setDateFilter] = useState('today'); // 'today' | 'yesterday' | 'all' | 'custom'
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);

  // --- Filtering Logic ---
  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.created_at).toLocaleDateString();

    const today = new Date().toLocaleDateString();

    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toLocaleDateString();

    const selectedCustom = new Date(customDate).toLocaleDateString();

    if (dateFilter === 'today') return orderDate === today;
    if (dateFilter === 'yesterday') return orderDate === yesterday;
    if (dateFilter === 'custom') return orderDate === selectedCustom;
    return true; // 'all'
  });

  const totalRevenue = filteredOrders.reduce((acc, curr) => acc + (Number(curr.total_price) || 0), 0);
  const totalOrders = filteredOrders.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* FILTER BAR */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2 bg-zinc-900 p-1 rounded-xl border border-white/5 w-fit">
          {['today', 'yesterday', 'all', 'custom'].map((period) => (
            <button
              key={period}
              onClick={() => setDateFilter(period)}
              className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${dateFilter === period
                ? 'bg-amber-500 text-black'
                : 'text-neutral-500 hover:text-white'
                }`}
            >
              {period}
            </button>
          ))}
        </div>

        {/* CUSTOM CALENDAR INPUT */}
        {dateFilter === 'custom' && (
          <div className="animate-in slide-in-from-left-4 duration-300">
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="bg-zinc-900 border border-amber-500/30 text-amber-500 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl outline-none focus:border-amber-500 transition-all color-scheme:dark"
            />
          </div>
        )}
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900 p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
          <TrendingUp className="text-green-500 mb-4" />
          <p className="text-neutral-500 text-[10px] uppercase font-bold tracking-widest">
            {dateFilter === 'custom' ? `Revenue for ${customDate}` : `${dateFilter} Revenue`}
          </p>
          <p className="text-4xl font-black mt-2 tracking-tighter text-green-500">
            ₹{totalRevenue.toLocaleString()}
          </p>
        </div>

        <div className="bg-zinc-900 p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
          <CheckCircle className="text-amber-500 mb-4" />
          <p className="text-neutral-500 text-[10px] uppercase font-bold tracking-widest">
            {dateFilter === 'custom' ? `Orders for ${customDate}` : `${dateFilter} Orders`}
          </p>
          <p className="text-4xl font-black mt-2 tracking-tighter text-amber-500">
            {totalOrders}
          </p>
        </div>
      </div>

      {/* DETAILED LOGS TABLE */}
      <div className="bg-zinc-900 rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-neutral-600 text-[10px] uppercase tracking-widest border-b border-white/5 bg-black/20">
              <th className="p-6">Transaction</th>
              <th className="p-6">Customer</th>
              <th className="p-6">Time</th>
              <th className="p-6">Amount</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {filteredOrders.length > 0 ? (
              filteredOrders.map(o => (
                <tr key={o.id} className="border-b border-white/5 hover:bg-white/1 transition-colors">
                  <td className="p-6 text-neutral-500 font-mono text-[10px]">#ORD-{o.id.toString().slice(-5)}</td>
                  <td className="p-6 font-bold uppercase italic">{o.customer_name}</td>
                  <td className="p-6 text-neutral-400">
                    {new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-6 text-green-500 font-black">₹{o.total_price}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-20 text-center text-neutral-600 uppercase font-black italic tracking-widest">
                  No data found for this selection
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StockManagement = () => (
  <div className="bg-zinc-900 p-20 rounded-3xl border border-white/5 text-center shadow-2xl">
    <AlertTriangle size={64} className="text-amber-500 mx-auto mb-6 animate-bounce" />
    <h3 className="text-2xl font-black uppercase italic tracking-tighter">Inventory Control</h3>
    <p className="text-neutral-500 mt-2 max-w-sm mx-auto">Connecting your bean inventory database and out-of-stock toggles...</p>
    <button className="mt-8 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-neutral-400">
      Check Warehouse
    </button>
  </div>
);

export default AdminDashboard;