# DigitalArs — Billetera Virtual

> **Proyecto:** Billetera Virtual (Digital Wallet) para la aceleración técnica en **Alchemie Acceleration Tech**.  
> **Equipo:** **Squad-stack** — Emmanuel, Andrés, Micaela y Máximo.

---

## 1. Introducción y Propósito del Proyecto

**DigitalArs** es una plataforma de billetera digital orientada a la gestión financiera de usuarios particulares y corporativos. La aplicación permite consultar saldos en tiempo real, visualizar el histórico de movimientos transaccionales categorizados, realizar transferencias atómicas entre cuentas y acreditar fondos de forma ágil y segura. 

El presente repositorio contiene la aplicación **Frontend Single Page Application (SPA)**, desarrollada con estándares profesionales de ingeniería de interfaz de usuario (UI), arquitectura orientada a componentes, fidelidad pixel-perfect a los lineamientos de diseño de Figma y un motor de animaciones y microinteracciones fluidas.

---

## 2. Documentación Técnica de UI y Stack Tecnológico

La selección tecnológica fue concebida para balancear robustez empresarial, accesibilidad, desempeño de renderizado en milisegundos y una experiencia visual refinada inspirada en productos bancarios modernos.

### 2.1. Arquitectura de Tecnologías del Frontend

