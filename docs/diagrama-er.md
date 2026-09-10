# Diagrama Entidad-Relación — Billetera Virtual DigitalArs

> **Documento:** Especificación del Modelo de Datos Relacional  
> **Sistema:** DigitalArs API (.NET 10 + Entity Framework Core 10 + SQL Server)  
> **Versión:** 3.0 (Consolidado Final Completo: Cuentas, Transacciones, Inversiones, Tarjetas, Servicios, Reservas y Notificaciones)  

---

## 1. Diagrama Mermaid Actualizado

```mermaid
erDiagram
    ROLE ||--o{ USER : "clasifica (1:N)"
    USER ||--|| ACCOUNT : "posee (1:1)"
    USER ||--o{ NOTIFICATION : "recibe (1:N)"
    ACCOUNT ||--o{ TRANSACTION : "origen (1:N)"
    ACCOUNT ||--o{ TRANSACTION : "destino (1:N)"
    ACCOUNT ||--o{ FIXED_TERM_DEPOSIT : "invierte (1:N)"
    ACCOUNT ||--o{ CARD : "asocia (1:N)"
    ACCOUNT ||--o{ MONEY_RESERVE : "reserva (1:N)"
    ACCOUNT ||--o{ SERVICE_PAYMENT : "debits (1:N)"
    SERVICE_PROVIDER ||--o{ SERVICE_PAYMENT : "factura (1:N)"
    TRANSACTION ||--o| SERVICE_PAYMENT : "respalda (1:1)"
    MONEY_RESERVE |o--o{ SERVICE_PAYMENT : "financia (0..1:N)"

    ROLE {
        int Id PK "Clave primaria autoincremental"
        string Name "Nombre del rol (Admin, User)"
        string NormalizedName "Nombre normalizado en mayúsculas"
        string Description "Descripción de permisos del rol"
        string ConcurrencyStamp "Control de concurrencia optimista"
    }

    USER {
        int Id PK "Clave primaria autoincremental (IdentityUser<int>)"
        string FirstName "Nombre de pila del usuario"
        string LastName "Apellido del usuario"
        string Email UK "Correo electrónico único"
        string NormalizedEmail "Email normalizado para búsquedas O(1)"
        string UserName "Nombre de usuario del sistema"
        string NormalizedUserName "Username normalizado"
        string PasswordHash "Hash criptográfico PBKDF2"
        string PhoneNumber "Número de teléfono opcional"
        bool PhoneNumberConfirmed "Estado de confirmación de teléfono"
        bool TwoFactorEnabled "Soporte de autenticación de dos factores"
        bool EmailConfirmed "Estado de confirmación de correo"
        int RoleId FK "Referencia al Rol principal asignado"
        bool IsDeleted "Marca de baja lógica (Soft Delete)"
        datetime CreatedAt "Fecha de registro UTC"
        string SecurityStamp "Sello de seguridad de sesión"
        string ConcurrencyStamp "Sello de concurrencia"
    }

    ACCOUNT {
        int Id PK "Clave primaria autoincremental"
        int UserId FK,UK "Clave foránea única 1:1 con User"
        decimal Money "Saldo disponible con precisión decimal(18,2)"
        bool IsBlocked "Estado de bloqueo preventivo de cuenta"
        datetime CreatedAt "Fecha de apertura de cuenta UTC"
    }

    TRANSACTION {
        int Id PK "Clave primaria autoincremental"
        int AccountId FK "Cuenta emisora o cuenta que recibe el depósito"
        int ToAccountId FK "Cuenta receptora (nullable para depósitos o pagos)"
        decimal Amount "Monto transaccionado decimal(18,2)"
        int Type "Tipo: 1=Deposit, 2=TransferReceived, 3=TransferSent, 4=ServicePayment"
        string Concept "Detalle o motivo del movimiento"
        datetime Date "Marca temporal de la transacción UTC"
    }

    FIXED_TERM_DEPOSIT {
        int Id PK "Clave primaria autoincremental"
        int AccountId FK "Cuenta asociada que financia el plazo fijo"
        decimal Amount "Capital inicial invertido decimal(18,2)"
        decimal InterestRate "Tasa Nominal Anual aplicada (ej. 19.0%)"
        int DurationDays "Plazo pactado en días (mínimo 30 días)"
        datetime CreationDate "Fecha y hora de constitución UTC"
        datetime ClosingDate "Fecha y hora pactada de vencimiento UTC"
        decimal InterestEarned "Interés acumulado generado decimal(18,2)"
        decimal FinalAmount "Monto final a liquidar (Capital + Interés)"
        int Status "Estado: 1=Active, 2=Finished, 3=Cancelled"
    }

    CARD {
        int Id PK "Clave primaria autoincremental"
        int AccountId FK "Cuenta bancaria que respalda la tarjeta"
        string HolderName "Nombre completo del titular en mayúsculas"
        string CardNumber "Número de tarjeta de 16 dígitos"
        string SecurityCode "Código de verificación CVV de 3 dígitos"
        datetime ExpirationDate "Fecha de caducidad (3 años)"
        int Type "Tipo de tarjeta: 1=Virtual, 2=Physical"
        bool IsActive "Indica si la tarjeta está habilitada para operar"
        bool IsFrozen "Estado de congelamiento preventivo por el usuario"
        datetime CreatedAt "Fecha de emisión UTC"
    }

    MONEY_RESERVE {
        int Id PK "Clave primaria autoincremental"
        int AccountId FK "Cuenta dueña de la reserva"
        string Name "Nombre de la reserva o meta de ahorro"
        decimal TargetAmount "Monto objetivo deseado decimal(18,2) nullable"
        decimal CurrentBalance "Monto apartado actualmente decimal(18,2)"
        string Icon "Ícono visual representativo"
        string Color "Color temático de la reserva"
        datetime CreatedAt "Fecha de creación UTC"
        bool IsActive "Estado activo de la reserva"
    }

    SERVICE_PROVIDER {
        int Id PK "Clave primaria autoincremental"
        string Name "Nombre de la empresa prestadora de servicio"
        int Category "Categoría: Electricity, Water, Gas, Telephony, Internet, Taxes"
        string CodeLabel "Etiqueta del identificador (ej: Nro de Cliente)"
        string IconName "Identificador del icono o logotipo de la empresa"
        bool IsActive "Indica si la empresa está habilitada para cobros"
    }

    SERVICE_PAYMENT {
        int Id PK "Clave primaria autoincremental"
        int AccountId FK "Cuenta desde la cual se debitó el pago"
        int ServiceProviderId FK "Empresa a la cual se le abonó el servicio"
        int TransactionId FK,UK "Transacción contable que respalda el débito"
        int ReserveId FK "Reserva utilizada para financiar el pago (opcional)"
        string ReferenceNumber "Número de referencia, cliente o código de barras"
        decimal Amount "Monto debitado decimal(18,2)"
        datetime PaymentDate "Fecha y hora del pago UTC"
        string ReceiptNumber "Número de comprobante digital único generado"
    }

    NOTIFICATION {
        int Id PK "Clave primaria autoincremental"
        int UserId FK "Usuario destinatario de la notificación"
        string Title "Título de la notificación"
        string Message "Cuerpo del mensaje descriptivo"
        string Type "Tipo: Welcome, Deposit, TransferIn, ServicePayment, General"
        bool IsRead "Indica si el usuario leyó la notificación"
        datetime CreatedAt "Marca de tiempo de emisión UTC"
        string ActionUrl "Ruta de navegación asociada (opcional)"
    }
```

