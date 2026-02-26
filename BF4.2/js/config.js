// ============================================
// BALANCE FORRAJERO PRO v6.0 - Configuracion
// (c) 2025-2026 Santiago Jose Insaurralde.
// Todos los derechos reservados.
// ============================================

// URL del formulario de feedback (Google Form)
var FEEDBACK_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfiLJB8cCuOIQ5CgiCuR64r9ETUlS_dNUgq6RsWhS98OTb7dw/viewform';

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

// Potreros y rotaciones
var potreros = [];
var rotaciones = [];

// Clima
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
var chartNutricion, chartClima, chartComposicion, chartDemandaCategoria;
