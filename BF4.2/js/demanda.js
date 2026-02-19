// ============================================
// BALANCE FORRAJERO PRO v6.0 - Oferta/Demanda
// ============================================

var alertasPredictivas = [];

function calcularDemanda() {
    var alertContainer = document.querySelector('#ofertademanda .section');
    if (!configuracionCampo) {
        if (alertContainer) {
            var a = alertContainer.querySelector('.alert-validacion');
            if (!a) { a = document.createElement('div'); a.className = 'alert alert-danger alert-validacion'; alertContainer.appendChild(a); }
            a.innerHTML = '<strong>Primero calcula el balance forrajero</strong> en la pestana Balance.';
            setTimeout(function() { a.remove(); }, 5000);
        }
        return;
    }
    var esc = getEscenarioActivo();
    if (!esc || esc.grupos.length === 0) {
        if (alertContainer) {
            var a = alertContainer.querySelector('.alert-validacion');
            if (!a) { a = document.createElement('div'); a.className = 'alert alert-danger alert-validacion'; alertContainer.appendChild(a); }
            a.innerHTML = '<strong>Agrega al menos un grupo de animales</strong> en la pestana Lotes/Rodeo.';
            setTimeout(function() { a.remove(); }, 5000);
        }
        return;
    }

    var manejo = configuracionCampo.manejo;
    var eficiencia = MODELO_CONFIG.eficienciaPastoreo[manejo];
    var mesInicio = parseInt(document.getElementById('mesInicioSelect').value);
    var stockInicial = parseFloat(document.getElementById('stockInicialInput').value) || 0;

    var ofertaMensual = configuracionCampo.produccionMensualTotal;
    var demandaMensual = Array(12).fill(0);

    esc.grupos.forEach(function(g) {
        var cat = CATEGORIAS[g.categoria];
        if (!cat.usaPasto) return;

        var entrada = new Date(g.fechaEntrada);
        var salida = new Date(g.fechaSalida);

        // Iterar mes a mes desde entrada hasta salida (puede cruzar anos)
        var mesActual = new Date(entrada.getFullYear(), entrada.getMonth(), 1);
        var mesFinal = new Date(salida.getFullYear(), salida.getMonth(), 1);

        while (mesActual <= mesFinal) {
            var mesIdx = mesActual.getMonth(); // 0-11 mes calendario
            var inicioMes = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1);
            var finMes = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0);

            // Dias realmente presentes en este mes
            var diaDesde = entrada > inicioMes ? entrada : inicioMes;
            var diaHasta = salida < finMes ? salida : finMes;
            var diasPresente = Math.max(0, Math.floor((diaHasta - diaDesde) / 86400000) + 1);

            if (diasPresente > 0) {
                var diasDesdeEntrada = Math.max(0, Math.floor((new Date(mesActual.getFullYear(), mesActual.getMonth(), 15) - entrada) / 86400000));
                var pesoPromedio = g.pesoInicial + g.ganancia * diasDesdeEntrada;

                var consumoDiario = pesoPromedio * cat.consumo;
                if (g.categoria === 'vaca' && cat.consumoCria) {
                    var pesoCria = cat.pesoCria + g.ganancia * 0.3 * diasDesdeEntrada;
                    consumoDiario += pesoCria * cat.consumoCria;
                }

                demandaMensual[mesIdx] += consumoDiario * diasPresente * g.cantidad;
            }

            mesActual.setMonth(mesActual.getMonth() + 1);
        }
    });

    var balanceMensual = Array(12).fill(0);
    var diferidoAcumulado = Array(12).fill(0);
    var disponibilidadMensual = Array(12).fill(0);
    var diferidoActual = stockInicial;

    for (var i = 0; i < 12; i++) {
        var mes = (mesInicio + i) % 12;
        var produccionMes = ofertaMensual[mes] * eficiencia;
        diferidoActual = diferidoActual * (1 - MODELO_CONFIG.perdidaDiferido);
        var disponibilidadTotal = produccionMes + diferidoActual;
        disponibilidadMensual[mes] = disponibilidadTotal;
        var balance = disponibilidadTotal - demandaMensual[mes];
        balanceMensual[mes] = balance;
        diferidoActual = balance > 0 ? balance : 0;
        diferidoAcumulado[mes] = diferidoActual;
    }

    mostrarGraficoOfertaDemanda(ofertaMensual, demandaMensual, balanceMensual, eficiencia);
    mostrarGraficoDiferimiento(diferidoAcumulado, disponibilidadMensual);
    generarTablaDetalleMensual(ofertaMensual, demandaMensual, balanceMensual, diferidoAcumulado, eficiencia, mesInicio);
    generarAlertasDemanda(ofertaMensual, demandaMensual, balanceMensual, diferidoAcumulado, eficiencia, mesInicio);
    calcularIndicadoresOfertaDemanda(ofertaMensual, demandaMensual, balanceMensual, eficiencia);

    // Suplementacion inteligente
    detectarSuplementacionNecesaria(balanceMensual, demandaMensual, mesInicio);

    // Alertas predictivas para resumen ejecutivo
    generarAlertasPredictivas(balanceMensual, demandaMensual, ofertaMensual, eficiencia, mesInicio);

    // Balance hidrico
    calcularBalanceHidrico();

    document.getElementById('resultadosDemanda').style.display = 'block';
    document.getElementById('resultadosDemanda').scrollIntoView({ behavior: 'smooth' });
}

