-- ============================================================================
-- DIGITALARS - SCRIPT DE REINICIO Y POBLADO DE DATOS (SEED DATA & TEST USERS)
-- Base de Datos: DigitalArsDb (SQL Server / LocalDB)
-- UTF-8 Unicode Seguro con literales N'...'
-- ============================================================================

USE [DigitalArsDb];
GO

SET NOCOUNT ON;

-- 1. Deshabilitar temporalmente las restricciones de Foreign Key
EXEC sp_MSforeachtable "ALTER TABLE ? NOCHECK CONSTRAINT all";
GO

-- 2. Limpiar todas las tablas de negocio y usuarios
DELETE FROM [Notifications];
DELETE FROM [ServicePayments];
DELETE FROM [FixedTermDeposits];
DELETE FROM [MoneyReserves];
DELETE FROM [Cards];
DELETE FROM [Transactions];
DELETE FROM [Accounts];
DELETE FROM [AspNetUserRoles];
DELETE FROM [AspNetUserClaims];
DELETE FROM [AspNetUserLogins];
DELETE FROM [AspNetUserTokens];
DELETE FROM [AspNetRoleClaims];
DELETE FROM [AspNetUsers];
DELETE FROM [AspNetRoles];
DELETE FROM [ServiceProviders];
GO

-- Reseteo de contadores IDENTITY
DBCC CHECKIDENT ('[AspNetRoles]', RESEED, 0);
DBCC CHECKIDENT ('[AspNetUsers]', RESEED, 0);
DBCC CHECKIDENT ('[Accounts]', RESEED, 0);
DBCC CHECKIDENT ('[Transactions]', RESEED, 0);
DBCC CHECKIDENT ('[Cards]', RESEED, 0);
DBCC CHECKIDENT ('[FixedTermDeposits]', RESEED, 0);
DBCC CHECKIDENT ('[MoneyReserves]', RESEED, 0);
DBCC CHECKIDENT ('[ServiceProviders]', RESEED, 0);
DBCC CHECKIDENT ('[ServicePayments]', RESEED, 0);
DBCC CHECKIDENT ('[Notifications]', RESEED, 0);
GO

-- ============================================================================
-- 3. INSERTAR ROLES
-- ============================================================================
SET IDENTITY_INSERT [AspNetRoles] ON;
INSERT INTO [AspNetRoles] ([Id], [Name], [NormalizedName], [Description], [ConcurrencyStamp]) VALUES
(1, N'Admin', N'ADMIN', N'Administrador de plataforma y backoffice', N'seed-role-admin-concurrency'),
(2, N'User',  N'USER',  N'Usuario cliente de billetera virtual DigitalArs', N'seed-role-user-concurrency');
SET IDENTITY_INSERT [AspNetRoles] OFF;
GO

-- ============================================================================
-- 4. INSERTAR USUARIOS (Con Nombres y Apellidos en Unicode Limpio)
-- Hash 'Admin123!': AQAAAAIAAYagAAAAENO87HGO7ibu/kR6bblZLBu39LF1P9oeSEu7bwGb0YRvny7KouBk+XFrlxztTvecMQ==
-- Hash 'User123!':  AQAAAAIAAYagAAAAECqqjIM1ZIVPsBB3YZEKUPrj44F/xdD2xp072usAuCjy/xFUe8NVyVA4IvNdTJnO2A==
-- ============================================================================
SET IDENTITY_INSERT [AspNetUsers] ON;
INSERT INTO [AspNetUsers] (
    [Id], [FirstName], [LastName], [UserName], [NormalizedUserName], 
    [Email], [NormalizedEmail], [EmailConfirmed], [PasswordHash], 
    [SecurityStamp], [ConcurrencyStamp], [PhoneNumber], [PhoneNumberConfirmed], 
    [TwoFactorEnabled], [LockoutEnd], [LockoutEnabled], [AccessFailedCount], 
    [RoleId], [IsDeleted], [CreatedAt]
) VALUES
-- 1. Administrador General
(1, N'Administrador', N'DigitalArs', N'admin@digitalars.com', N'ADMIN@DIGITALARS.COM',
    N'admin@digitalars.com', N'ADMIN@DIGITALARS.COM', 1, 
    N'AQAAAAIAAYagAAAAENO87HGO7ibu/kR6bblZLBu39LF1P9oeSEu7bwGb0YRvny7KouBk+XFrlxztTvecMQ==',
    N'STAMP-ADMIN-001', N'CONCURRENCY-ADMIN-001', N'+5491140001001', 1, 0, NULL, 0, 0, 1, 0, '2026-01-01 08:00:00'),

