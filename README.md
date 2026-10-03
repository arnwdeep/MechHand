# MECHHAND // CYBERNETIC CHROME & KINETIC HAND ARTICULATIONS

> **Next.js 16 Storefront & 3D Interactive Specimen Showcase**  
> Exploring biological kinetics, cold-drawn titanium rigging, extraterrestrial meteoric inlays, and minimal Swiss editorial typography.

[![Deployment](https://img.shields.io/badge/Deployment-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://mech-hand.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/arnwdeep/MechHand)
[![Next.js 16](https://img.shields.io/badge/Framework-Next.js%2016-black?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Styling-Tailwind%20v4-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript 5](https://img.shields.io/badge/Language-TypeScript%205-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

---

## 🌐 Live Deployments

- **Production URL:** [https://mech-hand.vercel.app](https://mech-hand.vercel.app)
- **Repository:** [https://github.com/arnwdeep/MechHand](https://github.com/arnwdeep/MechHand)
- **Local Preview:** `http://localhost:3005`

---

## ⚡ Overview & Architecture

MECHHAND is a cybernetic storefront and design engineering archive presenting biological articulations, high-polish liquid alloy finishes, and ergonomic kinetic prosthetics.

```
┌─────────────────────────────────────────────────────────────┐
│                       MECHHAND SYSTEM                       │
├──────────────────────────────┬──────────────────────────────┤
│  01. HERO EXPERIENCE         │  Dual-layer video playback   │
│                              │  with real-time liquid mask  │
├──────────────────────────────┼──────────────────────────────┤
│  02. EDITORIAL SPECIFICATIONS│  Unboxed Swiss key-value     │
│                              │  tabular data layout (ID 26) │
├──────────────────────────────┼──────────────────────────────┤
│  03. 3D SPECIMEN SHOWCASE    │  SSENSE/Balenciaga carousel  │
│                              │  (ROCK / SKIN / BONE)        │
├──────────────────────────────┼──────────────────────────────┤
│  04. LIQUID HEADER PILL      │  Dynamic category routing &  │
│                              │  frosted client portal       │
└──────────────────────────────┴──────────────────────────────┘
```

---

## 🔬 Hardware Specimen Roster

| Specimen | Code | Key Materials | Articulation & Mechanics |
| :--- | :--- | :--- | :--- |
| **ROCK** | `CL5770-vvr1.23en` | Raw Chondrite Meteorite, Braided Steel | Cold-drawn titanium tension rigging, multi-link armored knuckles |
| **SKIN** | `CL5F7D-vvnt 12apr` | Bio-Synthetic Epidermis, 7075-T6 Alloy | Thermal-adaptive polymer skin, sub-micron linear micro-actuators |
| **BONE** | `CL570-wn1.2aer` | Calcium Composite, Cast Chrome Alloy | Electro-active red artificial muscle bundles, 18-axis biomorphic flexion |

---

## ✨ Key Features

- **3D Upward-Rotated Carousel:** Showcases upright anatomical hand specimens with smooth 3D perspective depth (`rotateY(\pm 26^\circ)`), dynamic scaling, and side blur isolation.
- **Header-Linked Category Synchronization:** Clicking `ROCK`, `SKIN`, or `BONE` in the top header dynamically triggers custom event dispatching that instantly synchronizes the active 3D carousel index and scrolls smoothly to the showcase.
- **Swiss Editorial Typography:** Styled with slash-separated metadata blocks inspired by high-fashion technical lookbooks (ASICS x BEAMS / GORE-TEX).
- **Floating iOS Liquid Glass Header:** Frosted dark pill (`backdrop-blur-[6px]`) featuring the bold extended `MECHHAND` logo (Syne 800) and fluid transparent account portal.
- **Zero Distortions:** Strict aspect ratio preservation (`object-contain`) for ultra-high-resolution transparent PNG cutouts.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (Turbopack, App Router)
- **UI & Components:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Typography:** Syne (Google Fonts), Helvetica Neue, Grotesque
- **Deployment:** [Vercel](https://vercel.com/)

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 20+ or Node.js 22+
- npm, pnpm, or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/arnwdeep/MechHand.git

# Navigate to frontend
cd MechHand/frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3005](http://localhost:3005) in your browser.

### Production Build

```bash
# Build optimized static bundle
npm run build

# Start production server
npm start
```

---

## 📁 Repository Structure

```
shree-rani-gehna/
├── README.md                     # Comprehensive project documentation
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx        # Root layout with Syne font injection
│   │   │   ├── page.tsx          # Unboxed editorial layout & section assemblies
│   │   │   └── globals.css       # Global styles and resets
│   │   ├── components/
│   │   │   ├── Header.tsx        # Floating liquid header & dynamic category controls
│   │   │   └── home/
│   │   │       ├── HandHeroVideo.tsx    # Dual-video liquid cursor mask
│   │   │       └── Hand3DCarousel.tsx   # 3D interactive hand stage with slash metadata
│   │   └── lib/
│   │       └── cart.tsx          # Client store architecture
│   └── public/
│       └── media/
│           ├── brand-logo.png
│           ├── hero/             # High-definition video assets
│           ├── icons/            # 3D chrome interface icons
│           └── hands/            # Full-resolution transparent hand cutouts
```

---

## 📄 License

&copy; 2026 MECHHAND. All Rights Reserved. Stockists: Dover Street Market (London, Ginza, New York) & DSML E-Shop.
