# DigitalArs — Billetera Virtual (Frontend)

Aplicación web SPA moderna desarrollada para la billetera virtual **DigitalArs**. La plataforma permite a los usuarios gestionar su dinero, visualizar su saldo y últimos movimientos, realizar depósitos y transferencias a terceros, con un diseño fiel a las especificaciones oficiales de **Figma** (resoluciones Desktop y Mobile).

---

## 🛠️ Tecnologías Utilizadas y su Propósito en el Proyecto

A continuación se detallan todas las tecnologías que componen el proyecto, las que se discutieron para la arquitectura y el rol específico que cumple cada una:

| Tecnología / Librería | Versión | ¿Para qué se usa en el proyecto? |
| :--- | :---: | :--- |
| **[React](https://react.dev/)** | `19` | **Biblioteca base de UI**: Permite construir la aplicación como una Single Page Application (SPA) basada en componentes funcionales reactivos, gestión de estado local y global (`useState`, `useEffect`, `useCallback`, `useContext`) y renderizado inmutable del DOM virtual. |
| **[Vite](https://vite.dev/)** | `8` | **Herramienta de compilación y empaquetado (Bundler)**: Provee un entorno de desarrollo ultrarrápido con *Hot Module Replacement* (HMR instantáneo) y genera compilaciones de producción altamente optimizadas mediante Rollup/Rolldown en milisegundos (< 400ms). |
| **[Material UI (MUI)](https://mui.com/)** | `v6 / v9` | **Sistema de componentes estructurales y accesibles**: Provee los bloques de construcción troncales de la interfaz (`Box`, `Grid`, `Card`, `Typography`, `Button`, `TextField`, `Dialog`, `Skeleton`, `Snackbar`, `Badge`). Utiliza la propiedad `sx={{ ... }}` integrada al tema para un estilizado robusto y tipado. |
| **[@emotion/react & styled](https://emotion.sh/)** | `11` | **Motor de estilos CSS-in-JS**: Provee la infraestructura de inyección dinámica de estilos en tiempo de ejecución para Material UI y el soporte de temas personalizados. |
| **[@mui/icons-material](https://mui.com/material-ui/material-icons/)** | `v6 / v9` | **Iconografía oficial del sistema**: Provee los íconos vectoriales SVG para la barra lateral (Inicio, Historial, Tarjetas, Perfil), cabecera (notificaciones, avatar), acciones rápidas (Depositar, Transferir, Escanear, Servicios) y tipos de transacción (compras, café, recibos). |
| **[Motion (motion.dev)](https://motion.dev/) / Framer Motion** | `13` | **Motor de animaciones y físicas interactivas**: Se utiliza para dar vida a la interfaz mediante transiciones fluidas de entrada, físicas de resorte suaves (*springs*), microinteracciones al pasar el mouse (`whileHover`), feedback táctil de pulsación (`whileTap`) y animación de campana de notificaciones. |
| **[React Bits](https://reactbits.dev/)** | *Patrones de diseño* | **Catálogo de inspiración de patrones UI**: Se utiliza como referencia estética para componentes fintech modernos: tarjetas levitantes con elevación dinámica, resplandor radial decorativo (*Spotlight Glow*), microinteracciones en badges de tendencia (`+2.4%`) y animaciones escalonadas en listas. |
| **[Tailwind CSS](https://tailwindcss.com/)** | `v4` | **Clases utilitarias de layout**: Utilizado para layouting ágil, alineaciones responsivas (`flex`, `grid`, `items-center`), espaciados granulares y control rápido de visualización en conjunto con los componentes estructurados de MUI. |
| **[Axios](https://axios-http.com/)** | `1.20` | **Cliente HTTP centralizado**: Gestiona toda la comunicación con la API REST de .NET 10 mediante una instancia única (`src/services/api.js`). Incluye **interceptor de Request** (inyección automática del token Bearer) e **interceptor de Response** (captura de errores 401 para expiración y cierre de sesión). |
| **[React Router DOM](https://reactrouter.com/)** | `7` | **Enrutador del lado del cliente (SPA)**: Controla la navegación sin recarga de página entre el Dashboard (`/`), Historial (`/historial`), Login (`/login`) y vistas futuras. |
| **Dotenv / Vite Env (`import.meta.env`)** | *Nativo* | **Gestión segura de variables de entorno**: Permite configurar de forma desacoplada la URL del backend (`VITE_API_URL=http://localhost:5065/api`) facilitando el cambio entre entornos local, pruebas y producción. |

---

## 📑 Documentación de la Pantalla del Dashboard (HU-24) y Efectos

Para consultar el desglose exhaustivo de **qué se utiliza en cada sección del Dashboard** (Sidebar, Navbar, BalanceCard, QuickActions, RecentActivity y MobileBottomNav), el catálogo completo de efectos aplicados, de dónde fueron extraídos y cómo funcionan en el código, consulta el documento técnico formal:

👉 **[docs/dashboard-ui-effects.md](file:///E:/repos/Squad-stack-Frontend/docs/dashboard-ui-effects.md)**

---

## 🎨 Especificación de Diseño y Criterios de Aceptación

### HU-24: Dashboard de la Billetera (Figma 1:1)

* **Tarjeta Destacada de Saldo (`BalanceCard`)**:
  - Saldo formateado en moneda argentina (`$45,230.50`).
  - Degradado azul oficial `linear-gradient(135deg, #0056D2 0%, #0066FF 60%, #0077FF 100%)`.
  - Badge de variación porcentual verde neón (`↗ +2.4%`).
  - Máscara de tarjeta `"DigitalArs Card **** 4892"` y esferas entrelazadas en transparencia.
  - Efecto hover de levitación física y resplandor radial translúcido.

* **Accesos Directos (`QuickActions`)**:
  - 4 accesos rápidos: **Depositar**, **Transferir**, **Escanear** y **Servicios**.
  - En Desktop: 4 tarjetas blancas con elevación al hover y físicas de pulsación.
  - En Mobile: Fila superior de *Depositar* y *Transferir* en azul primario sólido (`#0056D2`), y fila inferior de *Escanear* y *Servicios* en blanco contorneado.
  - Diálogos modales interactivos para realizar depósitos y transferencias en el momento.

* **Actividad Reciente (`RecentActivity`)**:
  - Muestra los últimos movimientos obtenidos de `GET /api/transactions/me?page=1&pageSize=5`.
  - **Ingresos**: Resaltados en verde esmeralda (`#10B981`) con signo positivo (`+$15,000.00`) e ícono en cápsula `#E6F9F0`.
  - **Egresos**: Formateados en tono oscuro (`#0F172A`) con signo negativo (`-$1,250.00`) e íconos temáticos de compras o servicios.
  - En Desktop: Contenedor con divisores y desplazamiento lateral al hover (`x: 4px`).
  - En Mobile: Renderizado en **tarjetas individuales separadas** con borde (`borderRadius: 16px`).

* **Navegación Desktop & Mobile**:
  - **Desktop**: Barra lateral izquierda fija (`#02122c`) con enlaces a Inicio, Historial, Tarjetas, Perfil, Configuración, Soporte, Ayuda y Cerrar Sesión. Barra superior con pestañas (*Resumen*, *Inversiones*, *Préstamos*) y perfil de usuario.
  - **Mobile**: Cabecera azul marina superior (`#001639`), lámina inferior blanca curvada (`borderRadius: 28px 28px 0 0`) y barra de navegación fija inferior (`Home`, `History`, `Profile`, `Settings`).

---

## 📂 Estructura del Repositorio

```text
Squad-stack-Frontend/
├── docs/
│   └── dashboard-ui-effects.md   # Desglose formal de componentes y efectos UI
├── public/                       # Recursos estáticos públicos
├── src/
│   ├── assets/                   # Recursos visuales y logos
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── BalanceCard.jsx   # Tarjeta destacada con levitación y glow
│   │   │   ├── QuickActions.jsx  # Grid 2x2 / 1x4 con feedback háptico
│   │   │   └── RecentActivity.jsx # Movimientos con colores y slide al hover
│   │   └── layout/
│   │       ├── DashboardNavbar.jsx # Barra superior con campana animada y perfil
│   │       ├── MobileBottomNav.jsx # Barra fija inferior para móvil
│   │       └── Sidebar.jsx       # Barra lateral fija con menú y cerrar sesión
│   ├── context/                  # Context API para estado global (.gitkeep)
│   ├── hooks/                    # Hooks personalizados reutilizables (.gitkeep)
│   ├── pages/
│   │   └── Dashboard/
│   │       └── DashboardPage.jsx # Página orquestadora del Dashboard (Desktop/Mobile)
│   ├── services/
│   │   ├── accountService.js     # Servicios de cuenta y saldo
│   │   ├── transactionService.js # Servicios de transacciones e historial
│   │   └── api.js                # Instancia única de Axios con interceptores
│   ├── theme/
│   │   └── theme.js              # Configuración de tema base Material UI
│   ├── App.css
│   ├── App.jsx                   # Enrutador base de la aplicación
│   ├── index.css                 # Reset full-window (100vw / 100vh)
│   └── main.jsx                  # Entrada principal Vite
├── .env                          # Variables de entorno locales
├── .env.example                  # Plantilla de variables de entorno
├── index.html                    # Documento base HTML
├── package.json                  # Dependencias y scripts
└── vite.config.js                # Configuración de Vite y plugins
```

---

## 🚀 Puesta en Marcha

### Requisitos
- Node.js v18 o superior
- Backend .NET 10 corriendo en `http://localhost:5065`

### Comandos

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar el servidor de desarrollo
npm run dev
```

La aplicación se ejecutará en `http://localhost:5173`.