-- 2. Mateo Rossi
(2, N'Mateo', N'Rossi', N'mateo.rossi@gmail.com', N'MATEO.ROSSI@GMAIL.COM',
    N'mateo.rossi@gmail.com', N'MATEO.ROSSI@GMAIL.COM', 1,
    N'AQAAAAIAAYagAAAAECqqjIM1ZIVPsBB3YZEKUPrj44F/xdD2xp072usAuCjy/xFUe8NVyVA4IvNdTJnO2A==',
    N'STAMP-USER-002', N'CONCURRENCY-USER-002', N'+5491155002002', 1, 0, NULL, 0, 0, 2, 0, '2026-01-15 09:30:00'),

-- 3. Sofía Martínez
(3, N'Sofía', N'Martínez', N'sofia.martinez@gmail.com', N'SOFIA.MARTINEZ@GMAIL.COM',
    N'sofia.martinez@gmail.com', N'SOFIA.MARTINEZ@GMAIL.COM', 1,
    N'AQAAAAIAAYagAAAAECqqjIM1ZIVPsBB3YZEKUPrj44F/xdD2xp072usAuCjy/xFUe8NVyVA4IvNdTJnO2A==',
    N'STAMP-USER-003', N'CONCURRENCY-USER-003', N'+5491166003003', 1, 0, NULL, 0, 0, 2, 0, '2026-02-01 10:15:00'),

-- 4. Lucas Benítez
(4, N'Lucas', N'Benítez', N'lucas.benitez@gmail.com', N'LUCAS.BENITEZ@GMAIL.COM',
    N'lucas.benitez@gmail.com', N'LUCAS.BENITEZ@GMAIL.COM', 1,
    N'AQAAAAIAAYagAAAAECqqjIM1ZIVPsBB3YZEKUPrj44F/xdD2xp072usAuCjy/xFUe8NVyVA4IvNdTJnO2A==',
    N'STAMP-USER-004', N'CONCURRENCY-USER-004', N'+5491177004004', 1, 0, NULL, 0, 0, 2, 0, '2026-02-10 11:00:00'),

-- 5. Camila Fernández
(5, N'Camila', N'Fernández', N'camila.fernandez@gmail.com', N'CAMILA.FERNANDEZ@GMAIL.COM',
    N'camila.fernandez@gmail.com', N'CAMILA.FERNANDEZ@GMAIL.COM', 1,
    N'AQAAAAIAAYagAAAAECqqjIM1ZIVPsBB3YZEKUPrj44F/xdD2xp072usAuCjy/xFUe8NVyVA4IvNdTJnO2A==',
    N'STAMP-USER-005', N'CONCURRENCY-USER-005', N'+5491188005005', 1, 0, NULL, 0, 0, 2, 0, '2026-02-20 14:20:00'),

-- 6. Joaquín Díaz
(6, N'Joaquín', N'Díaz', N'joaquin.diaz@gmail.com', N'JOAQUIN.DIAZ@GMAIL.COM',
    N'joaquin.diaz@gmail.com', N'JOAQUIN.DIAZ@GMAIL.COM', 1,
    N'AQAAAAIAAYagAAAAECqqjIM1ZIVPsBB3YZEKUPrj44F/xdD2xp072usAuCjy/xFUe8NVyVA4IvNdTJnO2A==',
    N'STAMP-USER-006', N'CONCURRENCY-USER-006', N'+5491199006006', 1, 0, NULL, 0, 0, 2, 0, '2026-03-01 16:40:00'),

-- 7. Valentina Gómez
(7, N'Valentina', N'Gómez', N'valentina.gomez@gmail.com', N'VALENTINA.GOMEZ@GMAIL.COM',
    N'valentina.gomez@gmail.com', N'VALENTINA.GOMEZ@GMAIL.COM', 1,
    N'AQAAAAIAAYagAAAAECqqjIM1ZIVPsBB3YZEKUPrj44F/xdD2xp072usAuCjy/xFUe8NVyVA4IvNdTJnO2A==',
    N'STAMP-USER-007', N'CONCURRENCY-USER-007', N'+5491122007007', 1, 0, NULL, 0, 0, 2, 0, '2026-03-05 18:00:00'),

