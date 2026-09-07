# DigitalArs — Billetera Virtual (Frontend SPA)

> **Proyecto:** Billetera Virtual / Digital Wallet  
> **Programa:** Aceleración Técnica en **Alchemie Acceleration Tech**  
> **Equipo:** **Squad-stack** — Emmanuel, Andrés, Micaela y Máximo  
> **Stack Principal:** React 19 | Vite 8 | Material UI v9 | Framer Motion | Tailwind CSS v4 | Axios  

---

## 1. Introducción y Propósito del Proyecto

**DigitalArs** es una aplicación web Single Page Application (SPA) para la gestión financiera integral de usuarios particulares y corporativos. La interfaz permite consultar saldos en tiempo real, realizar transferencias de dinero entre cuentas con emisión de comprobante bancario, acreditar depósitos, simular y constituir inversiones a plazo fijo, emitir y administrar tarjetas de crédito/débito virtuales y físicas con efectos 3D, consultar el historial de movimientos paginado con filtros avanzados y gestionar usuarios desde un panel de control para administradores.

El frontend fue desarrollado siguiendo estrictos estándares de ingeniería de software, arquitectura orientada a componentes desacoplados, fidelidad pixel-perfect a los lineamientos de diseño en Figma y una experiencia visual enriquecida con animaciones y microinteracciones fluidas.

---

## 2. Stack Tecnológico y Arquitectura Frontend

