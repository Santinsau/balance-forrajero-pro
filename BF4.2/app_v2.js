// ============================================
// BALANCE FORRAJERO PRO v5.0
// Mejoras: Meses de uso, Mes inicio ejercicio, Stock inicial,
// Nuevas categorias, Peso objetivo, Editar/Duplicar lotes,
// Escenarios (rodeo completo), Costos detallados,
// Tabla por recurso, Grafico acumulado stacked
// ============================================

// --- CONFIGURACION DEL MODELO ---
const MODELO_CONFIG = {
    perdidaDiferido: 0.05,
    eficienciaPastoreo: {
        continuo: 0.55,
        rotativo: 0.725,
        intensivo: 0.825
    },
    consumoAnualEV: 3650
};

// --- CATEGORIAS (6 nuevas) ---
const CATEGORIAS = {
    ternero:    { nombre: 'Ternero',    consumo: 0.025, pesoDefecto: 180, gananciaDefecto: 0.55, usaPasto: true },
    ternera:    { nombre: 'Ternera',    consumo: 0.025, pesoDefecto: 170, gananciaDefecto: 0.50, usaPasto: true },
    novillito:  { nombre: 'Novillito',  consumo: 0.028, pesoDefecto: 280, gananciaDefecto: 0.65, usaPasto: true },
    novillo:    { nombre: 'Novillo',    consumo: 0.025, pesoDefecto: 380, gananciaDefecto: 0.80, usaPasto: true },
    vaquillona: { nombre: 'Vaquillona', consumo: 0.025, pesoDefecto: 300, gananciaDefecto: 0.60, usaPasto: true },
    vaca:       { nombre: 'Vaca',       consumo: 0.022, pesoDefecto: 450, gananciaDefecto: 0.00, usaPasto: true,
                  consumoCria: 0.015, pesoCria: 80 }
};

// --- MESES DE USO POR DEFECTO ---
const MESES_LABELS = ['E','F','M','A','M','J','J','A','S','O','N','D'];
const MESES_NOMBRES = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];

const MESES_USO_DEFECTO = {
    'Campo natural':                  [1,1,1,1,1,1,1,1,1,1,1,1],
    'Campo natural con agropiro':     [1,1,1,1,1,1,1,1,1,1,1,1],
    'Pastura base alfalfa':           [1,1,1,1,1,1,1,1,1,1,1,1],
    'Pastura consociada':             [1,1,1,1,1,1,1,1,1,1,1,1],
    'Pastura de agropiro':            [1,1,1,1,1,1,1,1,1,1,1,1],
    'Pastura de festuca':             [1,1,1,1,1,1,1,1,1,1,1,1],
    'Promocion de raigras':           [0,0,0,1,1,1,1,1,1,1,1,0],
    'Promocion intensiva de raigras': [0,0,0,1,1,1,1,1,1,1,1,0],
    'Verdeo de avena':                [0,1,1,1,1,1,1,1,1,1,1,0],
    'Verdeo de invierno':             [0,1,1,1,1,1,1,1,1,1,1,0],
    'Verdeo de maiz':                 [1,1,1,1,1,0,0,0,0,1,0,1],
    'Verdeo de raigras':              [0,1,1,1,1,1,1,1,1,1,0,0],
    'Verdeo de sorgo':                [1,0,0,1,1,0,0,0,0,1,1,1]
};

// --- DATOS FORRAJEROS EMBEBIDOS (elimina dependencia de fetch/archivo externo) ---
const DATOS_FORRAJEROS_EMBEBIDOS = {
  "recursos": [
    "Campo natural","Campo natural con agropiro","Pastura base alfalfa","Pastura consociada",
    "Pastura de agropiro","Pastura de festuca","Promocion de raigras","Promocion intensiva de raigras",
    "Verdeo de avena","Verdeo de invierno","Verdeo de maiz","Verdeo de raigras","Verdeo de sorgo"
  ],
  "promedios": {
    "Campo natural":{"mensual":[525.9,534.0,524.9,417.0,303.5,256.5,251.2,287.1,362.2,498.6,618.8,563.3],"anual":5143.0},
    "Campo natural con agropiro":{"mensual":[488.4,487.1,513.9,432.8,322.6,271.0,270.6,311.5,395.1,535.7,622.7,522.8],"anual":5174.2},
    "Pastura base alfalfa":{"mensual":[892.9,843.1,682.4,625.3,495.2,412.7,388.9,505.6,607.7,602.7,814.8,758.7],"anual":7630.0},
    "Pastura consociada":{"mensual":[736.3,798.4,785.8,740.2,574.0,484.1,503.1,618.2,774.0,832.9,876.0,764.9],"anual":8487.9},
    "Pastura de agropiro":{"mensual":[663.7,702.8,702.3,619.7,498.4,421.0,414.3,491.0,600.4,654.2,929.6,814.4],"anual":7511.8},
    "Pastura de festuca":{"mensual":[742.1,830.4,832.3,792.0,540.4,405.9,395.0,483.6,670.7,899.3,931.4,781.0],"anual":8304.1},
    "Promocion de raigras":{"mensual":[503.6,491.4,683.1,655.4,548.4,455.0,442.0,513.6,609.7,797.8,872.4,548.3],"anual":7120.7},
    "Promocion intensiva de raigras":{"mensual":[681.3,655.2,742.0,665.9,807.4,732.5,706.4,784.4,919.0,907.1,668.5,630.9],"anual":8900.6},
    "Verdeo de avena":{"mensual":[0,767.0,894.6,815.4,601.0,389.7,471.8,692.0,773.3,541.4,968.2,0],"anual":6914.4},
    "Verdeo de invierno":{"mensual":[0,682.2,699.7,678.3,770.1,671.3,664.9,795.4,846.6,903.0,933.9,0],"anual":7645.4},
    "Verdeo de maiz":{"mensual":[0,673.5,615.9,579.9,673.7,0,0,0,0,741.3,0,945.6],"anual":4229.9},
    "Verdeo de raigras":{"mensual":[0,761.6,802.7,541.4,646.2,597.9,618.9,679.6,721.2,864.2,0,0],"anual":6233.7},
    "Verdeo de sorgo":{"mensual":[817.1,0,0,679.4,771.8,0,0,0,0,608.7,899.2,830.0],"anual":4606.2}
  },
  "resumen": {
    "Campo natural":{"promedio":427.91,"minimo":158.3,"maximo":772.6,"cv":33.08,"anio_mejor":2002,"produccion_mejor":481.5,"anio_peor":2011,"produccion_peor":357.1,"recomendacion":"Alta variabilidad. Bajo potencial productivo. Recomendado para: sistemas extensivos."},
    "Campo natural con agropiro":{"promedio":430.79,"minimo":194.7,"maximo":996.8,"cv":36.25,"anio_mejor":2002,"produccion_mejor":562.9,"anio_peor":2011,"produccion_peor":322.9,"recomendacion":"Alta variabilidad. Bajo potencial productivo. Recomendado para: sistemas extensivos."},
    "Pastura base alfalfa":{"promedio":584.36,"minimo":271.8,"maximo":978.1,"cv":32.55,"anio_mejor":2020,"produccion_mejor":645.9,"anio_peor":2023,"produccion_peor":498.8,"recomendacion":"Alta variabilidad. Bajo potencial productivo. Recomendado para: sistemas extensivos."},
    "Pastura consociada":{"promedio":674.56,"minimo":364.4,"maximo":999.1,"cv":24.94,"anio_mejor":2001,"produccion_mejor":767.4,"anio_peor":2009,"produccion_peor":551.2,"recomendacion":"Estabilidad media. Bajo potencial productivo. Recomendado para: sistemas extensivos."},
    "Pastura de agropiro":{"promedio":609.77,"minimo":347.5,"maximo":998.7,"cv":28.33,"anio_mejor":2018,"produccion_mejor":658.4,"anio_peor":2023,"produccion_peor":540.3,"recomendacion":"Estabilidad media. Bajo potencial productivo. Recomendado para: sistemas extensivos."},
    "Pastura de festuca":{"promedio":622.68,"minimo":329.8,"maximo":996.4,"cv":32.62,"anio_mejor":2018,"produccion_mejor":710.6,"anio_peor":2007,"produccion_peor":532.0,"recomendacion":"Alta variabilidad. Bajo potencial productivo. Recomendado para: sistemas extensivos."},
    "Promocion de raigras":{"promedio":578.01,"minimo":180.2,"maximo":976.0,"cv":29.68,"anio_mejor":2016,"produccion_mejor":657.2,"anio_peor":2017,"produccion_peor":485.6,"recomendacion":"Estabilidad media. Bajo potencial productivo. Recomendado para: sistemas extensivos."},
    "Promocion intensiva de raigras":{"promedio":728.39,"minimo":0.0,"maximo":994.1,"cv":27.07,"anio_mejor":2014,"produccion_mejor":863.9,"anio_peor":2022,"produccion_peor":555.4,"recomendacion":"Estabilidad media. Bajo potencial productivo. Recomendado para: sistemas extensivos."},
    "Verdeo de avena":{"promedio":611.13,"minimo":254.3,"maximo":981.3,"cv":33.86,"anio_mejor":2018,"produccion_mejor":750.7,"anio_peor":2015,"produccion_peor":375.8,"recomendacion":"Alta variabilidad. Bajo potencial productivo. Recomendado para: sistemas extensivos."},
    "Verdeo de invierno":{"promedio":723.99,"minimo":211.5,"maximo":996.5,"cv":25.95,"anio_mejor":2011,"produccion_mejor":897.7,"anio_peor":2009,"produccion_peor":341.7,"recomendacion":"Estabilidad media. Bajo potencial productivo. Recomendado para: sistemas extensivos."},
    "Verdeo de maiz":{"promedio":723.13,"minimo":467.6,"maximo":961.8,"cv":23.11,"anio_mejor":2017,"produccion_mejor":961.8,"anio_peor":2008,"produccion_peor":467.6,"recomendacion":"Estabilidad media. Bajo potencial productivo. Recomendado para: sistemas extensivos."},
    "Verdeo de raigras":{"promedio":664.65,"minimo":157.5,"maximo":997.5,"cv":32.93,"anio_mejor":2018,"produccion_mejor":851.1,"anio_peor":2011,"produccion_peor":432.4,"recomendacion":"Alta variabilidad. Bajo potencial productivo. Recomendado para: sistemas extensivos."},
    "Verdeo de sorgo":{"promedio":708.12,"minimo":412.9,"maximo":990.1,"cv":28.49,"anio_mejor":2018,"produccion_mejor":969.3,"anio_peor":2015,"produccion_peor":412.9,"recomendacion":"Estabilidad media. Bajo potencial productivo. Recomendado para: sistemas extensivos."}
  },
  "estacional": {
    "Campo natural":{"Verano":528.2,"Otoño":325.7,"Invierno":300.2,"Primavera":560.2},
    "Campo natural con agropiro":{"Verano":496.7,"Otoño":342.1,"Invierno":325.7,"Primavera":560.4},
    "Pastura base alfalfa":{"Verano":769.1,"Otoño":511.1,"Invierno":495.4,"Primavera":713.1},
    "Pastura consociada":{"Verano":772.7,"Otoño":595.6,"Invierno":629.8,"Primavera":813.9},
    "Pastura de agropiro":{"Verano":692.3,"Otoño":513.0,"Invierno":501.9,"Primavera":791.7},
    "Pastura de festuca":{"Verano":801.6,"Otoño":576.6,"Invierno":516.4,"Primavera":860.9},
    "Promocion de raigras":{"Verano":557.1,"Otoño":551.1,"Invierno":521.8,"Primavera":707.4},
    "Promocion intensiva de raigras":{"Verano":683.1,"Otoño":743.7,"Invierno":772.6,"Primavera":662.9},
    "Verdeo de avena":{"Verano":809.5,"Otoño":548.8,"Invierno":614.5,"Primavera":683.7},
    "Verdeo de invierno":{"Verano":690.4,"Otoño":702.3,"Invierno":741.4,"Primavera":923.6},
    "Verdeo de maiz":{"Verano":644.7,"Otoño":626.8,"Invierno":0,"Primavera":766.8},
    "Verdeo de raigras":{"Verano":782.2,"Otoño":604.4,"Invierno":662.8,"Primavera":864.2},
    "Verdeo de sorgo":{"Verano":817.1,"Otoño":692.6,"Invierno":0,"Primavera":708.1}
  }
};