-- 8. Diego Romero
(8, N'Diego', N'Romero', N'diego.romero@gmail.com', N'DIEGO.ROMERO@GMAIL.COM',
    N'diego.romero@gmail.com', N'DIEGO.ROMERO@GMAIL.COM', 1,
    N'AQAAAAIAAYagAAAAECqqjIM1ZIVPsBB3YZEKUPrj44F/xdD2xp072usAuCjy/xFUe8NVyVA4IvNdTJnO2A==',
    N'STAMP-USER-008', N'CONCURRENCY-USER-008', N'+5491133008008', 1, 0, NULL, 0, 0, 2, 0, '2026-03-10 19:30:00');
SET IDENTITY_INSERT [AspNetUsers] OFF;
GO

-- Asignar roles en AspNetUserRoles
INSERT INTO [AspNetUserRoles] ([UserId], [RoleId]) VALUES
(1, 1),
(2, 2),
(3, 2),
(4, 2),
(5, 2),
(6, 2),
(7, 2),
(8, 2);
GO

-- ============================================================================
-- 5. INSERTAR CUENTAS (ACCOUNTS)
-- ============================================================================
SET IDENTITY_INSERT [Accounts] ON;
INSERT INTO [Accounts] ([Id], [UserId], [Money], [IsBlocked], [Alias], [Cvu], [CreatedAt]) VALUES
(1, 1, 1500000.00, 0, N'admin.digital.ars',   N'0000003100010000000001', '2026-01-01 08:00:00'),
(2, 2,  345800.00, 0, N'mateo.rossi.ars',     N'0000003100010000000002', '2026-01-15 09:30:00'),
(3, 3,  215450.00, 0, N'sofia.martinez.ars',   N'0000003100010000000003', '2026-02-01 10:15:00'),
(4, 4,  128900.00, 0, N'lucas.benitez.ars',    N'0000003100010000000004', '2026-02-10 11:00:00'),
(5, 5,  480200.00, 0, N'camila.fernandez.ars', N'0000003100010000000005', '2026-02-20 14:20:00'),
(6, 6,   72600.00, 0, N'joaquin.diaz.ars',     N'0000003100010000000006', '2026-03-01 16:40:00'),
(7, 7,  590000.00, 0, N'valentina.gomez.ars',  N'0000003100010000000007', '2026-03-05 18:00:00'),
(8, 8,   95300.00, 0, N'diego.romero.ars',     N'0000003100010000000008', '2026-03-10 19:30:00');
SET IDENTITY_INSERT [Accounts] OFF;
GO

-- ============================================================================
-- 6. INSERTAR PROVEEDORES DE SERVICIOS (SERVICE PROVIDERS)
-- Categories: 1=Electricity, 2=Water, 3=Gas, 4=TelephonyAndInternet, 5=Taxes
-- ============================================================================
SET IDENTITY_INSERT [ServiceProviders] ON;
INSERT INTO [ServiceProviders] ([Id], [Name], [Category], [CodeLabel], [IconName], [IsActive]) VALUES
(1,  N'Edenor',                   1, N'Número de Cuenta / Cliente (10 dígitos)',        N'bolt',                  1),
(2,  N'Edesur',                   1, N'Número de Cliente (8 dígitos)',                  N'bolt',                  1),
(3,  N'EPEC Córdoba',             1, N'Código de Pago Electrónico (14 dígitos)',        N'bolt',                  1),
(4,  N'AySA',                     2, N'Número de Cuenta de Servicios (10 dígitos)',     N'water_drop',            1),
(5,  N'Aguas Cordobesas',         2, N'Código de Unidad de Facturación (8 dígitos)',    N'water_drop',            1),
(6,  N'Metrogas',                 3, N'Número de Referencia de Pago (11 dígitos)',      N'local_fire_department', 1),
(7,  N'Naturgy',                  3, N'Número de Cuenta de Factura (10 dígitos)',       N'local_fire_department', 1),
(8,  N'Camuzzi Gas',              3, N'Código Link / Banelco (12 dígitos)',             N'local_fire_department', 1),
(9,  N'Claro',                    4, N'Número de Línea (10 dígitos con código de área)',N'phone_iphone',          1),
(10, N'Personal Flow',            4, N'Número de Línea o Código de Pago (10 dígitos)',  N'phone_iphone',          1),
(11, N'Movistar',                 4, N'Número de Celular o Cuenta (10 dígitos)',        N'phone_iphone',          1),
(12, N'Telecentro',               4, N'Número de Cliente (8 dígitos)',                  N'router',                1),
(13, N'ARCA / AFIP (VEP)',        5, N'Número de VEP (Volante Electrónico de Pago)',    N'account_balance',       1),
(14, N'AGIP Rentas CABA',         5, N'Código de Pago Electrónico / Partida',           N'receipt',               1),
(15, N'ARBA Buenos Aires',        5, N'Código de Pago Electrónico (14 dígitos)',        N'receipt',               1);
SET IDENTITY_INSERT [ServiceProviders] OFF;
GO