| Tecnología / Librería | Versión | Rol y Justificación Técnica en el Proyecto |
| :--- | :---: | :--- |
| **[React](https://react.dev/)** | `19` | **Librería Troncal de Interfaz**: Arquitectura reactiva basada en componentes funcionales desacoplados y hooks modernos (`useState`, `useEffect`, `useCallback`, `useMemo`, `useContext`). |
| **[Vite](https://vite.dev/)** | `8` | **Tooling & Bundler Ultrarrápido**: Entorno de desarrollo con módulos ES nativos (ESM), Hot Module Replacement (HMR < 350ms) y compilación para producción con *code-splitting*. |
| **[Material UI (MUI)](https://mui.com/)** | `v6 / v9` | **Sistema de Componentes Estructurales**: Bloques de interfaz accesibles (`Box`, `Grid`, `Card`, `Typography`, `Button`, `Dialog`, `TextField`, `Skeleton`, `Snackbar`, `Badge`) estilizados mediante `sx` y estandarizados con la API moderna de `slotProps`. |
| **[@emotion/react & styled](https://emotion.sh/)** | `11` | **Motor de CSS-in-JS**: Inyección dinámica y cálculo de especificidades CSS para personalización del tema institucional. |
| **[@mui/icons-material](https://mui.com/material-ui/material-icons/)** | `v6 / v9` | **Catálogo de Iconografía Vectorial**: Glifos SVG optimizados para navegación lateral, categorías de movimientos, tarjetas y alertas. |
| **[Motion (motion.dev)](https://motion.dev/) / Framer Motion** | `13` | **Motor de Animaciones y Físicas Declarativas**: Microinteracciones fluidas con físicas de resorte (*spring physics*), elevación en hover, feedback táctil en tap, repique oscilatorio en campana de notificaciones y volteo 3D de tarjetas. |
| **[Tailwind CSS](https://tailwindcss.com/)** | `v4` | **Utilidades CSS de Maquetación**: Micro-alineaciones responsivas, flexbox y espaciado granular complementario. |
| **[Axios](https://axios-http.com/)** | `1.20` | **Cliente HTTP Centralizado**: Instancia singleton (`src/services/api.js`) con interceptores automáticos para inyección de token JWT (`Authorization: Bearer <token>`) y detección del código `401 Unauthorized` para expiración de sesión. |
| **[React Router DOM](https://reactrouter.com/)** | `7` | **Enrutador Declarativo SPA**: Manejo de rutas públicas, rutas autenticadas protegidas (`ProtectedRoute.jsx`) y control de acceso por roles (`AdminRoute`). |

---

## 3. Especificación de Diseño y Tokens Visuales

### 3.1. Paleta de Colores
* **Primario Institucional (Brand Primary):**
  - Degradado principal: `linear-gradient(135deg, #0056D2 0%, #0066FF 60%, #0077FF 100%)`.
  - Azul sólido de acción: `#0056D2` (Hover: `#0047B3`).
* **Superficies y Fondos:**
  - Fondo de aplicación Desktop: `#F8FAFC` (Slate 50).
  - Fondo de navegación / Header Mobile: `#001639` / `#02122c` (Navy Blue profundo).
  - Contenedores y Tarjetas: `#FFFFFF` con borde sutil `1px solid #E2E8F0` y radio de borde de `16px` a `20px`.
* **Semántica Financiera:**
  - **Ingresos / Acreditaciones:** Verde esmeralda `#10B981` con fondo `#E6F9F0` y badge `#C6F6D5`.
  - **Egresos / Gastos:** Tono carbón `#0F172A` con cápsula gris neutra `#F1F5F9`.
  - **Alertas / Estado Congelado:** Naranja / Rojo carmesí `#EF4444`.

### 3.2. Tipografía y Jerarquía Visual
* **Fuente Principal:** Inter, Roboto, sans-serif.
* **Escala Tipográfica:**
  - **Saldo Principal:** `2.9rem` (`font-weight: 800`), tracking `-0.03em`.
  - **Decimales de Saldo:** `1.6rem` (`font-weight: 700`), opacidad al 90%.
  - **Títulos de Sección:** `1.5rem` - `2.1rem` (`font-weight: 800`).
  - **Montos de Transacción:** `1.05rem` (`font-weight: 800`).
  - **Etiquetas y Metadatos:** `0.75rem` - `0.85rem` (`#64748B`, `font-weight: 500`).

---

## 4. Estructura y Vistas de la Aplicación

```
Squad-stack-Frontend/
├── docs/
│   ├── UI_OPTIMIZATION_REPORT.md   # Reporte consolidado de optimizaciones y mejoras UI
│   └── dashboard-ui-effects.md     # Documentación técnica de microinteracciones
├── public/                         # Activos estáticos públicos
├── src/
│   ├── assets/                     # Recursos gráficos y vectores
│   ├── components/
│   │   ├── common/
│   │   │   ├── EmptyState.jsx      # Estado vacío ilustrado con llamada a la acción
│   │   │   ├── ErrorState.jsx      # Capturador de error con botón de reintento
│   │   │   ├── LoadingSkeleton.jsx # Esqueletos de carga para saldos, tablas y tarjetas
│   │   │   ├── ProtectedRoute.jsx  # Guardián de rutas autenticadas y verificación de rol
│   │   │   └── TransferReceiptModal.jsx # Visualizador y descarga de comprobantes
│   │   ├── dashboard/
│   │   │   ├── BalanceCard.jsx     # Tarjeta de saldo destacada con glow radial y visibilidad
│   │   │   ├── QuickActions.jsx    # Accesos rápidos con físicas táctiles elásticas
│   │   │   └── RecentActivity.jsx  # Listado de últimos movimientos con navegación
│   │   └── layout/
│   │       ├── AppLayout.jsx       # Layout maestro con contenedor adaptativo
│   │       ├── DashboardNavbar.jsx # Barra superior con campana animada y menú de usuario
│   │       ├── MobileBottomNav.jsx # Barra inferior flotante para dispositivos móviles
│   │       └── Sidebar.jsx         # Barra lateral fija Desktop con Drawer móvil coordinado
│   ├── context/
│   │   ├── AccountContext.jsx      # Estado global de saldo, cuenta y recarga reactiva
│   │   └── AuthContext.jsx         # Estado global de autenticación, JWT y rol de usuario
│   ├── pages/
│   │   ├── Admin/
│   │   │   └── AdminUsersPage.jsx  # Panel de administración de usuarios y bloqueo de cuentas
│   │   ├── Cards/
│   │   │   └── CardsPage.jsx       # Emisión, congelamiento y vista 3D de tarjetas
│   │   ├── Dashboard/
│   │   │   └── DashboardPage.jsx   # Tablero principal de billetera
│   │   ├── Deposit/
│   │   │   └── DepositPage.jsx     # Acreditación de fondos propios y comprobante
│   │   ├── History/
│   │   │   └── HistoryPage.jsx     # Historial de transacciones con filtros y paginación
│   │   ├── Investments/
│   │   │   └── InvestmentsPage.jsx # Simulador y constitución de Plazo Fijo con TNA
│   │   ├── Profile/
│   │   │   └── ProfilePage.jsx     # Perfil de usuario y datos personales
│   │   ├── Transfer/
│   │   │   └── TransferPage.jsx    # Transferencias inmediatas con comprobante bancario
│   │   └── Login.jsx               # Pantalla de inicio de sesión y registro
│   ├── services/
│   │   ├── accountService.js       # Consumo de saldos, cuentas y depósitos
│   │   ├── api.js                  # Cliente Axios singleton con interceptores JWT
│   │   ├── authService.js          # Consumo de login, registro y tokens
│   │   ├── cardService.js          # Consumo de tarjetas, emisión y congelamiento
│   │   ├── fixedTermDepositService.js # Consumo de plazos fijos y liquidación
│   │   └── transactionService.js   # Consumo de transferencias e historial paginado
│   ├── theme/
│   │   └── theme.js                # Tokens del tema Material UI y overrides de componentes
│   ├── utils/
│   │   └── formatters.js           # Formateadores monetarios, fechas locales y tarjetas
│   ├── App.jsx                     # Árbol de rutas declarativo
│   ├── main.jsx                    # Punto de entrada de la aplicación
│   └── index.css                   # Resets globales y fuentes
├── .env.example                    # Plantilla de variables de entorno
├── package.json                    # Dependencias y scripts de npm
└── vite.config.js                  # Configuración de compilación Vite
```

---

## 5. Requisitos Previos

* **[Node.js](https://nodejs.org/)** versión `18.0.0` o superior (se recomienda Node 20 LTS o superior).
* **[npm](https://www.npmjs.com/)** versión `9.0.0` o superior.
* **Backend DigitalArs** (.NET 10 API) ejecutándose en `http://localhost:5065`.

---

## 6. Instalación y Puesta en Marcha

### Paso 1: Clonar el Repositorio
```bash
git clone https://github.com/porrettimaximo/Squad-stack-Frontend.git
cd Squad-stack-Frontend
```

### Paso 2: Configurar las Variables de Entorno
Cree un archivo `.env` en la raíz del proyecto basándose en `.env.example`:

```bash
cp .env.example .env
```

Contenido del archivo `.env`:
```env
VITE_API_URL=http://localhost:5065/api
```

### Paso 3: Instalar Dependencias
```bash
npm install
```

### Paso 4: Iniciar el Servidor de Desarrollo
```bash
npm run dev
```

La aplicación estará disponible inmediatamente en `http://localhost:5173`.

### Paso 5: Compilación para Producción (Opcional)
Para validar la compilación y empaquetado optimizado para producción:
```bash
npm run build
npm run preview
```

---

## 7. Credenciales de Prueba

Puede ingresar inmediatamente utilizando cualquiera de los usuarios preconfigurados en el backend:

| Rol | Correo Electrónico | Contraseña | Saldo Inicial | Perfil de Prueba |
| :--- | :--- | :--- | :---: | :--- |
| **Administrador** | `admin@digitalars.com` | `Admin123!` | $500.000,00 | Acceso total al Panel de Administración (`/admin`), gestión de usuarios y bloqueo de cuentas |
| **Usuario Estándar** | `robercarlos3@gmail.com` | `Roberto1!` | $260.000,00 | Operaciones de billetera, transferencias y emisión de tarjetas |
| **Usuario Estándar** | `alejandro.silva@digitalars.com` | `User123!` | $45.230,50 | Usuario con movimientos recientes, transferencias cruzadas y plazos fijos |
| **Usuario Estándar** | `micaela.mulato@digitalars.com` | `User123!` | $320.000,00 | Usuario con alto saldo para simulación de inversiones |
| **Usuario Estándar** | `emmanuel.torres@digitalars.com` | `User123!` | $410.000,00 | Usuario estándar para pruebas de transferencias |

---

## 8. Guía de Funcionalidades Principales

1. **Tablero Principal (Dashboard):**
   - Tarjeta de saldo con botón para ocultar/mostrar importe, cálculo de rendimiento y resplandor dinámico.
   - Accesos rápidos elásticos para depositar, transferir, invertir o gestionar tarjetas.
   - Listado de actividad reciente con categorías visuales de ingresos y egresos.
2. **Depósito de Fondos:**
   - Selección rápida de importes ($5.000, $10.000, $50.000, etc.) o ingreso libre.
   - Generación instantánea de comprobante de depósito con botón de descarga.
3. **Transferencias Inmediatas:**
   - Validación en tiempo real del correo del destinatario y del saldo disponible.
   - Modal de confirmación y generación de comprobante de transferencia bancaria con ID único.
4. **Inversiones a Plazo Fijo:**
   - Calculadora y simulador de rendimiento en tiempo real según plazo seleccionado (30, 60, 90, 180, 365 días) y Tasa Nominal Anual (TNA).
   - Constitución de inversión con débito automático y vista de plazos fijos activos y cancelados.
5. **Tarjetas de Débito y Crédito:**
   - Visualización de tarjetas en formato interactivo 3D con posibilidad de giro para ver CVV y fecha de vencimiento.
   - Emisión instantánea de tarjetas virtuales o físicas.
   - Botón para pausar/congelar tarjetas por seguridad.
6. **Historial de Movimientos:**
   - Tabla y lista interactiva con paginación en servidor.
   - Filtros por tipo de movimiento (todos, depósitos, transferencias enviadas, transferencias recibidas) y rango de fechas.
7. **Panel de Administración (Solo Admins):**
   - Visualización de métricas globales de usuarios.
   - Bloqueo y desbloqueo preventivo de cuentas de usuarios.
   - Modificación de roles y baja lógica de usuarios.

---

## 9. Seguridad y Manejo de Secretos

- El frontend **no almacena claves secretas ni tokens permanentes en código fuente**.
- Las llamadas hacia la API utilizan tokens JWT efímeros almacenados en memoria/`localStorage` e inyectados automáticamente mediante interceptores de Axios.
- El archivo `.env` se encuentra ignorado por `.gitignore`, distribuyéndose únicamente la plantilla `.env.example`.

---

## 10. Documentación Complementaria

- 📄 **[Reporte de Optimización y Mejoras de UI/UX](docs/UI_OPTIMIZATION_REPORT.md)**: Detalle técnico de la migración a `slotProps`, componentes de esqueleto, accesibilidad y diseño responsivo.
- 📄 **[Efectos y Microinteracciones UI](docs/dashboard-ui-effects.md)**: Especificación de animaciones con Motion.
