import React from 'react';
import { ShoppingCart, Star } from 'lucide-react';

const drinks = [
  {
    id: 1,
    name: "Golden Crema",
    price: "₹220",
    rating: 4.9,
    img: "/coffee1.jpg",
    tags: ["Best Seller", "Hot"]
  },
  {
    id: 2,
    name: "Midnight Brew",
    price: "₹180",
    rating: 4.7,
    img: "/coffee2.jpg",
    tags: ["Strong"]
  },
  {
    id: 3,
    name: "Velvet Latte",
    price: "₹250",
    rating: 4.8,
    img: "/coffee3.jpg",
    tags: ["Creamy"]
  },
  {
    id: 4,
    name: "Dalgona Coffee",
    price: "₹350",
    rating: 4.2,
    img: "/coffee4.jpg",
    tags: ["Latte"]
  },
  {
    id: 4,
    name: "Breve Coffee",
    price: "₹220",
    rating: 4.3,
    img: "/coffee5.jpg",
    tags: ["Chef's Kiss"]
  }
];

const Catalogue = () => {
  return (
    <div className="min-h-screen bg-black pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-5xl font-black uppercase italic tracking-tighter text-white mb-4">
            Signature <span className="text-amber-500">Catalogue</span>
          </h1>
          <p className="text-neutral-400 max-w-xl">
            Hand-picked blends roasted to perfection in our Keonjhar facility. 
            Select a masterpiece below.
          </p>
        </div>

        {/* DRINK GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {drinks.map((drink) => (
            <div key={drink.id} className="group bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden hover:border-amber-500/50 transition-all duration-500">
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={drink.img} 
                  alt={drink.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  {drink.tags.map(tag => (
                    <span key={tag} className="bg-amber-500 text-black text-[10px] font-black uppercase px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Info */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{drink.name}</h3>
                    <div className="flex items-center gap-1 text-amber-500 mt-1">
                      <Star size={14} fill="currentColor" />
                      <span className="text-sm font-bold">{drink.rating}</span>
                    </div>
                  </div>
                  <span className="text-2xl font-black text-white">{drink.price}</span>
                </div>

                <button className="w-full py-3 bg-white text-black font-bold uppercase rounded-xl hover:bg-amber-500 transition-colors flex items-center justify-center gap-2">
                  <ShoppingCart size={18} /> Add to Order
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Catalogue;