---

## 2. Descripción Detallada de Entidades y Relaciones

### 2.1. `User` (Usuarios del Sistema)
- Hereda de `IdentityUser<int>` provisto por ASP.NET Core Identity.
- Implementa **baja lógica (*Soft Delete*)** mediante `IsDeleted` con filtro global en EF Core (`HasQueryFilter`).
- Índice único no agrupado sobre `NormalizedEmail` e índice sobre `IsDeleted` para consultas eficientes.

### 2.2. `Role` (Roles y Permisos - RBAC)
- Hereda de `IdentityRole<int>`.
- Roles sembrados: `Admin` (Id: 1, gestión de usuarios, auditoría) y `User` (Id: 2, operaciones de billetera).

### 2.3. `Account` (Cuenta Monetaria)
- Relación **1 a 1** con `User`. Cada usuario dispone de una cuenta transaccional en pesos argentinos (ARS).
- `Money` utiliza precisión `decimal(18,2)` para salvaguardar exactitud financiera.
- Cuenta con bandera `IsBlocked` para inmovilización preventiva de saldo.

### 2.4. `Transaction` (Movimientos y Transferencias)
- Registra cualquier mutación monetaria con soporte para paginación de servidor (`OFFSET ... FETCH NEXT`).
- Relación **1 a N** con `Account` (`AccountId`) y receptor opcional (`ToAccountId`).
- Enumeración `TransactionType`: `Deposit` (1), `TransferReceived` (2), `TransferSent` (3), `ServicePayment` (4).

### 2.5. `FixedTermDeposit` (Inversiones a Plazo Fijo)
- Inversión a plazo con tasa nominal anual garantizada (19.0% TNA base).
- Al constituirse debita fondos disponibles de la cuenta; al vencer o cancelarse liquida capital e intereses según el estado.

### 2.6. `Card` (Tarjetas Virtuales y Físicas)
- Emisión de tarjetas con numeración de 16 dígitos, CVV encriptado/hash y fecha de vencimiento a 3 años.
- Control instantáneo de congelamiento preventivo (`IsFrozen`) sin baja definitiva.

### 2.7. `MoneyReserve` (Apartados y Metas de Ahorro)
- Permite al usuario separar saldo de su cuenta general para metas específicas (ahorro, vacaciones, emergencias, impuestos).
- Permite depósitos y retiros internos atómicos con validación de saldo disponible.

### 2.8. `ServiceProvider` y `ServicePayment` (Pago de Servicios e Impuestos)
- Catálogo categorizado de empresas de servicios públicos y privados (Edenor, Edesur, AySA, Metrogas, Claro, Personal, Movistar, Fibertel, Telecentro, AFIP, ARBA, AGIP).
- Ejecución atómica de pago debitando cuenta o reserva, emitiendo comprobante fiscal digital único (`ReceiptNumber`) y registrando la transacción vinculada.

### 2.9. `Notification` (Centro de Alertas y Notificaciones)
- Registro cronológico de avisos al usuario (depósitos recibidos, transferencias entrantes, pagos realizados y bienvenidas).
- Soporte para conteo de no leídos en tiempo real y marcado atómico como leídas.

---

## 3. Integridad Referencial y Reglas de Cascada
- Se utiliza `DeleteBehavior.Restrict` / `DeleteBehavior.NoAction` en tablas financieras históricas (`Transactions`, `ServicePayments`, `FixedTermDeposits`) para garantizar inviolabilidad contable y auditoría forense.
- Los usuarios eliminados administrativamente no eliminan filas físicas sino que activan `IsDeleted = true`.
