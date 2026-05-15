// ============================================
// BALANCE FORRAJERO PRO v6.0 - Economico
// (c) 2025-2026 Santiago Jose Insaurralde.
// Todos los derechos reservados.
// ============================================

function calcularEconomico() {
    if (!configuracionCampo) { alert('Primero calcula el balance.'); return; }
    var esc = getEscenarioActivo();
    if (!esc || esc.grupos.length === 0) { alert('Agrega lotes primero.'); return; }

    var superficie = configuracionCampo.superficie;
    var costoLabores = (parseFloat(document.getElementById('costoLabores').value) || 0) * superficie;
    var costosEstructura = (parseFloat(document.getElementById('costosEstructura').value) || 0) * superficie;
    var costoSuplemento = (parseFloat(document.getElementById('costoSuplemento').value) || 0) * (parseFloat(document.getElementById('kgSuplemento').value) || 0);
    var comisionVenta = (parseFloat(document.getElementById('comisionVenta').value) || 0) / 100;
    var costoFleteCab = parseFloat(document.getElementById('costoFlete').value) || 0;

    var inversionTotal = 0;
    var ingresoTotal = 0;
    var detalleGrupos = [];
    var totalCabezas = 0;

    esc.grupos.forEach(function(g) {
        var cat = CATEGORIAS[g.categoria];
        var dias = Math.floor((new Date(g.fechaSalida) - new Date(g.fechaEntrada)) / 86400000);
        var pesoFinal = g.pesoInicial + g.ganancia * dias;
        var kgCompra = g.pesoInicial * g.cantidad;
        var kgVenta = pesoFinal * g.cantidad;
        var kgProducidos = g.ganancia * dias * g.cantidad;

        // Produccion de terneros destete (se atribuye a la vaca)
        var kgTerneros = 0;
        var cantTerneros = 0, cantTerneras = 0;
        var infoDestete = '';
        var ingresoTerneros = 0;
        var trans = g.transicion || null;
        if (trans && trans.tipo === 'cria' && trans.fechaDestete && g.categoria === 'vaca') {
            cantTerneros = Math.round(g.cantidad * (trans.porcentajeDestete||85)/100 * (trans.porcentajeMachos||50)/100);
            cantTerneras = Math.round(g.cantidad * (trans.porcentajeDestete||85)/100 * (1-(trans.porcentajeMachos||50)/100));
            // Peso real al destete = peso nacimiento + ganancia * dias de lactancia
            var diasLactancia = Math.floor((new Date(trans.fechaDestete) - new Date(trans.fechaParto)) / 86400000);
            var pesoDesteteMachos = (cat.pesoCria || 80) + 0.6 * Math.max(0, diasLactancia);
            var pesoDesteteHembras = pesoDesteteMachos - 10;
            kgTerneros = cantTerneros * pesoDesteteMachos + cantTerneras * pesoDesteteHembras;
            kgProducidos += kgTerneros;

            var destinoDestete = trans.destinoDestete || 'vender';
            if (destinoDestete === 'vender') {
                var precioTernero = trans.precioTernero || g.costos.venta;
                ingresoTerneros = kgTerneros * precioTernero;
                infoDestete = ' (Venta: ' + (cantTerneros + cantTerneras) + ' terneros, ' + formatNum(kgTerneros) + ' kg a $' + formatNum(precioTernero) + '/kg)';
            } else {
                infoDestete = ' (Retiene: ' + (cantTerneros + cantTerneras) + ' terneros, ' + formatNum(kgTerneros) + ' kg)';
            }
        }

        var costoCompra = kgCompra * g.costos.compra;
        var costoSanidad = g.costos.sanidad * g.cantidad;
        var costoFlete = costoFleteCab * g.cantidad;
        // Ingreso: vaca a su precio + terneros a precio ternero (si se venden)
        var ingresoBruto = kgVenta * g.costos.venta + ingresoTerneros;
        var costoComision = ingresoBruto * comisionVenta;

        var ingresoNeto = ingresoBruto - costoComision;
        var margen = ingresoNeto - costoCompra - costoSanidad - costoFlete;

        inversionTotal += costoCompra + costoSanidad;
        ingresoTotal += ingresoBruto;
        totalCabezas += g.cantidad;

        detalleGrupos.push({
            nombre: cat.nombre, cantidad: g.cantidad, kgCompra: kgCompra, kgVenta: kgVenta,
            kgProducidos: kgProducidos, costoCompra: costoCompra, costoSanidad: costoSanidad,
            costoFlete: costoFlete, costoComision: costoComision, ingresoBruto: ingresoBruto,
            ingresoNeto: ingresoNeto, margen: margen, dias: dias, pesoFinal: pesoFinal,
            infoDestete: infoDestete, ingresoTerneros: ingresoTerneros
        });
    });

    var ingresoBrutoTotal = ingresoTotal;
    var totalCostosCompra = detalleGrupos.reduce(function(s,d) { return s + d.costoCompra; }, 0);
    var totalCostosSanidad = detalleGrupos.reduce(function(s,d) { return s + d.costoSanidad; }, 0);
    var totalComision = detalleGrupos.reduce(function(s,d) { return s + d.costoComision; }, 0);
    var totalFlete = detalleGrupos.reduce(function(s,d) { return s + d.costoFlete; }, 0);

    var gastosGenerales = costoLabores + costosEstructura + costoSuplemento;
    var margenBrutoCalc = ingresoBrutoTotal - totalCostosCompra - totalCostosSanidad - totalComision - totalFlete;
    var margenNeto = margenBrutoCalc - gastosGenerales;

    var ecoCards = [
        { id: 'inversionTotal', val: totalCostosCompra + totalCostosSanidad },
        { id: 'ingresoTotal', val: ingresoBrutoTotal },
        { id: 'costosDirectosTotal', val: totalCostosCompra + totalCostosSanidad + totalComision + totalFlete },
        { id: 'margenBrutoTotal', val: margenBrutoCalc, color: true },
        { id: 'margenBrutoHa', val: margenBrutoCalc / superficie, color: true },
        { id: 'margenNetoTotal', val: margenNeto, color: true }
    ];
    ecoCards.forEach(function(c) {
        var el = document.getElementById(c.id);
        if (!el) return;
        el.textContent = formatMoneyCompact(c.val);
        el.title = formatMoney(c.val);
        if (c.color) el.style.color = c.val >= 0 ? '#27ae60' : '#e74c3c';
    });

    // Tabla detalle por grupo
    var htmlDetalle = '<table><thead><tr><th>Grupo</th><th>Cab</th><th>Dias</th><th>Peso Final</th><th>Kg Producidos</th><th>Ingreso</th><th>Costos</th><th>Margen</th></tr></thead><tbody>';
    detalleGrupos.forEach(function(d) {
        htmlDetalle += '<tr>';
        htmlDetalle += '<td>' + d.nombre + '</td>';
        htmlDetalle += '<td>' + d.cantidad + '</td>';
        htmlDetalle += '<td>' + d.dias + '</td>';
        htmlDetalle += '<td>' + d.pesoFinal.toFixed(0) + ' kg</td>';
        htmlDetalle += '<td>' + formatNum(d.kgProducidos) + (d.infoDestete || '') + '</td>';
        htmlDetalle += '<td>' + formatMoney(d.ingresoBruto) + '</td>';
        htmlDetalle += '<td>' + formatMoney(d.costoCompra + d.costoSanidad + d.costoFlete + d.costoComision) + '</td>';
        htmlDetalle += '<td style="color:' + (d.margen >= 0 ? '#27ae60' : '#e74c3c') + ';font-weight:700;">' + formatMoney(d.margen) + '</td>';
        htmlDetalle += '</tr>';
    });
    htmlDetalle += '</tbody></table>';
    document.getElementById('tablaDetalleEconomico').innerHTML = htmlDetalle;

    // Tabla composicion de costos
    var todosLosCostos = [
        { concepto: 'Compra de hacienda', monto: totalCostosCompra },
        { concepto: 'Sanidad', monto: totalCostosSanidad },
        { concepto: 'Comision de venta', monto: totalComision },
        { concepto: 'Flete', monto: totalFlete },
        { concepto: 'Labores', monto: costoLabores },
        { concepto: 'Estructura', monto: costosEstructura },
        { concepto: 'Suplementacion', monto: costoSuplemento }
    ];
    var costoTotalGeneral = todosLosCostos.reduce(function(s,c) { return s + c.monto; }, 0);

    var htmlCostos = '<table><thead><tr><th>Concepto</th><th>Monto</th><th>% del Total</th></tr></thead><tbody>';
    todosLosCostos.forEach(function(c) {
        if (c.monto > 0) {
            htmlCostos += '<tr><td>' + c.concepto + '</td><td>' + formatMoney(c.monto) + '</td><td>' + (c.monto / costoTotalGeneral * 100).toFixed(1) + '%</td></tr>';
        }
    });
    htmlCostos += '<tr class="fila-total"><td>TOTAL</td><td>' + formatMoney(costoTotalGeneral) + '</td><td>100%</td></tr>';
    htmlCostos += '</tbody></table>';
    document.getElementById('tablaComposicionCostos').innerHTML = htmlCostos;

    // Tabla de sensibilidad de precios
    var variaciones = [-20, -10, 0, 10, 20];
    var totalKgCompra = detalleGrupos.reduce(function(s,d) { return s + d.kgCompra; }, 0);
    var totalKgVenta = detalleGrupos.reduce(function(s,d) { return s + d.kgVenta; }, 0);
    var costosFijos = totalCostosSanidad + totalFlete + gastosGenerales;

    var htmlSens = '<table><thead><tr><th>Precio venta \\ Precio compra</th>';
    variaciones.forEach(function(vc) {
        htmlSens += '<th>Compra ' + (vc >= 0 ? '+' : '') + vc + '%</th>';
    });
    htmlSens += '</tr></thead><tbody>';

    variaciones.forEach(function(vv) {
        htmlSens += '<tr><td style="font-weight:600;">Venta ' + (vv >= 0 ? '+' : '') + vv + '%</td>';
        variaciones.forEach(function(vc) {
            var precioCompraAdj = 1 + vc / 100;
            var precioVentaAdj = 1 + vv / 100;
            var ingAdj = 0; var costoCompraAdj = 0;
            detalleGrupos.forEach(function(d) {
                ingAdj += d.ingresoBruto * precioVentaAdj;
                costoCompraAdj += d.costoCompra * precioCompraAdj;
            });
            var comisionAdj = ingAdj * comisionVenta;
            var margenAdj = ingAdj - costoCompraAdj - comisionAdj - costosFijos;
            var esBase = (vc === 0 && vv === 0);
            var bg = esBase ? 'background:#f0f4ff;font-weight:700;' : '';
            var color = margenAdj >= 0 ? '#27ae60' : '#e74c3c';
            htmlSens += '<td style="' + bg + 'color:' + color + ';">' + formatMoneyCompact(margenAdj) + '</td>';
        });
        htmlSens += '</tr>';
    });
    htmlSens += '</tbody></table>';
    document.getElementById('tablaSensibilidad').innerHTML = htmlSens;

    document.getElementById('resultadosEconomico').style.display = 'block';
    document.getElementById('resultadosEconomico').scrollIntoView({ behavior: 'smooth' });
}