// --- ESTADO GLOBAL ---
let datosForrajeros = null;
let configuracionCampo = null;
let mesesUsoRecursos = {};    // { recurso: [0|1 x12] }
let escenarios = [];
let escenarioActivoId = null;
let grupoEditandoId = null;   // null = modo agregar, id = modo editar
let nextId = 1;

// Charts
let chartBalance, chartAcumulado, chartOfertaDemanda, chartDiferimiento, chartComparador;

// ============================================
// INICIALIZACION
// ============================================

function cargarDatos() {
    // Datos embebidos directamente - no necesita fetch ni servidor
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

    // Crear escenario base
    crearEscenario('Escenario Base');

    // Precargar datos de ejemplo
    precargarDatos();
}

function precargarDatos() {
    const haInputs = {
        'Campo_natural': 10,
        'Pastura_consociada': 32,
        'Pastura_de_agropiro': 15,
        'Pastura_de_festuca': 71
    };
    Object.entries(haInputs).forEach(([key, val]) => {
        const el = document.getElementById('ha_' + key);
        if (el) el.value = val;
    });

    // Precargar lotes en escenario base
    const esc = getEscenarioActivo();
    if (esc) {
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
            costos: { compra: 1200, venta: 1400, sanidad: 5000 }
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
            costos: { compra: 800, venta: 1100, sanidad: 4000 }
        });
        actualizarVistaEscenarios();
    }

    // Calcular balance automaticamente
    setTimeout(function() { try { calcularBalance(); } catch(e) { console.error('Error auto-calculo:', e); } }, 500);
}

// ============================================
// RECURSOS CON MESES DE USO
// ============================================

function generarInputsRecursos() {
    var container = document.getElementById('recursosContainer');
    if (!container) { console.error('ERROR: recursosContainer no encontrado'); return; }

    var recursos = datosForrajeros.recursos;
    if (!recursos || recursos.length === 0) {
        container.innerHTML = '<div class="alert alert-danger">No se encontraron recursos forrajeros en el JSON.</div>';
        return;
    }

    var html = '';
    for (var r = 0; r < recursos.length; r++) {
        var recurso = recursos[r];
        var inputId = 'ha_' + recurso.replace(/\s+/g, '_');
        var promediosRecurso = datosForrajeros.promedios[recurso];
        var prodAnual = promediosRecurso ? promediosRecurso.anual : 0;
        var mesesActivos = mesesUsoRecursos[recurso] || [1,1,1,1,1,1,1,1,1,1,1,1];

        html += '<div class="recurso-row">';
        html += '<div class="recurso-info">';
        html += '<strong>' + recurso + '</strong>';
        html += '<span class="prod-info">' + Math.round(prodAnual) + ' kg MS/ha/año</span>';
        html += '</div>';
        html += '<div class="recurso-ha"><input type="number" id="' + inputId + '" step="0.1" min="0" value="0" placeholder="Ha"></div>';
        html += '<div class="meses-container">';
        for (var m = 0; m < 12; m++) {
            var activo = mesesActivos[m] ? 'activo' : '';
            html += '<button type="button" class="mes-btn ' + activo + '" ';
            html += 'data-recurso="' + recurso + '" data-mes="' + m + '" ';
            html += 'onclick="toggleMesRecurso(this)">';
            html += MESES_LABELS[m] + '</button>';
        }
        html += '</div>';
        html += '</div>';
    }

    container.innerHTML = html;
    console.log('Recursos generados:', recursos.length);
}

