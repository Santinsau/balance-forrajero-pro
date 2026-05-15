// ============================================
// BALANCE FORRAJERO PRO v6.0 - Comparador
// (c) 2025-2026 Santiago Jose Insaurralde.
// Todos los derechos reservados.
// ============================================

function compararEscenarios() {
    if (escenarios.length < 2) {
        alert('Necesitas al menos 2 escenarios para comparar.');
        return;
    }
    if (!configuracionCampo) {
        alert('Primero calcula el balance forrajero.');
        return;
    }

    var eficiencia = MODELO_CONFIG.eficienciaPastoreo[configuracionCampo.manejo];
    var ofertaMensual = configuracionCampo.produccionMensualTotal;
    var mesInicio = parseInt(document.getElementById('mesInicioSelect').value);
    var stockInicial = parseFloat(document.getElementById('stockInicialInput').value) || 0;

    var comparacion = [];

    escenarios.forEach(function(esc) {
        var demanda = Array(12).fill(0);
        var totalCabezas = 0;
        var kgProducidos = 0;

        esc.grupos.forEach(function(g) {
            var cat = CATEGORIAS[g.categoria];
            if (!cat.usaPasto) return;
            totalCabezas += g.cantidad;

            var entrada = new Date(g.fechaEntrada);
            var salida = new Date(g.fechaSalida);
            var dias = Math.floor((salida - entrada) / 86400000);
            kgProducidos += g.ganancia * dias * g.cantidad;

            // Iterar mes a mes desde entrada hasta salida (puede cruzar anos)
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
                    var diasDesde = Math.max(0, Math.floor((new Date(mesActual.getFullYear(), mesActual.getMonth(), 15) - entrada) / 86400000));
                    var peso = g.pesoInicial + g.ganancia * diasDesde;
                    var consumo = peso * cat.consumo;
                    if (g.categoria === 'vaca' && cat.consumoCria) {
                        consumo += (cat.pesoCria + g.ganancia * 0.3 * diasDesde) * cat.consumoCria;
                    }
                    demanda[mesIdx] += consumo * diasPresente * g.cantidad;
                }

                mesActual.setMonth(mesActual.getMonth() + 1);
            }
        });

        var demandaTotal = demanda.reduce(function(a,b) { return a + b; }, 0);
        var ofertaTotal = ofertaMensual.reduce(function(a,b) { return a + b; }, 0) * eficiencia;

        var diferido = stockInicial;
        var mesesDeficit = 0;
        for (var i = 0; i < 12; i++) {
            var mes = (mesInicio + i) % 12;
            diferido = diferido * (1 - MODELO_CONFIG.perdidaDiferido);
            var disp = ofertaMensual[mes] * eficiencia + diferido;
            var bal = disp - demanda[mes];
            if (bal < 0) mesesDeficit++;
            diferido = bal > 0 ? bal : 0;
        }

        comparacion.push({
            nombre: esc.nombre,
            cabezas: totalCabezas,
            demandaTotal: demandaTotal,
            kgProducidos: kgProducidos,
            tasaUso: (demandaTotal / ofertaTotal * 100),
            mesesDeficit: mesesDeficit,
            cargaReal: demandaTotal / MODELO_CONFIG.consumoAnualEV / configuracionCampo.superficie
        });
    });

    var html = '<table><thead><tr><th>Escenario</th><th>Cabezas</th><th>Demanda (kg MS)</th><th>Kg Producidos</th><th>Tasa Uso</th><th>Carga (EV/ha)</th><th>Meses Deficit</th></tr></thead><tbody>';
    comparacion.forEach(function(c) {
        html += '<tr>';
        html += '<td><strong>' + c.nombre + '</strong></td>';
        html += '<td>' + c.cabezas + '</td>';
        html += '<td>' + formatNum(c.demandaTotal) + '</td>';
        html += '<td>' + formatNum(c.kgProducidos) + '</td>';
        html += '<td style="color:' + (c.tasaUso > 100 ? '#e74c3c' : c.tasaUso > 85 ? '#f39c12' : '#27ae60') + '">' + c.tasaUso.toFixed(1) + '%</td>';
        html += '<td>' + c.cargaReal.toFixed(2) + '</td>';
        html += '<td style="color:' + (c.mesesDeficit > 0 ? '#e74c3c' : '#27ae60') + '">' + c.mesesDeficit + '</td>';
        html += '</tr>';
    });
    html += '</tbody></table>';
    document.getElementById('comparadorContainer').innerHTML = html;

    if (chartComparador) chartComparador.destroy();
    var ctx = document.getElementById('chartComparador');

    chartComparador = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: comparacion.map(function(c) { return c.nombre; }),
            datasets: [
                { label: 'Demanda (miles kg MS)', data: comparacion.map(function(c) { return c.demandaTotal / 1000; }), backgroundColor: '#e74c3c80' },
                { label: 'Kg Producidos (miles)', data: comparacion.map(function(c) { return c.kgProducidos / 1000; }), backgroundColor: '#2ecc7180' }
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
