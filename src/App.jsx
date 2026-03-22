import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom';
import { Coffee, ChevronLeft, ChevronRight, MapPin, Clock, Phone } from 'lucide-react';
import { supabase } from './supabaseClient';

// Components
import AdminDashboard from './adminDashboard';
import KitchenLogin from './kitchenLogin';

// Page Imports
import Customize from './pages/customize';
import Catalogue from './pages/catalogue';
import About from './pages/about';

// --- HOME COMPONENT ---
const Home = ({ slides }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-60' : 'opacity-0'}`}
        >
          <img src={slide.img} alt={slide.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-b from-black/60 via-transparent to-black" />
        </div>
      ))}

      <div className="relative z-10 text-center px-4">
        <h2 className="text-6xl md:text-8xl font-black uppercase mb-4 tracking-tighter">
          {slides[currentSlide].title}
        </h2>
        <p className="text-lg md:text-xl text-amber-200 font-light max-w-lg mx-auto mb-8">
          {slides[currentSlide].desc}
        </p>
        <Link
          to="/customize"
          className="border-2 border-white hover:bg-white hover:text-black px-8 py-3 font-bold uppercase transition-all"
        >
          Brew Now
        </Link>
      </div>

      <button onClick={prevSlide} className="absolute left-4 z-20 p-2 hover:bg-white/10 rounded-full transition-colors">
        <ChevronLeft size={40} />
      </button>
      <button onClick={nextSlide} className="absolute right-4 z-20 p-2 hover:bg-white/10 rounded-full transition-colors">
        <ChevronRight size={40} />
      </button>

      <div className="absolute bottom-10 flex gap-2">
        {slides.map((_, i) => (
          <div key={i} className={`h-1 w-8 rounded-full ${i === currentSlide ? 'bg-amber-500' : 'bg-white/20'}`} />
        ))}
      </div>
    </section>
  );
};

// --- MAIN APP COMPONENT ---
const App = () => {
  const [adminUser, setAdminUser] = useState(null);
  const [showKitchenGate, setShowKitchenGate] = useState(false);

  const coffeeSlides = [
    { title: "Iced-Coffee", desc: "Bold, intense, and perfect for the early bird.", img: "/coffee1.jpg" },
    { title: "Espresso Coffee", desc: "Smooth, creamy, and naturally sweet.", img: "/coffee2.jpg" },
    { title: "Iced-Coffee-Strong", desc: "A rich blend of buttery caramel and espresso.", img: "/coffee3.jpg" }
  ];

  const navLinkStyles = ({ isActive }) =>
    `transition-colors ${isActive ? 'text-amber-500' : 'hover:text-amber-500'}`;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAdminUser(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500/30">

        {/* HEADER */}
        <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 group cursor-pointer">
              <Coffee className="text-amber-500 group-hover:rotate-12 transition-transform" size={28} />
              <span className="text-xl font-black tracking-tighter uppercase italic">Koffee Everyday</span>
            </Link>

            <nav className="hidden md:flex gap-8 text-xs font-bold uppercase tracking-widest text-neutral-400">
              <NavLink to="/" className={navLinkStyles}>Home</NavLink>
              <NavLink to="/customize" className={navLinkStyles}>Customize</NavLink>
              <NavLink to="/catalogue" className={navLinkStyles}>Catalogue</NavLink>
              <NavLink to="/about" className={navLinkStyles}>About</NavLink>
            </nav>

            <button className="bg-amber-600 hover:bg-amber-700 px-4 py-2 text-xs font-bold uppercase rounded">
              ORDER ONLINE
            </button>
          </div>
        </header>

        {/* ROUTES AREA */}
        <main>
          <Routes>
            <Route path="/" element={<Home slides={coffeeSlides} />} />
            <Route path="/customize" element={<Customize />} />
            <Route path="/catalogue" element={<Catalogue />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>

        {/* FOOTER */}
        <footer className="bg-zinc-950 py-20 px-6 border-t border-white/5 relative">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left mb-16">
            <div className="space-y-4">
              <h4 className="flex items-center justify-center md:justify-start gap-2 text-amber-500 font-bold uppercase tracking-widest">
                <MapPin size={20} /> Location
              </h4>
              <p className="text-neutral-400 text-sm">Near Gonasika College, Kashipur<br />Keonjhar, Odisha 758001</p>
            </div>
            <div className="space-y-4">
              <h4 className="flex items-center justify-center md:justify-start gap-2 text-amber-500 font-bold uppercase tracking-widest">
                <Clock size={18} /> Hours
              </h4>
              <p className="text-neutral-400 text-sm">Mon — Fri: 06:00 - 20:00<br />Sat — Sun: 08:00 - 22:00</p>
            </div>
            <div className="space-y-4">
              <h4 className="flex items-center justify-center md:justify-start gap-2 text-amber-500 font-bold uppercase tracking-widest">
                <Phone size={18} /> Contact
              </h4>
              <p className="text-neutral-400 text-sm">Order: (555) KOFFEE-1<br />Email: hello@koffeeeveryday.com</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 gap-4">
            <div className="text-[10px] text-neutral-600 uppercase tracking-widest">
              &copy; 2026 KoffeeEveryday. All Rights Reserved.
            </div>

            {/* THE SECRET ENTRANCE */}
            <button
              onClick={() => setShowKitchenGate(true)}
              className="px-3 py-1.5 border border-white/10 bg-zinc-900/50 hover:bg-amber-500 hover:text-black hover:border-amber-500 rounded-lg text-[14px] text-neutral-500 transition-all uppercase flex items-center gap-2 group"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 group-hover:bg-black animate-pulse" />
              Staff: Enter Kitchen
            </button>
          </div>

          {/* THE GATEKEEPER MODAL */}
          {showKitchenGate && !adminUser && (
            <KitchenLogin
              onLoginSuccess={(user) => {
                setAdminUser(user);
                setShowKitchenGate(false);
              }}
              onBack={() => setShowKitchenGate(false)}
            />
          )}

          {/* THE ACTUAL DASHBOARD - Rendered ONLY if adminUser exists */}
          {adminUser && (
            <AdminDashboard 
              user={adminUser} 
              onLogout={handleLogout} 
            />
          )}
        </footer>
      </div>
    </Router>
  );
};

export default App;