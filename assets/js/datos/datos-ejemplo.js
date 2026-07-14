const DATOS_EJEMPLO = {
    credencialesDemo: {
        correo: 'taxista@demo.com',
        contrasena: 'demo123'
    },

    taxista: {
        id: 'tx-001',
        nombre: 'Carlos Mendoza',
        dni: '45678912',
        telefono: '+51 987 654 321',
        correo: 'taxista@demo.com',
        placa: 'ABC-123',
        vehiculo: 'Toyota Yaris 2019',
        licencia: 'LIC-2024-8891',
        calificacion: 4.8,
        viajesTotales: 342,
        fotoUrl: null,
        estado: 'disponible',
        fechaRegistro: '2024-03-15'
    },

    resumenDia: {
        serviciosHoy: 12,
        completados: 9,
        ganancias: 145,
        estado: 'Disponible'
    },

    serviciosDisponibles: [
        {
            id: 'srv-001',
            tienda: 'Ripley',
            tipo: 'Entrega',
            prioridad: false,
            origen: 'Matellini - Chorrillos',
            destino: 'Av. Paseo de la República 5890, Surquillo',
            producto: 'Televisor 55"',
            peso: '18 kg',
            tarifa: 15.0,
            distancia: '4.2 km',
            tiempoEstimado: '25 min',
            cliente: 'María López',
            telefonoCliente: '+51 912 345 678',
            notas: 'Tocar timbre, edificio azul piso 3.',
            coordenadasRecogida: { lat: -12.1895, lng: -77.0212 },
            coordenadasEntrega: { lat: -12.1089, lng: -77.0287 }
        },
        {
            id: 'srv-002',
            tienda: 'Saga Falabella',
            tipo: 'Entrega',
            prioridad: true,
            origen: 'Surco',
            destino: 'Calle Las Begonias 475, San Isidro',
            producto: 'Horno microondas',
            peso: '12 kg',
            tarifa: 18.0,
            distancia: '5.8 km',
            tiempoEstimado: '32 min',
            cliente: 'Jorge Ramírez',
            telefonoCliente: '+51 923 456 789',
            notas: 'Entregar en recepción del edificio.',
            coordenadasRecogida: { lat: -12.1356, lng: -76.9987 },
            coordenadasEntrega: { lat: -12.0965, lng: -77.0365 }
        },
        {
            id: 'srv-003',
            tienda: 'Promart',
            tipo: 'Entrega',
            prioridad: false,
            origen: 'Barranco',
            destino: 'Jr. Huancavelica 245, Lima Cercado',
            producto: 'Herramientas',
            peso: '8 kg',
            tarifa: 20.0,
            distancia: '7.1 km',
            tiempoEstimado: '38 min',
            cliente: 'Ana Torres',
            telefonoCliente: '+51 934 567 890',
            notas: 'Producto frágil, manejar con cuidado.',
            coordenadasRecogida: { lat: -12.1467, lng: -77.0209 },
            coordenadasEntrega: { lat: -12.0464, lng: -77.0428 }
        }
    ],

    historial: [
        { id: 'hist-001', fecha: '2026-06-02', destino: 'Surco', tarifa: 18, estado: 'completado', tienda: 'Saga Falabella' },
        { id: 'hist-002', fecha: '2026-06-01', destino: 'Barranco', tarifa: 20, estado: 'completado', tienda: 'Promart' },
        { id: 'hist-003', fecha: '2026-05-31', destino: 'Chorrillos', tarifa: 15, estado: 'completado', tienda: 'Ripley' },
        { id: 'hist-004', fecha: '2026-05-30', destino: 'Miraflores', tarifa: 22, estado: 'completado', tienda: 'Plaza Vea' },
        { id: 'hist-005', fecha: '2026-05-29', destino: 'San Borja', tarifa: 16, estado: 'cancelado', tienda: 'Tottus' },
        { id: 'hist-006', fecha: '2026-05-28', destino: 'La Molina', tarifa: 25, estado: 'completado', tienda: 'Metro' }
    ],

    ganancias: {
        hoy: 145,
        semana: 892,
        mes: 3420,
        pendientePago: 580,
        desgloseSemanal: [
            { dia: 'Lun', monto: 120 },
            { dia: 'Mar', monto: 145 },
            { dia: 'Mié', monto: 98 },
            { dia: 'Jue', monto: 167 },
            { dia: 'Vie', monto: 189 },
            { dia: 'Sáb', monto: 95 },
            { dia: 'Dom', monto: 78 }
        ],
        ultimosPagos: [
            { fecha: '2026-05-25', monto: 1250, metodo: 'Transferencia' },
            { fecha: '2026-05-18', monto: 1180, metodo: 'Transferencia' },
            { fecha: '2026-05-11', monto: 1095, metodo: 'Transferencia' }
        ]
    },

    notificaciones: [
        { id: 'not-001', titulo: 'Nuevo servicio cerca', mensaje: 'Hay un servicio disponible en Matellini a 2 min.', tipo: 'servicio', leida: false, fecha: '2026-06-16T08:30:00' },
        { id: 'not-002', titulo: 'Pago procesado', mensaje: 'Se acreditó S/ 1,250.00 en tu cuenta.', tipo: 'pago', leida: false, fecha: '2026-06-15T14:00:00' },
        { id: 'not-003', titulo: 'Servicio completado', mensaje: 'Entrega en Surco finalizada correctamente.', tipo: 'info', leida: true, fecha: '2026-06-14T11:20:00' },
        { id: 'not-004', titulo: 'Actualización de app', mensaje: 'Nueva versión disponible con mejoras de accesibilidad.', tipo: 'sistema', leida: true, fecha: '2026-06-10T09:00:00' }
    ],

    preguntasFrecuentes: [
        { pregunta: '¿Cómo acepto un servicio?', respuesta: 'Ve a Servicios Disponibles, selecciona uno y presiona Aceptar servicio.' },
        { pregunta: '¿Cuándo recibo mis ganancias?', respuesta: 'Los pagos se procesan cada lunes por los servicios de la semana anterior.' },
        { pregunta: '¿Puedo cancelar un servicio aceptado?', respuesta: 'Solo en casos excepcionales. Contacta a soporte lo antes posible.' },
        { pregunta: '¿Cómo cambio mi contraseña?', respuesta: 'Desde Perfil > Cambio de contraseña puedes actualizar tus credenciales.' }
    ]
};