function calcularIndicadoresOfertaDemanda(oferta, demanda, balance, eficiencia) {
    var superficie = configuracionCampo.superficie;
    var produccionTotal = oferta.reduce(function(a,b) { return a + b; }, 0);
    var produccionAprovechable = produccionTotal * eficiencia;
    var demandaTotal = demanda.reduce(function(a,b) { return a + b; }, 0);
    var balanceAnual = balance.reduce(function(a,b) { return a + b; }, 0);
    var cargaReal = demandaTotal / MODELO_CONFIG.consumoAnualEV / superficie;
    var cargaMaxima = produccionAprovechable / MODELO_CONFIG.consumoAnualEV / superficie;
    var tasaUso = demandaTotal / produccionAprovechable * 100;

    document.getElementById('produccionTotalDemanda').textContent = formatNum(produccionTotal);
    document.getElementById('demandaTotalAnual').textContent = formatNum(demandaTotal);
    document.getElementById('balanceAnual').textContent = formatNum(balanceAnual);
    document.getElementById('balanceAnual').style.color = balanceAnual >= 0 ? '#27ae60' : '#e74c3c';
    document.getElementById('cargaAnimalReal').textContent = cargaReal.toFixed(2);
    document.getElementById('cargaAnimalMaxima').textContent = cargaMaxima.toFixed(2);
    document.getElementById('tasaUso').textContent = tasaUso.toFixed(1);
    document.getElementById('tasaUso').style.color = tasaUso > 100 ? '#e74c3c' : tasaUso > 85 ? '#f39c12' : '#27ae60';
}

function mostrarGraficoOfertaDemanda(oferta, demanda, balance, eficiencia) {
    var ctx = document.getElementById('chartOfertaDemanda');
    if (chartOfertaDemanda) chartOfertaDemanda.destroy();

    var ofertaAprov = oferta.map(function(o) { return o * eficiencia; });

    chartOfertaDemanda = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: MESES_NOMBRES,
            datasets: [
                { label: 'Oferta aprovechable', data: ofertaAprov, backgroundColor: '#27ae6050', borderColor: '#27ae60', borderWidth: 2 },
                { label: 'Demanda', data: demanda, backgroundColor: '#e74c3c50', borderColor: '#e74c3c', borderWidth: 2 },
                { label: 'Balance (con diferimiento)', data: balance, type: 'line', borderColor: '#3498db', borderWidth: 2, tension: 0.4, fill: false, pointRadius: 4 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Balance Forrajero - Oferta vs Demanda (Eficiencia: ' + (eficiencia*100).toFixed(1) + '%)', font: { size: 14, weight: 'bold' } },
                legend: { position: 'top' }
            },
            scales: { y: { beginAtZero: true, ticks: { callback: function(v) { return (v/1000).toFixed(0) + 'k'; } } } }
        }
    });
}

function mostrarGraficoDiferimiento(diferido, disponibilidad) {
    var ctx = document.getElementById('chartDiferimiento');
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
            scales: { y: { beginAtZero: true, ticks: { callback: function(v) { return (v/1000).toFixed(0) + 'k'; } } } }
        }
    });
}

