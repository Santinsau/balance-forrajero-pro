// ============================================
// BALANCE FORRAJERO PRO v6.0 - Balance
// ============================================

function generarInputsRecursos() {
    var container = document.getElementById('recursosContainer');
    if (!container) { console.error('ERROR: recursosContainer no encontrado'); return; }

    var recursos = datosForrajeros.recursos;
    if (!recursos || recursos.length === 0) {
        container.innerHTML = '<div class="alert alert-danger">No se encontraron recursos forrajeros.</div>';
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
        html += '<span class="prod-info">' + Math.round(prodAnual) + ' kg MS/ha/ano</span>';
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
        html += '</div></div>';
    }

    container.innerHTML = html;
}

function toggleMesRecurso(btn) {
    var recurso = btn.getAttribute('data-recurso');
    var mes = parseInt(btn.getAttribute('data-mes'));
    mesesUsoRecursos[recurso][mes] = mesesUsoRecursos[recurso][mes] ? 0 : 1;
    btn.classList.toggle('activo');
    if (typeof guardarEstadoAuto === 'function') guardarEstadoAuto();
}

function limpiarRecursos() {
    datosForrajeros.recursos.forEach(function(r) {
        var inputId = 'ha_' + r.replace(/\s+/g, '_');
        var el = document.getElementById(inputId);
        if (el) el.value = '0';
    });
}

function calcularBalance() {
    var recursos = datosForrajeros.recursos;
    var escenario = document.getElementById('escenarioSelect').value;
    var ajuste = parseFloat(document.getElementById('ajusteProductividad').value) / 100;
    var manejo = document.getElementById('manejoPastoreo').value;

    // Factor clima
    var factorClima = 1;
    if (typeof obtenerFactorClima === 'function') {
        factorClima = obtenerFactorClima();
    }

    var superficieTotal = 0;
    var config = [];

    recursos.forEach(function(recurso) {
        var inputId = 'ha_' + recurso.replace(/\s+/g, '_');
        var hectareas = parseFloat(document.getElementById(inputId).value) || 0;
        if (hectareas > 0) {
            superficieTotal += hectareas;
            config.push({ recurso: recurso, hectareas: hectareas });
        }
    });

    if (superficieTotal === 0) {
        var container = document.getElementById('recursosContainer');
        if (container) {
            var alertDiv = container.querySelector('.alert-validacion');
            if (!alertDiv) {
                alertDiv = document.createElement('div');
                alertDiv.className = 'alert alert-danger alert-validacion';
                container.prepend(alertDiv);
            }
            alertDiv.innerHTML = '<strong>Ingresa al menos una superficie mayor a 0</strong>';
            setTimeout(function() { alertDiv.remove(); }, 5000);
        }
        return;
    }

    configuracionCampo = { superficie: superficieTotal, recursos: config, escenario: escenario, ajuste: ajuste, manejo: manejo };

    var produccionPorRecurso = {};
    var produccionMensualTotal = Array(12).fill(0);

    config.forEach(function(item) {
        var recurso = item.recurso;
        var hectareas = item.hectareas;
        var promedios = datosForrajeros.promedios[recurso];
        var resumen = datosForrajeros.resumen[recurso];
        var mesesActivos = getMesesActivos(recurso);

        var factorEscenario = 1;
        if (escenario === 'bueno') factorEscenario = resumen.produccion_mejor / resumen.promedio;
        else if (escenario === 'malo') factorEscenario = resumen.produccion_peor / resumen.promedio;

        var prodRecurso = promedios.mensual.map(function(prod, i) {
            var factorClimaMes = 1;
            if (typeof obtenerFactorClimaMensual === 'function') {
                factorClimaMes = obtenerFactorClimaMensual(i);
            }
            return prod * hectareas * factorEscenario * ajuste * mesesActivos[i] * factorClimaMes;
        });

        produccionPorRecurso[recurso] = prodRecurso;
        prodRecurso.forEach(function(p, i) { produccionMensualTotal[i] += p; });
    });

    if (escenario === 'comparar') {
        var datasets = calcularTresEscenarios(config, ajuste);
        mostrarGraficoBalance(datasets);
        produccionPorRecurso = {};
        produccionMensualTotal = Array(12).fill(0);
        config.forEach(function(item) {
            var recurso = item.recurso;
            var hectareas = item.hectareas;
            var promedios = datosForrajeros.promedios[recurso];
            var mesesActivos = getMesesActivos(recurso);
            var prodRecurso = promedios.mensual.map(function(prod, i) {
                return prod * hectareas * ajuste * mesesActivos[i];
            });
            produccionPorRecurso[recurso] = prodRecurso;
            prodRecurso.forEach(function(p, i) { produccionMensualTotal[i] += p; });
        });
    } else {
        mostrarGraficoBalance([{
            label: escenario === 'promedio' ? 'Ano Promedio' : escenario === 'bueno' ? 'Ano Bueno' : 'Ano Malo',
            data: produccionMensualTotal,
            color: escenario === 'promedio' ? '#27ae60' : escenario === 'bueno' ? '#2ecc71' : '#e74c3c'
        }]);
    }

    var produccionAnual = produccionMensualTotal.reduce(function(a, b) { return a + b; }, 0);
    var cargaMax = calcularCargaMaxima(produccionAnual, superficieTotal, manejo);

    document.getElementById('superficieTotal').textContent = superficieTotal.toFixed(1);
    document.getElementById('produccionAnual').textContent = formatNum(produccionAnual);
    document.getElementById('cargaMaxima').textContent = cargaMax.toFixed(2);
    document.getElementById('produccionPorHa').textContent = formatNum(produccionAnual / superficieTotal);

    generarTablaProduccionRecursos(produccionPorRecurso, config);
    mostrarGraficoAcumuladoRecursos(produccionPorRecurso, config);
    generarAlertasBalance(produccionMensualTotal, manejo, ajuste);

    configuracionCampo.produccionPorRecurso = produccionPorRecurso;
    configuracionCampo.produccionMensualTotal = produccionMensualTotal;

    document.getElementById('resultadosBalance').style.display = 'block';
    document.getElementById('resultadosBalance').scrollIntoView({ behavior: 'smooth' });

    // Auto-guardar estado
    if (typeof guardarEstadoAuto === 'function') guardarEstadoAuto();
    if (typeof actualizarResumenEjecutivo === 'function') actualizarResumenEjecutivo();
}