| Tecnología / Librería | Versión | Rol y Justificación Técnica en el Proyecto |
| :--- | :---: | :--- |
| **[React](https://react.dev/)** | `19` | **Librería Troncal de Interfaz**: Implementa la arquitectura reactiva basada en componentes funcionales desacoplados. Gestiona el ciclo de vida y los estados de la aplicación mediante hooks nativos (`useState`, `useEffect`, `useCallback`, `useMemo`, `useContext`), asegurando un árbol de renderizado optimizado e inmutable. |
| **[Vite](https://vite.dev/)** | `8` | **Tooling & Bundler de Próxima Generación**: Provee un entorno de desarrollo de alta velocidad basado en módulos ES nativos (ESM) y *Hot Module Replacement* (HMR) ultrarrápido. En producción, empaqueta activos optimizados con división de código (*code-splitting*) y compilaciones completas en menos de 400ms. |
| **[Material UI (MUI)](https://mui.com/)** | `v6 / v9` | **Sistema de Componentes Estructurales y Accesibilidad**: Proporciona los bloques fundamentales de la interfaz (`Box`, `Grid`, `Card`, `Typography`, `Button`, `Dialog`, `TextField`, `Skeleton`, `Snackbar`, `Badge`). Facilita un diseño coherente y parametrizable mediante la prop `sx={{ ... }}`, eliminando hojas de estilo desordenadas y garantizando cumplimiento de estándares WAI-ARIA. |
| **[@emotion/react & styled](https://emotion.sh/)** | `11` | **Motor de CSS-in-JS**: Administra la inyección dinámica de estilos en el DOM en tiempo de ejecución, gestionando el cómputo de especificidades CSS y el soporte de temas customizables. |
| **[@mui/icons-material](https://mui.com/material-ui/material-icons/)** | `v6 / v9` | **Catálogo de Iconografía Vectorial**: Biblioteca unificada de glifos SVG vectoriales optimizados para la barra lateral (navegación), indicadores de estado, accesos directos y categorización de movimientos financieros. |
| **[Motion (motion.dev)](https://motion.dev/) / Framer Motion** | `13` | **Motor de Animaciones y Físicas Declarativas**: Orquesta microinteracciones orgánicas mediante físicas de resorte (*spring physics*), retroalimentación táctil de pulsación (`whileTap`), elevaciones dinámicas al posar el cursor (`whileHover`), animación en keyframes de alertas y entradas escalonadas (*staggered delays*). |
| **[React Bits](https://reactbits.dev/)** | *Design Patterns* | **Catálogo de Patrones Visuales Avanzados**: Referencia de diseño para componentes fintech de alto impacto visual, integrando tarjetas con resplandor focal (*Glow Spotlight*), efectos de levitación de tarjetas (*Card Hover Lift*), microinteracciones en badges y transiciones direccionales en listas. |
| **[Tailwind CSS](https://tailwindcss.com/)** | `v4` | **Utilidades CSS de Maquetación**: Complementa el sistema estructural de Material UI con utilidades de espaciado granular, micro-alineaciones responsivas y flexbox/grid ágil sin sobrecarga de especificidad. |
| **[Axios](https://axios-http.com/)** | `1.20` | **Cliente de Comunicación HTTP**: Centraliza la capa de consumo hacia el backend mediante una instancia singleton (`src/services/api.js`). Incorpora interceptores automáticos de petición (inyección del encabezado `Authorization: Bearer <token>`) y de respuesta (detección del código `401 Unauthorized` para expiración y cierre de sesión). |
| **[React Router DOM](https://reactrouter.com/)** | `7` | **Enrutador Declarativo SPA**: Gestiona el enrutamiento del lado del cliente sin recargas de página, historial de navegación por URL y orquestación de rutas públicas y protegidas. |
| **Vite Environment Variables** | *Nativo* | **Aislamiento de Configuraciones**: Manejo desacoplado de variables de entorno mediante `import.meta.env.VITE_API_URL`, permitiendo intercalar entre entornos locales y productivos sin alterar código fuente. |

---

## 3. Especificación de Diseño de UI (Figma Design System)

La interfaz fue diseñada respetando una paleta cromática sobria y tecnológica con contrastes intencionales para jerarquizar datos monetarios y de seguridad.

### 3.1. Tokens de Color

* **Primario Institucional (Brand Primary):**
  - Degradado principal: `linear-gradient(135deg, #0056D2 0%, #0066FF 60%, #0077FF 100%)`.
  - Azul sólido de acción: `#0056D2` (hover: `#0047B3`).
* **Superficies y Fondos:**
  - Fondo de aplicación Desktop: `#F8FAFC` (Slate 50).
  - Fondo de navegación / Header Mobile: `#001639` / `#02122c` (Navy Blue profundo).
  - Contenedores y Tarjetas: `#FFFFFF` con borde `1px solid #E2E8F0` y radio de `16px` a `20px`.
* **Semántica Financiera:**
  - **Ingresos / Tendencia Positiva:** Verde esmeralda `#10B981` (texto) con cápsula contenedora `#E6F9F0` y badge `#C6F6D5` con texto `#047857` (`↗ +2.4%`).
  - **Egresos / Gastos:** Tono carbón `#0F172A` con cápsula gris neutra `#F1F5F9`.
  - **Alertas / Notificaciones:** Rojo carmesí `#EF4444` para badges e indicadores críticos.

### 3.2. Tipografía y Jerarquía Visual

* **Familia Tipográfica:** Inter, Roboto, sans-serif.
* **Escala de Jerarquía:**
  - **Saldo Entero:** `2.9rem` (`font-weight: 800`), tracking `-0.03em`.
  - **Saldo Decimal:** `1.6rem` (`font-weight: 700`), opacidad al 90%.
  - **Título de Usuario:** `2.1rem` en Desktop / `1.75rem` en Mobile (`font-weight: 800`).
  - **Montos de Transacción:** `1.05rem` (`font-weight: 800`).
  - **Subtítulos y Metadatos:** `0.75rem` - `0.85rem` (`#64748B`, `font-weight: 500`).

---

## 4. Catálogo de Microinteracciones y Efectos

Para asegurar una experiencia táctil y visual dinámica, los componentes implementan efectos basados en las guías de **[motion.dev](https://motion.dev/)** y los patrones de **[reactbits.dev](https://reactbits.dev/)**:

1. **Levitación y Resplandor en Tarjeta de Saldo (`BalanceCard`):**
   - Entrada suave con opacidad y desplazamiento vertical (`initial={{ opacity: 0, y: 18 }}`).
   - Elevación al hover (`y: -5px`) con expansión de sombra perimetral azul.
   - Resplandor radial difuminado (*Spotlight Glow*) en la esquina superior derecha.
   - Micro-escalado en el badge de rendimiento (`whileHover={{ scale: 1.08 }}`).
2. **Físicas de Pulsación en Accesos Rápidos (`QuickActions`):**
   - Feedback táctil al presionar con compresión elástica (`whileTap={{ scale: 0.96 }}`).
   - Entrada escalonada en cascada (*Stagger delay*): cada botón ingresa sucesivamente con `delay: index * 0.06s`.
3. **Selección Activa en Movimientos (`RecentActivity`):**
   - Desplazamiento horizontal interactivo (`whileHover={{ x: 4 }}`) con cambio de fondo suave para destacar el movimiento seleccionado.
   - Entrada progresiva de transacciones desde la izquierda.
4. **Repique de Campana en Navegación (`DashboardNavbar`):**
   - Secuencia de fotogramas clave (*Keyframe wiggle*): `whileHover={{ rotate: [0, -12, 12, -6, 6, 0] }}` simulando el timbre de una campana real.
5. **Navegación Lateral Dinámica (`Sidebar`):**
   - Desplazamiento al hover en ítems de menú (`whileHover={{ x: 4 }}`) y compresión táctil (`whileTap={{ scale: 0.98 }}`).

> 📄 **Documentación Detallada de Efectos:**  
> Consulta el desglose técnico completo con fragmentos de código comentados en:  
> 👉 **[`docs/dashboard-ui-effects.md`](file:///E:/repos/Squad-stack-Frontend/docs/dashboard-ui-effects.md)**

---

## 5. Arquitectura del Repositorio

El proyecto sigue una estructura limpia, desacoplada por responsabilidades y libre de plomería técnica (*zero-plumbing*):

```text
Squad-stack-Frontend/
├── docs/
│   └── dashboard-ui-effects.md   # Documentación exhaustiva de componentes y efectos UI
├── public/                       # Activos públicos estáticos
├── src/
│   ├── assets/                   # Recursos gráficos
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── BalanceCard.jsx   # Tarjeta de saldo destacada con glow y físicas
│   │   │   ├── QuickActions.jsx  # Grid 2x2 / 1x4 de accesos directos con feedback
│   │   │   └── RecentActivity.jsx # Listado de últimos 5 movimientos con badges
│   │   └── layout/
│   │       ├── DashboardNavbar.jsx # Barra superior con pestañas y campana animada
│   │       ├── MobileBottomNav.jsx # Barra fija inferior con cápsula de navegación móvil
│   │       └── Sidebar.jsx       # Barra lateral fija de navegación (Desktop)
│   ├── context/                  # Estados globales con Context API
│   ├── hooks/                    # Custom hooks reutilizables
│   ├── pages/
│   │   └── Dashboard/
│   │       └── DashboardPage.jsx # Página orquestadora del Dashboard (Desktop y Mobile)
│   ├── services/
│   │   ├── accountService.js     # Consumo de cuentas, saldo y depósitos
│   │   ├── transactionService.js # Consumo de transacciones e historial paginado
│   │   └── api.js                # Cliente Axios singleton con interceptores JWT y 401
│   ├── theme/
│   │   └── theme.js              # Configuración y tokens del tema Material UI
│   ├── App.css                   # Estilos auxiliares
│   ├── App.jsx                   # Enrutador principal de la aplicación
│   ├── index.css                 # Reset global de ventana (100vw / 100vh)
│   └── main.jsx                  # Punto de entrada de la aplicación Vite
├── .env                          # Variables de entorno locales
├── index.html                    # Documento HTML raíz
├── package.json                  # Definición de dependencias y scripts
└── vite.config.js                # Configuración de compilación Vite
```

---

---

## 6. Instalación y Puesta en Marcha

### Prerrequisitos
* Node.js v18.0.0 o superior
* npm v9.0.0 o superior
* Backend DigitalArs (.NET 10) corriendo en `http://localhost:5065`

### Pasos de Ejecución

```bash
# 1. Clonar o posicionarse en el repositorio de Frontend
cd E:\repos\Squad-stack-Frontend

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor en modo desarrollo con HMR
npm run dev

# 4. Compilar para producción (optimización Rollup)
npm run build
```

La aplicación estará disponible de forma predeterminada en `http://localhost:5173`.
