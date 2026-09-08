# Documentación Técnica — HU-25: Pantalla de Depósito de Fondos

> **Proyecto:** DigitalArs — Billetera Virtual (Frontend)  
> **Historia de Usuario:** HU-25 — Pantalla de Depósito de Fondos  
> **Ubicación del Módulo:** `src/pages/Deposit/DepositPage.jsx` y componentes en `src/components/common/SuccessStep.jsx`.

---

## 1. Objetivo y Criterios de Aceptación

> **Como usuario**, quiero ingresar fondos a mi billetera virtual seleccionando un medio de pago y especificando el monto, para disponer de dinero en mi cuenta DigitalArs.

### Criterios Cumplidos:
- [x] **Flujo Guiado Paso a Paso (Wizard en 4 pasos):**
  1. **Paso 1 (Selección de Medio):** Opción entre *Transferencia Bancaria (CVU / CBU)* con acreditación instantánea y *Tarjeta de Débito*.
  2. **Paso 2 (Ingreso de Monto):** Input numérico con prefijo de moneda `$`, display del saldo actual en cuenta y chips de selección rápida (`+$5.000`, `+$10.000`, `+$20.000`).
  3. **Paso 3 (Resumen y Confirmación):** Detalle de medio de pago, monto a ingresar, comisión ($0,00) y cálculo de nuevo saldo estimado.
  4. **Paso 4 (Pantalla de Éxito):** Pantalla animada con icono de checkmark, detalle del nuevo saldo disponible y redirección automática o manual al Dashboard.
- [x] **Validaciones Estrictas:**
  - El monto debe ser numérico y estrictamente mayor a 0 (`amount > 0`).
  - Botón de continuar deshabilitado ante entradas inválidas o vacías.
- [x] **Actualización Reactiva de Saldo:**
  - Se ejecuta a través de `depositFunds(amount)` en `AccountContext`.
  - El saldo se actualiza de inmediato en el estado global y se inserta automáticamente el movimiento correspondiente en el historial de transacciones.
- [x] **Reutilización de Layout y Componentes Comunes:**
  - Montado sobre `AppLayout` compartiendo la barra de navegación y sidebar.
  - El paso de éxito utiliza el componente compartido `SuccessStep`.

---

## 2. Arquitectura y Flujo de Pantalla

```
DepositPage.jsx (Montado en AppLayout)
├── Paso 1: Selección de Medio (Transferencia vs. Débito)
├── Paso 2: Ingreso de Monto + Chips Rápidos ($5K, $10K, $20K)
├── Paso 3: Confirmación y Nuevo Saldo Proyectado
└── Paso 4: SuccessStep (Checkmark animado + Contador de retorno)
```