function generarTablaDetalleMensual(oferta, demanda, balance, diferido, eficiencia, mesInicio) {
    var tbody = document.getElementById('tablaDetalleMensualBody');
    var html = '';

    for (var i = 0; i < 12; i++) {
        var mes = (mesInicio + i) % 12;
        var ofertaAprov = oferta[mes] * eficiencia;
        var estado = balance[mes] >= 0
            ? '<span style="color:#27ae60;font-weight:700;">OK</span>'
            : '<span style="color:#e74c3c;font-weight:700;">DEFICIT</span>';

        html += '<tr>';
        html += '<td>' + MESES_NOMBRES[mes] + '</td>';
        html += '<td>' + formatNum(ofertaAprov) + '</td>';
        html += '<td>' + formatNum(demanda[mes]) + '</td>';
        html += '<td style="color:' + (balance[mes] >= 0 ? '#27ae60' : '#e74c3c') + ';font-weight:700;">' + formatNum(balance[mes]) + '</td>';
        html += '<td>' + formatNum(diferido[mes]) + '</td>';
        html += '<td>' + estado + '</td></tr>';
    }

    tbody.innerHTML = html;
}

function generarAlertasDemanda(oferta, demanda, balance, diferido, eficiencia, mesInicio) {
    var container = document.getElementById('alertasDemanda');
    var alertas = [];

    var mesesDeficit = [];
    var deficitTotal = 0;
    for (var i = 0; i < 12; i++) {
        var mes = (mesInicio + i) % 12;
        if (balance[mes] < 0) {
            mesesDeficit.push(MESES_NOMBRES[mes]);
            deficitTotal += Math.abs(balance[mes]);
        }
    }

    if (mesesDeficit.length > 0) {
        alertas.push({ tipo: 'danger', msg: '<strong>Deficit forrajero:</strong> ' + mesesDeficit.length + ' meses con deficit: ' + mesesDeficit.join(', ') + '. Deficit total: ' + formatNum(deficitTotal) + ' kg MS.' });
    } else {
        alertas.push({ tipo: 'success', msg: '<strong>Balance positivo:</strong> Todos los meses tienen balance positivo considerando el diferimiento.' });
    }

    var diferidoMax = Math.max.apply(null, diferido);
    if (diferidoMax > 0) {
        var mesDif = MESES_NOMBRES[diferido.indexOf(diferidoMax)];
        alertas.push({ tipo: 'info', msg: '<strong>Diferimiento maximo:</strong> ' + formatNum(diferidoMax) + ' kg MS en ' + mesDif + '. Perdida de calidad: 5% mensual.' });
    }

    var ofertaTotal = oferta.reduce(function(a,b){return a+b;},0);
    var desperdicio = ofertaTotal * (1 - eficiencia);
    alertas.push({ tipo: 'warning', msg: '<strong>Desperdicio por manejo:</strong> ' + formatNum(desperdicio) + ' kg MS/ano no aprovechados (' + ((1-eficiencia)*100).toFixed(1) + '%).' });

    container.innerHTML = alertas.map(function(a) { return '<div class="alert alert-' + a.tipo + '">' + a.msg + '</div>'; }).join('');
}

// Suplementacion inteligente (Fase 6)
function detectarSuplementacionNecesaria(balance, demanda, mesInicio) {
    var container = document.getElementById('suplementacionInteligente');
    if (!container) return;

    var sugerencias = [];
    for (var i = 0; i < 12; i++) {
        var mes = (mesInicio + i) % 12;
        if (balance[mes] < 0) {
            var deficit = Math.abs(balance[mes]);
            // Estimar kg de grano de maiz necesarios (3.2 Mcal EM/kg, ~90% MS)
            var kgGrano = deficit / 0.9; // simplificado: 1 kg MS suplemento ~= 1 kg MS forraje
            sugerencias.push({
                mes: MESES_NOMBRES[mes],
                deficit: deficit,
                kgGrano: kgGrano
            });
        }
    }

    if (sugerencias.length === 0) {
        container.innerHTML = '<div class="alert alert-success"><strong>Sin deficit:</strong> No se requiere suplementacion.</div>';
        return;
    }

    var html = '<h3>Suplementacion sugerida</h3>';
    html += '<table><thead><tr><th>Mes</th><th>Deficit (kg MS)</th><th>Suplemento sugerido (kg)</th><th>Equivale a</th></tr></thead><tbody>';
    var totalKg = 0;
    sugerencias.forEach(function(s) {
        totalKg += s.kgGrano;
        var kgDia = s.kgGrano / 30;
        html += '<tr><td>' + s.mes + '</td><td style="color:#e74c3c;">' + formatNum(s.deficit) + '</td>';
        html += '<td>' + formatNum(s.kgGrano) + '</td>';
        html += '<td>' + kgDia.toFixed(1) + ' kg/dia total rodeo</td></tr>';
    });
    html += '<tr class="fila-total"><td>TOTAL</td><td></td><td>' + formatNum(totalKg) + ' kg</td><td></td></tr>';
    html += '</tbody></table>';

    container.innerHTML = html;
}

