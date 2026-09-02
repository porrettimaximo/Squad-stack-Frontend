# Squad-stack-Frontend — Documentación Técnica y Especificación de UI

> **HU-21: Setup del proyecto React**  
> *Como desarrollador, quiero el proyecto React inicializado con su estructura y librerías, para construir pantallas sin plumbing.*

---

## 📌 1. Estado y Criterios de Aceptación

El proyecto se encuentra inicializado **completamente de 0**, sin componentes ni pantallas de negocio creadas, proveyendo la base arquitectónica y de dependencias lista para que cualquier desarrollador construya nuevas funcionalidades sin lidiar con configuración ni plomería técnica (*zero-plumbing*).

| Criterio de Aceptación | Estado | Detalle de Implementación |
| :--- | :---: | :--- |
| **Proyecto creado con Vite + React** | ✅ Cumplido | Inicializado con Vite + React (ESM/JSX), optimizado para desarrollo rápido con HMR y build ultraliviano. |
| **Material UI instalado con tema base (A DEFINIR)** | ✅ Cumplido | `@mui/material`, `@emotion/react`, `@emotion/styled`, `@mui/icons-material` instalados. Archivo `src/theme/theme.js` configurado con tema base marcado *A DEFINIR*. |
| **Estructura de carpetas requerida** | ✅ Cumplido | Directorios `pages`, `components`, `services`, `context`, `hooks` creados y versionados de 0. |
| **React Router con rutas base configuradas** | ✅ Cumplido | `react-router-dom` configurado en `src/App.jsx` con rutas base (`/`, `/login` y comodín `*` 404). |
| **Axios con instancia única** | ✅ Cumplido | `src/services/api.js` configurado con `baseURL` desde `.env` (`VITE_API_URL`), interceptor de token Bearer e interceptor 401 para expiración de sesión. |

---

## 🎨 2. Especificación Formal de UI & Design System

Esta sección establece las especificaciones y lineamientos formales de diseño de interfaz de usuario para el desarrollo de las pantallas del proyecto **DigitalArs**.

### 2.1. Stack de UI y Diseño
* **Material UI (MUI)**: Librería central de componentes estructurales y de interacción (botones, campos de texto, tablas, modales, alertas y navegación).
* **Tailwind CSS** *(Capacidad recomendada)*: Clases utilitarias ágiles para layouting, flexbox/grid, posicionamiento y espaciados responsivos rápidos.
* **Motion ([motion.dev](https://motion.dev/))**: Motor de animaciones declarativas para transiciones de páginas fluidas, modales emergentes y microinteracciones en controles financieros.
* **React Bits ([reactbits.dev](https://reactbits.dev/))**: Catálogo de referencia de patrones UI modernos para inspirar tarjetas interactivas de saldo, contadores numéricos animados, estados vacíos elegantes y efectos de hover levitantes.

---

### 2.2. Guía de Tokens de Diseño (Tema Base — A DEFINIR)

A continuación se definen los lineamientos recomendados para la formalización del tema visual en `src/theme/theme.js`:

#### Paleta de Colores (Fintech)
* **Primary (`#1976D2` / `#0A2540`)**: Representa solidez, seguridad bancaria e identidad de marca. Uso en barras de navegación, encabezados principales y botones primarios.
* **Secondary (`#0066FF` / `#00B4D8`)**: Color de acción y acento fintech. Uso en enlaces activos, llamadas a la acción (CTA) y destacados.
* **Success (`#10B981` / `#2E7D32`)**: Verde esmeralda para depósitos, transferencias entrantes, estados exitosos y saldos a favor.
* **Error (`#EF4444` / `#D32F2F`)**: Rojo para débitos, transferencias salientes, validaciones fallidas y alertas de error.
* **Warning (`#F59E0B`)**: Avisos de confirmación previa a transferencias y alertas de límites de saldo.
* **Backgrounds (`#F8FAFC` / `#FFFFFF`)**: Superficies claras con alto contraste y descanso visual.

#### Tipografía
* **Fuentes Oficiales**: `Roboto`, `Inter`, sans-serif.
* **Montos Financieros**: Formato monetario `Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })`, renderizados en pesos semibold/bold (600/700) con espaciado ajustado.

---

### 2.3. Patrones de Interacción (Inspirados en React Bits & Motion)

Para mantener una experiencia de usuario consistente entre desarrolladores:
1. **Entradas Suaves**: Las pantallas y tarjetas deben aplicar transiciones de entrada suaves (`opacity: 0 -> 1`, `y: 10 -> 0`).
2. **Feedback Inmediato**: Todo botón con llamada a API debe deshabilitarse y mostrar un spinner de carga (`CircularProgress`) durante la petición para evitar dobles envíos.
3. **Manejo Inmutable**: En las tablas y listas, mantener siempre la propiedad obligatoria `key={item.id}` y transformar estados mediante inmutabilidad (`.map()`, `.filter()`, `[...items]`).

---

## 📂 3. Estructura de Carpetas

El proyecto está organizado de manera modular y limpia:

```text
Squad-stack-Frontend/
├── public/                 # Recursos estáticos públicos
├── src/
│   ├── assets/             # Imágenes y vectores
│   ├── components/         # Componentes transversales reutilizables (.gitkeep)
│   ├── context/            # Contextos globales de React / Context API (.gitkeep)
│   ├── hooks/              # Custom hooks reutilizables (.gitkeep)
│   ├── pages/              # Vistas completas asociadas a rutas (.gitkeep)
│   ├── services/           # Clientes HTTP y llamadas a APIs REST
│   │   └── api.js          # Instancia única de Axios con interceptores
│   ├── theme/              # Configuración de tema base de Material UI
│   │   └── theme.js        # Tema base (A DEFINIR)
│   ├── App.css
│   ├── App.jsx             # Enrutador base con React Router y ThemeProvider
│   ├── index.css           # Estilos base globales
│   └── main.jsx            # Punto de entrada de la aplicación Vite
├── .env                    # Variables de entorno locales
├── .env.example            # Plantilla de variables de entorno
├── index.html              # Plantilla HTML
├── package.json            # Dependencias del proyecto
└── vite.config.js          # Configuración de Vite
```

---

## 🌐 4. Capa de Red y Servicios (Axios)

Toda comunicación con la API se realiza mediante la **instancia única** ubicada en `src/services/api.js`:

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5065/api",
  headers: {
    "Content-Type": "application/json",
  },
});
```

### Interceptores Configurados

1. **Interceptor de Request (Token Bearer)**:  
   Inspecciona automáticamente si existe un token en `localStorage.getItem("token")` y lo inyecta en el encabezado `Authorization: Bearer <token>`.
2. **Interceptor de Response (401 Unauthorized)**:  
   Detecta respuestas `401`, limpia el almacenamiento de sesión local (`localStorage.removeItem("token")`) y redirige automáticamente a `/login` si el usuario no se encuentra en esa ruta.

---

## 🚦 5. Enrutamiento Base (React Router)

Configurado en `src/App.jsx` utilizando `<BrowserRouter>`, `<Routes>` y `<Route>`:
* `/`: Ruta raíz inicial (pantalla base de bienvenida).
* `/login`: Ruta base de inicio de sesión.
* `*`: Ruta comodín para capturar páginas no encontradas (404).

---

## 🚀 6. Guía de Inicio Rápido

### Requisitos
* [Node.js](https://nodejs.org/) v18+ (recomendado v20+)
* Backend .NET 10 corriendo en `http://localhost:5065` (o el puerto configurado en `VITE_API_URL`)

### Comandos de Ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar el servidor de desarrollo
npm run dev

# 3. Compilar para producción
npm run build
```