function toggleMesRecurso(btn) {
    const recurso = btn.getAttribute('data-recurso');
    const mes = parseInt(btn.getAttribute('data-mes'));

    mesesUsoRecursos[recurso][mes] = mesesUsoRecursos[recurso][mes] ? 0 : 1;
    btn.classList.toggle('activo');
}

function getMesesActivos(recurso) {
    return mesesUsoRecursos[recurso] || Array(12).fill(1);
}

function limpiarRecursos() {
    datosForrajeros.recursos.forEach(r => {
        const inputId = 'ha_' + r.replace(/\s+/g, '_');
        const el = document.getElementById(inputId);
        if (el) el.value = '0';
    });
}

// ============================================
// CALCULO DE BALANCE
// ============================================

function calcularBalance() {
    const recursos = datosForrajeros.recursos;
    const escenario = document.getElementById('escenarioSelect').value;
    const ajuste = parseFloat(document.getElementById('ajusteProductividad').value) / 100;
    const manejo = document.getElementById('manejoPastoreo').value;

    let superficieTotal = 0;
    let config = [];

    recursos.forEach(recurso => {
        const inputId = 'ha_' + recurso.replace(/\s+/g, '_');
        const hectareas = parseFloat(document.getElementById(inputId).value) || 0;
        if (hectareas > 0) {
            superficieTotal += hectareas;
            config.push({ recurso, hectareas });
        }
    });

    if (superficieTotal === 0) {
        alert('Ingresa al menos una superficie mayor a 0');
        return;
    }

    configuracionCampo = { superficie: superficieTotal, recursos: config, escenario, ajuste, manejo };

    // Calcular produccion por recurso y mes (respetando meses de uso)
    let produccionPorRecurso = {};  // { recurso: [12 meses] }
    let produccionMensualTotal = Array(12).fill(0);

    config.forEach(({ recurso, hectareas }) => {
        const promedios = datosForrajeros.promedios[recurso];
        const resumen = datosForrajeros.resumen[recurso];
        const mesesActivos = getMesesActivos(recurso);

        let factorEscenario = 1;
        if (escenario === 'bueno') factorEscenario = resumen.produccion_mejor / resumen.promedio;
        else if (escenario === 'malo') factorEscenario = resumen.produccion_peor / resumen.promedio;

        const prodRecurso = promedios.mensual.map((prod, i) => {
            return prod * hectareas * factorEscenario * ajuste * mesesActivos[i];
        });

        produccionPorRecurso[recurso] = prodRecurso;
        prodRecurso.forEach((p, i) => { produccionMensualTotal[i] += p; });
    });

    // Si es comparar, calcular los 3 escenarios para el grafico principal
    if (escenario === 'comparar') {
        const datasets = calcularTresEscenarios(config, ajuste);
        mostrarGraficoBalance(datasets);
        // Para tabla y stacked usamos el promedio
        produccionPorRecurso = {};
        produccionMensualTotal = Array(12).fill(0);
        config.forEach(({ recurso, hectareas }) => {
            const promedios = datosForrajeros.promedios[recurso];
            const mesesActivos = getMesesActivos(recurso);
            const prodRecurso = promedios.mensual.map((prod, i) => prod * hectareas * ajuste * mesesActivos[i]);
            produccionPorRecurso[recurso] = prodRecurso;
            prodRecurso.forEach((p, i) => { produccionMensualTotal[i] += p; });
        });
    } else {
        mostrarGraficoBalance([{
            label: escenario === 'promedio' ? 'Año Promedio' : escenario === 'bueno' ? 'Año Bueno' : 'Año Malo',
            data: produccionMensualTotal,
            color: escenario === 'promedio' ? '#27ae60' : escenario === 'bueno' ? '#2ecc71' : '#e74c3c'
        }]);
    }

    const produccionAnual = produccionMensualTotal.reduce((a, b) => a + b, 0);
    const cargaMaxima = calcularCargaMaxima(produccionAnual, superficieTotal, manejo);

    document.getElementById('superficieTotal').textContent = superficieTotal.toFixed(1);
    document.getElementById('produccionAnual').textContent = Math.round(produccionAnual).toLocaleString('es-AR');
    document.getElementById('cargaMaxima').textContent = cargaMaxima.toFixed(2);
    document.getElementById('produccionPorHa').textContent = Math.round(produccionAnual / superficieTotal).toLocaleString('es-AR');

    // Tabla por recurso
    generarTablaProduccionRecursos(produccionPorRecurso, config);

    // Grafico stacked por recurso
    mostrarGraficoAcumuladoRecursos(produccionPorRecurso, config);

    // Alertas
    generarAlertasBalance(produccionMensualTotal, manejo, ajuste);

    // Guardar produccion para uso en demanda
    configuracionCampo.produccionPorRecurso = produccionPorRecurso;
    configuracionCampo.produccionMensualTotal = produccionMensualTotal;

    document.getElementById('resultadosBalance').style.display = 'block';
    document.getElementById('resultadosBalance').scrollIntoView({ behavior: 'smooth' });
}

function calcularTresEscenarios(config, ajuste) {
    return ['promedio', 'bueno', 'malo'].map(esc => {
        let prod = Array(12).fill(0);
        config.forEach(({ recurso, hectareas }) => {
            const resumen = datosForrajeros.resumen[recurso];
            const promedios = datosForrajeros.promedios[recurso];
            const mesesActivos = getMesesActivos(recurso);
            let factor = 1;
            if (esc === 'bueno') factor = resumen.produccion_mejor / resumen.promedio;
            else if (esc === 'malo') factor = resumen.produccion_peor / resumen.promedio;
            promedios.mensual.forEach((p, i) => { prod[i] += p * hectareas * factor * ajuste * mesesActivos[i]; });
        });
        return {
            label: esc === 'promedio' ? 'Año Promedio' : esc === 'bueno' ? 'Año Bueno' : 'Año Malo',
            data: prod,
            color: esc === 'promedio' ? '#f39c12' : esc === 'bueno' ? '#2ecc71' : '#e74c3c'
        };
    });
}

function calcularCargaMaxima(produccionAnual, superficie, manejo) {
    const eficiencia = MODELO_CONFIG.eficienciaPastoreo[manejo] || 0.725;
    return (produccionAnual * eficiencia) / MODELO_CONFIG.consumoAnualEV / superficie;
}

// ============================================
// TABLA DE PRODUCCION POR RECURSO
// ============================================

function generarTablaProduccionRecursos(produccionPorRecurso, config) {
    const container = document.getElementById('tablaProduccionRecursos');

    let html = '<table><thead><tr><th>Recurso</th><th>Ha</th>';
    MESES_NOMBRES.forEach(m => { html += '<th>' + m + '</th>'; });
    html += '<th>Total</th></tr></thead><tbody>';

    let totalesMes = Array(12).fill(0);
    let granTotal = 0;

    config.forEach(({ recurso, hectareas }) => {
        const prod = produccionPorRecurso[recurso];
        const totalRecurso = prod.reduce((a, b) => a + b, 0);
        granTotal += totalRecurso;

        html += '<tr><td>' + recurso + '</td><td>' + hectareas + '</td>';
        prod.forEach((p, i) => {
            totalesMes[i] += p;
            html += '<td>' + Math.round(p).toLocaleString('es-AR') + '</td>';
        });
        html += '<td><strong>' + Math.round(totalRecurso).toLocaleString('es-AR') + '</strong></td></tr>';
    });

    html += '<tr class="fila-total"><td>TOTAL</td><td>' + configuracionCampo.superficie.toFixed(1) + '</td>';
    totalesMes.forEach(t => { html += '<td>' + Math.round(t).toLocaleString('es-AR') + '</td>'; });
    html += '<td><strong>' + Math.round(granTotal).toLocaleString('es-AR') + '</strong></td></tr>';

    html += '</tbody></table>';
    container.innerHTML = html;
}

// ============================================
// GRAFICO ACUMULADO POR RECURSO (STACKED AREA)
// ============================================