-- ============================================================================
-- 7. INSERTAR TRANSACCIONES CRUZADAS (INTERACCIONES REALISTAS EN UNICODE)
-- Types: 1=Deposit, 2=TransferIn, 3=TransferOut, 4=FixedDeposit, 5=Payment
-- ============================================================================
SET IDENTITY_INSERT [Transactions] ON;
INSERT INTO [Transactions] ([Id], [AccountId], [ToAccountId], [Amount], [Type], [Concept], [Date]) VALUES
-- Depósitos iniciales de saldo / Haberes
(1,  2, NULL, 500000.00, 1, N'Depósito de Haberes - Empresa Tech', '2026-08-01 09:00:00'),
(2,  3, NULL, 350000.00, 1, N'Carga de saldo por transferencia bancaria', '2026-08-01 09:15:00'),
(3,  4, NULL, 280000.00, 1, N'Acreditación sueldo mensual', '2026-08-01 09:30:00'),
(4,  5, NULL, 600000.00, 1, N'Cobro de honorarios profesionales', '2026-08-01 10:00:00'),
(5,  6, NULL, 200000.00, 1, N'Transferencia bancaria recibida', '2026-08-01 10:15:00'),
(6,  7, NULL, 750000.00, 1, N'Ingreso de fondos freelance', '2026-08-01 10:30:00'),
(7,  8, NULL, 180000.00, 1, N'Depósito en efectivo cajero', '2026-08-01 11:00:00'),

-- Interacciones Mateo Rossi (Acc 2) <-> Sofía Martínez (Acc 3)
(8,  2, 3, 85000.00, 3, N'Alquiler cochera y expensas', '2026-08-10 14:20:00'),
(9,  3, 2, 85000.00, 2, N'Alquiler cochera y expensas', '2026-08-10 14:20:00'),

-- Sofía le transfiere $12.500 a Lucas Benítez (Acc 4) por 'Cena Squad y Pizza'
(10, 3, 4, 12500.00, 3, N'Cena Squad y Pizza', '2026-08-12 22:30:00'),
(11, 4, 3, 12500.00, 2, N'Cena Squad y Pizza', '2026-08-12 22:30:00'),

-- Camila Fernández (Acc 5) le transfiere $120.000 a Mateo Rossi (Acc 2) por 'Honorarios Desarrollo Web'
(12, 5, 2, 120000.00, 3, N'Honorarios Desarrollo Web', '2026-08-15 11:45:00'),
(13, 2, 5, 120000.00, 2, N'Honorarios Desarrollo Web', '2026-08-15 11:45:00'),

-- Lucas Benítez (Acc 4) le transfiere $45.000 a Joaquín Díaz (Acc 6) por 'Expensas Torre Belgrano'
(14, 4, 6, 45000.00, 3, N'Expensas Torre Belgrano', '2026-08-18 16:10:00'),
(15, 6, 4, 45000.00, 2, N'Expensas Torre Belgrano', '2026-08-18 16:10:00'),

-- Valentina Gómez (Acc 7) le transfiere $32.400 a Camila Fernández (Acc 5) por 'Supermercado y compras'
(16, 7, 5, 32400.00, 3, N'Supermercado y compras', '2026-08-20 18:00:00'),
(17, 5, 7, 32400.00, 2, N'Supermercado y compras', '2026-08-20 18:00:00'),

