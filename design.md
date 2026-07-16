# Wassup Premium Car Wash — Design System & Visual Guidelines

Welcome to the official **Wassup Design System** documentation. This design language has been meticulously crafted to bridge premium organic earthy styling with a high-energy, modern high-tech visual identity. 

This design system is implemented in React using **Tailwind CSS v4** and customized font pairings to deliver a cohesive, aesthetic, and high-performance experience across multiple client interfaces: **Self-Service Kiosk (M0)**, **Admin Operator Hub (M1-M7)**, and **TV Broadcast Queue Display**.

---

## 1. Core Brand Mood & Aesthetic Concept

The Wassup brand aesthetic is defined as **"Cyber-Organic Premium"** or **"Eco-Tech Prestige"**. It relies on high contrast and sophisticated organic tones, punctuated by high-visibility energy accents to guide user attention.

*   **Primary Mood:** Clean, minimalist, modern, premium, and trustworthy.
*   **The Contrast Paradox:** Classic earthy hues (mossy green, warm gold, deep wood brown, sand beige) paired with an ultra-bright neon lime-green accent.
*   **Surface Principles:** Soft, spacious off-white layouts for consumer interfaces (Kiosk) to maximize legibility and reduce friction, contrasting with absolute obsidian dark backgrounds for the operator hub (Admin Dashboard, TV) to emphasize high-performance telemetry and 24/7 readability.

---

## 2. Color Palette & Tokens

These colors are mapped directly in `/src/index.css` under Tailwind's `@theme` directive, making them globally available as native utility classes (e.g. `text-brand-green`, `bg-matte-black`).

| Token Name | Hex Code | Tailwind Class | Semantic Role / Usage |
| :--- | :--- | :--- | :--- |
| **Brand Green (Volt)** | `#A2C62C` | `bg-brand-green` / `text-brand-green` | Primary high-energy accent, call-to-action buttons, selected states, and brand highlights. |
| **Brand Green Hover** | `#8fb124` | `bg-brand-green-hover` | Hover state for interactive brand-green elements. |
| **Brand Green Light** | `#f0f7d4` | `bg-brand-green-light` | Soft background for selected items, vouchers, and notification blocks. |
| **Matte Black** | `#1A1A1A` | `bg-matte-black` / `text-matte-black` | Deep obsidian canvas background for Admin and TV displays; body text in Kiosk. |
| **Warm White** | `#FAFAFA` | `bg-warm-white` / `text-warm-white` | Primary bright canvas background for the Kiosk interface; clean contrast panels. |
| **Forest Green** | `#59743E` | `text-forest-green` | Sub-branding, success badges, and secondary botanical/environmental icons. |
| **Warm Gold** | `#AC9653` | `text-warm-gold` | Premium tier packages, VIP status highlights, and star ratings. |
| **Earth Brown** | `#594026` | `text-earth-brown` | Subtle organic lines, premium framing, and natural borders. |
| **Sand Beige** | `#BCBC8F` | `text-sand-beige` | Soft borders, inactive step lines, and premium card backdrops. |
| **Mid Gray** | `#6B7280` | `text-mid-gray` | Secondary body copy, descriptions, placeholders, and helper text. |

---

## 3. Typography & Font Pairing

Wassup utilizes three distinct font families to build semantic structure and typographic rhythm.

```css
@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
```

### 3.1. Display Font: **Lexend** (`font-display`)
*   **Role:** Bold headers, app branding, pricing, primary numeric figures, and uppercase navigation labels.
*   **Characteristics:** Highly structured, geometric, approachable, and extremely legible at high speeds (perfect for drive-through kiosks and roadside TV displays).
*   **Usage Example:**
    ```tsx
    <h1 className="font-display font-extrabold text-3xl tracking-tight text-matte-black uppercase">
      THIẾT LẬP HỆ THỐNG
    </h1>
    ```

### 3.2. Body Font: **Inter** (`font-sans`)
*   **Role:** Primary text, tables, user profiles, detail descriptions, input forms, and structural labels.
*   **Characteristics:** Neutral, highly legible sans-serif with excellent vertical metrics and spacing.
*   **Usage Example:**
    ```tsx
    <p className="font-sans text-sm text-mid-gray leading-relaxed">
      Quản lý nhân sự, cấu hình quyền hạn (RBAC) và kiểm toán hệ thống.
    </p>
    ```

### 3.3. Monospace Font: **JetBrains Mono** (`font-mono`)
*   **Role:** Ticket IDs, license plates, timestamps, live IoT coordinates, sensor telemetry, and financial figures.
*   **Characteristics:** Clear character distinction (e.g. `O` vs `0`), giving a technical, highly accurate "live telemetry" vibe.
*   **Usage Example:**
    ```tsx
    <span className="font-mono text-xs font-semibold tracking-wider text-amber-500">
      ID: ORD-72810
    </span>
    ```

---

## 4. UI Layout & Screen Architectures

The system is split into three core visual viewports, each with its own structural boundaries and layout systems:

### 4.1. Admin Operator Hub (`activeScreen === "admin"`)
*   **Visual Direction:** High-contrast dark mode to reduce eye strain for operators during night shifts.
*   **Layout:**
    *   **Sidebar:** Permanent vertical navigation (`w-64`) with categorized module navigation items (QUẢN TRỊ VẬN HÀNH, DỮ LIỆU & DANH MỤC, HỆ THỐNG TRẠM).
    *   **Header:** Persistent top bar with live connection status, screen router tabs, notifications manager, and current operator profile controls.
    *   **Content Region:** Flexible grid/card system with white-on-dark components (`bg-[#222222]` cards on a `bg-[#111111]` background).
