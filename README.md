# Squad-stack-Frontend — Documentación Técnica y Especificación de UI

> **DigitalArs — Billetera Virtual**  
> Aplicación Frontend SPA desarrollada con **React**, **Vite** y **Material UI (MUI)** para la gestión de cuentas, transferencias y movimientos financieros.

---

## 📑 Historias de Usuario Implementadas

### 1. HU-21: Setup del Proyecto React
- **Objetivo**: Inicialización limpia de la arquitectura y librerías base para construir pantallas sin plomería técnica (*zero-plumbing*).
- **Entregables Base**:
  - Estructura modular: `pages`, `components`, `services`, `context`, `hooks`, `theme`.
  - Instancia única de Axios en `src/services/api.js` con inyección de token Bearer y control de respuestas 401.
  - Enrutamiento SPA con `react-router-dom`.
  - Configuración de variables de entorno `.env` (`VITE_API_URL=http://localhost:5065/api`).

---

### 2. HU-24: Dashboard Principal de la Billetera
- **Descripción de HU**: *Como usuario, quiero ver mi saldo y últimos movimientos al entrar, para tener el estado de mi cuenta de un vistazo.*
- **Diseño de Referencia**: Diseños oficiales de **Figma** (Desktop y Mobile).

#### Criterios de Aceptación Cumplidos:
| Criterio | Estado | Implementación |
| :--- | :---: | :--- |
| **Card destacada con saldo formateado** | ✅ | Componente `BalanceCard` con degradado azul eléctrico, badge de tendencia (`↗ +2.4%`), saldo grande (`$45,230.50`), máscara `**** 4892` y esferas traslúcidas. |
| **Últimos 5 movimientos** | ✅ | Componente `RecentActivity` que lista hasta 5 transacciones con título/contraparte, concepto, fecha y categoría. Enlace directo *"Ver todo"*. |
| **Diferenciación visual de entradas y salidas** | ✅ | **Ingresos**: `+$15,000.00` en verde esmeralda (`#10B981`) con ícono en cápsula `#E6F9F0`.<br>**Egresos**: `-$1,250.00` en tono oscuro (`#0F172A`) con íconos temáticos de compra/servicio. |
| **Consumo de APIs** | ✅ | Integración en paralelo de `GET /api/accounts/me` (saldo y estado de cuenta) y `GET /api/transactions/me?page=1&pageSize=5` (historial de movimientos de HU-17). Fallback seguro en caso de contingencia. |
| **Estados de Carga y Error** | ✅ | Uso de `Skeleton` de Material UI en la tarjeta de saldo y en la lista de actividad mientras se obtienen los datos. Mensaje de alerta con botón *"Reintentar"* en caso de error de red. |
| **Accesos directos funcionales** | ✅ | Componente `QuickActions` con 4 botones de acción rápida: **Depositar**, **Transferir**, **Escanear** y **Servicios**, con modales interactivos para realizar operaciones. |

---

## 🎨 Especificación de UI & Tokens de Diseño (Figma Design System)

Basado en las pantallas oficiales de Figma aportadas para el proyecto:

### 1. Paleta de Colores
* **Brand Primary Gradient**: `linear-gradient(135deg, #0056D2 0%, #0066FF 60%, #0077FF 100%)`
  - Utilizado en la tarjeta destacada de saldo y botones prioritarios.
* **Accent Success (Ingresos / Tendencias)**:
  - Badge de tendencia: Fondo `#C6F6D5`, Texto `#047857` (`+2.4%`).
  - Montos de ingreso: `#10B981` con signo `+`.
  - Cápsula de ícono de ingreso: `#E6F9F0`.
* **Dark / Egresos**:
  - Montos de salida: `#0F172A` con signo `-`.
  - Cápsula de ícono neutro: `#F1F5F9` con ícono `#475569`.
* **Superficies**:
  - Fondo de aplicación: `#F8FAFC`.
  - Tarjetas y contenedores: `#FFFFFF` con borde `1px solid #E2E8F0` y radio de `16px` a `20px`.

### 2. Tipografía y Jerarquía
* **Fuente**: `Roboto`, `Inter`, sans-serif.
* **Encabezado de Bienvenida**:
  - Subtítulo: `"Bienvenido de nuevo"` (14px, `#64748B`, font-weight 600).
  - Título Principal: `"Alejandro Silva"` (32px, `#0F172A`, font-weight 800, tracking -0.02em).
* **Saldo Destacado**:
  - Parte entera: `2.9rem`, font-weight 800.
  - Parte decimal: `1.6rem`, font-weight 700, opacidad 90%.

### 3. Navegación Responsiva
* **Desktop (`DashboardNavbar`)**:
  - Pestañas horizontales: *Resumen* (con línea azul indicadora inferior), *Inversiones*, *Préstamos*.
  - Campana de notificaciones con indicador de punto rojo (`#EF4444`).
  - Badge de perfil de usuario con avatar y texto *"Mi Perfil"*.
* **Mobile (`MobileBottomNav`)**:
  - Barra fija inferior con accesos a: *Home* (activo), *History*, *Profile*, *Settings*.
  - Botones *Depositar* y *Transferir* con fondo azul primario destacado para toque táctil ergonómico.

---

## 📂 Estructura del Código

```text
src/
├── components/
│   ├── dashboard/
│   │   ├── BalanceCard.jsx       # Tarjeta azul de crédito/saldo con esferas y badge
│   │   ├── QuickActions.jsx      # Grid de 4 accesos directos (Depositar, Transferir...)
│   │   └── RecentActivity.jsx    # Lista de los últimos 5 movimientos con colores
│   └── layout/
│       ├── DashboardNavbar.jsx   # Barra superior con pestañas y perfil
│       └── MobileBottomNav.jsx   # Barra de navegación inferior móvil
├── pages/
│   └── Dashboard/
│       └── DashboardPage.jsx     # Orquestador del Dashboard y modales de acción
├── services/
│   ├── accountService.js         # Consumo de /api/accounts/me y depósitos
│   ├── transactionService.js     # Consumo de /api/transactions/me
│   └── api.js                    # Instancia única de Axios con interceptores
├── theme/
│   └── theme.js                  # Tema de Material UI
├── App.jsx                       # Enrutador de la aplicación
├── index.css
└── main.jsx
```

---

## 🚀 Guía de Ejecución

```bash
# 1. Ingresar a la carpeta del proyecto
cd E:\repos\Squad-stack-Frontend

# 2. Iniciar el servidor en modo desarrollo
npm run dev

# 3. Compilar para producción
npm run build
```