-- Diego Romero (Acc 8) le transfiere $18.000 a Mateo Rossi (Acc 2) por 'Cuota gimnasio y running'
(18, 8, 2, 18000.00, 3, N'Cuota gimnasio y running', '2026-08-22 09:15:00'),
(19, 2, 8, 18000.00, 2, N'Cuota gimnasio y running', '2026-08-22 09:15:00'),

-- Joaquín Díaz (Acc 6) le transfiere $55.000 a Valentina Gómez (Acc 7) por 'Servicio de diseño UX'
(20, 6, 7, 55000.00, 3, N'Servicio de diseño UX', '2026-08-25 15:30:00'),
(21, 7, 6, 55000.00, 2, N'Servicio de diseño UX', '2026-08-25 15:30:00'),

-- Sofía Martínez (Acc 3) le transfiere $8.700 a Diego Romero (Acc 8) por 'Reintegro viaje Uber'
(22, 3, 8, 8700.00, 3, N'Reintegro viaje Uber', '2026-08-28 20:45:00'),
(23, 8, 3, 8700.00, 2, N'Reintegro viaje Uber', '2026-08-28 20:45:00'),

-- Mateo Rossi (Acc 2) le transfiere $15.000 a Valentina Gómez (Acc 7) por 'Regalo cumpleaños Lucas'
(24, 2, 7, 15000.00, 3, N'Regalo cumpleaños Lucas', '2026-09-01 12:00:00'),
(25, 7, 2, 15000.00, 2, N'Regalo cumpleaños Lucas', '2026-09-01 12:00:00'),

-- Lucas Benítez (Acc 4) le transfiere $140.000 a Valentina Gómez (Acc 7) por 'Venta notebook usada'
(26, 4, 7, 140000.00, 3, N'Venta notebook usada', '2026-09-03 17:50:00'),
(27, 7, 4, 140000.00, 2, N'Venta notebook usada', '2026-09-03 17:50:00'),

-- Diego Romero (Acc 8) le transfiere $9.500 a Joaquín Díaz (Acc 6) por 'Asado de fin de semana'
(28, 8, 6, 9500.00, 3, N'Asado de fin de semana', '2026-09-05 21:10:00'),
(29, 6, 8, 9500.00, 2, N'Asado de fin de semana', '2026-09-05 21:10:00'),

-- Camila Fernández (Acc 5) le transfiere $28.000 a Sofía Martínez (Acc 3) por 'Clases de inglés particulares'
(30, 5, 3, 28000.00, 3, N'Clases de inglés particulares', '2026-09-07 10:20:00'),
(31, 3, 5, 28000.00, 2, N'Clases de inglés particulares', '2026-09-07 10:20:00'),

-- Mateo Rossi (Acc 2) le transfiere $25.000 a Lucas Benítez (Acc 4) por 'Compra monitor secundario'
(32, 2, 4, 25000.00, 3, N'Compra monitor secundario', '2026-09-08 16:40:00'),
(33, 4, 2, 25000.00, 2, N'Compra monitor secundario', '2026-09-08 16:40:00'),

-- Valentina Gómez (Acc 7) le transfiere $40.000 a Diego Romero (Acc 8) por 'Fotografía evento corporativo'
(34, 7, 8, 40000.00, 3, N'Fotografía evento corporativo', '2026-09-09 11:30:00'),
(35, 8, 7, 40000.00, 2, N'Fotografía evento corporativo', '2026-09-09 11:30:00'),

-- Pagos de Servicios (Type 5 = Payment)
(36, 2, NULL, 18200.00, 5, N'Pago de Servicio - Edenor', '2026-08-15 08:30:00'),
(37, 3, NULL, 12850.00, 5, N'Pago de Servicio - Metrogas', '2026-08-16 09:00:00'),
(38, 4, NULL, 22400.00, 5, N'Pago de Servicio - Personal Flow', '2026-08-20 14:15:00'),
(39, 5, NULL, 45600.00, 5, N'Pago de Servicio - ARCA / AFIP (VEP)', '2026-08-22 10:40:00'),
(40, 7, NULL, 14500.00, 5, N'Pago de Servicio - AySA', '2026-08-25 11:10:00'),
(41, 8, NULL, 15900.00, 5, N'Pago de Servicio - Claro', '2026-08-28 17:00:00'),

