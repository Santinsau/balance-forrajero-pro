const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// Cargar todos los JS en orden
const jsFiles = [
    'js/datos.js',
    'js/config.js',
    'js/utils.js',
    'js/balance.js',
    'js/lotes.js',
    'js/demanda.js',
    'js/economico.js',
    'js/comparador.js',
    'js/rotaciones.js',
    'js/nutricion.js',
    'js/clima.js',
    'js/ndvi.js',
    'js/ayuda.js',
    'js/app.js'
];

let jsContent = '';
jsFiles.forEach(function(file) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        jsContent += '\n// === ' + file + ' ===\n';
        jsContent += fs.readFileSync(filePath, 'utf8');
    } else {
        console.log('WARNING: ' + file + ' no encontrado');
    }
});

// Crear DOM virtual
const dom = new JSDOM(htmlContent, {
    runScripts: 'dangerously',
    resources: 'usable',
    url: 'http://localhost:8889/'
});

const window = dom.window;
const document = window.document;

// Mock Chart.js
window.Chart = function(ctx, config) {
    this.destroy = function() {};
    return this;
};

// Mock alert, confirm, prompt
window.alert = function(msg) { console.log('ALERT:', msg); };
window.confirm = function(msg) { return true; };
window.prompt = function(msg, def) { return def; };

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = function() {};

// Mock localStorage
var store = {};
window.localStorage = {
    getItem: function(key) { return store[key] || null; },
    setItem: function(key, val) { store[key] = String(val); },
    removeItem: function(key) { delete store[key]; }
};

// Mock fetch
window.fetch = function(url) {
    return Promise.reject(new Error('fetch not available in test'));
};

// Ejecutar todos los JS
try {
    window.eval(jsContent);
    console.log('JS loaded OK (' + jsFiles.length + ' archivos)');
} catch(e) {
    console.log('ERROR loading JS:', e.message);
    console.log('Stack:', e.stack);
    process.exit(1);
}

