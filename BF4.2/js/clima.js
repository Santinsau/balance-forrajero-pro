// ============================================
// BALANCE FORRAJERO PRO v6.0 - Clima / Precipitaciones
// (c) 2025-2026 Santiago Jose Insaurralde.
// Todos los derechos reservados.
// ============================================

// Obtener factor de ajuste climatico global
function obtenerFactorClima() {
    if (!datosClima.usarDatosReales) return datosClima.indiceSequia / 100;
    return 1; // Si usa datos reales, el factor se aplica por mes
}

// Obtener factor de ajuste climatico por mes
function obtenerFactorClimaMensual(mesIndex) {
    if (!datosClima.usarDatosReales) return 1; // El ajuste global ya se aplica en obtenerFactorClima()

    var precReal = datosClima.precipitacionesMensuales[mesIndex] || 0;
    var mesKey = MESES_NOMBRES[mesIndex];
    var precPromedio = PRECIPITACION_PROMEDIO[mesKey] || 60;

    if (precPromedio === 0) return 1;

    var factorLluvia = precReal / precPromedio;
    // Con limites: rendimientos decrecientes
    var factorAjustado = Math.min(1.3, Math.max(0.4, 0.3 + 0.7 * factorLluvia));
    return factorAjustado;
}

// Consultar API Open-Meteo
function consultarClima() {
    var lat = parseFloat(document.getElementById('climaLatitud').value) || datosClima.latitud;
    var lon = parseFloat(document.getElementById('climaLongitud').value) || datosClima.longitud;

    datosClima.latitud = lat;
    datosClima.longitud = lon;

    var statusEl = document.getElementById('climaStatus');
    statusEl.innerHTML = '<div class="alert alert-info">Consultando datos de clima...</div>';

    // Consultar ultimos 365 dias
    var hoy = new Date();
    var hace1Ano = new Date(hoy.getTime() - 365 * 86400000);
    var fechaInicio = hace1Ano.toISOString().split('T')[0];
    var fechaFin = hoy.toISOString().split('T')[0];

    var url = 'https://archive-api.open-meteo.com/v1/archive?latitude=' + lat +
        '&longitude=' + lon +
        '&start_date=' + fechaInicio +
        '&end_date=' + fechaFin +
        '&daily=precipitation_sum&timezone=America/Argentina/Buenos_Aires';

    fetch(url)
        .then(function(response) {
            if (!response.ok) throw new Error('Error HTTP: ' + response.status);
            return response.json();
        })
        .then(function(data) {
            if (!data.daily || !data.daily.precipitation_sum) {
                throw new Error('Datos no disponibles');
            }

            // Acumular precipitacion por mes
            var precPorMes = Array(12).fill(0);
            var diasPorMes = Array(12).fill(0);

            data.daily.time.forEach(function(fecha, i) {
                var mes = new Date(fecha).getMonth();
                var prec = data.daily.precipitation_sum[i] || 0;
                precPorMes[mes] += prec;
                diasPorMes[mes]++;
            });

            datosClima.precipitacionesMensuales = precPorMes;
            datosClima.usarDatosReales = true;

            // Actualizar inputs
            for (var m = 0; m < 12; m++) {
                var el = document.getElementById('climaPrec_' + m);
                if (el) el.value = Math.round(precPorMes[m]);
            }

            // Guardar en localStorage
            try {
                localStorage.setItem('balanceForrajero_clima', JSON.stringify({
                    fecha: new Date().toISOString(),
                    lat: lat, lon: lon,
                    precipitaciones: precPorMes
                }));
            } catch(e) {}

            statusEl.innerHTML = '<div class="alert alert-success"><strong>Datos obtenidos:</strong> Precipitaciones del ultimo ano para lat=' + lat.toFixed(2) + ', lon=' + lon.toFixed(2) + '</div>';
            actualizarVistaClima();
        })
        .catch(function(err) {
            statusEl.innerHTML = '<div class="alert alert-danger"><strong>Error:</strong> ' + err.message + '. Usa el ingreso manual.</div>';
        });
}

// Actualizar datos manuales
function actualizarPrecipitacionManual(mesIndex) {
    var el = document.getElementById('climaPrec_' + mesIndex);
    if (el) {
        datosClima.precipitacionesMensuales[mesIndex] = parseFloat(el.value) || 0;
    }
    if (datosClima.precipitacionesMensuales.some(function(p) { return p > 0; })) {
        datosClima.usarDatosReales = true;
    }
    actualizarVistaClima();
}

function actualizarIndiceSequia() {
    var el = document.getElementById('climaIndiceSequia');
    if (el) {
        datosClima.indiceSequia = parseInt(el.value);
        var display = document.getElementById('sequiaValor');
        if (display) display.textContent = datosClima.indiceSequia + '%';
    }
    if (typeof guardarEstadoAuto === 'function') guardarEstadoAuto();
}

// Renderizar vista de clima
function actualizarVistaClima() {
    renderVistaClima();
    if (typeof guardarEstadoAuto === 'function') guardarEstadoAuto();
}