*   **Modular Tab Concept (Module 7):** Merged sub-tabs under `/admin/system` (Nhân sự & RBAC, Cài đặt trạm, Giám sát IoT, CRM Khách hàng) to maintain strict clean spacing.

### 4.2. Self-Service Kiosk (`activeScreen === "kiosk"`)
*   **Visual Direction:** Friendly, highly polished light mode with generous negative space.
*   **Layout:**
    *   **Stage Container:** `max-w-4xl mx-auto px-6 py-8` to enforce visual structure.
    *   **Interactive Blocks:** Oversized touch targets (minimum height `44px`, recommended cards `190px+`) with clear hover and active-selected indicator circles.
    *   **Wizard Progression:** Sequential wizard headers tracking Step 1 (Xe & Khách), Step 2 (Chọn gói), Step 3 (Add-ons), Step 4 (Thanh toán).

### 4.3. TV Broadcast Queue (`activeScreen === "tv"`)
*   **Visual Direction:** Cinema-scale dashboard optimized for viewing from 5-10 meters away inside the customer lounge.
*   **Layout:**
    *   **Header:** Giant clocks, weather forecast, and status statistics.
    *   **Bento Grid columns:** Dynamic divided zones mapping **Active Wash Booths** (Current status, progress bar, license plate) alongside **Waiting Queues** (Upcoming vehicles).
    *   **Status Colors:** Staggered status colors: Blue (Đang xịt xà bông), Yellow (Đang sấy khô), Green (Đang bàn giao), Gray (Chờ rửa).

---

## 5. Standard Component Specs & Tailwinds

### 5.1. Primary Buttons
*   **Accent Brand Button (Volt):**
    `bg-brand-green hover:bg-brand-green-hover text-slate-950 font-display font-black text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all duration-300 shadow-md shadow-brand-green/10 border-0 cursor-pointer`
*   **Destructive Button (Red):**
    `bg-red-500 hover:bg-red-600 text-white font-display font-black text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all duration-300 border-0 cursor-pointer`
*   **Secondary/Neutral Button:**
    `bg-[#262626] text-gray-400 hover:text-white hover:bg-[#333333] font-display font-black text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all duration-300 border border-[#3a3a3a] cursor-pointer`

### 5.2. Data Cards
*   **Admin/Dark Card:**
    `bg-matte-black/55 border border-[#2d2d2d] p-5 rounded-2xl shadow-lg relative overflow-hidden backdrop-blur-md`
*   **Kiosk/Light Card:**
    `bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300`

### 5.3. Status Badges
Status indicators must always use standard semantic pairings with clear typography:
*   **Success / Active:** `bg-emerald-500/10 text-emerald-400 border border-emerald-500/20`
*   **Warning / Pending / In-Progress:** `bg-amber-500/10 text-amber-400 border border-amber-500/20`
*   **Danger / Cancelled:** `bg-red-500/10 text-red-400 border border-red-500/20`
*   **Info / Idle:** `bg-blue-500/10 text-blue-400 border border-blue-500/20`

### 5.4. CRM Utility Action Links (Matte Black)
Interactive text links for administrative/CRM tasks inside user detail sheets (such as **Đăng ký thêm xe** and **Cấp voucher thủ công**) must be styled in high-contrast matte-black rather than the primary bright brand green to prevent color-contrast pollution and visual fatigue:
*   **Class Specs:** `text-[#1a1a1a] hover:text-[#1a1a1a]/80 font-extrabold uppercase text-[10px] flex items-center gap-1 cursor-pointer transition font-sans`

---

## 6. Motion & Interaction Rules

Animations must be subtle, intentional, and performant. Standardized transition speeds and layout transitions are driven by **Framer Motion (`motion/react`)**.

*   **Page/Module Transitions:** Staggered fade-ins using `y: 10` down-offset and standard spring/ease properties.
    ```tsx
    import { motion } from "motion/react";
    
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="animate-fadeIn"
    >
      {/* Component content */}
    </motion.div>
    ```
*   **Micro-Interactions (Hovers):** All interactive buttons and list items must include a smooth transition (`transition-all duration-300`) and slight transform or scale where appropriate (e.g. `hover:scale-[1.02] hover:-translate-y-0.5`).
*   **Visual Loading/Syncing Pulse:** Highlighting live operational statuses with a soft radial breathing pulse effect:
    `animate-pulse bg-brand-green h-2 w-2 rounded-full shadow-[0_0_12px_#A2C62C]`

---

## 7. Development Guidelines & Best Practices

1.  **Strict Icon Rule:** All icons **MUST** be imported from `lucide-react`. Do not create inline SVG code blocks or use other font packages.
2.  **No Direct Port references:** The application runs behind a reverse proxy mapping port `3000`. Direct configuration or reading of local port overrides is strictly prohibited.
3.  **Client-Side Persistence:** Critical local data (role permissions, user logins, simulated service BOM maps) must utilize standard local storage structures with fallback schemas so the app remains resilient to cache resets.
4.  **No Clutter/Anti-AI Slop:** Never display raw technical telemetry, system coordinates, or container internal states (e.g., "PORT: 3000") in consumer margins unless explicitly asked. Design with clean, honest labels.