// Simular window.onload
setTimeout(function() {
    try {
        window.cargarDatos();
    } catch(e) {
        console.log('ERROR en cargarDatos:', e.message);
        console.log('Stack:', e.stack);
    }

    setTimeout(function() {
        var passed = 0;
        var failed = 0;

        function test(desc, condition) {
            if (condition) {
                console.log('  PASS: ' + desc);
                passed++;
            } else {
                console.log('  FAIL: ' + desc);
                failed++;
            }
        }

        console.log('\n=== TEST RESULTS - Balance Forrajero PRO v6.0 ===\n');

        // --- FASE 1: Modularizacion ---
        console.log('--- Fase 1: Modularizacion ---');

        var container = document.getElementById('recursosContainer');
        test('recursosContainer existe', !!container);
        test('recursosContainer tiene contenido', container && container.innerHTML.length > 0);

        if (container) {
            var recursoRows = container.innerHTML.match(/recurso-row/g);
            test('13 filas de recursos', recursoRows && recursoRows.length === 13);
            var inputs = container.innerHTML.match(/type="number"/g);
            test('13 inputs de hectareas', inputs && inputs.length === 13);
            var mesBtns = container.innerHTML.match(/mes-btn/g);
            test('156 botones de meses (13x12)', mesBtns && mesBtns.length === 156);
        }

        var escSelect = document.getElementById('escenarioActivoSelect');
        test('escenarioActivoSelect existe', !!escSelect);
        test('1 escenario inicial', escSelect && escSelect.options.length === 1);

        var tabs = document.querySelectorAll('.tab-content');
        test('9 tabs encontrados', tabs.length === 9);

        var activeTab = document.querySelector('.tab-content.active');
        test('tab activo = balance', activeTab && activeTab.id === 'balance');

        var grupoCategoria = document.getElementById('grupoCategoria');
        test('grupoCategoria tiene 6 categorias', grupoCategoria && grupoCategoria.options.length === 6);

        // --- FASE 2: Potreros ---
        console.log('\n--- Fase 2: Potreros ---');

        test('potreroGrid existe', !!document.getElementById('potreroGrid'));
        test('ganttContainer existe', !!document.getElementById('ganttContainer'));
        test('rotacionGrupo existe', !!document.getElementById('rotacionGrupo'));
        test('rotacionPotrero existe', !!document.getElementById('rotacionPotrero'));
        test('Variable potreros es array', Array.isArray(window.potreros));
        test('Variable rotaciones es array', Array.isArray(window.rotaciones));
        test('Funcion agregarPotrero existe', typeof window.agregarPotrero === 'function');
        test('Funcion agregarRotacion existe', typeof window.agregarRotacion === 'function');
        test('Funcion renderGanttRotaciones existe', typeof window.renderGanttRotaciones === 'function');

        // --- FASE 3: Nutricion ---
        console.log('\n--- Fase 3: Nutricion ---');

        test('PERFIL_NUTRICIONAL existe', !!window.PERFIL_NUTRICIONAL);
        test('13 perfiles nutricionales', window.PERFIL_NUTRICIONAL && Object.keys(window.PERFIL_NUTRICIONAL).length === 13);
        test('Funcion calcularGananciaDinamica existe', typeof window.calcularGananciaDinamica === 'function');

        // Test ganancia dinamica - novillo en campo natural invierno
        var ganInvierno = window.calcularGananciaDinamica(350, 'Campo natural', 6);
        test('Ganancia campo natural invierno: 0.1-0.5 kg/dia', ganInvierno && ganInvierno.ganancia >= 0.1 && ganInvierno.ganancia <= 0.5);

        // Test ganancia dinamica - novillo en pastura alfalfa primavera
        var ganPrimavera = window.calcularGananciaDinamica(350, 'Pastura base alfalfa', 10);
        test('Ganancia alfalfa primavera: 0.5-1.2 kg/dia', ganPrimavera && ganPrimavera.ganancia >= 0.5 && ganPrimavera.ganancia <= 1.2);

        test('Ganancia alfalfa > campo natural', ganPrimavera && ganInvierno && ganPrimavera.ganancia > ganInvierno.ganancia);

        // --- FASE 4: Clima ---
        console.log('\n--- Fase 4: Clima ---');

        test('Variable datosClima existe', !!window.datosClima);
        test('PRECIPITACION_PROMEDIO existe', !!window.PRECIPITACION_PROMEDIO);
        test('Funcion consultarClima existe', typeof window.consultarClima === 'function');
        test('Funcion obtenerFactorClima existe', typeof window.obtenerFactorClima === 'function');
        test('Funcion obtenerFactorClimaMensual existe', typeof window.obtenerFactorClimaMensual === 'function');

        var factorClima = window.obtenerFactorClima();
        test('Factor clima default = 1', factorClima === 1);

        // --- FASE 5: NDVI ---
        console.log('\n--- Fase 5: NDVI ---');

        test('Funcion calcularFactorNDVI existe', typeof window.calcularFactorNDVI === 'function');
        test('NDVI 0.7 -> factor ~1.05', Math.abs(window.calcularFactorNDVI(0.7) - 1.05) < 0.1);
        test('NDVI 0.3 -> factor < 0.6', window.calcularFactorNDVI(0.3) < 0.6);
        test('NDVI null -> factor 1', window.calcularFactorNDVI(null) === 1);

        // --- FASE 6: UX ---
        console.log('\n--- Fase 6: UX ---');

        test('Funcion exportarConfiguracion existe', typeof window.exportarConfiguracion === 'function');
        test('Funcion importarConfiguracion existe', typeof window.importarConfiguracion === 'function');
        test('Funcion cargarDatosEjemplo existe', typeof window.cargarDatosEjemplo === 'function');
        test('Acordeon elementos existen', document.querySelectorAll('.acordeon').length >= 1);
        test('Boton Cargar ejemplo existe', !!document.querySelector('[onclick="cargarDatosEjemplo()"]'));

        // Auto-persistencia
        test('Funcion guardarEstadoAuto existe', typeof window.guardarEstadoAuto === 'function');
        test('Funcion restaurarEstadoAuto existe', typeof window.restaurarEstadoAuto === 'function');

        // Bienvenida
        test('Funcion mostrarBienvenida existe', typeof window.mostrarBienvenida === 'function');
        test('Div bienvenida existe', !!document.getElementById('bienvenida'));

        // Ayuda
        test('INSTRUCTIVOS tiene 9 tabs', window.INSTRUCTIVOS && Object.keys(window.INSTRUCTIVOS).length === 9);
        test('Funcion renderizarInstructivos existe', typeof window.renderizarInstructivos === 'function');

        // Tooltips
        test('Cards con tooltips', document.querySelectorAll('[data-tooltip]').length >= 10);

        // Validacion inline
        test('Funcion mostrarError existe', typeof window.mostrarError === 'function');
        test('Funcion limpiarError existe', typeof window.limpiarError === 'function');
        test('Funcion limpiarErrores existe', typeof window.limpiarErrores === 'function');

        // Resumen ejecutivo
        test('Funcion actualizarResumenEjecutivo existe', typeof window.actualizarResumenEjecutivo === 'function');
        test('Funcion toggleResumen existe', typeof window.toggleResumen === 'function');
        test('Div resumenEjecutivo existe', !!document.getElementById('resumenEjecutivo'));

        // Balance hidrico
        test('Funcion calcularBalanceHidrico existe', typeof window.calcularBalanceHidrico === 'function');
        test('CONSUMO_AGUA_FACTOR existe', !!window.CONSUMO_AGUA_FACTOR);
        test('Div balanceHidrico existe', !!document.getElementById('balanceHidrico'));

        // Test cargar ejemplo
        console.log('\n--- Test: Cargar datos ejemplo ---');
        try {
            window.cargarDatosEjemplo();
        } catch(e) {
            console.log('  INFO: cargarDatosEjemplo parcial: ' + e.message);
        }

        setTimeout(function() {
            var haCampo = document.getElementById('ha_Campo_natural');
            test('Ejemplo: ha_Campo_natural = 10', haCampo && haCampo.value === '10');

            var haPastura = document.getElementById('ha_Pastura_de_festuca');
            test('Ejemplo: ha_Pastura_de_festuca = 71', haPastura && haPastura.value === '71');

            test('Ejemplo: potreros cargados (5)', window.potreros && window.potreros.length === 5);

            var esc = window.getEscenarioActivo();
            test('Ejemplo: escenario activo tiene grupos', esc && esc.grupos.length === 2);
            test('Estado auto-guardado en localStorage', !!window.localStorage.getItem('balanceForrajero_estado'));

            // Resumen ejecutivo se muestra con datos
            var resumen = document.getElementById('resumenEjecutivo');
            test('Resumen ejecutivo visible con datos', resumen && resumen.style.display !== 'none');

            console.log('\n=== RESUMEN ===');
            console.log('  Pasaron: ' + passed);
            console.log('  Fallaron: ' + failed);
            console.log('  Total: ' + (passed + failed));
            console.log('=== FIN TEST ===');

            process.exit(failed > 0 ? 1 : 0);
        }, 500);

    }, 500);
}, 100);
