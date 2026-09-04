# Documentación Técnica — HU-26: Pantalla de Transferencia de Fondos

> **Proyecto:** DigitalArs — Billetera Virtual (Frontend)  
> **Historia de Usuario:** HU-26 — Pantalla de Transferencia de Fondos  
> **Ubicación del Módulo:** `src/pages/Transfer/TransferPage.jsx`, `src/constants/contacts.js`, `src/constants/motives.js` y componentes en `src/components/common/SuccessStep.jsx`.

---

## 1. Objetivo y Criterios de Aceptación

> **Como usuario**, quiero enviar dinero a otras personas o cuentas ingresando su identificador (CBU, CVU, Alias o Número de Cuenta) o seleccionando un contacto, especificando el monto y el motivo, para realizar transferencias entre pares (P2P) de forma ágil y sin necesidad de scroll.

### Criterios Cumplidos:
- [x] **Diseño Compacto en Una Sola Ventana (Zero-Scroll UI):** Toda la interacción entra dentro del alto de pantalla en desktop y mobile, evitando scroll vertical innecesario.
- [x] **Selección y Deselección Interactiva:**
  - Al hacer clic en un destinatario sugerido, se resalta y muestra su ficha completa.
  - Se incluye un botón prominente **"Deseleccionar"** (y toggle al volver a cliquear) para cancelar la selección y volver al buscador en cualquier momento.
- [x] **Ficha Completa del Destinatario:**
  - Despliega toda la información oficial:
    - **Nombre completo** (ej: *Roberto Carlos*)
    - **Email verificado** (ej: *robercarlos3@gmail.com*)
    - **Número de Cuenta** (ej: *Cuenta #2*)
    - **CVU completo** (ej: *0000003100010000000002*)
    - **Alias bancario** (ej: *roberto.carlos.ars*)
    - **Entidad** (*DigitalArs Billetera Virtual*)
- [x] **Lista Oficial de 18 Motivos de Transferencia:**
  - Selector desplegable (`Select`) con menú scrollable de 18 motivos oficiales.
  - Valor inicial por defecto: **"Varios"**.
  - Opciones disponibles: *Varios, Haberes, Comidas y bebidas, Cuentas y servicios, Cuotas de préstamos, Depósitos y ahorro, Educación, Entretenimiento y cultura, Familia y amigos, Honorarios profesionales, Mascotas, Regalos, Salud, Seguros, Transporte, Vestimenta y cuidado personal, Vivienda y mantenimiento del hogar, Viajes*.
- [x] **Validación de Fondos Disponibles:**
  - Impide continuar si el monto ingresado supera el saldo actual (`amount > currentBalance`).
  - No admite montos menores o iguales a cero (`amount <= 0`).
- [x] **Operación Reactiva Inmediata:**
  - El saldo se descuenta inmediatamente a través de `transferFunds` en `AccountContext`.
  - Se registra el movimiento de egreso con el motivo seleccionado en el historial de transacciones.
- [x] **Reutilización y Buenas Prácticas de React:**
  - Utiliza `AppLayout`, `SuccessStep`, `formatCurrency`, `TRANSFER_MOTIVES` y `SEED_CONTACTS`.

---

## 2. Arquitectura y Flujo de Pantalla

```
TransferPage.jsx (Montado en AppLayout)
├── Paso 1: Búsqueda o Selección de Destinatario (con ficha completa y botón Deseleccionar)
├── Paso 2: Monto a Transferir + Saldo Disponible + Desplegable de 18 Motivos
├── Paso 3: Confirmación con Ficha Bancaria Completa y Desglose a Debitar
└── Paso 4: SuccessStep (Checkmark animado + Retorno al Dashboard)
```