function mostrarGraficoAcumuladoRecursos(produccionPorRecurso, config) {
    const ctx = document.getElementById('chartAcumuladoRecursos');
    if (chartAcumulado) chartAcumulado.destroy();

    const colores = ['#2ecc71','#3498db','#e74c3c','#f39c12','#9b59b6','#1abc9c','#e67e22','#34495e','#16a085','#c0392b','#8e44ad','#d35400','#27ae60'];

    const datasets = config.map(({ recurso }, idx) => ({
        label: recurso,
        data: produccionPorRecurso[recurso],
        backgroundColor: colores[idx % colores.length] + '80',
        borderColor: colores[idx % colores.length],
        borderWidth: 1,
        fill: true
    }));

    chartAcumulado = new Chart(ctx, {
        type: 'line',
        data: { labels: MESES_NOMBRES, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Aporte de cada recurso (kg MS/mes)', font: { size: 14, weight: 'bold' } },
                legend: { position: 'bottom', labels: { font: { size: 11 } } }
            },
            scales: {
                x: { stacked: true },
                y: { stacked: true, beginAtZero: true, ticks: { callback: v => (v/1000).toFixed(0) + 'k' } }
            },
            elements: { line: { tension: 0.3 }, point: { radius: 0 } }
        }
    });
}

// ============================================
// GRAFICO BALANCE PRINCIPAL
// ============================================

function mostrarGraficoBalance(datasets) {
    const ctx = document.getElementById('chartBalance');
    if (chartBalance) chartBalance.destroy();

    chartBalance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: MESES_NOMBRES,
            datasets: datasets.map(ds => ({
                label: ds.label,
                data: ds.data,
                borderColor: ds.color,
                backgroundColor: ds.color + '20',
                borderWidth: 3,
                fill: datasets.length === 1,
                tension: 0.4
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Produccion Forrajera Mensual (kg MS)', font: { size: 14, weight: 'bold' } },
                legend: { position: 'top' }
            },
            scales: { y: { beginAtZero: true, ticks: { callback: v => (v/1000).toFixed(0) + 'k' } } }
        }
    });
}

// ============================================
// ALERTAS BALANCE
// ============================================

function generarAlertasBalance(produccionMensual, manejo, ajuste) {
    const container = document.getElementById('alertasBalance');
    const eficiencia = MODELO_CONFIG.eficienciaPastoreo[manejo];
    const minProd = Math.min(...produccionMensual);
    const maxProd = Math.max(...produccionMensual);
    const mesMin = MESES_NOMBRES[produccionMensual.indexOf(minProd)];
    const mesMax = MESES_NOMBRES[produccionMensual.indexOf(maxProd)];

    let alertas = [];
    const variacion = minProd > 0 ? ((maxProd - minProd) / minProd * 100) : 999;
    if (variacion > 100) {
        alertas.push({ tipo: 'warning', msg: '<strong>Alta estacionalidad:</strong> Variacion del ' + variacion.toFixed(0) + '% entre ' + mesMin + ' y ' + mesMax + '. Considera diferimiento o suplementacion.' });
    }

    alertas.push({ tipo: 'info', msg: '<strong>Eficiencia de pastoreo:</strong> ' + (eficiencia*100).toFixed(1) + '% (' + manejo + '). Produccion aprovechable: ' + Math.round(produccionMensual.reduce((a,b)=>a+b,0) * eficiencia).toLocaleString('es-AR') + ' kg MS.' });

    if (ajuste !== 1) {
        alertas.push({ tipo: ajuste > 1 ? 'success' : 'warning', msg: '<strong>Ajuste de productividad:</strong> ' + (ajuste*100).toFixed(0) + '% (' + (ajuste > 1 ? 'optimista' : 'conservador') + ').' });
    }

    container.innerHTML = alertas.map(a => '<div class="alert alert-' + a.tipo + '">' + a.msg + '</div>').join('');
}

// ============================================
// GESTION DE ESCENARIOS
// ============================================

function crearEscenario(nombre) {
    const esc = { id: nextId++, nombre, grupos: [] };
    escenarios.push(esc);
    escenarioActivoId = esc.id;
    actualizarSelectEscenarios();
    actualizarVistaEscenarios();
    return esc;
}

function getEscenarioActivo() {
    return escenarios.find(e => e.id === escenarioActivoId) || null;
}

function nuevoEscenario() {
    const nombre = prompt('Nombre del nuevo escenario:', 'Escenario ' + (escenarios.length + 1));
    if (nombre) crearEscenario(nombre);
}

function duplicarEscenarioActivo() {
    const esc = getEscenarioActivo();
    if (!esc) return;
    const nuevo = {
        id: nextId++,
        nombre: esc.nombre + ' (copia)',
        grupos: esc.grupos.map(g => ({ ...g, id: nextId++, costos: { ...g.costos } }))
    };
    escenarios.push(nuevo);
    escenarioActivoId = nuevo.id;
    actualizarSelectEscenarios();
    actualizarVistaEscenarios();
}

function eliminarEscenarioActivo() {
    if (escenarios.length <= 1) { alert('Debe haber al menos un escenario.'); return; }
    if (!confirm('Eliminar este escenario?')) return;
    escenarios = escenarios.filter(e => e.id !== escenarioActivoId);
    escenarioActivoId = escenarios[0].id;
    actualizarSelectEscenarios();
    actualizarVistaEscenarios();
}

function cambiarEscenarioActivo() {
    escenarioActivoId = parseInt(document.getElementById('escenarioActivoSelect').value);
    actualizarVistaEscenarios();
}

function actualizarSelectEscenarios() {
    const select = document.getElementById('escenarioActivoSelect');
    select.innerHTML = escenarios.map(e =>
        '<option value="' + e.id + '"' + (e.id === escenarioActivoId ? ' selected' : '') + '>' + e.nombre + '</option>'
    ).join('');
}

// ============================================
// GESTION DE GRUPOS (LOTES DENTRO DE ESCENARIO)
// ============================================

function ajustarPesosDefecto() {
    const cat = document.getElementById('grupoCategoria').value;
    const info = CATEGORIAS[cat];
    if (info) {
        document.getElementById('grupoPesoInicial').value = info.pesoDefecto;
        document.getElementById('grupoGanancia').value = info.gananciaDefecto;
    }
}

function toggleCriterioSalida() {
    const criterio = document.querySelector('input[name="criterioSalida"]:checked').value;
    document.getElementById('wrapFechaSalida').style.display = criterio === 'fecha' ? '' : 'none';
    document.getElementById('wrapPesoObjetivo').style.display = criterio === 'peso' ? '' : 'none';
}

