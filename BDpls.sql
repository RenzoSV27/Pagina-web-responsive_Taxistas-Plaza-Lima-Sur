CREATE DATABASE PLS;
USE PLS;

/* ============================================================
   Taxi Plaza Lima Sur - Esquema SQL Server
   Base de datos: PLZ
   ============================================================ */
IF NOT EXISTS (SELECT 1 FROM sys.databases WHERE name = N'PLZ')
BEGIN
    CREATE DATABASE PLZ;
END
GO

USE PLZ;
GO

/* ------------------------------------------------------------
   TABLA: taxistas
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.taxistas', N'U') IS NOT NULL
    DROP TABLE dbo.taxistas;
GO

CREATE TABLE dbo.taxistas (
    id                  INT             NOT NULL IDENTITY(1,1),
    nombre              NVARCHAR(150)   NOT NULL,
    dni                 CHAR(8)         NOT NULL,
    telefono            NVARCHAR(20)    NOT NULL,
    correo              NVARCHAR(150)   NOT NULL,
    contrasena_hash     NVARCHAR(255)   NOT NULL,
    placa               NVARCHAR(15)    NOT NULL,
    vehiculo            NVARCHAR(100)   NOT NULL,
    licencia            NVARCHAR(50)    NULL,
    calificacion        DECIMAL(2,1)    NOT NULL CONSTRAINT DF_taxistas_calificacion DEFAULT (0.0),
    viajes_totales      INT             NOT NULL CONSTRAINT DF_taxistas_viajes_totales DEFAULT (0),
    foto_url            NVARCHAR(500)   NULL,
    estado              NVARCHAR(20)    NOT NULL CONSTRAINT DF_taxistas_estado DEFAULT (N'disponible'),
    fecha_registro      DATE            NOT NULL CONSTRAINT DF_taxistas_fecha_registro DEFAULT (CAST(GETDATE() AS DATE)),
    acepta_terminos     BIT             NOT NULL CONSTRAINT DF_taxistas_acepta_terminos DEFAULT (0),
    creado_en           DATETIME2(0)    NOT NULL CONSTRAINT DF_taxistas_creado_en DEFAULT (SYSDATETIME()),
    actualizado_en      DATETIME2(0)    NOT NULL CONSTRAINT DF_taxistas_actualizado_en DEFAULT (SYSDATETIME()),

    CONSTRAINT PK_taxistas PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_taxistas_correo UNIQUE (correo),
    CONSTRAINT UQ_taxistas_dni UNIQUE (dni),
    CONSTRAINT CK_taxistas_calificacion CHECK (calificacion >= 0 AND calificacion <= 5),
    CONSTRAINT CK_taxistas_viajes_totales CHECK (viajes_totales >= 0),
    CONSTRAINT CK_taxistas_estado CHECK (estado IN (N'disponible', N'ocupado', N'inactivo'))
);
GO

CREATE NONCLUSTERED INDEX IX_taxistas_estado ON dbo.taxistas (estado);
GO

/* ------------------------------------------------------------
   TABLA: sesiones
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.sesiones', N'U') IS NOT NULL
    DROP TABLE dbo.sesiones;
GO

CREATE TABLE dbo.sesiones (
    id              INT             NOT NULL IDENTITY(1,1),
    taxista_id      INT             NOT NULL,
    token           NVARCHAR(255)   NOT NULL,
    iniciada_en     DATETIME2(0)    NOT NULL CONSTRAINT DF_sesiones_iniciada_en DEFAULT (SYSDATETIME()),
    expira_en       DATETIME2(0)    NOT NULL,
    activa          BIT             NOT NULL CONSTRAINT DF_sesiones_activa DEFAULT (1),

    CONSTRAINT PK_sesiones PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_sesiones_token UNIQUE (token),
    CONSTRAINT FK_sesiones_taxistas FOREIGN KEY (taxista_id)
        REFERENCES dbo.taxistas (id)
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);
GO

CREATE NONCLUSTERED INDEX IX_sesiones_taxista_id ON dbo.sesiones (taxista_id);
CREATE NONCLUSTERED INDEX IX_sesiones_activa ON dbo.sesiones (activa);
GO

/* ------------------------------------------------------------
   TABLA: tokens_recuperacion_contrasena
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.tokens_recuperacion_contrasena', N'U') IS NOT NULL
    DROP TABLE dbo.tokens_recuperacion_contrasena;
GO

CREATE TABLE dbo.tokens_recuperacion_contrasena (
    id              INT             NOT NULL IDENTITY(1,1),
    taxista_id      INT             NOT NULL,
    token           NVARCHAR(255)   NOT NULL,
    expira_en       DATETIME2(0)    NOT NULL,
    usado           BIT             NOT NULL CONSTRAINT DF_tokens_recuperacion_usado DEFAULT (0),
    creado_en       DATETIME2(0)    NOT NULL CONSTRAINT DF_tokens_recuperacion_creado_en DEFAULT (SYSDATETIME()),

    CONSTRAINT PK_tokens_recuperacion_contrasena PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_tokens_recuperacion_token UNIQUE (token),
    CONSTRAINT FK_tokens_recuperacion_taxistas FOREIGN KEY (taxista_id)
        REFERENCES dbo.taxistas (id)
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);
GO

CREATE NONCLUSTERED INDEX IX_tokens_recuperacion_taxista_id ON dbo.tokens_recuperacion_contrasena (taxista_id);
GO

/* ------------------------------------------------------------
   TABLA: servicios
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.servicios', N'U') IS NOT NULL
    DROP TABLE dbo.servicios;
GO

CREATE TABLE dbo.servicios (
    id                      INT             NOT NULL IDENTITY(1,1),
    tienda                  NVARCHAR(100)   NOT NULL,
    tipo                    NVARCHAR(50)    NOT NULL CONSTRAINT DF_servicios_tipo DEFAULT (N'Entrega'),
    prioridad               BIT             NOT NULL CONSTRAINT DF_servicios_prioridad DEFAULT (0),
    origen                  NVARCHAR(250)   NOT NULL,
    destino                 NVARCHAR(250)   NOT NULL,
    producto                NVARCHAR(150)   NOT NULL,
    peso                    NVARCHAR(30)    NOT NULL,
    tarifa                  DECIMAL(10,2)   NOT NULL,
    distancia               NVARCHAR(30)    NOT NULL,
    tiempo_estimado         NVARCHAR(30)    NOT NULL,
    cliente                 NVARCHAR(150)   NOT NULL,
    telefono_cliente        NVARCHAR(20)    NOT NULL,
    notas                   NVARCHAR(500)   NULL,
    latitud_recogida        DECIMAL(10,7)   NOT NULL,
    longitud_recogida       DECIMAL(10,7)   NOT NULL,
    latitud_entrega         DECIMAL(10,7)   NOT NULL,
    longitud_entrega        DECIMAL(10,7)   NOT NULL,
    estado                  NVARCHAR(20)    NOT NULL CONSTRAINT DF_servicios_estado DEFAULT (N'disponible'),
    taxista_id              INT             NULL,
    creado_en               DATETIME2(0)    NOT NULL CONSTRAINT DF_servicios_creado_en DEFAULT (SYSDATETIME()),
    actualizado_en          DATETIME2(0)    NOT NULL CONSTRAINT DF_servicios_actualizado_en DEFAULT (SYSDATETIME()),

    CONSTRAINT PK_servicios PRIMARY KEY CLUSTERED (id),
    CONSTRAINT FK_servicios_taxistas FOREIGN KEY (taxista_id)
        REFERENCES dbo.taxistas (id)
        ON UPDATE NO ACTION
        ON DELETE SET NULL,
    CONSTRAINT CK_servicios_tarifa CHECK (tarifa >= 0),
    CONSTRAINT CK_servicios_estado CHECK (estado IN (N'disponible', N'asignado', N'completado', N'cancelado'))
);
GO

CREATE NONCLUSTERED INDEX IX_servicios_estado ON dbo.servicios (estado);
CREATE NONCLUSTERED INDEX IX_servicios_taxista_id ON dbo.servicios (taxista_id);
CREATE NONCLUSTERED INDEX IX_servicios_prioridad ON dbo.servicios (prioridad);
GO

/* ------------------------------------------------------------
   TABLA: servicios_activos
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.servicios_activos', N'U') IS NOT NULL
    DROP TABLE dbo.servicios_activos;
GO

CREATE TABLE dbo.servicios_activos (
    id              INT             NOT NULL IDENTITY(1,1),
    servicio_id     INT             NOT NULL,
    taxista_id      INT             NOT NULL,
    etapa           NVARCHAR(30)    NOT NULL,
    aceptado_en     DATETIME2(0)    NOT NULL CONSTRAINT DF_servicios_activos_aceptado_en DEFAULT (SYSDATETIME()),
    actualizado_en  DATETIME2(0)    NOT NULL CONSTRAINT DF_servicios_activos_actualizado_en DEFAULT (SYSDATETIME()),

    CONSTRAINT PK_servicios_activos PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_servicios_activos_servicio_id UNIQUE (servicio_id),
    CONSTRAINT UQ_servicios_activos_taxista_id UNIQUE (taxista_id),
    CONSTRAINT FK_servicios_activos_servicios FOREIGN KEY (servicio_id)
        REFERENCES dbo.servicios (id)
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT FK_servicios_activos_taxistas FOREIGN KEY (taxista_id)
        REFERENCES dbo.taxistas (id)
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT CK_servicios_activos_etapa CHECK (etapa IN (
        N'aceptado',
        N'recogida',
        N'confirmacion-recogida',
        N'en-curso',
        N'destino',
        N'confirmacion-entrega'
    ))
);
GO

/* ------------------------------------------------------------
   TABLA: historial_servicios
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.historial_servicios', N'U') IS NOT NULL
    DROP TABLE dbo.historial_servicios;
GO

CREATE TABLE dbo.historial_servicios (
    id              INT             NOT NULL IDENTITY(1,1),
    taxista_id      INT             NOT NULL,
    servicio_id     INT             NULL,
    fecha           DATE            NOT NULL,
    tienda          NVARCHAR(100)   NOT NULL,
    destino         NVARCHAR(250)   NOT NULL,
    tarifa          DECIMAL(10,2)   NOT NULL,
    estado          NVARCHAR(20)    NOT NULL,
    completado_en   DATETIME2(0)    NULL,

    CONSTRAINT PK_historial_servicios PRIMARY KEY CLUSTERED (id),
    CONSTRAINT FK_historial_servicios_taxistas FOREIGN KEY (taxista_id)
        REFERENCES dbo.taxistas (id)
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT FK_historial_servicios_servicios FOREIGN KEY (servicio_id)
        REFERENCES dbo.servicios (id)
        ON UPDATE NO ACTION
        ON DELETE SET NULL,
    CONSTRAINT CK_historial_servicios_tarifa CHECK (tarifa >= 0),
    CONSTRAINT CK_historial_servicios_estado CHECK (estado IN (N'completado', N'cancelado'))
);
GO

CREATE NONCLUSTERED INDEX IX_historial_servicios_taxista_id ON dbo.historial_servicios (taxista_id);
CREATE NONCLUSTERED INDEX IX_historial_servicios_fecha ON dbo.historial_servicios (fecha DESC);
CREATE NONCLUSTERED INDEX IX_historial_servicios_estado ON dbo.historial_servicios (estado);
GO

/* ------------------------------------------------------------
   TABLA: pagos
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.pagos', N'U') IS NOT NULL
    DROP TABLE dbo.pagos;
GO

CREATE TABLE dbo.pagos (
    id              INT             NOT NULL IDENTITY(1,1),
    taxista_id      INT             NOT NULL,
    fecha           DATE            NOT NULL,
    monto           DECIMAL(10,2)   NOT NULL,
    metodo          NVARCHAR(50)    NOT NULL,
    estado          NVARCHAR(20)    NOT NULL CONSTRAINT DF_pagos_estado DEFAULT (N'procesado'),
    periodo_inicio  DATE            NULL,
    periodo_fin     DATE            NULL,
    creado_en       DATETIME2(0)    NOT NULL CONSTRAINT DF_pagos_creado_en DEFAULT (SYSDATETIME()),

    CONSTRAINT PK_pagos PRIMARY KEY CLUSTERED (id),
    CONSTRAINT FK_pagos_taxistas FOREIGN KEY (taxista_id)
        REFERENCES dbo.taxistas (id)
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT CK_pagos_monto CHECK (monto >= 0),
    CONSTRAINT CK_pagos_estado CHECK (estado IN (N'procesado', N'pendiente'))
);
GO

CREATE NONCLUSTERED INDEX IX_pagos_taxista_id ON dbo.pagos (taxista_id);
CREATE NONCLUSTERED INDEX IX_pagos_fecha ON dbo.pagos (fecha DESC);
CREATE NONCLUSTERED INDEX IX_pagos_estado ON dbo.pagos (estado);
GO

/* ------------------------------------------------------------
   TABLA: notificaciones
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.notificaciones', N'U') IS NOT NULL
    DROP TABLE dbo.notificaciones;
GO

CREATE TABLE dbo.notificaciones (
    id              INT             NOT NULL IDENTITY(1,1),
    taxista_id      INT             NOT NULL,
    titulo          NVARCHAR(150)   NOT NULL,
    mensaje         NVARCHAR(500)   NOT NULL,
    tipo            NVARCHAR(20)    NOT NULL,
    leida           BIT             NOT NULL CONSTRAINT DF_notificaciones_leida DEFAULT (0),
    fecha           DATETIME2(0)    NOT NULL CONSTRAINT DF_notificaciones_fecha DEFAULT (SYSDATETIME()),
    creado_en       DATETIME2(0)    NOT NULL CONSTRAINT DF_notificaciones_creado_en DEFAULT (SYSDATETIME()),

    CONSTRAINT PK_notificaciones PRIMARY KEY CLUSTERED (id),
    CONSTRAINT FK_notificaciones_taxistas FOREIGN KEY (taxista_id)
        REFERENCES dbo.taxistas (id)
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT CK_notificaciones_tipo CHECK (tipo IN (N'servicio', N'pago', N'info', N'sistema'))
);
GO

CREATE NONCLUSTERED INDEX IX_notificaciones_taxista_id ON dbo.notificaciones (taxista_id);
CREATE NONCLUSTERED INDEX IX_notificaciones_leida ON dbo.notificaciones (leida);
CREATE NONCLUSTERED INDEX IX_notificaciones_fecha ON dbo.notificaciones (fecha DESC);
GO

/* ------------------------------------------------------------
   TABLA: preferencias_taxista
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.preferencias_taxista', N'U') IS NOT NULL
    DROP TABLE dbo.preferencias_taxista;
GO

CREATE TABLE dbo.preferencias_taxista (
    id                              INT             NOT NULL IDENTITY(1,1),
    taxista_id                      INT             NOT NULL,
    alto_contraste                  BIT             NOT NULL CONSTRAINT DF_preferencias_alto_contraste DEFAULT (0),
    texto_grande                    BIT             NOT NULL CONSTRAINT DF_preferencias_texto_grande DEFAULT (0),
    notif_servicios_cercanos        BIT             NOT NULL CONSTRAINT DF_preferencias_notif_servicios DEFAULT (1),
    notif_confirmacion_pagos        BIT             NOT NULL CONSTRAINT DF_preferencias_notif_pagos DEFAULT (1),
    notif_actualizaciones_sistema   BIT             NOT NULL CONSTRAINT DF_preferencias_notif_sistema DEFAULT (0),
    notif_recordatorios_servicio    BIT             NOT NULL CONSTRAINT DF_preferencias_notif_recordatorios DEFAULT (1),
    actualizado_en                  DATETIME2(0)    NOT NULL CONSTRAINT DF_preferencias_actualizado_en DEFAULT (SYSDATETIME()),

    CONSTRAINT PK_preferencias_taxista PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_preferencias_taxista_taxista_id UNIQUE (taxista_id),
    CONSTRAINT FK_preferencias_taxistas FOREIGN KEY (taxista_id)
        REFERENCES dbo.taxistas (id)
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);
GO

/* ------------------------------------------------------------
   TABLA: preguntas_frecuentes
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.preguntas_frecuentes', N'U') IS NOT NULL
    DROP TABLE dbo.preguntas_frecuentes;
GO

CREATE TABLE dbo.preguntas_frecuentes (
    id          INT             NOT NULL IDENTITY(1,1),
    pregunta    NVARCHAR(300)   NOT NULL,
    respuesta   NVARCHAR(1000)  NOT NULL,
    orden       INT             NOT NULL CONSTRAINT DF_preguntas_frecuentes_orden DEFAULT (0),
    activa      BIT             NOT NULL CONSTRAINT DF_preguntas_frecuentes_activa DEFAULT (1),
    creado_en   DATETIME2(0)    NOT NULL CONSTRAINT DF_preguntas_frecuentes_creado_en DEFAULT (SYSDATETIME()),

    CONSTRAINT PK_preguntas_frecuentes PRIMARY KEY CLUSTERED (id)
);
GO

CREATE NONCLUSTERED INDEX IX_preguntas_frecuentes_orden ON dbo.preguntas_frecuentes (orden);
GO

/* ------------------------------------------------------------
   TABLA: mensajes_soporte
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.mensajes_soporte', N'U') IS NOT NULL
    DROP TABLE dbo.mensajes_soporte;
GO

CREATE TABLE dbo.mensajes_soporte (
    id              INT             NOT NULL IDENTITY(1,1),
    taxista_id      INT             NULL,
    nombre          NVARCHAR(150)   NOT NULL,
    correo          NVARCHAR(150)   NOT NULL,
    asunto          NVARCHAR(200)   NOT NULL,
    mensaje         NVARCHAR(2000)  NOT NULL,
    estado          NVARCHAR(20)    NOT NULL CONSTRAINT DF_mensajes_soporte_estado DEFAULT (N'nuevo'),
    enviado_en      DATETIME2(0)    NOT NULL CONSTRAINT DF_mensajes_soporte_enviado_en DEFAULT (SYSDATETIME()),

    CONSTRAINT PK_mensajes_soporte PRIMARY KEY CLUSTERED (id),
    CONSTRAINT FK_mensajes_soporte_taxistas FOREIGN KEY (taxista_id)
        REFERENCES dbo.taxistas (id)
        ON UPDATE NO ACTION
        ON DELETE SET NULL,
    CONSTRAINT CK_mensajes_soporte_estado CHECK (estado IN (N'nuevo', N'en_proceso', N'respondido'))
);
GO

CREATE NONCLUSTERED INDEX IX_mensajes_soporte_taxista_id ON dbo.mensajes_soporte (taxista_id);
CREATE NONCLUSTERED INDEX IX_mensajes_soporte_estado ON dbo.mensajes_soporte (estado);
GO

/* ------------------------------------------------------------
   TRIGGER: actualizar actualizado_en en taxistas
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.TR_taxistas_actualizado_en', N'TR') IS NOT NULL
    DROP TRIGGER dbo.TR_taxistas_actualizado_en;
GO

CREATE TRIGGER dbo.TR_taxistas_actualizado_en
ON dbo.taxistas
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE t
    SET actualizado_en = SYSDATETIME()
    FROM dbo.taxistas t
    INNER JOIN inserted i ON i.id = t.id;
END;
GO

/* ------------------------------------------------------------
   TRIGGER: actualizar actualizado_en en servicios
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.TR_servicios_actualizado_en', N'TR') IS NOT NULL
    DROP TRIGGER dbo.TR_servicios_actualizado_en;
GO

CREATE TRIGGER dbo.TR_servicios_actualizado_en
ON dbo.servicios
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE s
    SET actualizado_en = SYSDATETIME()
    FROM dbo.servicios s
    INNER JOIN inserted i ON i.id = s.id;
END;
GO

/* ------------------------------------------------------------
   TRIGGER: actualizar actualizado_en en servicios_activos
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.TR_servicios_activos_actualizado_en', N'TR') IS NOT NULL
    DROP TRIGGER dbo.TR_servicios_activos_actualizado_en;
GO

CREATE TRIGGER dbo.TR_servicios_activos_actualizado_en
ON dbo.servicios_activos
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE sa
    SET actualizado_en = SYSDATETIME()
    FROM dbo.servicios_activos sa
    INNER JOIN inserted i ON i.id = sa.id;
END;
GO

/* ------------------------------------------------------------
   TRIGGER: actualizar actualizado_en en preferencias_taxista
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.TR_preferencias_taxista_actualizado_en', N'TR') IS NOT NULL
    DROP TRIGGER dbo.TR_preferencias_taxista_actualizado_en;
GO

CREATE TRIGGER dbo.TR_preferencias_taxista_actualizado_en
ON dbo.preferencias_taxista
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE p
    SET actualizado_en = SYSDATETIME()
    FROM dbo.preferencias_taxista p
    INNER JOIN inserted i ON i.id = p.id;
END;
GO

PRINT N'Base de datos PLZ creada correctamente.';
GO