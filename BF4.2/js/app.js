// ============================================
// BALANCE FORRAJERO PRO v6.0 - Inicializacion
// ============================================

function cargarDatos() {
    datosForrajeros = DATOS_FORRAJEROS_EMBEBIDOS;
    try {
        inicializarApp();
    } catch(e) {
        console.error('Error al inicializar:', e);
        var container = document.getElementById('recursosContainer');
        if (container) {
            container.innerHTML = '<div class="alert alert-danger"><strong>Error al inicializar:</strong> ' + e.message + '</div>';
        }
    }
}

function inicializarApp() {
    // Inicializar meses de uso con defaults
    datosForrajeros.recursos.forEach(function(r) {
        mesesUsoRecursos[r] = (MESES_USO_DEFECTO[r] || [1,1,1,1,1,1,1,1,1,1,1,1]).slice();
    });

    generarInputsRecursos();

    // Intentar restaurar estado guardado de localStorage
    var restaurado = false;
    if (typeof restaurarEstadoAuto === 'function') {
        restaurado = restaurarEstadoAuto();
    }

    if (!restaurado) {
        // Crear escenario base vacio
        crearEscenario('Escenario Base');

        // Cargar datos de clima guardados
        if (typeof cargarClimaGuardado === 'function') {
            cargarClimaGuardado();
        }

        // Mostrar pantalla de bienvenida
        mostrarBienvenida();
    }

    // Renderizar instructivos de ayuda
    if (typeof renderizarInstructivos === 'function') {
        renderizarInstructivos();
    }

    // Renderizar tabs especiales
    if (typeof renderTabNutricion === 'function') {
        renderTabNutricion();
    }
    if (typeof renderTabNDVI === 'function') {
        renderTabNDVI();
    }

    console.log('Balance Forrajero PRO v6.0 inicializado' + (restaurado ? ' (datos restaurados)' : ''));
}

// --- Pantalla de bienvenida ---

function mostrarBienvenida() {
    var el = document.getElementById('bienvenida');
    if (el) el.style.display = 'flex';
}

function ocultarBienvenida() {
    var el = document.getElementById('bienvenida');
    if (el) el.style.display = 'none';
}

// --- Datos de ejemplo ---

function cargarDatosEjemplo() {
    ocultarBienvenida();

    // Precargar hectareas
    var haInputs = {
        'Campo_natural': 10,
        'Pastura_consociada': 32,
        'Pastura_de_agropiro': 15,
        'Pastura_de_festuca': 71
    };
    Object.keys(haInputs).forEach(function(key) {
        var el = document.getElementById('ha_' + key);
        if (el) el.value = haInputs[key];
    });

    // Precargar lotes en escenario base
    var esc = getEscenarioActivo();
    if (esc) {
        esc.grupos = [];
        esc.grupos.push({
            id: nextId++,
            categoria: 'novillo',
            cantidad: 91,
            pesoInicial: 370,
            ganancia: 0.800,
            criterioSalida: 'fecha',
            fechaEntrada: '2025-01-10',
            fechaSalida: '2025-10-30',
            pesoObjetivo: null,
            costos: { compra: 1200, venta: 1400, sanidad: 5000 },
            modoGanancia: 'manual'
        });
        esc.grupos.push({
            id: nextId++,
            categoria: 'ternera',
            cantidad: 150,
            pesoInicial: 180,
            ganancia: 0.650,
            criterioSalida: 'fecha',
            fechaEntrada: '2025-01-01',
            fechaSalida: '2025-12-31',
            pesoObjetivo: null,
            costos: { compra: 800, venta: 1100, sanidad: 4000 },
            modoGanancia: 'manual'
        });
        actualizarVistaEscenarios();
    }

    // Precargar potreros de ejemplo
    potreros = [
        { id: nextId++, nombre: 'Potrero 1', superficie: 25, recurso: 'Pastura de festuca', aguada: true, estado: 'disponible' },
        { id: nextId++, nombre: 'Potrero 2', superficie: 23, recurso: 'Pastura de festuca', aguada: true, estado: 'disponible' },
        { id: nextId++, nombre: 'Potrero 3', superficie: 23, recurso: 'Pastura de festuca', aguada: false, estado: 'disponible' },
        { id: nextId++, nombre: 'Potrero 4', superficie: 32, recurso: 'Pastura consociada', aguada: true, estado: 'disponible' },
        { id: nextId++, nombre: 'Potrero 5', superficie: 25, recurso: 'Pastura de agropiro', aguada: true, estado: 'disponible' }
    ];

    if (typeof actualizarVistaPotreros === 'function') actualizarVistaPotreros();
    if (typeof cargarSelectsRotacion === 'function') cargarSelectsRotacion();

    // Calcular balance automaticamente
    setTimeout(function() {
        try { calcularBalance(); } catch(e) { console.error('Error auto-calculo:', e); }
        // Render nutricion despues del balance
        if (typeof renderGananciaGrupos === 'function') renderGananciaGrupos();
    }, 300);

    alert('Datos de ejemplo cargados.');
}

window.onload = cargarDatos;