-- Constitución de Plazos Fijos (Type 4 = FixedDeposit)
(42, 2, NULL, 100000.00, 4, N'Inversión: Constitución Plazo Fijo Digital 30 días', '2026-08-10 10:00:00'),
(43, 5, NULL, 150000.00, 4, N'Inversión: Constitución Plazo Fijo Rendimiento Max', '2026-08-15 12:00:00'),
(44, 7, NULL, 200000.00, 4, N'Inversión: Constitución Plazo Fijo 60 días', '2026-08-20 15:00:00');
SET IDENTITY_INSERT [Transactions] OFF;
GO

-- ============================================================================
-- 8. INSERTAR TARJETAS (CARDS)
-- Types: 1=Virtual, 2=Physical
-- ============================================================================
SET IDENTITY_INSERT [Cards] ON;
INSERT INTO [Cards] ([Id], [AccountId], [HolderName], [CardNumber], [SecurityCode], [ExpirationDate], [Type], [CreatedAt], [IsActive], [IsFrozen]) VALUES
(1, 2, N'MATEO ROSSI',       N'4532XXXXXXXX1092', N'321', '2029-08-01 00:00:00', 1, '2026-01-16 10:00:00', 1, 0),
(2, 2, N'MATEO ROSSI',       N'5412XXXXXXXX8821', N'654', '2028-12-01 00:00:00', 2, '2026-01-20 11:00:00', 1, 0),
(3, 3, N'SOFIA MARTINEZ',    N'4532XXXXXXXX4431', N'789', '2029-05-01 00:00:00', 1, '2026-02-02 12:00:00', 1, 0),
(4, 3, N'SOFIA MARTINEZ',    N'5412XXXXXXXX3319', N'147', '2028-09-01 00:00:00', 2, '2026-02-05 14:30:00', 1, 0),
(5, 4, N'LUCAS BENITEZ',     N'4532XXXXXXXX9042', N'258', '2029-11-01 00:00:00', 1, '2026-02-11 16:00:00', 1, 0),
(6, 5, N'CAMILA FERNANDEZ',  N'4532XXXXXXXX6712', N'369', '2030-01-01 00:00:00', 1, '2026-02-21 10:15:00', 1, 0),
(7, 5, N'CAMILA FERNANDEZ',  N'5412XXXXXXXX5523', N'951', '2028-06-01 00:00:00', 2, '2026-02-25 15:45:00', 1, 0),
(8, 6, N'JOAQUIN DIAZ',      N'4532XXXXXXXX7104', N'753', '2029-03-01 00:00:00', 1, '2026-03-02 09:30:00', 1, 0),
(9, 7, N'VALENTINA GOMEZ',   N'4532XXXXXXXX8290', N'852', '2029-10-01 00:00:00', 1, '2026-03-06 14:00:00', 1, 0),
(10,7, N'VALENTINA GOMEZ',   N'5412XXXXXXXX1145', N'456', '2028-04-01 00:00:00', 2, '2026-03-08 17:00:00', 1, 0),
(11,8, N'DIEGO ROMERO',      N'4532XXXXXXXX3901', N'123', '2029-07-01 00:00:00', 1, '2026-03-11 11:20:00', 1, 0);
SET IDENTITY_INSERT [Cards] OFF;
GO

-- ============================================================================
-- 9. INSERTAR PLAZOS FIJOS (FIXED TERM DEPOSITS)
-- Status: 1=Active, 2=Closed
-- ============================================================================
SET IDENTITY_INSERT [FixedTermDeposits] ON;
INSERT INTO [FixedTermDeposits] (
    [Id], [AccountId], [Amount], [InterestRate], [DurationDays], 
    [CreationDate], [ClosingDate], [InterestEarned], [FinalAmount], [Status]
) VALUES
-- Mateo Rossi: 1 Plazo Fijo Activo y 1 Cerrado
(1, 2, 100000.00, 42.00, 30, '2026-08-10 10:00:00', '2026-09-09 10:00:00', 3452.05, 103452.05, 1),
(2, 2,  50000.00, 40.00, 30, '2026-07-01 10:00:00', '2026-07-31 10:00:00', 1643.84,  51643.84, 2),