function agregarGrupo() {
    const esc = getEscenarioActivo();
    if (!esc) { alert('Selecciona un escenario.'); return; }

    const categoria = document.getElementById('grupoCategoria').value;
    const cantidad = parseInt(document.getElementById('grupoCantidad').value);
    const pesoInicial = parseFloat(document.getElementById('grupoPesoInicial').value);
    const ganancia = parseFloat(document.getElementById('grupoGanancia').value);
    const fechaEntrada = document.getElementById('grupoFechaEntrada').value;
    const criterio = document.querySelector('input[name="criterioSalida"]:checked').value;

    if (!cantidad || !pesoInicial || !fechaEntrada) {
        alert('Completa los campos obligatorios: cantidad, peso, fecha de entrada.');
        return;
    }

    let fechaSalida, pesoObjetivo = null;

    if (criterio === 'peso') {
        pesoObjetivo = parseFloat(document.getElementById('grupoPesoObjetivo').value);
        if (!pesoObjetivo || pesoObjetivo <= pesoInicial) {
            alert('El peso objetivo debe ser mayor al peso inicial.');
            return;
        }
        if (!ganancia || ganancia <= 0) {
            alert('La ganancia diaria debe ser mayor a 0 para calcular la fecha de salida.');
            return;
        }
        const dias = Math.ceil((pesoObjetivo - pesoInicial) / ganancia);
        const entrada = new Date(fechaEntrada);
        const salida = new Date(entrada.getTime() + dias * 86400000);
        fechaSalida = salida.toISOString().split('T')[0];
    } else {
        fechaSalida = document.getElementById('grupoFechaSalida').value;
        if (!fechaSalida) { alert('Ingresa la fecha de salida.'); return; }
        if (new Date(fechaSalida) <= new Date(fechaEntrada)) {
            alert('La fecha de salida debe ser posterior a la de entrada.');
            return;
        }
    }

    const costos = {
        compra: parseFloat(document.getElementById('grupoPrecioCompra').value) || 0,
        venta: parseFloat(document.getElementById('grupoPrecioVenta').value) || 0,
        sanidad: parseFloat(document.getElementById('grupoSanidad').value) || 0
    };

    if (grupoEditandoId !== null) {
        // Modo editar
        const grupo = esc.grupos.find(g => g.id === grupoEditandoId);
        if (grupo) {
            Object.assign(grupo, { categoria, cantidad, pesoInicial, ganancia, criterioSalida: criterio, fechaEntrada, fechaSalida, pesoObjetivo, costos });
        }
        grupoEditandoId = null;
        document.getElementById('btnAgregarGrupo').textContent = 'Agregar al escenario';
        document.getElementById('btnCancelarEdicion').style.display = 'none';
    } else {
        esc.grupos.push({
            id: nextId++, categoria, cantidad, pesoInicial, ganancia,
            criterioSalida: criterio, fechaEntrada, fechaSalida, pesoObjetivo, costos
        });
    }

    actualizarVistaEscenarios();
    limpiarFormGrupo();
}

function editarGrupo(escId, grupoId) {
    const esc = escenarios.find(e => e.id === escId);
    if (!esc) return;
    const g = esc.grupos.find(gr => gr.id === grupoId);
    if (!g) return;

    // Si es de otro escenario, cambiar al activo
    escenarioActivoId = escId;
    actualizarSelectEscenarios();

    document.getElementById('grupoCategoria').value = g.categoria;
    document.getElementById('grupoCantidad').value = g.cantidad;
    document.getElementById('grupoPesoInicial').value = g.pesoInicial;
    document.getElementById('grupoGanancia').value = g.ganancia;
    document.getElementById('grupoFechaEntrada').value = g.fechaEntrada;

    const criterio = g.criterioSalida || 'fecha';
    document.querySelector('input[name="criterioSalida"][value="' + criterio + '"]').checked = true;
    toggleCriterioSalida();

    if (criterio === 'peso' && g.pesoObjetivo) {
        document.getElementById('grupoPesoObjetivo').value = g.pesoObjetivo;
    } else {
        document.getElementById('grupoFechaSalida').value = g.fechaSalida;
    }

    document.getElementById('grupoPrecioCompra').value = g.costos.compra;
    document.getElementById('grupoPrecioVenta').value = g.costos.venta;
    document.getElementById('grupoSanidad').value = g.costos.sanidad;

    grupoEditandoId = grupoId;
    document.getElementById('btnAgregarGrupo').textContent = 'Guardar cambios';
    document.getElementById('btnCancelarEdicion').style.display = '';

    // Scroll al formulario
    document.getElementById('grupoCategoria').scrollIntoView({ behavior: 'smooth' });
}

function cancelarEdicion() {
    grupoEditandoId = null;
    document.getElementById('btnAgregarGrupo').textContent = 'Agregar al escenario';
    document.getElementById('btnCancelarEdicion').style.display = 'none';
    limpiarFormGrupo();
}

function duplicarGrupo(escId, grupoId) {
    const esc = escenarios.find(e => e.id === escId);
    if (!esc) return;
    const g = esc.grupos.find(gr => gr.id === grupoId);
    if (!g) return;

    esc.grupos.push({ ...g, id: nextId++, costos: { ...g.costos } });
    actualizarVistaEscenarios();
}

function eliminarGrupo(escId, grupoId) {
    const esc = escenarios.find(e => e.id === escId);
    if (!esc) return;
    esc.grupos = esc.grupos.filter(g => g.id !== grupoId);
    actualizarVistaEscenarios();
}

function limpiarFormGrupo() {
    document.getElementById('grupoCantidad').value = '50';
    ajustarPesosDefecto();
    document.getElementById('grupoFechaEntrada').value = '';
    document.getElementById('grupoFechaSalida').value = '';
    document.getElementById('grupoPesoObjetivo').value = '450';
}

function actualizarVistaEscenarios() {
    const container = document.getElementById('escenariosContainer');

    if (escenarios.length === 0) {
        container.innerHTML = '<p style="color:#999;text-align:center;">No hay escenarios.</p>';
        return;
    }

    let html = '';
    escenarios.forEach(esc => {
        const esActivo = esc.id === escenarioActivoId;
        html += '<div class="escenario-card' + (esActivo ? ' activo' : '') + '">';
        html += '<div class="escenario-header">';
        html += '<span class="escenario-nombre">' + esc.nombre + (esActivo ? ' (activo)' : '') + '</span>';
        html += '<span style="font-size:0.85em;color:#7f8c8d;">' + esc.grupos.length + ' grupos - ' + esc.grupos.reduce((s,g) => s + g.cantidad, 0) + ' cabezas</span>';
        html += '</div>';

        if (esc.grupos.length === 0) {
            html += '<p style="color:#aaa;font-size:0.9em;">Sin grupos cargados.</p>';
        } else {
            esc.grupos.forEach(g => {
                const cat = CATEGORIAS[g.categoria];
                const dias = Math.floor((new Date(g.fechaSalida) - new Date(g.fechaEntrada)) / 86400000);
                const pesoFinal = g.pesoInicial + g.ganancia * dias;
                const kgProd = g.ganancia * dias * g.cantidad;

                html += '<div class="grupo-item">';
                html += '<div class="grupo-info">';
                html += '<span><strong>' + cat.nombre + '</strong></span>';
                html += '<span>' + g.cantidad + ' cab</span>';
                html += '<span>' + g.pesoInicial + ' → ' + pesoFinal.toFixed(0) + ' kg</span>';
                html += '<span>' + g.ganancia + ' kg/dia</span>';
                html += '<span>' + dias + ' dias</span>';
                if (g.criterioSalida === 'peso') html += '<span>Obj: ' + g.pesoObjetivo + ' kg</span>';
                html += '<span>' + Math.round(kgProd).toLocaleString('es-AR') + ' kg prod</span>';
                html += '</div>';
                html += '<div class="grupo-acciones">';
                html += '<button class="btn-editar" onclick="editarGrupo(' + esc.id + ',' + g.id + ')">Editar</button>';
                html += '<button class="btn-duplicar" onclick="duplicarGrupo(' + esc.id + ',' + g.id + ')">Duplicar</button>';
                html += '<button class="btn-eliminar" onclick="eliminarGrupo(' + esc.id + ',' + g.id + ')">Eliminar</button>';
                html += '</div>';
                html += '</div>';
            });
        }
        html += '</div>';
    });

    container.innerHTML = html;
}

// ============================================
// CALCULO DE DEMANDA (OFERTA VS DEMANDA)
// ============================================

