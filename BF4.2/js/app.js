// ============================================
// BALANCE FORRAJERO PRO v6.0 - Inicializacion
// (c) 2025-2026 Santiago Jose Insaurralde.
// Todos los derechos reservados.
// ============================================

// --- Control de version de prueba ---
var FECHA_EXPIRACION = new Date('2026-06-01');

function verificarExpiracion() {
    if (new Date() > FECHA_EXPIRACION) {
        document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f5f6fa;">' +
            '<div style="text-align:center;padding:40px;background:#fff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.10);max-width:500px;">' +
            '<div style="font-size:3em;margin-bottom:15px;">&#9888;</div>' +
            '<h2 style="color:#e74c3c;margin-bottom:10px;">Version de prueba expirada</h2>' +
            '<p style="color:#555;margin-bottom:20px;">Esta version de Balance Forrajero PRO ha expirado el ' + FECHA_EXPIRACION.toLocaleDateString('es-AR') + '.</p>' +
            '<p style="color:#555;">Contacta al autor para obtener la version actualizada:</p>' +
            '<p style="margin-top:10px;"><a href="mailto:insau.sj@gmail.com" style="color:#2ecc71;font-weight:600;">insau.sj@gmail.com</a></p>' +
            '</div></div>';
        return false;
    }
    return true;
}