// Alertas predictivas para resumen ejecutivo
function generarAlertasPredictivas(balance, demanda, oferta, eficiencia, mesInicio) {
    alertasPredictivas = [];

    var ofertaTotal = oferta.reduce(function(a, b) { return a + b; }, 0);
    var ofertaAprovechable = ofertaTotal * eficiencia;
    var demandaTotal = demanda.reduce(function(a, b) { return a + b; }, 0);
    var tasaUso = ofertaAprovechable > 0 ? (demandaTotal / ofertaAprovechable * 100) : 0;

    // Recorrer meses en orden del ejercicio
    var mesesDeficit = [];
    var deficitTotal = 0;
    var primerDeficitIdx = -1;
    var mesMenorMargen = -1;
    var menorMargenRatio = Infinity;

    for (var i = 0; i < 12; i++) {
        var mes = (mesInicio + i) % 12;
        if (balance[mes] < 0) {
            if (primerDeficitIdx === -1) primerDeficitIdx = i;
            mesesDeficit.push({ mes: mes, idx: i, deficit: Math.abs(balance[mes]) });
            deficitTotal += Math.abs(balance[mes]);
        }
        // Buscar mes con menor margen (para alerta amarilla)
        if (demanda[mes] > 0) {
            var ofertaMes = oferta[mes] * eficiencia;
            var ratio = ofertaMes / demanda[mes];
            if (ratio < menorMargenRatio) {
                menorMargenRatio = ratio;
                mesMenorMargen = mes;
            }
        }
    }

    // Calcular cabezas a vender para eliminar deficit
    var esc = getEscenarioActivo();
    var totalCab = 0;
    if (esc && esc.grupos) {
        esc.grupos.forEach(function(g) { totalCab += g.cantidad; });
    }

    // Consumo promedio diario del rodeo (para calcular cabezas equivalentes)
    var consumoPromedioDiario = demandaTotal > 0 ? demandaTotal / 365 : 0;
    var consumoPorCabezaDia = totalCab > 0 ? consumoPromedioDiario / totalCab : 10;

    if (tasaUso > 100) {
        // ROJO: Sobrecarga
        var exceso = demandaTotal - ofertaAprovechable;
        var cabVender = totalCab > 0 ? Math.ceil(exceso / consumoPorCabezaDia / 365) : 0;
        alertasPredictivas.push({
            tipo: 'critica',
            titulo: 'Sobrecarga: la demanda supera la oferta anual',
            detalle: 'Tasa de uso: ' + tasaUso.toFixed(0) + '%. Exceso: ' + formatNum(exceso) + ' kg MS.',
            accion: cabVender > 0 ? 'Reducir ' + cabVender + ' cabezas para equilibrar el balance.' : ''
        });
    }

    if (mesesDeficit.length >= 3 || (mesesDeficit.length > 0 && deficitTotal > demandaTotal * 0.15)) {
        // ROJO: Deficit critico
        var mesesEnAnticipacion = primerDeficitIdx > 0 ? 'En ' + primerDeficitIdx + ' meses: ' : '';
        var nombresMeses = mesesDeficit.map(function(m) { return MESES_NOMBRES[m.mes]; }).join(', ');
        var kgSuplemento = deficitTotal / 0.9; // aprox 1 kg grano = 0.9 kg MS
        var tonSuplemento = (kgSuplemento / 1000).toFixed(1);
        var cabVender = totalCab > 0 ? Math.ceil(deficitTotal / consumoPorCabezaDia / 365) : 0;
        alertasPredictivas.push({
            tipo: 'critica',
            titulo: mesesEnAnticipacion + 'Deficit critico en ' + mesesDeficit.length + ' meses',
            detalle: 'Meses afectados: ' + nombresMeses + '. Deficit total: ' + formatNum(deficitTotal) + ' kg MS.',
            accion: 'Vender ' + cabVender + ' cabezas o suplementar ~' + tonSuplemento + ' toneladas de grano.'
        });
    } else if (mesesDeficit.length > 0) {
        // AMARILLO: Deficit leve (1-2 meses, <15% demanda)
        var mesesEnAnticipacion = primerDeficitIdx > 0 ? 'En ' + primerDeficitIdx + ' meses: ' : '';
        var nombresMeses = mesesDeficit.map(function(m) { return MESES_NOMBRES[m.mes]; }).join(', ');
        var kgSupDiario = deficitTotal / (mesesDeficit.length * 30);
        alertasPredictivas.push({
            tipo: 'atencion',
            titulo: mesesEnAnticipacion + 'Deficit leve en ' + nombresMeses,
            detalle: 'Deficit total: ' + formatNum(deficitTotal) + ' kg MS (' + (deficitTotal / demandaTotal * 100).toFixed(1) + '% de la demanda).',
            accion: 'Suplementar ~' + formatNum(kgSupDiario) + ' kg/dia de grano durante ' + mesesDeficit.length + ' mes(es).'
        });
    } else if (tasaUso > 85) {
        // AMARILLO: Balance ajustado
        alertasPredictivas.push({
            tipo: 'atencion',
            titulo: 'Balance ajustado. Margen bajo en ' + MESES_NOMBRES[mesMenorMargen],
            detalle: 'Tasa de uso: ' + tasaUso.toFixed(0) + '%. Sin deficit actual pero con poco margen.',
            accion: 'Considerar reducir carga o reservar forraje para contingencias.'
        });
    } else {
        // VERDE: Todo OK
        alertasPredictivas.push({
            tipo: 'ok',
            titulo: 'Balance positivo todo el ano',
            detalle: 'Tasa de uso: ' + tasaUso.toFixed(0) + '%. Buen margen de seguridad.',
            accion: ''
        });
    }

    // Renderizar en el panel de resumen
    renderAlertasPredictivas();
    actualizarResumenEjecutivo();
}

