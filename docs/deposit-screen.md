# Documentación Técnica — HU-25: Pantalla de Depósito de Fondos

Esta documentación detalla la arquitectura, decisiones de diseño, flujo de datos y criterios de aceptación implementados para la historia de usuario **HU-25: Pantalla de Depósito** en el cliente web y mobile de **DigitalArs**.

---

## 1. Objetivo y Criterios de Aceptación

> **Como usuario**, quiero depositar dinero desde la interfaz, para cargar fondos fácilmente en mi cuenta DigitalArs.

### Criterios Cumplidos:
- [x] **Campo de monto con validación:** Permite únicamente valores numéricos mayores a cero (`amount > 0`), admitiendo hasta 2 decimales.
- [x] **Consumo de endpoint backend:** Envía `POST /api/accounts/deposit` mediante `accountService.deposit(amount)`.
- [x] **Feedback visual mediante Snackbars:**
  - **Éxito:** Muestra el nuevo saldo reportado en tiempo real por el backend (`result.newBalance`).
  - **Error:** Captura y muestra el mensaje de error exacto retornado por la API (`err.response.data.error`).
- [x] **Prevención de doble depósito:** Botón deshabilitado durante el envío (`disabled={!isValid || loading}`), con feedback de spinner `CircularProgress` y texto *"Procesando depósito..."*.
- [x] **Sincronización del saldo con el Dashboard:** Utiliza `AccountContext` para propagar el `newBalance` inmediatamente, de modo que al volver al Dashboard con el botón `← Volver`, el saldo reflejado en el `BalanceCard` está 100% actualizado sin necesidad de recargar.
- [x] **Estructura en 2 Cards Lado a Lado de Idéntico Tamaño (Desktop):**
  - **Tarjeta 1 (Izquierda): Cuenta de Acreditación / Destinatario:** Formulario interactivo con input para ingresar el CVU, CBU o Alias del destinatario con icono de búsqueda, y sección dedicada de **Destinatarios Recientes** con avatars y autocompletado rápido. Se eliminó la opción de transferirse a sí mismo.
  - **Tarjeta 2 (Derecha): Monto a Ingresar / Pagar y Motivo:**
    - Selector de origen de fondos: **Dinero en cuenta** vs. **Línea de crédito** (Wallet).
    - Display de monto gigante **$ 0.00** con validación estricta de saldo disponible.
    - Opciones rápidas de dinero inteligentes: divisiones calculadas dinámicamente que están **estrictamente por debajo del dinero disponible**, impidiendo montos superiores a los fondos reales.
    - Selector de motivo con menú desplegable scrollable con los 18 motivos oficiales.
  - **Fondo del Dashboard (`#F8FAFC`):** Sin envoltorios blancos invasivos, integrado armónicamente con la aplicación web.
  - **Botón Confirmar Depósito Abajo:** Ubicado de forma destacada debajo de ambas tarjetas en color verde institucional (`#076B38`).

---

## 2. Destinatarios Recientes

Para agilizar operaciones frecuentes, la tarjeta izquierda incluye:
- **Roberto Carlos** (`roberto.carlos.ars` · DigitalArs)
- **Mohammed Khan** (`mohammed.khan.ars` · DigitalArs)
- **Laura Benítez** (`laura.benitez.ars` · Banco Galicia)
- **Empresa de Servicios S.A.** (`servicios.digitalars` · CBU)

Al hacer clic en cualquier contacto reciente, se completa automáticamente el campo de destinatario con feedback visual de selección activa.

---

## 3. Lógica Financiera y Reglas de Negocio

### 3.1 Origen de Fondos (Wallet)
El usuario puede seleccionar entre:
1. **Dinero en cuenta:** Saldo real disponible en la cuenta bancaria DigitalArs (`account.money`).
2. **Línea de crédito:** Límite crediticio pre-aprobado para transferencias y pagos (`$150.000,00`).

### 3.2 Validación de Saldo Disponible
- Si el usuario tipea un monto mayor al disponible del origen seleccionado (ej. tiene `$45.230,50` e ingresa `$46.000,00`), la interfaz muestra inmediatamente:
  > **`"Dinero no disponible (supera el saldo disponible)"`**
- El botón de confirmación queda automáticamente **deshabilitado**.

### 3.3 Opciones Rápidas de Dinero Inteligentes
Para evitar que el usuario seleccione valores superiores a su disponible:
- Se evalúan los tramos estándar (`$1.000`, `$2.000`, `$5.000`, `$10.000`, `$20.000`, `$25.000`, `$50.000`, etc.).
- Se filtran mediante:
  ```javascript
  const allowed = baseTiers.filter((t) => t < currentAvailable);
  ```
- Si el usuario tiene `$45.230,50`, las opciones disponibles serán `+$1.000`, `+$5.000`, `+$10.000`, `+$25.000` y un botón especial **`Total ($45.230)`**, sin permitir nunca `$50.000` ni `$100.000`.

---

## 4. Lista Oficial de 18 Motivos

El selector cuenta con scroll suave (`maxHeight: 320px`) y los siguientes 18 motivos acompañados de iconografía temática:

1. **Varios** (`MoreHorizIcon`)
2. **Haberes** (`WorkOutlinedIcon`)
3. **Comidas y bebidas** (`RestaurantOutlinedIcon`)
4. **Cuentas y servicios** (`ReceiptLongOutlinedIcon`)
5. **Cuotas de préstamos** (`AccountBalanceOutlinedIcon`)
6. **Depósitos y ahorro** (`SavingsOutlinedIcon`)
7. **Educación** (`SchoolOutlinedIcon`)
8. **Entretenimiento y cultura** (`TheaterComedyOutlinedIcon`)
9. **Familia y amigos** (`PeopleAltOutlinedIcon`)
10. **Honorarios profesionales** (`BadgeOutlinedIcon`)
11. **Mascotas** (`PetsOutlinedIcon`)
12. **Regalos** (`CardGiftcardOutlinedIcon`)
13. **Salud** (`MedicalServicesOutlinedIcon`)
14. **Seguros** (`ShieldOutlinedIcon`)
15. **Transporte** (`DirectionsCarOutlinedIcon`)
16. **Vestimenta y cuidado personal** (`CheckroomOutlinedIcon`)
17. **Vivienda y mantenimiento del hogar** (`HomeOutlinedIcon`)
18. **Viajes** (`FlightTakeoffOutlinedIcon`)

---

## 5. Pruebas y Validación Realizadas

- **Compilación de producción:** `npm run build` ejecutado exitosamente con Vite / Rolldown (0 errores).
- **Linter:** `npm run lint` validado con `oxlint` (0 errores).
- **Control de Versiones:** Todos los cambios permanecen estrictamente en local sin `git commit` ni `git push`.
