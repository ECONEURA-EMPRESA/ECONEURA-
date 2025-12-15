# 🏗️ ECONEURA Frontend Architecture Guide

## 📁 Estructura de Estilos

```
src/
├── index.css                    # ⚠️ GLOBAL - Solo reset y tokens
├── styles/
│   ├── tokens.css              # ⚠️ CRÍTICO - Variables CSS compartidas
│   └── cockpit.module.css      # 🔒 AISLADO - Solo Cockpit
└── pages/
    └── Login/
        └── login.module.css    # 🔒 AISLADO - Solo Login
```

## 📁 Estructura de Componentes del Cockpit

```
src/components/cockpit/
├── index.ts              # Barrel export
├── AgentCard.tsx         # Tarjeta de agente con ejecución
├── NewAgentCard.tsx      # Tarjeta para crear agentes
├── FooterComponent.tsx   # Footer global
└── OrgChart.tsx          # Vista de organigrama
```

## 🚦 Reglas de Modificación

### ✅ SEGURO MODIFICAR (Bajo Riesgo)
| Archivo | Afecta a |
|---------|----------|
| `login.module.css` | Solo Login |
| `cockpit.module.css` | Solo Cockpit |
| `LoginView.tsx` | Solo Login |
| Componentes en `pages/Cockpit/` | Solo Cockpit |

### ⚠️ MODIFICAR CON CUIDADO (Riesgo Medio)
| Archivo | Afecta a | Acción |
|---------|----------|--------|
| `tokens.css` | Todo | Probar Login Y Cockpit |
| `index.css` | Todo | Probar Login Y Cockpit |
| `App.tsx` | Todo | Probar routing completo |

### 🚫 NO TOCAR SIN REVISIÓN (Alto Riesgo)
| Archivo | Razón |
|---------|-------|
| `tailwind.config.js` | Rompe todos los estilos |
| `vite.config.ts` | Rompe el build |
| `tsconfig.json` | Rompe TypeScript |

## 🎨 Uso de CSS Modules

### En Login:
```tsx
import styles from './login.module.css';

function LoginView() {
  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        {/* Login content */}
      </div>
    </div>
  );
}
```

### En Cockpit:
```tsx
import styles from '../../styles/cockpit.module.css';

function CockpitShell() {
  return (
    <div className={styles.cockpitContainer}>
      <aside className={styles.sidebar}>
        {/* Sidebar */}
      </aside>
      <main className={styles.mainContent}>
        {/* Content */}
      </main>
    </div>
  );
}
```

## 🔢 Uso de Design Tokens

Los tokens están disponibles como variables CSS en toda la app:

```css
.myComponent {
  background: var(--color-bg-card);
  color: var(--color-text-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  transition: all var(--transition-normal);
}
```

## ✅ Checklist Antes de Modificar Estilos

- [ ] ¿Qué componente estoy editando? (Login / Cockpit / Ambos)
- [ ] ¿Estoy usando el CSS Module correcto?
- [ ] ¿Estoy usando tokens en vez de valores hardcodeados?
- [ ] ¿He probado AMBAS vistas después del cambio?
