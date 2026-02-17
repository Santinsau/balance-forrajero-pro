// ============================================
// BALANCE FORRAJERO PRO v6.0 - Configuracion
// ============================================

var MODELO_CONFIG = {
    perdidaDiferido: 0.05,
    eficienciaPastoreo: {
        continuo: 0.55,
        rotativo: 0.725,
        intensivo: 0.825
    },
    consumoAnualEV: 3650
};

// --- ESTADO GLOBAL ---
var datosForrajeros = null;
var configuracionCampo = null;
var mesesUsoRecursos = {};
var escenarios = [];
var escenarioActivoId = null;
var grupoEditandoId = null;
var nextId = 1;

// Potreros (Fase 2)
var potreros = [];
var rotaciones = [];

// Clima (Fase 4)
var datosClima = {
    latitud: -36.6,
    longitud: -59.8,
    precipitacionesMensuales: [0,0,0,0,0,0,0,0,0,0,0,0],
    usarDatosReales: false,
    indiceSequia: 100
};

// NDVI (Fase 5)
var datosNDVI = {
    latitud: -36.6,
    longitud: -59.8,
    ndviActual: null,
    ndviHistorico: null
};

// Charts refs
var chartBalance, chartAcumulado, chartOfertaDemanda, chartDiferimiento, chartComparador;
var chartNutricion, chartClima;