function cargarDatos() {
    if (!verificarExpiracion()) return;
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

// Funcion auxiliar para limpiar y preparar antes de cargar un ejemplo
function _prepararEjemplo() {
    ocultarBienvenida();
    // Resetear escenarios y potreros
    escenarios = [];
    potreros = [];
    rotaciones = typeof rotaciones !== 'undefined' ? [] : [];
    crearEscenario('Escenario Base');
}

// Funcion auxiliar para finalizar carga de ejemplo
function _finalizarEjemplo(nombreEjemplo) {
    if (typeof actualizarVistaPotreros === 'function') actualizarVistaPotreros();
    if (typeof cargarSelectsRotacion === 'function') cargarSelectsRotacion();
    setTimeout(function() {
        try { calcularBalance(); } catch(e) { console.error('Error auto-calculo:', e); }
        if (typeof renderGananciaGrupos === 'function') renderGananciaGrupos();
    }, 300);
    alert(nombreEjemplo + ' cargado.');
}

// Ejemplo 1: Rodeo de Cria (500 ha, Pampa Humeda)
function cargarEjemploCria() {
    _prepararEjemplo();

    // Recursos forrajeros: 500 ha totales
    generarInputsRecursos({
        'Campo natural': 80,
        'Pastura consociada': 180,
        'Pastura de festuca': 150,
        'Pastura de agropiro': 90
    });

    var esc = getEscenarioActivo();
    if (esc) {
        esc.grupos = [];

        // Grupo 1: Vacas de cria (preñadas) - todo el año
        esc.grupos.push({
            id: nextId++,
            categoria: 'vaca',
            cantidad: 170,
            pesoInicial: 430,
            ganancia: 0.00,
            criterioSalida: 'fecha',
            fechaEntrada: '2025-01-01',
            fechaSalida: '2025-12-31',
            pesoObjetivo: null,
            costos: { compra: 900, venta: 800, sanidad: 6000 },
            modoGanancia: 'manual',
            transicion: {
                tipo: 'cria',
                fechaParto: '2025-08-01',
                fechaDestete: '2026-03-15',
                porcentajeDestete: 88,
                porcentajeMachos: 50,
                destinoDestete: 'vender',
                precioTernero: 2200
            }
        });

        // Grupo 2: Vacas refugo (vacias, se venden post-tacto)
        esc.grupos.push({
            id: nextId++,
            categoria: 'vaca',
            cantidad: 30,
            pesoInicial: 400,
            ganancia: 0.00,
            criterioSalida: 'fecha',
            fechaEntrada: '2025-01-01',
            fechaSalida: '2025-04-30',
            pesoObjetivo: null,
            costos: { compra: 900, venta: 750, sanidad: 4000 },
            modoGanancia: 'manual',
            transicion: null
        });

        // Grupo 3: Toros
        esc.grupos.push({
            id: nextId++,
            categoria: 'toro',
            cantidad: 7,
            pesoInicial: 800,
            ganancia: 0.00,
            criterioSalida: 'fecha',
            fechaEntrada: '2025-01-01',
            fechaSalida: '2025-12-31',
            pesoObjetivo: null,
            costos: { compra: 1500, venta: 1000, sanidad: 8000 },
            modoGanancia: 'manual',
            transicion: null
        });

        // Grupo 4: Vaquillonas de reposicion (entran mayo)
        esc.grupos.push({
            id: nextId++,
            categoria: 'vaquillona',
            cantidad: 30,
            pesoInicial: 320,
            ganancia: 0.40,
            criterioSalida: 'fecha',
            fechaEntrada: '2025-05-01',
            fechaSalida: '2025-12-31',
            pesoObjetivo: null,
            costos: { compra: 1500, venta: 1200, sanidad: 5000 },
            modoGanancia: 'manual',
            transicion: null
        });

        actualizarVistaEscenarios();
    }

    // 6 potreros para 500 ha
    potreros = [
        { id: nextId++, nombre: 'Campo Natural', superficie: 80, recurso: 'Campo natural', aguada: true, estado: 'disponible' },
        { id: nextId++, nombre: 'Consociada Norte', superficie: 90, recurso: 'Pastura consociada', aguada: true, estado: 'disponible' },
        { id: nextId++, nombre: 'Consociada Sur', superficie: 90, recurso: 'Pastura consociada', aguada: true, estado: 'disponible' },
        { id: nextId++, nombre: 'Festuca', superficie: 150, recurso: 'Pastura de festuca', aguada: true, estado: 'disponible' },
        { id: nextId++, nombre: 'Agropiro', superficie: 90, recurso: 'Pastura de agropiro', aguada: true, estado: 'disponible' }
    ];

    _finalizarEjemplo('Ejemplo Cria (500 ha)');
}

// Ejemplo 2: Rodeo de Recria (250 ha)
function cargarEjemploRecria() {
    _prepararEjemplo();

    // Recursos forrajeros: 250 ha totales
    generarInputsRecursos({
        'Pastura consociada': 100,
        'Pastura de festuca': 80,
        'Pastura de agropiro': 70
    });

    var esc = getEscenarioActivo();
    if (esc) {
        esc.grupos = [];

        // Grupo 1: Terneros (machos, comprados al destete)
        esc.grupos.push({
            id: nextId++,
            categoria: 'ternero',
            cantidad: 80,
            pesoInicial: 180,
            ganancia: 0.55,
            criterioSalida: 'fecha',
            fechaEntrada: '2025-04-01',
            fechaSalida: '2026-03-31',
            pesoObjetivo: null,
            costos: { compra: 2200, venta: 1800, sanidad: 8000 },
            modoGanancia: 'manual',
            transicion: {
                tipo: 'recria',
                criterioTransicion: 'peso',
                pesoTransicion: 280,
                fechaTransicion: null,
                nuevaCategoria: 'novillito'
            }
        });

        // Grupo 2: Terneras (hembras, compradas al destete)
        esc.grupos.push({
            id: nextId++,
            categoria: 'ternera',
            cantidad: 60,
            pesoInicial: 170,
            ganancia: 0.50,
            criterioSalida: 'fecha',
            fechaEntrada: '2025-04-01',
            fechaSalida: '2026-03-31',
            pesoObjetivo: null,
            costos: { compra: 2000, venta: 1500, sanidad: 8000 },
            modoGanancia: 'manual',
            transicion: {
                tipo: 'recria',
                criterioTransicion: 'peso',
                pesoTransicion: 260,
                fechaTransicion: null,
                nuevaCategoria: 'vaquillona'
            }
        });

        // Grupo 3: Novillitos (del año anterior, terminacion)
        esc.grupos.push({
            id: nextId++,
            categoria: 'novillito',
            cantidad: 50,
            pesoInicial: 300,
            ganancia: 0.70,
            criterioSalida: 'fecha',
            fechaEntrada: '2025-01-01',
            fechaSalida: '2025-09-30',
            pesoObjetivo: null,
            costos: { compra: 1800, venta: 1600, sanidad: 5000 },
            modoGanancia: 'manual',
            transicion: null
        });

        actualizarVistaEscenarios();
    }

    // 3 potreros para 250 ha
    potreros = [
        { id: nextId++, nombre: 'Consociada', superficie: 100, recurso: 'Pastura consociada', aguada: true, estado: 'disponible' },
        { id: nextId++, nombre: 'Festuca', superficie: 80, recurso: 'Pastura de festuca', aguada: true, estado: 'disponible' },
        { id: nextId++, nombre: 'Agropiro', superficie: 70, recurso: 'Pastura de agropiro', aguada: true, estado: 'disponible' }
    ];

    _finalizarEjemplo('Ejemplo Recria (250 ha)');
}

// Alias para compatibilidad
function cargarDatosEjemplo() {
    cargarEjemploCria();
}

window.onload = cargarDatos;