function renderAlertasPredictivas() {
    var container = document.getElementById('alertasPredictivas');
    if (!container) return;

    if (alertasPredictivas.length === 0) {
        container.innerHTML = '';
        return;
    }

    var iconos = { ok: '&#9989;', atencion: '&#9888;&#65039;', critica: '&#10060;' };

    var html = alertasPredictivas.map(function(a) {
        var icono = iconos[a.tipo] || '';
        var accionHtml = a.accion ? '<div class="alerta-accion">' + a.accion + '</div>' : '';
        return '<div class="alerta-predictiva alerta-' + a.tipo + '">' +
            '<div class="alerta-icono">' + icono + '</div>' +
            '<div class="alerta-texto">' +
                '<strong>' + a.titulo + '</strong>' +
                '<div>' + a.detalle + '</div>' +
                accionHtml +
            '</div></div>';
    }).join('');

    container.innerHTML = html;
}

// Balance hidrico (consumo de agua)
// Ref: NRC 2000 - Water Requirements of Beef Cattle
// Consumo base: 5-10% del peso vivo segun temperatura
var CONSUMO_AGUA_FACTOR = {
    // litros/kg peso vivo/dia segun temperatura media mensual
    // Temp < 10°C: ~0.04, 10-20°C: ~0.06, 20-30°C: ~0.08, >30°C: ~0.10
    // Aproximamos por estacion para zona pampeana
    verano: 0.08,    // ~25-30°C
    otono: 0.06,     // ~15-18°C
    invierno: 0.045, // ~8-12°C
    primavera: 0.065  // ~16-22°C
};

