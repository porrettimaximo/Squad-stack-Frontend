# DigitalArs — Billetera Virtual (Frontend SPA)

> **Proyecto:** Billetera Virtual / Digital Wallet  
> **Programa:** Aceleración Técnica en **Alchemie Acceleration Tech**  
> **Equipo:** **Squad-stack** — Emmanuel, Andrés, Micaela y Máximo  
> **Stack Completo:** React 19 | Vite 8 | Material UI v6 | GSAP | Motion | jsPDF | Axios | .NET 10 Web API | SQL Server  

---

## 1. Introducción y Propósito del Proyecto

**DigitalArs** es una plataforma de billetera digital moderna orientada a la gestión financiera de usuarios particulares y corporativos. 

El presente repositorio contiene la aplicación **Frontend Single Page Application (SPA)**, desarrollada con los estándares más exigentes de la industria:
- **Arquitectura Basada en Componentes:** Desacoplada y modular con React 19.
- **Sistema de Diseño Adaptativo (Light / Dark Mode):** Basado en tokens semánticos de Material UI v6 y normalización de contrastes para accesibilidad WCAG.
- **Microinteracciones y Efectos Visuales Avanzados:** Físicas de resorte táctiles (`Motion`), animaciones direccionales, levitación de tarjetas y fondo interactivo en canvas (`DotGrid` + `GSAP`).
- **Segregación Estricta por Roles (RBAC):** Vistas y flujos diferenciados para usuarios de billetera (`/dashboard`) y administradores del sistema (`/admin`), con guardián de rutas `ProtectedRoute`.
- **Generación de Comprobantes Oficiales PDF:** Motor cliente (`jsPDF`) para emitir y descargar comprobantes oficiales imprimibles de transferencias, depósitos y pago de servicios.

---

## 2. Stack Tecnológico de Punta a Punta