function calcularDemanda() {
    if (!configuracionCampo) {
        alert('Primero calcula el balance forrajero.');
        return;
    }
    const esc = getEscenarioActivo();
    if (!esc || esc.grupos.length === 0) {
        alert('Agrega al menos un grupo de animales.');
        return;
    }

    const manejo = configuracionCampo.manejo;
    const eficiencia = MODELO_CONFIG.eficienciaPastoreo[manejo];
    const mesInicio = parseInt(document.getElementById('mesInicioSelect').value);
    const stockInicial = parseFloat(document.getElementById('stockInicialInput').value) || 0;

    // Oferta mensual (del calculo de balance)
    const ofertaMensual = configuracionCampo.produccionMensualTotal;

    // Calcular demanda mensual
    let demandaMensual = Array(12).fill(0);

    esc.grupos.forEach(g => {
        const cat = CATEGORIAS[g.categoria];
        if (!cat.usaPasto) return;

        const entrada = new Date(g.fechaEntrada);
        const salida = new Date(g.fechaSalida);

        for (let mes = 0; mes < 12; mes++) {
            // Verificar si el grupo esta activo en este mes
            const inicioMes = new Date(entrada.getFullYear(), mes, 1);
            const finMes = new Date(entrada.getFullYear(), mes + 1, 0);

            if (finMes < entrada || inicioMes > salida) continue;

            const diasDesdeEntrada = Math.max(0, Math.floor((new Date(entrada.getFullYear(), mes, 15) - entrada) / 86400000));
            const pesoPromedio = g.pesoInicial + g.ganancia * diasDesdeEntrada;

            let consumoDiario = pesoPromedio * cat.consumo;
            if (g.categoria === 'vaca' && cat.consumoCria) {
                const pesoCria = cat.pesoCria + g.ganancia * 0.3 * diasDesdeEntrada;
                consumoDiario += pesoCria * cat.consumoCria;
            }

            demandaMensual[mes] += consumoDiario * 30 * g.cantidad;
        }
    });

    // Calcular balance con diferimiento, empezando desde mesInicio
    let balanceMensual = Array(12).fill(0);
    let diferidoAcumulado = Array(12).fill(0);
    let disponibilidadMensual = Array(12).fill(0);

    let diferidoActual = stockInicial;

    for (let i = 0; i < 12; i++) {
        const mes = (mesInicio + i) % 12;

        const produccionMes = ofertaMensual[mes] * eficiencia;
        diferidoActual = diferidoActual * (1 - MODELO_CONFIG.perdidaDiferido);

        const disponibilidadTotal = produccionMes + diferidoActual;
        disponibilidadMensual[mes] = disponibilidadTotal;

        const balance = disponibilidadTotal - demandaMensual[mes];
        balanceMensual[mes] = balance;

        diferidoActual = balance > 0 ? balance : 0;
        diferidoAcumulado[mes] = diferidoActual;
    }

    // Mostrar resultados
    mostrarGraficoOfertaDemanda(ofertaMensual, demandaMensual, balanceMensual, eficiencia);
    mostrarGraficoDiferimiento(diferidoAcumulado, disponibilidadMensual);
    generarTablaDetalleMensual(ofertaMensual, demandaMensual, balanceMensual, diferidoAcumulado, eficiencia, mesInicio);
    generarAlertasDemanda(ofertaMensual, demandaMensual, balanceMensual, diferidoAcumulado, eficiencia, mesInicio);
    calcularIndicadoresOfertaDemanda(ofertaMensual, demandaMensual, balanceMensual, eficiencia);

    document.getElementById('resultadosDemanda').style.display = 'block';
    document.getElementById('resultadosDemanda').scrollIntoView({ behavior: 'smooth' });
}

function calcularIndicadoresOfertaDemanda(oferta, demanda, balance, eficiencia) {
    const superficie = configuracionCampo.superficie;
    const produccionTotal = oferta.reduce((a,b) => a + b, 0);
    const produccionAprovechable = produccionTotal * eficiencia;
    const demandaTotal = demanda.reduce((a,b) => a + b, 0);
    const balanceAnual = balance.reduce((a,b) => a + b, 0);
    const cargaReal = demandaTotal / MODELO_CONFIG.consumoAnualEV / superficie;
    const cargaMaxima = produccionAprovechable / MODELO_CONFIG.consumoAnualEV / superficie;
    const tasaUso = demandaTotal / produccionAprovechable * 100;

    document.getElementById('produccionTotalDemanda').textContent = Math.round(produccionTotal).toLocaleString('es-AR');
    document.getElementById('demandaTotalAnual').textContent = Math.round(demandaTotal).toLocaleString('es-AR');
    document.getElementById('balanceAnual').textContent = Math.round(balanceAnual).toLocaleString('es-AR');
    document.getElementById('balanceAnual').style.color = balanceAnual >= 0 ? '#27ae60' : '#e74c3c';
    document.getElementById('cargaAnimalReal').textContent = cargaReal.toFixed(2);
    document.getElementById('cargaAnimalMaxima').textContent = cargaMaxima.toFixed(2);
    document.getElementById('tasaUso').textContent = tasaUso.toFixed(1);
    document.getElementById('tasaUso').style.color = tasaUso > 100 ? '#e74c3c' : tasaUso > 85 ? '#f39c12' : '#27ae60';
}

function mostrarGraficoOfertaDemanda(oferta, demanda, balance, eficiencia) {
    const ctx = document.getElementById('chartOfertaDemanda');
    if (chartOfertaDemanda) chartOfertaDemanda.destroy();

    const ofertaAprov = oferta.map(o => o * eficiencia);

    chartOfertaDemanda = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: MESES_NOMBRES,
            datasets: [
                { label: 'Oferta aprovechable', data: ofertaAprov, backgroundColor: '#27ae6050', borderColor: '#27ae60', borderWidth: 2 },
                { label: 'Demanda', data: demanda, backgroundColor: '#e74c3c50', borderColor: '#e74c3c', borderWidth: 2 },
                { label: 'Balance (con diferimiento)', data: balance, type: 'line', borderColor: balance.map(b => b >= 0 ? '#2ecc71' : '#e74c3c'), borderWidth: 2, tension: 0.4, fill: false, pointRadius: 4 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Balance Forrajero - Oferta vs Demanda (Eficiencia: ' + (eficiencia*100).toFixed(1) + '%)', font: { size: 14, weight: 'bold' } },
                legend: { position: 'top' }
            },
            scales: { y: { beginAtZero: true, ticks: { callback: v => (v/1000).toFixed(0) + 'k' } } }
        }
    });
}