-- Sofía Martínez: 1 Plazo Fijo Activo
(3, 3,  80000.00, 42.00, 60, '2026-08-05 11:00:00', '2026-10-04 11:00:00', 5523.29,  85523.29, 1),

-- Camila Fernández: 1 Plazo Fijo Activo de alto monto
(4, 5, 150000.00, 44.00, 90, '2026-08-15 12:00:00', '2026-11-13 12:00:00', 16273.97, 166273.97, 1),

-- Valentina Gómez: 1 Plazo Fijo Activo
(5, 7, 200000.00, 42.00, 30, '2026-08-20 15:00:00', '2026-09-19 15:00:00', 6904.11, 206904.11, 1);
SET IDENTITY_INSERT [FixedTermDeposits] OFF;
GO

-- ============================================================================
-- 10. INSERTAR METAS DE AHORRO / RESERVAS (MONEY RESERVES)
-- Nombres limpios sin emojis corruptos, con iconos Material MUI correspondientes
-- ============================================================================
SET IDENTITY_INSERT [MoneyReserves] ON;
INSERT INTO [MoneyReserves] ([Id], [AccountId], [Name], [TargetAmount], [CurrentBalance], [Icon], [Color], [CreatedAt], [IsActive]) VALUES
(1, 2, N'Vacaciones Brasil',     300000.00, 185000.00, N'beach_access',    N'#00C853', '2026-02-01 10:00:00', 1),
(2, 2, N'Fondo de Emergencia',   250000.00, 120000.00, N'shield',          N'#2979FF', '2026-02-01 10:00:00', 1),
(3, 3, N'Curso de Posgrado',     180000.00,  95000.00, N'school',          N'#AA00FF', '2026-02-15 14:00:00', 1),
(4, 4, N'Recambio Smartphone',   220000.00,  80000.00, N'smartphone',      N'#FF6D00', '2026-02-20 11:30:00', 1),
(5, 5, N'Comprar Auto',         1200000.00, 450000.00, N'directions_car',  N'#00B0FF', '2026-03-01 09:00:00', 1),
(6, 5, N'Navidad y Regalos',      80000.00,  45000.00, N'card_giftcard',   N'#E91E63', '2026-03-01 09:00:00', 1),
(7, 7, N'Viaje a Europa',       1500000.00, 520000.00, N'flight',          N'#651FFF', '2026-03-06 16:00:00', 1),
(8, 8, N'Renovar Computadora',   350000.00, 110000.00, N'laptop',          N'#00BFA5', '2026-03-11 12:00:00', 1);
SET IDENTITY_INSERT [MoneyReserves] OFF;
GO

-- ============================================================================
-- 11. INSERTAR PAGOS DE SERVICIOS (SERVICE PAYMENTS)
-- ============================================================================
SET IDENTITY_INSERT [ServicePayments] ON;
INSERT INTO [ServicePayments] (
    [Id], [AccountId], [ServiceProviderId], [ReferenceNumber], 
    [Amount], [PaymentDate], [ReceiptNumber], [TransactionId], [ReserveId]
) VALUES
(1, 2, 1,  N'2894109283',  18200.00, '2026-08-15 08:30:00', N'REC-EDN-2026-00812', 36, NULL),
(2, 3, 6,  N'10928374619', 12850.00, '2026-08-16 09:00:00', N'REC-MTG-2026-00543', 37, NULL),
(3, 4, 10, N'1155992244',  22400.00, '2026-08-20 14:15:00', N'REC-FLW-2026-01928', 38, NULL),
(4, 5, 13, N'98273645102', 45600.00, '2026-08-22 10:40:00', N'REC-AFIP-2026-7731', 39, NULL),
(5, 7, 4,  N'4481920394',  14500.00, '2026-08-25 11:10:00', N'REC-AYS-2026-00421', 40, NULL),
(6, 8, 9,  N'1133445566',  15900.00, '2026-08-28 17:00:00', N'REC-CLA-2026-00918', 41, NULL);
SET IDENTITY_INSERT [ServicePayments] OFF;
GO