### Frontend (Este Repositorio)
| Tecnología / Librería | Versión | Rol y Justificación Técnica |
| :--- | :---: | :--- |
| **[React](https://react.dev/)** | `19` | Arquitectura reactiva basada en componentes funcionales, hooks nativos y renderizado eficiente. |
| **[Vite](https://vite.dev/)** | `8` | Bundler y herramienta de desarrollo ultrarrápida con ESM nativo y HMR en menos de 400ms. |
| **[Material UI (MUI)](https://mui.com/)** | `v6` | Sistema estructural de diseño (`Box`, `Card`, `Typography`, `Dialog`, `Switch`, etc.) con tokens semánticos. |
| **[@emotion/react & styled](https://emotion.sh/)** | `11` | Motor de CSS-in-JS para inyección dinámica de estilos en tiempo de ejecución. |
| **[@mui/icons-material](https://mui.com/material-ui/material-icons/)** | `v6` | Iconografía SVG vectorial para menús, acciones financieras y estados. |
| **[Motion (motion.dev)](https://motion.dev/)** | `13` | Microinteracciones declarativas con físicas de resorte (`whileHover`, `whileTap`, `stagger`). |
| **[GSAP](https://gsap.com/)** | `3.14+` | Fondo reactivo interactivo de puntos (`DotGrid`) en la pantalla de inicio de sesión. |
| **[Axios](https://axios-http.com/)** | `1.20` | Cliente HTTP con interceptores automáticos de cabeceras `Authorization: Bearer` y cache-busting. |
| **[React Router DOM](https://reactrouter.com/)** | `7` | Enrutamiento declarativo del lado del cliente con control de acceso por roles. |
| **[jsPDF](https://github.com/parallax/jsPDF)** | `4.2` | Generador de comprobantes bancarios descargables en PDF con sellos oficiales. |

### Backend Vinculado
| Tecnología | Versión | Rol |
| :--- | :---: | :--- |
| **.NET 10 / C#** | `10.0` | Web API RESTful con Clean Architecture. |
| **Entity Framework Core** | `10.0` | ORM con migraciones Code First y consultas paginadas en SQL Server. |
| **SQL Server** | `2022+` | Persistencia relacional de cuentas, transacciones y servicios. |

---

## 3. Requisitos Previos

Para ejecutar la solución completa en cualquier máquina de desarrollo:
1. **[Node.js](https://nodejs.org/)** (v18.0.0 o superior) y **npm** (v9.0.0 o superior).
2. **[.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)** (para el backend).
3. **Microsoft SQL Server / LocalDB** (para la base de datos).

---

## 4. Instalación y Puesta en Marcha (De Punta a Punta)

> 💡 **Cualquier desarrollador puede clonar ambos proyectos y levantarlos siguiendo estos pasos exactos:**

### Paso 1: Clonar los Repositorios
```bash
# Repositorio Frontend
git clone https://github.com/porrettimaximo/Squad-stack-Frontend.git

# Repositorio Backend (en la misma carpeta raíz o adyacente)
git clone https://github.com/MicaMulato/Squad-stack.git
```

---

### Paso 2: Inicializar y Levantar el Backend (.NET 10)

1. **Abrir una terminal en `Squad-stack`:**
   ```bash
   cd Squad-stack
   ```
2. **Aplicar migraciones para crear la base de datos y precargar usuarios:**
   ```bash
   dotnet ef database update --project DigitalArs.Infrastructure --startup-project DigitalArs.Api
   ```
3. **Ejecutar la API:**
   ```bash
   dotnet run --project DigitalArs.Api --launch-profile https
   ```
   *La API estará lista en `https://localhost:7142` (HTTPS) y `http://localhost:5065` (HTTP / Swagger).*

---

### Paso 3: Inicializar y Levantar el Frontend (React 19)

1. **Abrir otra terminal en `Squad-stack-Frontend`:**
   ```bash
   cd Squad-stack-Frontend
   ```
2. **Configurar variables de entorno (opcional si usa el puerto HTTPS por defecto):**
   ```bash
   cp .env.example .env
   ```
   *El archivo `.env` define:*
   ```env
   VITE_API_URL=https://localhost:7142/api
   ```
3. **Instalar dependencias de Node:**
   ```bash
   npm install
   ```
4. **Iniciar el servidor de desarrollo Vite:**
   ```bash
   npm run dev
   ```
5. **Acceder a la aplicación:**  
   Abra su navegador en `http://localhost:5173`.

---

## 5. Credenciales de Prueba (Data Seeding)

Inicie sesión inmediatamente con cualquiera de las siguientes cuentas preconfiguradas:

| Rol | Usuario / Nombre | Email | Contraseña | Saldo Inicial | Acceso Permitido |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **Admin** | Administrador DigitalArs | `admin@digitalars.com` | `Admin123!` | $500.000,00 | Panel Admin (`/admin`), ABM de usuarios, bloqueo de cuentas y ajustes de tema. |
| **User** | Roberto Carlos | `robercarlos3@gmail.com` | `Roberto1!` | $260.000,00 | Billetera (`/dashboard`), transferencias, depósitos, inversiones, tarjetas, servicios y reservas. |
| **User** | Mohammed Khan | `mokha@gmail.com` | `Mohammed1!` | $185.000,50 | Billetera (`/dashboard`), transferencias y comprobantes. |
| **User** | Alejandro Silva | `alejandro.silva@digitalars.com` | `User123!` | $45.230,50 | Historial y pagos. |

---

## 6. Documentación Adicional del Proyecto

En la carpeta `docs/` se encuentran los informes técnicos requeridos para la evaluación:
- **Diagrama Entidad-Relación Actualizado (Versión 3.0):**  
  👉 [docs/diagrama-er.md](docs/diagrama-er.md)
- **Reporte de Optimización Backend y Mejoras de UI/UX:**  
  👉 [docs/reporte-optimizacion.md](docs/reporte-optimizacion.md)
- **Documentación Técnica Integral en Formato Word (.docx):**  
  👉 `docs/Documentacion_DigitalArs_Frontend.docx`
- **Catálogo Detallado de Efectos y Microinteracciones UI:**  
  👉 [docs/dashboard-ui-effects.md](docs/dashboard-ui-effects.md)

---

## 7. Política de Secretos y Calidad de Código

- **Sin secretos commiteados:** No existen tokens de producción, claves privadas ni passwords en el control de versiones.
- **Variables desacopladas:** Uso estricto de `.env.example` y variables de entorno de Vite (`import.meta.env.VITE_API_URL`).
- **Compilación Limpia:** `npm run build` genera el bundle de producción sin advertencias de atributos DOM ni errores de Rolldown/Vite.

---

## 8. Equipo de Desarrollo (Squad-stack)

- **Emmanuel Torres**
- **Andrés**
- **Micaela Mulato**
- **Máximo Porretti**