function calcularTresEscenarios(config, ajuste) {
    return ['promedio', 'bueno', 'malo'].map(function(esc) {
        var prod = Array(12).fill(0);
        config.forEach(function(item) {
            var recurso = item.recurso;
            var hectareas = item.hectareas;
            var resumen = datosForrajeros.resumen[recurso];
            var promedios = datosForrajeros.promedios[recurso];
            var mesesActivos = getMesesActivos(recurso);
            var factor = 1;
            if (esc === 'bueno') factor = resumen.produccion_mejor / resumen.promedio;
            else if (esc === 'malo') factor = resumen.produccion_peor / resumen.promedio;
            promedios.mensual.forEach(function(p, i) { prod[i] += p * hectareas * factor * ajuste * mesesActivos[i]; });
        });
        return {
            label: esc === 'promedio' ? 'Ano Promedio' : esc === 'bueno' ? 'Ano Bueno' : 'Ano Malo',
            data: prod,
            color: esc === 'promedio' ? '#f39c12' : esc === 'bueno' ? '#2ecc71' : '#e74c3c'
        };
    });
}

function generarTablaProduccionRecursos(produccionPorRecurso, config) {
    var container = document.getElementById('tablaProduccionRecursos');
    var html = '<table><thead><tr><th>Recurso</th><th>Ha</th>';
    MESES_NOMBRES.forEach(function(m) { html += '<th>' + m + '</th>'; });
    html += '<th>Total</th></tr></thead><tbody>';

    var totalesMes = Array(12).fill(0);
    var granTotal = 0;

    config.forEach(function(item) {
        var prod = produccionPorRecurso[item.recurso];
        var totalRecurso = prod.reduce(function(a, b) { return a + b; }, 0);
        granTotal += totalRecurso;

        html += '<tr><td>' + item.recurso + '</td><td>' + item.hectareas + '</td>';
        prod.forEach(function(p, i) {
            totalesMes[i] += p;
            html += '<td>' + formatNum(p) + '</td>';
        });
        html += '<td><strong>' + formatNum(totalRecurso) + '</strong></td></tr>';
    });

    html += '<tr class="fila-total"><td>TOTAL</td><td>' + configuracionCampo.superficie.toFixed(1) + '</td>';
    totalesMes.forEach(function(t) { html += '<td>' + formatNum(t) + '</td>'; });
    html += '<td><strong>' + formatNum(granTotal) + '</strong></td></tr>';
    html += '</tbody></table>';
    container.innerHTML = html;
}

