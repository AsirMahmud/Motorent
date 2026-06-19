# RemoteRecruit - Features Page

Responsive React implementation of the RemoteRecruit features/home page from the supplied Figma design.

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Lucide React icons

## Getting Started

```bash
npm install
npm run dev
```

The local app will run at the URL printed by Vite, usually:

```bash
http://127.0.0.1:5173
```

## Build

```bash
npm run build
npm run preview
```

## Notes

- Figma image assets used by the page are exported into `public/assets`.
- The layout is component-based, with reusable sections for features, FAQ, pricing cards, CTA, footer, and scroll-to-top behavior.
- Section reveal animations are disabled automatically when the user has reduced motion enabled.
- The repository is ready to deploy on Vercel, Netlify, or any static host that supports Vite.