function renderVistaClima() {
    var indicadores = document.getElementById('climaIndicadores');
    if (!indicadores) return;

    var precTotal = datosClima.precipitacionesMensuales.reduce(function(a, b) { return a + b; }, 0);
    var precPromTotal = 0;
    MESES_NOMBRES.forEach(function(m) { precPromTotal += PRECIPITACION_PROMEDIO[m] || 0; });

    var factorGlobal = precPromTotal > 0 ? precTotal / precPromTotal : 1;

    var html = '<div class="card-grid">';
    html += '<div class="card"><div class="card-title">Prec. total</div><div class="card-value">' + Math.round(precTotal) + '</div><div class="card-unit">mm/ano</div></div>';
    html += '<div class="card"><div class="card-title">Prec. promedio</div><div class="card-value">' + Math.round(precPromTotal) + '</div><div class="card-unit">mm/ano</div></div>';
    html += '<div class="card"><div class="card-title">Indice vs prom.</div><div class="card-value" style="color:' + (factorGlobal >= 0.9 ? '#27ae60' : factorGlobal >= 0.7 ? '#f39c12' : '#e74c3c') + ';">' + (factorGlobal * 100).toFixed(0) + '%</div></div>';
    html += '</div>';

    // Tabla mensual con iconos
    html += '<h3>Detalle mensual</h3>';
    html += '<div class="tabla-scroll"><table><thead><tr><th>Mes</th><th>Icono</th><th>Prec. real (mm)</th><th>Prec. prom (mm)</th><th>Factor ajuste</th><th>Efecto produc.</th></tr></thead><tbody>';

    for (var m = 0; m < 12; m++) {
        var precReal = datosClima.precipitacionesMensuales[m];
        var precProm = PRECIPITACION_PROMEDIO[MESES_NOMBRES[m]] || 60;
        var factor = obtenerFactorClimaMensual(m);
        var icono = precReal > precProm * 1.2 ? '&#9748;' : precReal < precProm * 0.5 ? '&#9728;' : '&#9925;';
        var colorFactor = factor >= 1 ? '#27ae60' : factor >= 0.7 ? '#f39c12' : '#e74c3c';

        html += '<tr>';
        html += '<td>' + MESES_NOMBRES[m] + '</td>';
        html += '<td style="font-size:1.3em;">' + icono + '</td>';
        html += '<td>' + Math.round(precReal) + '</td>';
        html += '<td>' + precProm + '</td>';
        html += '<td style="color:' + colorFactor + ';font-weight:700;">' + factor.toFixed(2) + '</td>';
        html += '<td style="color:' + colorFactor + ';">' + ((factor - 1) * 100).toFixed(0) + '%</td>';
        html += '</tr>';
    }

    html += '</tbody></table></div>';

    indicadores.innerHTML = html;

    // Grafico de precipitaciones
    renderGraficoClima();
}

function renderGraficoClima() {
    var ctx = document.getElementById('chartClima');
    if (!ctx) return;
    if (chartClima) chartClima.destroy();

    var precReales = datosClima.precipitacionesMensuales;
    var precPromedio = MESES_NOMBRES.map(function(m) { return PRECIPITACION_PROMEDIO[m] || 0; });

    chartClima = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: MESES_NOMBRES,
            datasets: [
                { label: 'Prec. real (mm)', data: precReales, backgroundColor: '#3498db80', borderColor: '#3498db', borderWidth: 2 },
                { label: 'Prec. promedio (mm)', data: precPromedio, type: 'line', borderColor: '#f39c12', borderWidth: 2, borderDash: [5,5], fill: false, tension: 0.4, pointRadius: 3 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Precipitaciones: Real vs Promedio historico', font: { size: 14, weight: 'bold' } },
                legend: { position: 'top' }
            },
            scales: { y: { beginAtZero: true, title: { display: true, text: 'mm' } } }
        }
    });
}

// Cargar datos de clima guardados
function cargarClimaGuardado() {
    try {
        var saved = localStorage.getItem('balanceForrajero_clima');
        if (saved) {
            var data = JSON.parse(saved);
            if (data.precipitaciones) {
                datosClima.precipitacionesMensuales = data.precipitaciones;
                datosClima.latitud = data.lat || datosClima.latitud;
                datosClima.longitud = data.lon || datosClima.longitud;
                datosClima.usarDatosReales = true;

                // Actualizar inputs
                for (var m = 0; m < 12; m++) {
                    var el = document.getElementById('climaPrec_' + m);
                    if (el) el.value = Math.round(datosClima.precipitacionesMensuales[m]);
                }

                var latEl = document.getElementById('climaLatitud');
                var lonEl = document.getElementById('climaLongitud');
                if (latEl) latEl.value = datosClima.latitud;
                if (lonEl) lonEl.value = datosClima.longitud;

                var statusEl = document.getElementById('climaStatus');
                if (statusEl) {
                    statusEl.innerHTML = '<div class="alert alert-info">Datos cargados del ' + new Date(data.fecha).toLocaleDateString('es-AR') + '</div>';
                }
            }
        }
    } catch(e) {}
}
