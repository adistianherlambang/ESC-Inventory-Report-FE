# ESC-Inventory-Report-FE (fe2)

A React + Vite frontend for Semarang Cell features and admin pages. Built with Vite, React, Ant Design, Firebase, Zustand and utility libraries (Axios, Recharts, xlsx-js-style).

---

## 🚀 Quick start

**Prerequisites:**
- Node.js (>= 18 recommended)
- npm or yarn

**Setup:**
```bash
# install dependencies
npm install

# start dev server (available on local network)
npm run dev
```

**Build & preview:**
```bash
# build for production
npm run build

# locally preview production build
npm run preview
```

**Linting & formatting:**
```bash
# run ESLint
npm run lint

# format with Prettier
npm run format
```

---

## ⚙️ Environment & Firebase

This project reads Firebase config from environment variables (Vite env):
- `VITE_API_KEY`
- `VITE_AUTH_DOMAIN`
- `VITE_PROJECT_ID`
- `VITE_STORAGE_BUCKET`
- `VITE_MESSAGING_SENDERID`
- `VITE_APPID`
- `VITE_MEASUREMENTID`

Create a `.env` file in the project root or set the variables in your hosting provider. Example `.env`:
```
VITE_API_KEY=your_api_key
VITE_AUTH_DOMAIN=your_auth_domain
VITE_PROJECT_ID=your_project_id
VITE_STORAGE_BUCKET=your_storage_bucket
VITE_MESSAGING_SENDERID=your_messaging_sender_id
VITE_APPID=your_app_id
VITE_MEASUREMENTID=your_measurement_id
```

The Firebase client is set up in `firebase.js` and exposes `db` for Firestore access.

---

## 📁 Project structure (key folders)

- `src/` - main application source
  - `components/` - reusable UI pieces
  - `page/` - page-level components (admin, fl, pmt, login, etc.)
  - `assets/`, `styles/` - static assets and styling
- `public/` - static public files

---

## 🧩 Notable libraries

- React, Vite
- Ant Design (`antd`) for UI
- Firebase (Firestore)
- Zustand for state
- Axios for HTTP requests
- Recharts for charts
- xlsx-js-style for Excel export

---

## 🖥️ Deployment

Build with `npm run build` and serve the `dist` folder from any static host (Vercel, Netlify, S3, etc.). Ensure your hosting provider exposes Vite environment variables (prefixed with `VITE_`) or inject them during build.

---

## 💡 Tips

- Use `npm run lint` and `npm run format` before commits.
- If adding new environment keys, prefix them with `VITE_` for Vite to expose them to the client.

---

## 📜 License & Contribution

This repository is private. Add a `CONTRIBUTING.md` and a license if you make it public.

---

If you'd like, I can also add a `.env.example`, `CONTRIBUTING.md`, or a CI workflow for linting and building—tell me which you prefer next.