// Valores de referencia orientativos (mercado argentino, actualizar periodicamente)
var VALORES_REFERENCIA = {
    costoLabores: 45000,       // $/ha/ano - siembra, fertilizacion, pulverizacion
    costosEstructura: 30000,   // $/ha/ano - personal, impuestos, mantenimiento
    costoSuplemento: 200,      // $/kg - maiz, sorgo, etc.
    kgSuplemento: 0,           // kg/ano - depende del sistema
    comisionVenta: 4,          // %
    costoFlete: 15000,         // $/cabeza
    precioCompra: {            // $/kg vivo por categoria
        ternero: 2200, ternera: 2000, novillito: 1800, novillo: 1600,
        vaquillona: 1500, vaca: 900, toro: 800
    },
    precioVenta: {
        ternero: 2400, ternera: 2200, novillito: 2000, novillo: 1800,
        vaquillona: 1700, vaca: 1000, toro: 900
    },
    sanidad: {
        ternero: 8000, ternera: 8000, novillito: 6000, novillo: 5000,
        vaquillona: 6000, vaca: 7000, toro: 5000
    }
};

function cargarValoresReferencia() {
    // Campos del modulo economico
    document.getElementById('costoLabores').value = VALORES_REFERENCIA.costoLabores;
    document.getElementById('costosEstructura').value = VALORES_REFERENCIA.costosEstructura;
    document.getElementById('costoSuplemento').value = VALORES_REFERENCIA.costoSuplemento;
    document.getElementById('kgSuplemento').value = VALORES_REFERENCIA.kgSuplemento;
    document.getElementById('comisionVenta').value = VALORES_REFERENCIA.comisionVenta;
    document.getElementById('costoFlete').value = VALORES_REFERENCIA.costoFlete;

    // Actualizar precios de compra/venta/sanidad en cada grupo del escenario activo
    var esc = getEscenarioActivo();
    if (esc && esc.grupos.length > 0) {
        esc.grupos.forEach(function(g) {
            var cat = g.categoria;
            if (VALORES_REFERENCIA.precioCompra[cat]) g.costos.compra = VALORES_REFERENCIA.precioCompra[cat];
            if (VALORES_REFERENCIA.precioVenta[cat]) g.costos.venta = VALORES_REFERENCIA.precioVenta[cat];
            if (VALORES_REFERENCIA.sanidad[cat]) g.costos.sanidad = VALORES_REFERENCIA.sanidad[cat];
        });
        actualizarVistaEscenarios();
    }

    // Feedback visual
    var btn = event.target;
    var textoOriginal = btn.textContent;
    btn.textContent = 'Valores cargados!';
    btn.style.background = '#27ae60';
    btn.style.color = '#fff';
    setTimeout(function() {
        btn.textContent = textoOriginal;
        btn.style.background = '';
        btn.style.color = '';
    }, 2000);
}
