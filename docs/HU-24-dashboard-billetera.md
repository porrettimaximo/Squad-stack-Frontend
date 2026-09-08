# Documentación Técnica — HU-24: Dashboard Principal de la Billetera

> **Proyecto:** DigitalArs — Billetera Virtual (Frontend)  
> **Historia de Usuario:** HU-24 — Dashboard Principal de la Billetera Virtual  
> **Ubicación del Módulo:** `src/pages/Dashboard/DashboardPage.jsx` y componentes en `src/components/dashboard/` y `src/components/layout/`.

---

## 1. Objetivo y Criterios de Aceptación

> **Como usuario autenticado**, quiero visualizar un panel principal con mi saldo, información de cuenta, accesos rápidos y últimos movimientos, para tener el control general de mis finanzas personales en DigitalArs.

### Criterios Cumplidos:
- [x] **Visualización de Saldo Disponible:** Muestra el saldo actual del usuario en formato moneda argentina (`$ 45.230,50`).
- [x] **Saludo Personalizado:** Renderiza *"Bienvenido de nuevo, [Nombre del Usuario]"* conectado al contexto global `AccountContext`.
- [x] **Tarjeta de Cuenta (BalanceCard):** Tarjeta con gradiente institucional, terminación de tarjeta de débito vinculada (`**** 4892`), indicador de tendencia financiera e interactividad de visualización de saldo.
- [x] **Acciones Rápidas (QuickActions):** Cuadrícula 2x2 con accesos directos e interactivos:
  - **Ingresar dinero:** Navega a la pantalla de depósito (`/deposit`).
  - **Transferir dinero:** Navega a la pantalla de transferencia (`/transfer`).
  - **Escanear QR:** Acceso a pagos QR con feedback no bloqueante.
  - **Pagar Servicios:** Acceso a pago de facturas e impuestos con feedback visual.
- [x] **Carrusel Promocional Interactivo (ImageCarousel):** Slider con aspecto 1:1 en desktop y banner en mobile, con microinteracciones y botones de llamada a la acción (Transferir, Inversiones).
- [x] **Arquitectura Responsive Adaptativa (Desktop / Mobile):**
  - **Desktop (md+):** Barra lateral (`Sidebar`) fija con microinteracciones de levitación, navegación superior (`DashboardNavbar`) con tabs, campana de notificaciones y cápsula de perfil.
  - **Mobile (xs-sm):** Cabecera azul oscuro institucional (`#001639`), saludo compacto, balance card elevado y hoja blanca inferior redondeada (`curved bottom sheet`) con barra fija inferior (`MobileBottomNav`).

---

## 2. Arquitectura de Componentes

```
DashboardPage.jsx
├── AppLayout (Estructura Responsive)
│   ├── Sidebar (Desktop)
│   ├── DashboardNavbar (Desktop)
│   └── MobileBottomNav (Mobile)
├── BalanceCard (Saldo, Tarjeta, Tendencia)
├── QuickActions (Navegación a Depósito, Transferencia, QR, Servicios)
└── ImageCarousel (Banners interactivos con Framer Motion)
```

---

## 3. Estado Global y Datos

- **Contexto:** `AccountContext` provee el usuario actual (`Alejandro Silva`), saldo disponible y listado de transacciones recientes.
- **Formateadores:** Utiliza `src/utils/formatters.js` para renderizar números en moneda argentina de forma consistente.
