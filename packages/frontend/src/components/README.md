CockpitPreview component

Este archivo `CockpitPreview.tsx` es una vista autónoma de la UI del Cockpit
ECONEURA.

Uso:

import CockpitPreview from "./components/CockpitPreview";

function Page(){ return <CockpitPreview />; }

Notas:

- No modifica rutas de la app principal. Si quieres que sea la vista por
  defecto, sustituye el import en `apps/web/src/App.tsx`.
- Requiere soporte browser (localStorage, fetch, speechSynthesis) — en SSR
  renderizado será estático.
- Para pruebas locales ejecuta desde la raíz: `pnpm --filter ./apps/web dev` o
  `npm run dev --workspace=apps/web` según tu flujo.
