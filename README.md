# EcoTrack AI – Carbon Footprint Awareness Platform

EcoTrack AI is a production-ready, full-stack climate-tech web application designed to help citizens and teams calculate, visualize, audit, and reduce their carbon footprints through deterministic scientific models combined with real-time AI recommendations.

---

## 🌟 Core Features

### 1. Carbon Footprint Auditing Form
- Multi-step interactive slider form (Transportation commuted, Home power utilities, Nutrient patterns, Aviation, Water).
- Strong validation models matching constraints via **Zod schema** and **React-Hook-Form**.
- Immediate, real-time yearly carbon estimations updated synchronously before report submission.

### 2. Personal Cockpit Dashboard
- Segmented CO₂ aggregates (Daily, Monthly, and Annual summaries) compared with sustainable target baselines.
- Premium circular **Sustainability Score Gauge** dynamically colored by Tier Rating (A to E).
- **AI insights Panel** backed by server-side **Gemini 3.5-flash** proxy (gracefully fallbacks to deterministic recommendations if offline or non-authenticated).
- Checkable progress targets with persistent credit modifiers.

### 3. Advanced Climate Analytics
- **Pie Charts** presenting component carbon sources.
- **Timeline Area Plots** logging monthly/weekly progress trajectories.
- **[HACKATHON EXCLUSIVE] Climate-Tech Scenario Sandbox**: Drag sliders to preview lifestyle adjustments (Clean grid mix, active commuting) side-by-side with baselines in live Recharts bars.

### 4. Planet Planner & gamified Badges
- Target milestone anchors to reduce emissions by 5%, 15%, or 30%.
- **[HACKATHON EXCLUSIVE] Certified Offsets Simulator**: Interactively sponsor verified bio-char sequestration or sea-meadow restorations to drop Net Footprints.
- Persistent local-storage badges registry tracking citizen progressions.

### 5. Sustainability Hub & Trivia Library
- Searchable and categorized tip database (Energy, Diet, Transport, Water, Offsets).
- Implementation difficulty filters paired with interactive commitments contributing directly to the global savings pool.

---

## 🛠️ Technical Stack & Architecture

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, Framer Motion
- **Charts Engine**: Recharts (fully responsive, custom tooltips)
- **Validation**: React Hook Form with Zod Resolvers
- **Backend**: Node.js, Express, tsx
- **AI Auditor**: Google GenAI TypeScript SDK (Gemini 3.5-flash)
- **Local Persistence**: Durable HTML5 Local Storage serialization

---

## 📂 Project Structure

```text
├── server.ts                 # Full-stack Custom Express Server (Gemini Proxy)
├── metadata.json             # Applet permission indicators
├── package.json              # System package scripts and versions
├── index.html                # Page entrypoint
├── src/
│   ├── main.tsx              # React mounting root
│   ├── App.tsx               # Central UI routing and local-storage orchestrator
│   ├── types.ts              # Strict TypeScript models
│   ├── index.css             # Tailwind style configuration
│   ├── components/
│   │   ├── Header.tsx        # Logo, aggregate savings ticker, active switches
│   │   ├── Dashboard.tsx     # Cockpit, score gauge, Gemini panel
│   │   ├── Calculator.tsx   # Multi-step audit forms
│   │   ├── Analytics.tsx     # Double bar comparisons and scenario sandboxes
│   │   ├── Planner.tsx       # Goals, offsets, unlocked badge showcase
│   │   └── TipsLibrary.tsx   # Searchable tips and community commitments
│   └── utils/
│       └── carbonCalculator.ts  # Scientific factors and local deterministic fallbacks
```

---

## ⚙️ How to Install & Configure Locally

1. **Clone and Navigate**:
   ```bash
   git clone <repo_url>
   cd ecotrack-ai
   ```

2. **Install Base Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment secrets**:
   Create a local `.env` matching `.env.example`:
   ```env
   GEMINI_API_KEY="your_actual_gemini_api_key"
   APP_URL="http://localhost:3000"
   ```

4. **Launch development environment**:
   ```bash
   npm run dev
   ```

5. **Compile for production**:
   ```bash
   npm run build
   ```

6. **Boot production container**:
   ```bash
   npm run start
   ```

---

## 📈 Scientific Multipliers Used

| Component | Daily/Monthly Unit | Emission Metric | Target Goal |
| :--- | :--- | :--- | :--- |
| **Gas Vehicles** | km / day | 0.18 kg CO₂ / km | Zero-emissions walking or cycling swaps |
| **EV Vehicles** | km / day | 0.05 kg CO₂ / km | Recharge via midday solar Peaks |
| **Power Grid** | kWh / month | 0.40 kg CO₂ / kWh | Community renewable solar schemes |
| **Meat Diet** | Annual | 1,460 kg CO₂ / yr | Shift to vegetarian or Meatless Mondays |
| **Airlines** | Flights / yr | 500 kg CO₂ / Flight | Sponsor verified blue-carbon offsets |

---

## 📜 License

Distributed under the Apache-2.0 License. See the corporate manifest headers inside main entrypoints for context.
