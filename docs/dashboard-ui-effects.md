# Documentación de Arquitectura de UI y Catálogo de Efectos del Dashboard

> **Proyecto:** DigitalArs — Billetera Virtual (Frontend)  
> **Historia de Usuario:** HU-24 — Dashboard Principal de la Billetera  
> **Ubicación del Módulo:** `src/pages/Dashboard/DashboardPage.jsx` y componentes hijos en `src/components/dashboard/` y `src/components/layout/`.

---

## 📌 1. Visión General

El Dashboard de DigitalArs fue concebido para brindar una experiencia de usuario fluida, moderna y de nivel bancario/fintech. La interfaz combina la solidez estructural de **Material UI (MUI)** con el motor de animaciones basadas en físicas de **Motion ([motion.dev](https://motion.dev/))** y los patrones visuales interactivos de **React Bits ([reactbits.dev](https://reactbits.dev/))**.

---

## 🧩 2. Desglose Componente por Componente

A continuación se detalla qué tecnologías, librerías y componentes se utilizan en cada sección de la pantalla, qué efectos están aplicados, de dónde fueron inspirados y cómo funcionan en el código.

---

### 1. Barra Lateral Izquierda (Sidebar — Desktop)
* **Archivo:** [`src/components/layout/Sidebar.jsx`](file:///E:/repos/Squad-stack-Frontend/src/components/layout/Sidebar.jsx)
* **Tecnologías y Componentes:**
  - Material UI: `Box`, `Typography`, `List`, `ListItem`, `ListItemButton`, `ListItemIcon`, `ListItemText`, `Divider`, `Button`.
  - Iconos Material UI: `AccountBalanceWalletOutlined`, `HomeOutlined`, `HistoryOutlined`, `CreditCardOutlined`, `PersonOutlineOutlined`, `SettingsOutlined`, `HeadsetMicOutlined`, `HelpOutlineOutlined`, `LogoutOutlined`.
  - Framer Motion: `motion.div`.
* **Efectos Aplicados:**
  - **Desplazamiento horizontal al pasar el mouse (`Hover Row Shift`):** Cada ítem del menú se desplaza sutilmente hacia la derecha (`x: 4px`) al hacer hover, comunicando interactividad inmediata.
  - **Compresión al hacer clic (`Tap Compression`):** Al presionar un ítem se comprime ligeramente (`scale: 0.98`), simulando una tecla física.
  - **Botón "Cerrar Sesión" reactivo:** Efecto de levitación con `whileHover={{ scale: 1.02 }}` y `whileTap={{ scale: 0.97 }}` con borde brillante.
* **Origen del Efecto:**
  - Inspirado en la guía de **Microinteracciones de Navegación de [motion.dev](https://motion.dev/)** y el patrón de selección lateral de **[reactbits.dev](https://reactbits.dev/)**.
* **Cómo funciona en el código:**
  ```jsx
  <motion.div
    whileHover={{ x: 4 }}
    whileTap={{ scale: 0.98 }}
    transition={{ duration: 0.15 }}
  >
    <ListItemButton onClick={() => onItemClick(item.id)}>
      {/* Contenido del botón */}
    </ListItemButton>
  </motion.div>
  ```

---

### 2. Barra Superior de Navegación (DashboardNavbar — Desktop)
* **Archivo:** [`src/components/layout/DashboardNavbar.jsx`](file:///E:/repos/Squad-stack-Frontend/src/components/layout/DashboardNavbar.jsx)
* **Tecnologías y Componentes:**
  - Material UI: `Tabs`, `Tab`, `IconButton`, `Badge`, `Avatar`, `Container`, `Box`, `Typography`.
  - Iconos: `NotificationsNoneOutlinedIcon`, `PersonOutlineOutlinedIcon`.
  - Framer Motion: `motion.div`.
* **Efectos Aplicados:**
  - **Campana de notificaciones con efecto de campanada (`Bell Ring Wiggle`):** Al posar el mouse sobre la campana, se ejecuta una animación secuencial de rotación tipo péndulo (`rotate: [0, -12, 12, -6, 6, 0]`) en `0.4s`.
  - **Píldora activa en pestañas:** Indicador animado nativo de Material UI (`indicatorColor="primary"`) con altura de 3px y bordes redondeados.
  - **Cápsula de perfil interactiva:** `whileHover={{ scale: 1.02 }}` con cambio de color de fondo a `#F8FAFC`.
* **Origen del Efecto:**
  - Patrón de **Keyframe Animation de [motion.dev](https://motion.dev/)** para notificaciones llamativas sin ser intrusivas.
* **Cómo funciona en el código:**
  ```jsx
  <motion.div
    whileHover={{ rotate: [0, -12, 12, -6, 6, 0] }}
    transition={{ duration: 0.4 }}
  >
    <IconButton>
      <Badge color="error" variant="dot">
        <NotificationsNoneOutlinedIcon />
      </Badge>
    </IconButton>
  </motion.div>
  ```

---

### 3. Tarjeta Destacada de Saldo (BalanceCard)
* **Archivo:** [`src/components/dashboard/BalanceCard.jsx`](file:///E:/repos/Squad-stack-Frontend/src/components/dashboard/BalanceCard.jsx)
* **Tecnologías y Componentes:**
  - Material UI: `Card`, `Box`, `Typography`, `Skeleton`.
  - Iconos: `TrendingUpIcon`.
  - Framer Motion: `motion.div`.
  - CSS: `linear-gradient`, `radial-gradient`.
* **Efectos Aplicados:**
  - **Entrada Suave con Desplazamiento (`Smooth Entrance`):** Al montar el componente, inicia transparente y desplazado hacia abajo (`initial={{ opacity: 0, y: 18 }}`) y se acomoda con curva ergonómica (`ease: [0.25, 0.1, 0.25, 1.0]`).
  - **Levitación de Tarjeta (`Card Levitating Hover`):** Al pasar el cursor, la tarjeta se eleva 5px hacia arriba (`y: -5px`) y su sombra azul se expande (`boxShadow: 0 20px 38px -8px rgba(0, 102, 255, 0.48)`).
  - **Resplandor Radial de Fondo (`Glow Spotlight Effect`):** Esfera de luz blanca difuminada de `220px` colocada en la esquina superior derecha (`radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 70%)`).
  - **Badge de Tendencia (`+2.4%`) con Micro-Scale:** Escala reactiva con `whileHover={{ scale: 1.08 }}` y compresión al pulsar `whileTap={{ scale: 0.95 }}`.
* **Origen del Efecto:**
  - **Patrón "Spotlight Card / Card Glow" de [reactbits.dev](https://reactbits.dev/)** combinado con las propiedades de elevación física de **[motion.dev](https://motion.dev/)**.
* **Cómo funciona en el código:**
  ```jsx
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1.0] }}
    whileHover={{ y: -5, transition: { duration: 0.25, ease: "easeOut" } }}
  >
    <Card sx={{ background: "linear-gradient(135deg, #0056D2 0%, #0066FF 60%, #0077FF 100%)", ... }}>
      {/* Resplandor radial Glow */}
      <Box sx={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, background: "radial-gradient(...)" }} />
      ...
    </Card>
  </motion.div>
  ```

---

### 4. Grid de Accesos Directos (QuickActions)
* **Archivo:** [`src/components/dashboard/QuickActions.jsx`](file:///E:/repos/Squad-stack-Frontend/src/components/dashboard/QuickActions.jsx)
* **Tecnologías y Componentes:**
  - Material UI: `Grid`, `Card`, `CardActionArea`, `Box`, `Typography`.
  - Iconos: `AddCircleOutlineOutlinedIcon`, `SwapHorizIcon`, `QrCodeScannerIcon`, `ReceiptLongIcon`.
  - Framer Motion: `motion.div`.
* **Efectos Aplicados:**
  - **Entrada en Cascada Escalonada (`Staggered Fade-In`):** Los 4 botones aparecen sucesivamente con un retraso dinámico calculado: `delay: index * 0.06s`.
  - **Feedback Haptic de Pulsación (`Tactile Press Feedback`):** Al presionar cualquier botón, se comprime suavemente con `whileTap={{ scale: 0.96 }}`.
  - **Levitación al Hover:** Se eleva 3px (`y: -3px`) y se agranda un 2% (`scale: 1.02`), con sombra de elevación perimetral azul.
  - **Efecto Onda Material (`MUI Ripple Effect`):** Generado nativamente por `CardActionArea` al hacer clic.
* **Origen del Efecto:**
  - Concepto de **Staggered Delays y Spring Physics de [motion.dev](https://motion.dev/)**.
* **Cómo funciona en el código:**
  ```jsx
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
    whileHover={{ y: -3, scale: 1.02 }}
    whileTap={{ scale: 0.96 }}
  >
    <Card>
      <CardActionArea onClick={act.onClick}>...</CardActionArea>
    </Card>
  </motion.div>
  ```

---

### 5. Actividad Reciente (RecentActivity)
* **Archivo:** [`src/components/dashboard/RecentActivity.jsx`](file:///E:/repos/Squad-stack-Frontend/src/components/dashboard/RecentActivity.jsx)
* **Tecnologías y Componentes:**
  - Material UI: `Box`, `Card`, `Typography`, `Button`, `Divider`, `Skeleton`.
  - Iconos: `ShoppingCartOutlinedIcon`, `SouthWestOutlinedIcon`, `LocalCafeOutlinedIcon`, `ReceiptOutlinedIcon`.
  - Framer Motion: `motion.div`.
* **Efectos Aplicados:**
  - **Desplazamiento horizontal al seleccionar fila (`Row Hover Slide`):** En desktop, al pasar el cursor sobre un movimiento, la fila se desplaza `+4px` a la derecha (`whileHover={{ x: 4 }}`) y su fondo cambia a un gris sutil (`#F8FAFC`), destacando la fila seleccionada.
  - **Aparición Progresiva de Movimientos:** Cada fila ingresa desde la izquierda (`initial={{ opacity: 0, x: -10 }}`) con un delay escalonado de `idx * 0.06s`.
  - **Botón "Ver todo" animado:** `whileHover={{ scale: 1.05 }}` y `whileTap={{ scale: 0.95 }}`.
  - **Diferenciación cromática de montos:**
    - Ingresos: `+$15,000.00` en verde esmeralda (`#10B981`) con icono en cápsula translúcida `#E6F9F0`.
    - Egresos: `-$1,250.00` en negro carbón (`#0F172A`) con cápsula `#F1F5F9`.
* **Origen del Efecto:**
  - Patrón de **List Item Interactive Highlight de [reactbits.dev](https://reactbits.dev/)** y transiciones direccionales de **[motion.dev](https://motion.dev/)**.
* **Cómo funciona en el código:**
  ```jsx
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay: idx * 0.06 }}
    whileHover={{ x: 4, backgroundColor: "rgba(248, 250, 252, 0.9)" }}
  >
    {renderItemContent(tx)}
  </motion.div>
  ```

---

### 6. Navegación Fija Inferior (MobileBottomNav — Celular)
* **Archivo:** [`src/components/layout/MobileBottomNav.jsx`](file:///E:/repos/Squad-stack-Frontend/src/components/layout/MobileBottomNav.jsx)
* **Tecnologías y Componentes:**
  - Material UI: `Paper`, `Box`, `Typography`.
  - Iconos: `HomeOutlinedIcon`, `HistoryOutlinedIcon`, `PersonOutlineOutlinedIcon`, `SettingsOutlinedIcon`.
* **Efectos Aplicados:**
  - **Cápsula de Estado Activo (`Active Indicator Pill`):** El ítem actualmente seleccionado (*Home*) se encierra en una cápsula con esquinas curvas (`borderRadius: 16px`), fondo azul suave (`#EEF4FF`) y contorno azul fino (`1px solid #D0E1FD`).
  - **Transición fluida:** `transition: "all 0.15s ease"` al cambiar entre pestañas.
* **Origen del Efecto:**
  - Especificación oficial de **Figma Mobile** y directrices de Material 3 para barras de navegación inferiores.

---

## 📚 3. Resumen de Fuentes de Inspiración de los Efectos

| Efecto | Componente | Fuente Oficial | Mecanismo de Implementación |
| :--- | :--- | :--- | :--- |
| **Card Glow & Spotlight** | `BalanceCard` | [reactbits.dev](https://reactbits.dev/) | `radial-gradient` translúcido superpuesto con `position: absolute`. |
| **Card Levitation on Hover** | `BalanceCard` | [motion.dev](https://motion.dev/) | `whileHover={{ y: -5 }}` con sombra expandida por CSS. |
| **Micro-Scale on Badges** | `BalanceCard` (`+2.4%`) | [motion.dev](https://motion.dev/) | `whileHover={{ scale: 1.08 }}` y `whileTap={{ scale: 0.95 }}`. |
| **Tactile Button Press** | `QuickActions` | [motion.dev](https://motion.dev/) | `whileTap={{ scale: 0.96 }}` con físicas de resorte suaves. |
| **Staggered Delays** | `QuickActions` & `RecentActivity` | [motion.dev](https://motion.dev/) | `delay: index * 0.06s` para un orden de cascada armónico. |
| **Row Selection Slide** | `RecentActivity` | [reactbits.dev](https://reactbits.dev/) | `whileHover={{ x: 4 }}` desplazando el elemento lateralmente. |
| **Bell Wiggle Animation** | `DashboardNavbar` | [motion.dev](https://motion.dev/) | Secuencia de fotogramas clave en `rotate: [0, -12, 12, -6, 6, 0]`. |
| **Sidebar Link Shift** | `Sidebar` | [reactbits.dev](https://reactbits.dev/) | `whileHover={{ x: 4 }}` para indicar foco de navegación. |
