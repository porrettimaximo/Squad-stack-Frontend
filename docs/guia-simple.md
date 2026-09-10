# DigitalArs — Guía simple del frontend

DigitalArs es una aplicación web de billetera digital. Este repositorio contiene la interfaz que permite consultar el saldo, realizar operaciones y administrar la cuenta. Los datos y las operaciones se conectan con una API externa.

## Tecnologías

- React 19 y React Router 7: componentes y navegación.
- Vite 8: servidor de desarrollo y compilación.
- Material UI 9 y Emotion: interfaz y estilos.
- Axios: comunicación con la API.
- Framer Motion y GSAP: animaciones.
- jsPDF: generación de comprobantes PDF.

Las versiones declaradas se pueden consultar en [package.json](../package.json).

## Cómo ejecutar el proyecto

Se necesita npm y una versión de Node compatible con Vite: Node 20 desde 20.19.0, o Node 22.12.0 en adelante. Para iniciar sesión y trabajar con datos persistidos también se necesita el backend funcionando y una cuenta creada allí.

Desde PowerShell:

```powershell
cd E:\repos\Squad-stack-Frontend
npm ci
```

Si todavía no existe `.env`, crearlo a partir del ejemplo:

```powershell
Copy-Item .env.example .env
```

Configurar en `.env` la dirección de la API, incluyendo `/api`:

```env
VITE_API_URL=https://localhost:7142/api
```

Iniciar la aplicación:

```powershell
npm run dev
```

Abrir la dirección que muestra la terminal; el puerto configurado es `5173`. Si se cambia `.env`, reiniciar el servidor de desarrollo.

La URL anterior es el valor predeterminado del cliente HTTP. Ajustarla al backend disponible. Para usar el proxy local de Vite, establecer `VITE_API_URL=/api`; el proxy apunta por defecto a `http://localhost:5065` y solo se aplica durante el desarrollo.

## Pantallas principales

| Sección | Ruta principal | Función |
| --- | --- | --- |
| Acceso | `/login` | Iniciar sesión. |
| Inicio | `/dashboard` | Consultar saldo, accesos rápidos y movimientos recientes. |
| Depósitos | `/deposit` | Ingresar fondos. |
| Transferencias | `/transfer` | Enviar dinero. |
| Historial | `/history` | Consultar movimientos con filtros y gráficos. |
| Servicios | `/services` | Pagar servicios. |
| Reservas | `/reserves` | Apartar dinero. |
| Inversiones | `/investments` | Gestionar plazos fijos. |
| Tarjetas | `/cards` | Gestionar tarjetas. |
| Perfil y ajustes | `/profile`, `/settings` | Consultar y configurar la cuenta. |
| Ayuda y soporte | `/help`, `/support` | Consultar asistencia. |
| Administración | `/admin` | Administrar usuarios. |

Las pantallas de billetera excluyen al rol administrador. Perfil, ajustes, ayuda y soporte son compartidos por los usuarios autenticados. Administración requiere el rol `Admin`. Las rutas se definen en [src/App.jsx](../src/App.jsx).

## Organización del código

```text
src/
  pages/       Pantallas de la aplicación.
  components/  Elementos reutilizables y estructura visual.
  context/     Estado compartido de sesión, cuenta y tema.
  hooks/       Acceso reutilizable al estado de cuenta.
  services/    Llamadas a la API organizadas por funcionalidad.
  utils/       Formatos y generación de PDF.
  theme/       Configuración visual.
  constants/   Datos y opciones compartidos.
  assets/      Imágenes usadas por los componentes.
public/        Archivos estáticos.
docs/          Documentación complementaria.
```

`src/main.jsx` inicia React y `src/App.jsx` organiza las rutas y los proveedores de estado. Las pantallas utilizan los servicios para consultar o modificar datos en el backend.

`AuthContext` administra la sesión y guarda el token y los datos del usuario en `localStorage`. `src/services/api.js` configura Axios y agrega el token a las peticiones. `AccountContext` comparte el perfil, el saldo y los movimientos; `ThemeContext` administra el tema visual.

## Comandos disponibles

| Comando | Uso |
| --- | --- |
| `npm run dev` | Iniciar el entorno de desarrollo. |
| `npm run build` | Generar la versión de producción en `dist/`. |
| `npm run preview` | Revisar localmente la compilación generada. |
| `npm run lint` | Analizar el código con Oxlint. |

Actualmente no hay un comando de pruebas automatizadas definido en `package.json`.

## Detalles a tener en cuenta

- Si falla la conexión, revisar que el backend esté activo, la URL configurada y sus permisos de CORS. Si se usa HTTPS local, comprobar también el certificado.
- El método `depositFunds` de `AccountContext` actualiza el saldo local incluso si falla la API. Ese cambio no confirma que el depósito se haya guardado en el backend.
- Al publicar la aplicación, el servidor debe devolver `index.html` para las rutas de la SPA, como `/dashboard`, y disponer de la URL de API adecuada al compilar.

Para ampliar la información, consultar el [README](../README.md) y los documentos de esta carpeta. Esta guía describe el código del frontend; no verifica la instalación ni el estado del backend.