function mostrarGraficoAcumuladoRecursos(produccionPorRecurso, config) {
    var ctx = document.getElementById('chartAcumuladoRecursos');
    if (chartAcumulado) chartAcumulado.destroy();

    var datasets = config.map(function(item, idx) {
        return {
            label: item.recurso,
            data: produccionPorRecurso[item.recurso],
            backgroundColor: generarColorGrupo(idx) + '80',
            borderColor: generarColorGrupo(idx),
            borderWidth: 1,
            fill: true
        };
    });

    chartAcumulado = new Chart(ctx, {
        type: 'line',
        data: { labels: MESES_NOMBRES, datasets: datasets },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Aporte de cada recurso (kg MS/mes)', font: { size: 14, weight: 'bold' } },
                legend: { position: 'bottom', labels: { font: { size: 11 } } }
            },
            scales: {
                x: { stacked: true },
                y: { stacked: true, beginAtZero: true, ticks: { callback: function(v) { return (v/1000).toFixed(0) + 'k'; } } }
            },
            elements: { line: { tension: 0.3 }, point: { radius: 0 } }
        }
    });
}

function mostrarGraficoBalance(datasets) {
    var ctx = document.getElementById('chartBalance');
    if (chartBalance) chartBalance.destroy();

    chartBalance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: MESES_NOMBRES,
            datasets: datasets.map(function(ds) {
                return {
                    label: ds.label,
                    data: ds.data,
                    borderColor: ds.color,
                    backgroundColor: ds.color + '20',
                    borderWidth: 3,
                    fill: datasets.length === 1,
                    tension: 0.4
                };
            })
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Produccion Forrajera Mensual (kg MS)', font: { size: 14, weight: 'bold' } },
                legend: { position: 'top' }
            },
            scales: { y: { beginAtZero: true, ticks: { callback: function(v) { return (v/1000).toFixed(0) + 'k'; } } } }
        }
    });
}

function generarAlertasBalance(produccionMensual, manejo, ajuste) {
    var container = document.getElementById('alertasBalance');
    var eficiencia = MODELO_CONFIG.eficienciaPastoreo[manejo];
    var minProd = Math.min.apply(null, produccionMensual);
    var maxProd = Math.max.apply(null, produccionMensual);
    var mesMin = MESES_NOMBRES[produccionMensual.indexOf(minProd)];
    var mesMax = MESES_NOMBRES[produccionMensual.indexOf(maxProd)];

    var alertas = [];
    var variacion = minProd > 0 ? ((maxProd - minProd) / minProd * 100) : 999;
    if (variacion > 100) {
        alertas.push({ tipo: 'warning', msg: '<strong>Alta estacionalidad:</strong> Variacion del ' + variacion.toFixed(0) + '% entre ' + mesMin + ' y ' + mesMax + '. Considera diferimiento o suplementacion.' });
    }

    var prodTotal = produccionMensual.reduce(function(a,b){return a+b;}, 0);
    alertas.push({ tipo: 'info', msg: '<strong>Eficiencia de pastoreo:</strong> ' + (eficiencia*100).toFixed(1) + '% (' + manejo + '). Produccion aprovechable: ' + formatNum(prodTotal * eficiencia) + ' kg MS.' });

    if (ajuste !== 1) {
        alertas.push({ tipo: ajuste > 1 ? 'success' : 'warning', msg: '<strong>Ajuste de productividad:</strong> ' + (ajuste*100).toFixed(0) + '% (' + (ajuste > 1 ? 'optimista' : 'conservador') + ').' });
    }

    container.innerHTML = alertas.map(function(a) { return '<div class="alert alert-' + a.tipo + '">' + a.msg + '</div>'; }).join('');
}
