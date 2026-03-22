# ☕ KoffeeEveryday
> A high-end, interactive coffee customization and real-time ordering application.

## 🌟 Live Demo
[Paste your Vercel link here!]

---

## 🎨 Project Overview
KoffeeEveryday bridges the gap between artisanal coffee traditions and a modern, high-performance digital experience. Originally inspired by the coffee culture in Odisha, it has evolved into a full-stack solution for local shops.

### Key Features:
* **Real-time Stock Sync:** Instant "Sold Out" updates across all customer devices using Supabase Broadcast.
* **Live Order Tracking:** Customers can watch their order status change from "Placed" to "Brewing" to "Ready" in real-time.
* **Dynamic Customizer:** Real-time state management for coffee brand, temperature, and size.
* **Premium UI:** High-end aesthetic featuring Glassmorphism, parallax effects, and a sophisticated dark-mode palette.
* **Mobile-First Design:** Optimized for a seamless "order-on-the-go" experience.

## 🛠️ Technical Stack
* **Frontend:** React.js (Vite)
* **Backend-as-a-Service:** Supabase (PostgreSQL + Realtime Engine)
* **State Management:** React Hooks (useState, useEffect)
* **Styling:** Tailwind CSS (Custom configuration)
* **Icons & UI:** Lucide-React & Framer Motion
* **Security:** Environment Variables (`.env`) for protected API access

## 🧠 Technical Deep Dive: Realtime Sync
One of the core challenges solved in this project was maintaining **Type Consistency** between a local JSON database (`drinksDB.js`) and a remote PostgreSQL database. 

* **The Challenge:** Handling "Sold Out" states without page refreshes.
* **The Solution:** Implemented a **Supabase Realtime Channel** that listens for `UPDATE` and `INSERT` events. By normalizing database `UUIDs` and `BigInts` into JavaScript `Numbers` during the fetch, the app ensures 100% accuracy in UI filtering.

## 🚀 The Roadmap
- [x] **Real-time Database Integration:** Connected Supabase for inventory and orders.
- [x] **Secure Credential Handling:** Migrated to Vite environment variables for GitHub safety.
- [ ] **Smart Pricing:** Dynamic price calculation based on selected size/shots.
- [ ] **Admin Dashboard:** A dedicated portal for baristas to manage the queue.
- [ ] **Payment Integration:** Stripe/Razorpay for secure transactions.

---

## 👤 Author
**Kanha**
*Full-Stack Web Developer & 6th Sem B.Tech CST Student*
*Specializing in React, Supabase, and Freelance Solutions.*