function mostrarGraficoDiferimiento(diferido, disponibilidad) {
    const ctx = document.getElementById('chartDiferimiento');
    if (chartDiferimiento) chartDiferimiento.destroy();

    chartDiferimiento = new Chart(ctx, {
        type: 'line',
        data: {
            labels: MESES_NOMBRES,
            datasets: [
                { label: 'Forraje Diferido', data: diferido, backgroundColor: '#f39c1230', borderColor: '#f39c12', borderWidth: 3, fill: true, tension: 0.4 },
                { label: 'Disponibilidad Total', data: disponibilidad, borderColor: '#3498db', borderWidth: 2, borderDash: [5,5], fill: false, tension: 0.4 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Diferimiento y Disponibilidad (perdida 5%/mes)', font: { size: 14, weight: 'bold' } },
                legend: { position: 'top' }
            },
            scales: { y: { beginAtZero: true, ticks: { callback: v => (v/1000).toFixed(0) + 'k' } } }
        }
    });
}

function generarTablaDetalleMensual(oferta, demanda, balance, diferido, eficiencia, mesInicio) {
    const tbody = document.getElementById('tablaDetalleMensualBody');
    let html = '';

    for (let i = 0; i < 12; i++) {
        const mes = (mesInicio + i) % 12;
        const ofertaAprov = oferta[mes] * eficiencia;
        const estado = balance[mes] >= 0 ? '<span style="color:#27ae60;font-weight:700;">OK</span>' : '<span style="color:#e74c3c;font-weight:700;">DEFICIT</span>';

        html += '<tr>';
        html += '<td>' + MESES_NOMBRES[mes] + '</td>';
        html += '<td>' + Math.round(ofertaAprov).toLocaleString('es-AR') + '</td>';
        html += '<td>' + Math.round(demanda[mes]).toLocaleString('es-AR') + '</td>';
        html += '<td style="color:' + (balance[mes] >= 0 ? '#27ae60' : '#e74c3c') + ';font-weight:700;">' + Math.round(balance[mes]).toLocaleString('es-AR') + '</td>';
        html += '<td>' + Math.round(diferido[mes]).toLocaleString('es-AR') + '</td>';
        html += '<td>' + estado + '</td>';
        html += '</tr>';
    }

    tbody.innerHTML = html;
}

function generarAlertasDemanda(oferta, demanda, balance, diferido, eficiencia, mesInicio) {
    const container = document.getElementById('alertasDemanda');
    let alertas = [];

    const mesesDeficit = [];
    let deficitTotal = 0;
    for (let i = 0; i < 12; i++) {
        const mes = (mesInicio + i) % 12;
        if (balance[mes] < 0) {
            mesesDeficit.push(MESES_NOMBRES[mes]);
            deficitTotal += Math.abs(balance[mes]);
        }
    }

    if (mesesDeficit.length > 0) {
        alertas.push({ tipo: 'danger', msg: '<strong>Deficit forrajero:</strong> ' + mesesDeficit.length + ' meses con deficit: ' + mesesDeficit.join(', ') + '. Deficit total: ' + Math.round(deficitTotal).toLocaleString('es-AR') + ' kg MS. Considera reducir carga, suplementar o diferir.' });
    } else {
        alertas.push({ tipo: 'success', msg: '<strong>Balance positivo:</strong> Todos los meses tienen balance positivo considerando el diferimiento.' });
    }

    const diferidoMax = Math.max(...diferido);
    if (diferidoMax > 0) {
        const mesDif = MESES_NOMBRES[diferido.indexOf(diferidoMax)];
        alertas.push({ tipo: 'info', msg: '<strong>Diferimiento maximo:</strong> ' + Math.round(diferidoMax).toLocaleString('es-AR') + ' kg MS en ' + mesDif + '. Perdida de calidad: 5% mensual.' });
    }

    const ofertaTotal = oferta.reduce((a,b)=>a+b,0);
    const desperdicio = ofertaTotal * (1 - eficiencia);
    alertas.push({ tipo: 'warning', msg: '<strong>Desperdicio por manejo:</strong> ' + Math.round(desperdicio).toLocaleString('es-AR') + ' kg MS/año no aprovechados (' + ((1-eficiencia)*100).toFixed(1) + '%).' });

    container.innerHTML = alertas.map(a => '<div class="alert alert-' + a.tipo + '">' + a.msg + '</div>').join('');
}

// ============================================
// MODULO ECONOMICO
// ============================================

function calcularEconomico() {
    if (!configuracionCampo) { alert('Primero calcula el balance.'); return; }
    const esc = getEscenarioActivo();
    if (!esc || esc.grupos.length === 0) { alert('Agrega lotes primero.'); return; }

    const superficie = configuracionCampo.superficie;
    const costoLabores = (parseFloat(document.getElementById('costoLabores').value) || 0) * superficie;
    const costosEstructura = (parseFloat(document.getElementById('costosEstructura').value) || 0) * superficie;
    const costoSuplemento = (parseFloat(document.getElementById('costoSuplemento').value) || 0) * (parseFloat(document.getElementById('kgSuplemento').value) || 0);
    const comisionVenta = (parseFloat(document.getElementById('comisionVenta').value) || 0) / 100;
    const costoFleteCab = parseFloat(document.getElementById('costoFlete').value) || 0;

    let inversionTotal = 0;
    let ingresoTotal = 0;
    let costosDirectosTotal = 0;
    let detalleGrupos = [];
    let totalCabezas = 0;

    esc.grupos.forEach(g => {
        const cat = CATEGORIAS[g.categoria];
        const dias = Math.floor((new Date(g.fechaSalida) - new Date(g.fechaEntrada)) / 86400000);
        const pesoFinal = g.pesoInicial + g.ganancia * dias;
        const kgCompra = g.pesoInicial * g.cantidad;
        const kgVenta = pesoFinal * g.cantidad;
        const kgProducidos = g.ganancia * dias * g.cantidad;

        const costoCompra = kgCompra * g.costos.compra;
        const costoSanidad = g.costos.sanidad * g.cantidad;
        const costoFlete = costoFleteCab * g.cantidad;
        const ingresoBruto = kgVenta * g.costos.venta;
        const costoComision = ingresoBruto * comisionVenta;

        const costosDirectos = costoCompra + costoSanidad + costoFlete + costoComision;
        const ingresoNeto = ingresoBruto - costoComision;
        const margen = ingresoNeto - costoCompra - costoSanidad - costoFlete;

        inversionTotal += costoCompra + costoSanidad;
        ingresoTotal += ingresoBruto;
        costosDirectosTotal += costosDirectos;
        totalCabezas += g.cantidad;

        detalleGrupos.push({
            nombre: cat.nombre,
            cantidad: g.cantidad,
            kgCompra, kgVenta, kgProducidos,
            costoCompra, costoSanidad, costoFlete, costoComision,
            ingresoBruto, ingresoNeto, margen, dias, pesoFinal
        });
    });

    const costoComisionTotal = ingresoTotal * comisionVenta;
    const costoFleteTotal = costoFleteCab * totalCabezas;
    const gastosGenerales = costoLabores + costosEstructura + costoSuplemento;
    const margenBruto = ingresoTotal - costoComisionTotal - costosDirectosTotal + costoComisionTotal + costoFleteTotal;
    // Recalcular correctamente
    const ingresoBrutoTotal = ingresoTotal;
    const totalCostosCompra = detalleGrupos.reduce((s,d) => s + d.costoCompra, 0);
    const totalCostosSanidad = detalleGrupos.reduce((s,d) => s + d.costoSanidad, 0);
    const totalComision = detalleGrupos.reduce((s,d) => s + d.costoComision, 0);
    const totalFlete = detalleGrupos.reduce((s,d) => s + d.costoFlete, 0);

    const margenBrutoCalc = ingresoBrutoTotal - totalCostosCompra - totalCostosSanidad - totalComision - totalFlete;
    const margenNeto = margenBrutoCalc - gastosGenerales;

    document.getElementById('inversionTotal').textContent = '$' + Math.round(totalCostosCompra + totalCostosSanidad).toLocaleString('es-AR');
    document.getElementById('ingresoTotal').textContent = '$' + Math.round(ingresoBrutoTotal).toLocaleString('es-AR');
    document.getElementById('costosDirectosTotal').textContent = '$' + Math.round(totalCostosCompra + totalCostosSanidad + totalComision + totalFlete).toLocaleString('es-AR');
    document.getElementById('margenBrutoTotal').textContent = '$' + Math.round(margenBrutoCalc).toLocaleString('es-AR');
    document.getElementById('margenBrutoTotal').style.color = margenBrutoCalc >= 0 ? '#27ae60' : '#e74c3c';
    document.getElementById('margenBrutoHa').textContent = '$' + Math.round(margenBrutoCalc / superficie).toLocaleString('es-AR');
    document.getElementById('margenNetoTotal').textContent = '$' + Math.round(margenNeto).toLocaleString('es-AR');
    document.getElementById('margenNetoTotal').style.color = margenNeto >= 0 ? '#27ae60' : '#e74c3c';

    // Tabla detalle por grupo
    let htmlDetalle = '<table><thead><tr><th>Grupo</th><th>Cab</th><th>Dias</th><th>Peso Final</th><th>Kg Producidos</th><th>Ingreso</th><th>Costos</th><th>Margen</th></tr></thead><tbody>';
    detalleGrupos.forEach(d => {
        htmlDetalle += '<tr>';
        htmlDetalle += '<td>' + d.nombre + '</td>';
        htmlDetalle += '<td>' + d.cantidad + '</td>';
        htmlDetalle += '<td>' + d.dias + '</td>';
        htmlDetalle += '<td>' + d.pesoFinal.toFixed(0) + ' kg</td>';
        htmlDetalle += '<td>' + Math.round(d.kgProducidos).toLocaleString('es-AR') + '</td>';
        htmlDetalle += '<td>$' + Math.round(d.ingresoBruto).toLocaleString('es-AR') + '</td>';
        htmlDetalle += '<td>$' + Math.round(d.costoCompra + d.costoSanidad + d.costoFlete + d.costoComision).toLocaleString('es-AR') + '</td>';
        htmlDetalle += '<td style="color:' + (d.margen >= 0 ? '#27ae60' : '#e74c3c') + ';font-weight:700;">$' + Math.round(d.margen).toLocaleString('es-AR') + '</td>';
        htmlDetalle += '</tr>';
    });
    htmlDetalle += '</tbody></table>';
    document.getElementById('tablaDetalleEconomico').innerHTML = htmlDetalle;

    // Tabla composicion de costos
    let htmlCostos = '<table><thead><tr><th>Concepto</th><th>Monto</th><th>% del Total</th></tr></thead><tbody>';
    const todosLosCostos = [
        { concepto: 'Compra de hacienda', monto: totalCostosCompra },
        { concepto: 'Sanidad', monto: totalCostosSanidad },
        { concepto: 'Comision de venta', monto: totalComision },
        { concepto: 'Flete', monto: totalFlete },
        { concepto: 'Labores', monto: costoLabores },
        { concepto: 'Estructura', monto: costosEstructura },
        { concepto: 'Suplementacion', monto: costoSuplemento }
    ];
    const costoTotalGeneral = todosLosCostos.reduce((s,c) => s + c.monto, 0);

    todosLosCostos.forEach(c => {
        if (c.monto > 0) {
            htmlCostos += '<tr><td>' + c.concepto + '</td><td>$' + Math.round(c.monto).toLocaleString('es-AR') + '</td><td>' + (c.monto / costoTotalGeneral * 100).toFixed(1) + '%</td></tr>';
        }
    });
    htmlCostos += '<tr class="fila-total"><td>TOTAL</td><td>$' + Math.round(costoTotalGeneral).toLocaleString('es-AR') + '</td><td>100%</td></tr>';
    htmlCostos += '</tbody></table>';
    document.getElementById('tablaComposicionCostos').innerHTML = htmlCostos;

    document.getElementById('resultadosEconomico').style.display = 'block';
    document.getElementById('resultadosEconomico').scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// COMPARADOR DE ESCENARIOS
// ============================================

function compararEscenarios() {
    if (escenarios.length < 2) {
        alert('Necesitas al menos 2 escenarios para comparar. Duplica el escenario actual y modifica parametros.');
        return;
    }
    if (!configuracionCampo) {
        alert('Primero calcula el balance forrajero.');
        return;
    }

    const eficiencia = MODELO_CONFIG.eficienciaPastoreo[configuracionCampo.manejo];
    const ofertaMensual = configuracionCampo.produccionMensualTotal;
    const mesInicio = parseInt(document.getElementById('mesInicioSelect').value);
    const stockInicial = parseFloat(document.getElementById('stockInicialInput').value) || 0;

    let comparacion = [];

    escenarios.forEach(esc => {
        // Calcular demanda de este escenario
        let demanda = Array(12).fill(0);
        let totalCabezas = 0;
        let kgProducidos = 0;

        esc.grupos.forEach(g => {
            const cat = CATEGORIAS[g.categoria];
            if (!cat.usaPasto) return;
            totalCabezas += g.cantidad;

            const entrada = new Date(g.fechaEntrada);
            const salida = new Date(g.fechaSalida);
            const dias = Math.floor((salida - entrada) / 86400000);
            kgProducidos += g.ganancia * dias * g.cantidad;

            for (let mes = 0; mes < 12; mes++) {
                const inicioMes = new Date(entrada.getFullYear(), mes, 1);
                const finMes = new Date(entrada.getFullYear(), mes + 1, 0);
                if (finMes < entrada || inicioMes > salida) continue;

                const diasDesde = Math.max(0, Math.floor((new Date(entrada.getFullYear(), mes, 15) - entrada) / 86400000));
                const peso = g.pesoInicial + g.ganancia * diasDesde;
                let consumo = peso * cat.consumo;
                if (g.categoria === 'vaca' && cat.consumoCria) {
                    consumo += (cat.pesoCria + g.ganancia * 0.3 * diasDesde) * cat.consumoCria;
                }
                demanda[mes] += consumo * 30 * g.cantidad;
            }
        });

        const demandaTotal = demanda.reduce((a,b) => a + b, 0);
        const ofertaTotal = ofertaMensual.reduce((a,b) => a + b, 0) * eficiencia;

        // Balance con diferimiento
        let diferido = stockInicial;
        let mesesDeficit = 0;
        for (let i = 0; i < 12; i++) {
            const mes = (mesInicio + i) % 12;
            diferido = diferido * (1 - MODELO_CONFIG.perdidaDiferido);
            const disp = ofertaMensual[mes] * eficiencia + diferido;
            const bal = disp - demanda[mes];
            if (bal < 0) mesesDeficit++;
            diferido = bal > 0 ? bal : 0;
        }

        comparacion.push({
            nombre: esc.nombre,
            cabezas: totalCabezas,
            demandaTotal,
            kgProducidos,
            tasaUso: (demandaTotal / ofertaTotal * 100),
            mesesDeficit,
            cargaReal: demandaTotal / MODELO_CONFIG.consumoAnualEV / configuracionCampo.superficie
        });
    });

    // Mostrar tabla comparativa
    let html = '<table><thead><tr><th>Escenario</th><th>Cabezas</th><th>Demanda (kg MS)</th><th>Kg Producidos</th><th>Tasa Uso</th><th>Carga (EV/ha)</th><th>Meses Deficit</th></tr></thead><tbody>';
    comparacion.forEach(c => {
        html += '<tr>';
        html += '<td><strong>' + c.nombre + '</strong></td>';
        html += '<td>' + c.cabezas + '</td>';
        html += '<td>' + Math.round(c.demandaTotal).toLocaleString('es-AR') + '</td>';
        html += '<td>' + Math.round(c.kgProducidos).toLocaleString('es-AR') + '</td>';
        html += '<td style="color:' + (c.tasaUso > 100 ? '#e74c3c' : c.tasaUso > 85 ? '#f39c12' : '#27ae60') + '">' + c.tasaUso.toFixed(1) + '%</td>';
        html += '<td>' + c.cargaReal.toFixed(2) + '</td>';
        html += '<td style="color:' + (c.mesesDeficit > 0 ? '#e74c3c' : '#27ae60') + '">' + c.mesesDeficit + '</td>';
        html += '</tr>';
    });
    html += '</tbody></table>';
    document.getElementById('comparadorContainer').innerHTML = html;

    // Grafico comparador
    if (chartComparador) chartComparador.destroy();
    const ctx = document.getElementById('chartComparador');
    const colores = ['#2ecc71','#3498db','#e74c3c','#f39c12','#9b59b6'];

    chartComparador = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: comparacion.map(c => c.nombre),
            datasets: [
                { label: 'Demanda (miles kg MS)', data: comparacion.map(c => c.demandaTotal / 1000), backgroundColor: '#e74c3c80' },
                { label: 'Kg Producidos (miles)', data: comparacion.map(c => c.kgProducidos / 1000), backgroundColor: '#2ecc7180' }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { title: { display: true, text: 'Comparacion de Escenarios', font: { size: 14, weight: 'bold' } } }
        }
    });

    document.getElementById('resultadosComparador').style.display = 'block';
    document.getElementById('resultadosComparador').scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// TABS
// ============================================

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    // Encontrar el boton correspondiente
    document.querySelectorAll('.tab').forEach(t => {
        if (t.textContent.toLowerCase().includes(tabId.substring(0, 4)) ||
            (tabId === 'ofertademanda' && t.textContent.includes('Oferta')) ||
            (tabId === 'comparador' && t.textContent.includes('Comparador')) ||
            (tabId === 'balance' && t.textContent === 'Balance') ||
            (tabId === 'lotes' && t.textContent.includes('Lotes')) ||
            (tabId === 'economico' && t.textContent.includes('Economico'))) {
            t.classList.add('active');
        }
    });
}

// ============================================
// INICIALIZACION
// ============================================
window.onload = cargarDatos;
