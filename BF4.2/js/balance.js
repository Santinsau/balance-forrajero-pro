// ============================================
// BALANCE FORRAJERO PRO v6.0 - Balance
// (c) 2025-2026 Santiago Jose Insaurralde.
// Todos los derechos reservados.
// ============================================

// Recursos activos (los que el usuario agrego)
var recursosActivos = [];

// Auto-calculo con debounce
var _timerAutoCalc = null;
function autoCalcular() {
    if (_timerAutoCalc) clearTimeout(_timerAutoCalc);
    _timerAutoCalc = setTimeout(function() {
        try {
            // Solo calcular si hay al menos un recurso con ha > 0
            var hayRecursos = recursosActivos.some(function(r) {
                var el = document.getElementById('ha_' + r.replace(/\s+/g, '_'));
                return el && parseFloat(el.value) > 0;
            });
            if (!hayRecursos) return;
            calcularBalance();
            // Si ya se habia calculado demanda, recalcularla
            if (configuracionCampo && configuracionCampo.produccionMensualTotal && typeof calcularDemanda === 'function') {
                var esc = typeof getEscenarioActivo === 'function' ? getEscenarioActivo() : null;
                if (esc && esc.grupos && esc.grupos.length > 0) {
                    calcularDemanda();
                }
            }
        } catch(e) { /* silenciar errores de auto-calculo */ }
    }, 800);
}

// hectareasMap es opcional: { 'Campo natural': 10, 'Pastura consociada': 32, ... }
// Si se pasa, se usa para determinar recursos activos y setear hectareas.
// Si no se pasa, se detectan del DOM (inputs existentes con ha > 0).
function generarInputsRecursos(hectareasMap) {
    var container = document.getElementById('recursosContainer');
    if (!container) { console.error('ERROR: recursosContainer no encontrado'); return; }

    var recursos = datosForrajeros.recursos;
    if (!recursos || recursos.length === 0) {
        container.innerHTML = '<div class="alert alert-danger">No se encontraron recursos forrajeros.</div>';
        return;
    }

    // Determinar recursos activos
    recursosActivos = [];
    if (hectareasMap) {
        recursos.forEach(function(r) {
            if (hectareasMap[r] && hectareasMap[r] > 0) {
                recursosActivos.push(r);
            }
        });
    } else {
        recursos.forEach(function(r) {
            var inputId = 'ha_' + r.replace(/\s+/g, '_');
            var el = document.getElementById(inputId);
            var ha = el ? parseFloat(el.value) || 0 : 0;
            if (ha > 0 && recursosActivos.indexOf(r) === -1) recursosActivos.push(r);
        });
    }

    renderRecursosActivos();
    actualizarSelectorRecurso();

    // Si se paso mapa de hectareas, setear valores en los inputs recien creados
    if (hectareasMap) {
        recursos.forEach(function(r) {
            if (hectareasMap[r]) {
                var inputId = 'ha_' + r.replace(/\s+/g, '_');
                var el = document.getElementById(inputId);
                if (el) el.value = hectareasMap[r];
            }
        });
    }
}

function renderRecursosActivos() {
    var container = document.getElementById('recursosContainer');
    if (!container) return;

    if (recursosActivos.length === 0) {
        container.innerHTML = '<p style="color:#aaa;text-align:center;padding:15px;">No hay recursos cargados. Selecciona uno del desplegable y hace click en "Agregar recurso".</p>';
        return;
    }

    var html = '';
    recursosActivos.forEach(function(recurso) {
        var inputId = 'ha_' + recurso.replace(/\s+/g, '_');
        var promediosRecurso = datosForrajeros.promedios[recurso];
        var prodAnual = promediosRecurso ? promediosRecurso.anual : 0;
        var mesesActivos = mesesUsoRecursos[recurso] || [1,1,1,1,1,1,1,1,1,1,1,1];

        // Leer valor previo si existe en DOM
        var prevEl = document.getElementById(inputId);
        var prevVal = prevEl ? prevEl.value : '0';

        html += '<div class="recurso-row" id="recursoRow_' + recurso.replace(/\s+/g, '_') + '">';
        html += '<div class="recurso-info">';
        html += '<strong>' + recurso + '</strong>';
        html += '<span class="prod-info">' + Math.round(prodAnual) + ' kg MS/ha/ano</span>';
        html += '</div>';
        html += '<div class="recurso-ha"><input type="number" id="' + inputId + '" step="0.1" min="0" value="' + prevVal + '" placeholder="Ha" oninput="autoCalcular()"></div>';
        html += '<div class="meses-container">';
        for (var m = 0; m < 12; m++) {
            var activo = mesesActivos[m] ? 'activo' : '';
            html += '<button type="button" class="mes-btn ' + activo + '" ';
            html += 'data-recurso="' + recurso + '" data-mes="' + m + '" ';
            html += 'onclick="toggleMesRecurso(this)">';
            html += MESES_LABELS[m] + '</button>';
        }
        html += '</div>';
        html += '<button class="btn-eliminar" onclick="quitarRecurso(\'' + recurso.replace(/'/g, "\\'") + '\')" title="Quitar recurso" style="margin-left:8px;padding:4px 10px;border:none;border-radius:5px;cursor:pointer;font-weight:bold;color:white;">X</button>';
        html += '</div>';
    });

    container.innerHTML = html;
}

function actualizarSelectorRecurso() {
    var select = document.getElementById('selectorRecurso');
    if (!select) return;
    var recursos = datosForrajeros.recursos;
    var html = '';
    recursos.forEach(function(r) {
        if (recursosActivos.indexOf(r) === -1) {
            var prod = datosForrajeros.promedios[r] ? datosForrajeros.promedios[r].anual : 0;
            html += '<option value="' + r + '">' + r + ' (' + Math.round(prod) + ' kg MS/ha/ano)</option>';
        }
    });
    if (html === '') html = '<option value="">-- Todos los recursos agregados --</option>';
    select.innerHTML = html;
}

function agregarRecursoSeleccionado() {
    var select = document.getElementById('selectorRecurso');
    if (!select || !select.value) return;
    var recurso = select.value;
    if (recursosActivos.indexOf(recurso) === -1) {
        recursosActivos.push(recurso);
        renderRecursosActivos();
        actualizarSelectorRecurso();
        autoCalcular();
    }
}

function quitarRecurso(recurso) {
    recursosActivos = recursosActivos.filter(function(r) { return r !== recurso; });
    renderRecursosActivos();
    actualizarSelectorRecurso();
    if (typeof guardarEstadoAuto === 'function') guardarEstadoAuto();
    autoCalcular();
}

function toggleMesRecurso(btn) {
    var recurso = btn.getAttribute('data-recurso');
    var mes = parseInt(btn.getAttribute('data-mes'));
    mesesUsoRecursos[recurso][mes] = mesesUsoRecursos[recurso][mes] ? 0 : 1;
    btn.classList.toggle('activo');
    if (typeof guardarEstadoAuto === 'function') guardarEstadoAuto();
    autoCalcular();
}

function limpiarRecursos() {
    recursosActivos = [];
    renderRecursosActivos();
    actualizarSelectorRecurso();
}

function calcularBalance() {
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

    recursosActivos.forEach(function(recurso) {
        var inputId = 'ha_' + recurso.replace(/\s+/g, '_');
        var el = document.getElementById(inputId);
        var hectareas = el ? parseFloat(el.value) || 0 : 0;
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
