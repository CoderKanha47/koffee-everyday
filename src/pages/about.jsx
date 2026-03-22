import React from 'react';
import { Leaf, Award, Users, Coffee } from 'lucide-react';

const About = () => {
  const stats = [
    { icon: <Leaf className="text-amber-500" />, title: "Organic", desc: "100% Arabica beans" },
    { icon: <Award className="text-amber-500" />, title: "Quality", desc: "Small-batch roasted" },
    { icon: <Users className="text-amber-500" />, title: "Local", desc: "Proudly Odisha-born" }
  ];

  return (
    <div className="min-h-screen bg-black pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* HERO SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          <div className="relative h-125 rounded-3xl overflow-hidden group">
            <img 
              src="/coffee2.jpg" // Use one of your existing images
              alt="Coffee Roasting" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent opacity-60"></div>
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-white">
              Our <span className="text-amber-500">Story.</span>
            </h1>
            <p className="text-xl text-neutral-300 leading-relaxed font-light">
              Founded in the heart of <span className="text-white font-bold">Keonjhar, Odisha</span>, 
              KoffeeEveryday started with a simple obsession: finding the perfect bean.
            </p>
            <p className="text-neutral-500 leading-relaxed">
              We believe coffee is more than just caffeine—it's a ritual. Every cup we roast 
              at our Kashipur facility is a tribute to the farmers and the craft of 
              traditional roasting. No shortcuts, no artificial flavors, just pure energy.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
              {stats.map((stat, i) => (
                <div key={i} className="p-4 bg-zinc-900/50 rounded-2xl border border-white/5">
                  <div className="mb-2">{stat.icon}</div>
                  <h4 className="text-white font-bold text-sm uppercase">{stat.title}</h4>
                  <p className="text-neutral-500 text-xs mt-1">{stat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MISSION STRIP */}
        <div className="bg-amber-500 py-12 px-8 rounded-[40px] text-center">
          <Coffee className="mx-auto mb-4 text-black" size={48} />
          <h2 className="text-3xl md:text-5xl font-black uppercase text-black italic tracking-tighter">
            "Better Beans. Better Mornings. Everyday."
          </h2>
        </div>
      </div>
    </div>
  );
};

export default About;