-- ============================================================================
-- 12. INSERTAR NOTIFICACIONES (Unicode limpio)
-- ============================================================================
SET IDENTITY_INSERT [Notifications] ON;
INSERT INTO [Notifications] ([Id], [UserId], [Title], [Message], [Type], [IsRead], [CreatedAt], [ActionUrl]) VALUES
-- Mateo Rossi (UserId 2)
(1,  2, N'Transferencia recibida', N'Recibiste $120.000,00 de Camila Fernández por Honorarios Desarrollo Web.', N'Transfer', 1, '2026-08-15 11:45:00', N'/dashboard/transactions'),
(2,  2, N'Transferencia enviada', N'Enviaste $85.000,00 a Sofía Martínez por Alquiler cochera y expensas.', N'Transfer', 1, '2026-08-10 14:20:00', N'/dashboard/transactions'),
(3,  2, N'Pago de servicio exitoso', N'Se procesó tu pago de $18.200,00 a Edenor. Comprobante REC-EDN-2026-00812.', N'Payment', 1, '2026-08-15 08:30:00', N'/dashboard/services'),
(4,  2, N'Plazo Fijo Constituido', N'Tu plazo fijo por $100.000,00 a 30 días está activo generando rendimientos.', N'Investment', 0, '2026-08-10 10:00:00', N'/dashboard/investments'),
(5,  2, N'Meta de Ahorro', N'¡Buen progreso! Has completado más del 60% de tu meta Fondo de Emergencia.', N'Reserve', 0, '2026-09-08 18:00:00', N'/dashboard/reserves'),

-- Sofía Martínez (UserId 3)
(6,  3, N'Transferencia recibida', N'Recibiste $85.000,00 de Mateo Rossi.', N'Transfer', 1, '2026-08-10 14:20:00', N'/dashboard/transactions'),
(7,  3, N'Transferencia enviada', N'Enviaste $12.500,00 a Lucas Benítez por Cena Squad y Pizza.', N'Transfer', 1, '2026-08-12 22:30:00', N'/dashboard/transactions'),
(8,  3, N'Pago de Metrogas realizado', N'Tu factura de Metrogas por $12.850,00 fue abonada con éxito.', N'Payment', 0, '2026-08-16 09:00:00', N'/dashboard/services'),

-- Lucas Benítez (UserId 4)
(9,  4, N'Transferencia recibida', N'Recibiste $140.000,00 de Valentina Gómez por Venta notebook usada.', N'Transfer', 0, '2026-09-03 17:50:00', N'/dashboard/transactions'),
(10, 4, N'Transferencia recibida', N'Recibiste $25.000,00 de Mateo Rossi por Compra monitor secundario.', N'Transfer', 0, '2026-09-08 16:40:00', N'/dashboard/transactions'),

-- Camila Fernández (UserId 5)
(11, 5, N'Plazo Fijo Activo', N'Tu inversión de $150.000,00 con TNA 44% vencerá el 13/11/2026.', N'Investment', 0, '2026-08-15 12:00:00', N'/dashboard/investments'),
(12, 5, N'Transferencia recibida', N'Recibiste $32.400,00 de Valentina Gómez.', N'Transfer', 1, '2026-08-20 18:00:00', N'/dashboard/transactions'),

-- Valentina Gómez (UserId 7)
(13, 7, N'Transferencia recibida', N'Recibiste $55.000,00 de Joaquín Díaz por Servicio de diseño UX.', N'Transfer', 1, '2026-08-25 15:30:00', N'/dashboard/transactions'),
(14, 7, N'Nueva Tarjeta Virtual', N'Tu tarjeta virtual terminada en 8290 se encuentra activa y lista para usar.', N'Card', 0, '2026-03-06 14:05:00', N'/dashboard/cards'),

-- Diego Romero (UserId 8)
(15, 8, N'Transferencia recibida', N'Recibiste $40.000,00 de Valentina Gómez por Fotografía evento corporativo.', N'Transfer', 0, '2026-09-09 11:30:00', N'/dashboard/transactions');
SET IDENTITY_INSERT [Notifications] OFF;
GO

-- 13. Reactivar las restricciones de Foreign Key
EXEC sp_MSforeachtable "ALTER TABLE ? WITH CHECK CHECK CONSTRAINT all";
GO

PRINT '>>> DIGITALARS DATABASE RESET & SEEDING COMPLETADO CON EXITO (UNICODE CLEAN) <<<';
