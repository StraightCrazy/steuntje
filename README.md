# Steuntje 🌱

**Steuntje** is een kleine, rustige Progressive Web App (PWA) die je elke dag een warm moment van mentale steun geeft.  
Geen accounts, geen druk — gewoon even ademruimte.

🌍 Live: https://steuntje.vercel.app

---

## ✨ Wat is Steuntje?

- Dagelijks een **steuntje van de dag**
- Zachte, menselijke teksten
- Een kleine **mini-actie** die je meteen kan doen
- Mogelijkheid om te delen met iemand die het kan gebruiken
- Extra steun via AI wanneer je je gevoel neerschrijft

Steuntje is gemaakt om licht te zijn — in je hoofd én op je scherm.

---

## 📱 Progressive Web App (PWA)

Steuntje is een echte PWA:

- Installeren op **iPhone, Android, tablet en desktop**
- Werkt fullscreen, als een echte app
- Automatische updates bij nieuwe versies
- Eigen app-icoon en splash screens

### Installeren
- **iPhone (Safari)**: Deel → *Zet op beginscherm*
- **Android / Chrome**: *Installeren* of *Add to Home Screen*

---

## 🛠️ Technische stack

- **Next.js (App Router)**
- **TypeScript**
- **Supabase** (optioneel, voor dagsteuntjes)
- **Vercel** (hosting & deploy)
- **PWA manifest & service worker**

---

## 🧠 Data & fallback

- Als Supabase beschikbaar is → toont dagsteuntje uit database
- Zonder Supabase → slimme fallback op basis van datum & thema
- App blijft altijd werken (ook offline-first gedrag)

---

## ⚙️ Lokale setup

### 1. Install dependencies

```bash
npm install
