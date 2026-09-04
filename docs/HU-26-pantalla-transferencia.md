# Documentación Técnica — HU-26: Pantalla de Transferencia de Fondos

> **Proyecto:** DigitalArs — Billetera Virtual (Frontend)  
> **Historia de Usuario:** HU-26 — Pantalla de Transferencia de Fondos  
> **Ubicación del Módulo:** `src/pages/Transfer/TransferPage.jsx` y componentes en `src/components/common/SuccessStep.jsx`.

---

## 1. Objetivo y Criterios de Aceptación

> **Como usuario**, quiero enviar dinero a otras personas o cuentas ingresando su identificador (CBU, CVU, Alias o Número de Cuenta) y el monto a transferir, para realizar pagos y transferencias entre pares (P2P).

### Criterios Cumplidos:
- [x] **Flujo Guiado Paso a Paso (Wizard en 4 pasos):**
  1. **Paso 1 (Destinatario):** Campo de búsqueda de destinatario (Email, CVU, Alias o Nº de cuenta) con listado filtrado de **Últimos destinatarios**.
  2. **Paso 2 (Monto y Concepto):** Input de monto con formateo en pesos, visualización del saldo disponible en cuenta y campo opcional para el motivo de la transferencia.
  3. **Paso 3 (Resumen y Confirmación):** Desglose del destinatario, concepto, comisión ($0,00) y total a debitar.
  4. **Paso 4 (Pantalla de Éxito):** Pantalla animada de éxito con detalle de la operación y botón de regreso.
- [x] **Filtro Inteligente de Destinatarios:**
  - Excluye compras, servicios y suscripciones recurrentes (Mercado Libre, Netflix, Starbucks, Spotify, etc.) para que únicamente figuren cuentas y personas reales.
  - Incluye acceso directo a los usuarios sugeridos de la plataforma: **Roberto Carlos**, **Mohammed Khan**, **Micaela Mulato** y **Emmanuel Torres**.
- [x] **Validación de Fondos Disponibles:**
  - Impide continuar si el monto ingresado supera el saldo actual (`amount > currentBalance`).
  - No admite montos menores o iguales a cero (`amount <= 0`).
- [x] **Operación Reactiva Inmediata:**
  - El saldo se descuenta inmediatamente a través de `transferFunds` en `AccountContext`.
  - Se registra el movimiento de egreso en el listado de transacciones.
- [x] **Reutilización de Layout y Componentes Comunes:**
  - Integrado con `AppLayout` y `SuccessStep` siguiendo las buenas prácticas de React (DRY).

---

## 2. Arquitectura y Flujo de Pantalla

```
TransferPage.jsx (Montado en AppLayout)
├── Paso 1: Búsqueda de Destinatario + Contactos Sugeridos
├── Paso 2: Monto a Transferir + Saldo Disponible + Concepto
├── Paso 3: Confirmación y Resumen de Débito
└── Paso 4: SuccessStep (Checkmark animado + Retorno al Dashboard)
```