function calcularBalanceHidrico() {
    var container = document.getElementById('balanceHidrico');
    if (!container) return;

    var esc = getEscenarioActivo();
    if (!esc || esc.grupos.length === 0) {
        container.innerHTML = '';
        return;
    }

    var consumoMensual = Array(12).fill(0); // litros por mes

    esc.grupos.forEach(function(g) {
        var cat = CATEGORIAS[g.categoria];
        if (!cat.usaPasto) return;

        var entrada = new Date(g.fechaEntrada);
        var salida = new Date(g.fechaSalida);
        var mesActual = new Date(entrada.getFullYear(), entrada.getMonth(), 1);
        var mesFinal = new Date(salida.getFullYear(), salida.getMonth(), 1);

        while (mesActual <= mesFinal) {
            var mesIdx = mesActual.getMonth();
            var inicioMes = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1);
            var finMes = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0);

            var diaDesde = entrada > inicioMes ? entrada : inicioMes;
            var diaHasta = salida < finMes ? salida : finMes;
            var diasPresente = Math.max(0, Math.floor((diaHasta - diaDesde) / 86400000) + 1);

            if (diasPresente > 0) {
                var estacion = typeof getEstacion === 'function' ? getEstacion(mesIdx) : 'primavera';
                var factorAgua = CONSUMO_AGUA_FACTOR[estacion] || 0.06;

                var diasDesdeEntrada = Math.max(0, Math.floor((new Date(mesActual.getFullYear(), mesActual.getMonth(), 15) - entrada) / 86400000));
                var pesoPromedio = g.pesoInicial + g.ganancia * diasDesdeEntrada;

                var consumoDiarioAnimal = pesoPromedio * factorAgua; // litros/dia/animal
                if (g.categoria === 'vaca' && cat.consumoCria) {
                    var pesoCria = cat.pesoCria + g.ganancia * 0.3 * diasDesdeEntrada;
                    consumoDiarioAnimal += pesoCria * factorAgua * 0.5; // cria consume menos
                }

                consumoMensual[mesIdx] += consumoDiarioAnimal * diasPresente * g.cantidad;
            }

            mesActual.setMonth(mesActual.getMonth() + 1);
        }
    });

    var consumoAnual = consumoMensual.reduce(function(a, b) { return a + b; }, 0);
    if (consumoAnual === 0) {
        container.innerHTML = '';
        return;
    }

    // Calcular consumo maximo diario
    var maxMensual = Math.max.apply(null, consumoMensual);
    var mesMax = MESES_NOMBRES[consumoMensual.indexOf(maxMensual)];
    var totalCab = esc.grupos.reduce(function(s, g) { return s + g.cantidad; }, 0);
    var consumoMaxDiario = maxMensual / 30; // litros/dia total
    var consumoMaxPorCabeza = totalCab > 0 ? consumoMaxDiario / totalCab : 0;

    // Verificar aguadas (si hay potreros definidos)
    var sinAguada = typeof potreros !== 'undefined' ? potreros.filter(function(p) { return !p.aguada; }) : [];

    var html = '<h3>Balance Hidrico</h3>';
    html += '<div class="card-grid">';
    html += '<div class="card" data-tooltip="Consumo total de agua del rodeo en el ano"><div class="card-title">Consumo anual</div><div class="card-value">' + (consumoAnual / 1000).toFixed(0) + '</div><div class="card-unit">m3/ano</div></div>';
    html += '<div class="card" data-tooltip="Mes con mayor requerimiento de agua"><div class="card-title">Pico de consumo</div><div class="card-value">' + mesMax + '</div><div class="card-unit">' + (maxMensual / 1000).toFixed(1) + ' m3/mes</div></div>';
    html += '<div class="card" data-tooltip="Promedio diario por cabeza en el mes pico"><div class="card-title">Max por cabeza</div><div class="card-value">' + consumoMaxPorCabeza.toFixed(0) + '</div><div class="card-unit">litros/dia</div></div>';
    html += '</div>';

    // Tabla mensual
    html += '<div class="tabla-scroll"><table><thead><tr><th>Mes</th><th>Consumo (litros)</th><th>Consumo (m3)</th><th>Litros/dia total</th><th>Litros/cab/dia</th></tr></thead><tbody>';
    for (var m = 0; m < 12; m++) {
        if (consumoMensual[m] === 0) continue;
        var litrosDia = consumoMensual[m] / 30;
        var litrosCabDia = totalCab > 0 ? litrosDia / totalCab : 0;
        html += '<tr>';
        html += '<td>' + MESES_NOMBRES[m] + '</td>';
        html += '<td>' + formatNum(consumoMensual[m]) + '</td>';
        html += '<td>' + (consumoMensual[m] / 1000).toFixed(1) + '</td>';
        html += '<td>' + formatNum(litrosDia) + '</td>';
        html += '<td>' + litrosCabDia.toFixed(1) + '</td>';
        html += '</tr>';
    }
    html += '</tbody></table></div>';

    // Alertas
    if (sinAguada.length > 0) {
        html += '<div class="alert alert-warning"><strong>Potreros sin aguada:</strong> ' +
            sinAguada.map(function(p) { return p.nombre; }).join(', ') +
            '. Considerar provision de agua portatil.</div>';
    }
    if (consumoMaxPorCabeza > 60) {
        html += '<div class="alert alert-info"><strong>Alto consumo estival:</strong> En meses calurosos cada animal necesita ' +
            consumoMaxPorCabeza.toFixed(0) + ' litros/dia. Asegurar caudal de aguadas suficiente.</div>';
    }

    container.innerHTML = html;
}
