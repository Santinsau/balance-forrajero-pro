// ============================================
// BALANCE FORRAJERO PRO v6.0 - Economico
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

        var costoCompra = kgCompra * g.costos.compra;
        var costoSanidad = g.costos.sanidad * g.cantidad;
        var costoFlete = costoFleteCab * g.cantidad;
        var ingresoBruto = kgVenta * g.costos.venta;
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
            ingresoNeto: ingresoNeto, margen: margen, dias: dias, pesoFinal: pesoFinal
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
        htmlDetalle += '<td>' + formatNum(d.kgProducidos) + '</td>';
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

    document.getElementById('resultadosEconomico').style.display = 'block';
    document.getElementById('resultadosEconomico').scrollIntoView({ behavior: 'smooth' });
}
