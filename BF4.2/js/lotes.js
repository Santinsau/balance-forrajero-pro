// ============================================
// BALANCE FORRAJERO PRO v6.0 - Lotes / Escenarios
// (c) 2025-2026 Santiago Jose Insaurralde.
// Todos los derechos reservados.
// ============================================

function crearEscenario(nombre) {
    var esc = { id: nextId++, nombre: nombre, grupos: [] };
    escenarios.push(esc);
    escenarioActivoId = esc.id;
    actualizarSelectEscenarios();
    actualizarVistaEscenarios();
    return esc;
}

function getEscenarioActivo() {
    return escenarios.find(function(e) { return e.id === escenarioActivoId; }) || null;
}

function nuevoEscenario() {
    var nombre = prompt('Nombre del nuevo escenario:', 'Escenario ' + (escenarios.length + 1));
    if (nombre) crearEscenario(nombre);
}

function duplicarEscenarioActivo() {
    var esc = getEscenarioActivo();
    if (!esc) return;
    var nuevo = {
        id: nextId++,
        nombre: esc.nombre + ' (copia)',
        grupos: esc.grupos.map(function(g) { return Object.assign({}, g, { id: nextId++, costos: Object.assign({}, g.costos), transicion: g.transicion ? Object.assign({}, g.transicion) : null }); })
    };
    escenarios.push(nuevo);
    escenarioActivoId = nuevo.id;
    actualizarSelectEscenarios();
    actualizarVistaEscenarios();
}

function eliminarEscenarioActivo() {
    if (escenarios.length <= 1) { alert('Debe haber al menos un escenario.'); return; }
    if (!confirm('Eliminar este escenario?')) return;
    escenarios = escenarios.filter(function(e) { return e.id !== escenarioActivoId; });
    escenarioActivoId = escenarios[0].id;
    actualizarSelectEscenarios();
    actualizarVistaEscenarios();
}

function cambiarEscenarioActivo() {
    escenarioActivoId = parseInt(document.getElementById('escenarioActivoSelect').value);
    actualizarVistaEscenarios();
}

function actualizarSelectEscenarios() {
    var select = document.getElementById('escenarioActivoSelect');
    if (!select) return;
    select.innerHTML = escenarios.map(function(e) {
        return '<option value="' + e.id + '"' + (e.id === escenarioActivoId ? ' selected' : '') + '>' + e.nombre + '</option>';
    }).join('');
}

function ajustarPesosDefecto() {
    var cat = document.getElementById('grupoCategoria').value;
    var info = CATEGORIAS[cat];
    if (info) {
        document.getElementById('grupoPesoInicial').value = info.pesoDefecto;
        document.getElementById('grupoGanancia').value = info.gananciaDefecto;
    }
    // Mostrar/ocultar ciclo productivo
    var acordeonCiclo = document.getElementById('acordeonCiclo');
    var cicloVaca = document.getElementById('cicloVaca');
    var cicloRecria = document.getElementById('cicloRecria');
    if (!acordeonCiclo) return;
    if (cat === 'vaca') {
        acordeonCiclo.style.display = ''; cicloVaca.style.display = ''; cicloRecria.style.display = 'none';
    } else if (cat === 'ternero' || cat === 'ternera') {
        acordeonCiclo.style.display = ''; cicloVaca.style.display = 'none'; cicloRecria.style.display = '';
        var destino = CATEGORIAS[cat].transicionDefecto;
        document.getElementById('cicloRecriaDestino').textContent = CATEGORIAS[destino].nombre;
        document.getElementById('cicloPesoTransicion').value = CATEGORIAS[cat].pesoTransicion;
    } else {
        acordeonCiclo.style.display = 'none'; cicloVaca.style.display = 'none'; cicloRecria.style.display = 'none';
    }
    // Reset checkboxes
    var criaCheck = document.getElementById('cicloCriaCheck');
    var recriaCheck = document.getElementById('cicloRecriaCheck');
    if (criaCheck) { criaCheck.checked = false; toggleCicloCria(); }
    if (recriaCheck) { recriaCheck.checked = false; toggleCicloRecria(); }
}

function toggleCicloCria() {
    var f = document.getElementById('cicloCriaFields');
    if (f) f.style.display = document.getElementById('cicloCriaCheck').checked ? '' : 'none';
}
function toggleCicloRecria() {
    var f = document.getElementById('cicloRecriaFields');
    if (f) f.style.display = document.getElementById('cicloRecriaCheck').checked ? '' : 'none';
}
function toggleCriterioRecria() {
    var criterio = document.querySelector('input[name="criterioRecria"]:checked').value;
    document.getElementById('wrapPesoRecria').style.display = criterio === 'peso' ? '' : 'none';
    document.getElementById('wrapFechaRecria').style.display = criterio === 'fecha' ? '' : 'none';
}
function toggleDestinoDestete() {
    var destino = document.querySelector('input[name="destinoDestete"]:checked');
    var wrap = document.getElementById('wrapPrecioTernero');
    if (wrap && destino) wrap.style.display = destino.value === 'vender' ? '' : 'none';
}

function toggleCriterioSalida() {
    var criterio = document.querySelector('input[name="criterioSalida"]:checked').value;
    document.getElementById('wrapFechaSalida').style.display = criterio === 'fecha' ? '' : 'none';
    document.getElementById('wrapPesoObjetivo').style.display = criterio === 'peso' ? '' : 'none';
}

function agregarGrupo() {
    var esc = getEscenarioActivo();
    if (!esc) { alert('Selecciona un escenario.'); return; }

    var camposValidar = ['grupoCantidad', 'grupoPesoInicial', 'grupoGanancia', 'grupoFechaEntrada', 'grupoFechaSalida', 'grupoPesoObjetivo'];
    if (typeof limpiarErrores === 'function') limpiarErrores(camposValidar);

    var categoria = document.getElementById('grupoCategoria').value;
    var cantidad = parseInt(document.getElementById('grupoCantidad').value);
    var pesoInicial = parseFloat(document.getElementById('grupoPesoInicial').value);
    var ganancia = parseFloat(document.getElementById('grupoGanancia').value);
    var fechaEntrada = document.getElementById('grupoFechaEntrada').value;
    var criterio = document.querySelector('input[name="criterioSalida"]:checked').value;

    // Modo ganancia calculada
    var modoGanancia = 'manual';
    var toggleCalc = document.querySelector('input[name="modoGanancia"]:checked');
    if (toggleCalc) modoGanancia = toggleCalc.value;

    var hayError = false;
    if (!cantidad || cantidad <= 0) {
        if (typeof mostrarError === 'function') mostrarError('grupoCantidad', 'Ingresa la cantidad');
        hayError = true;
    }
    if (!pesoInicial || pesoInicial <= 0) {
        if (typeof mostrarError === 'function') mostrarError('grupoPesoInicial', 'Ingresa el peso');
        hayError = true;
    }
    if (!fechaEntrada) {
        if (typeof mostrarError === 'function') mostrarError('grupoFechaEntrada', 'Ingresa fecha de entrada');
        hayError = true;
    }
    if (hayError) return;

    var fechaSalida, pesoObjetivo = null;

    if (criterio === 'peso') {
        pesoObjetivo = parseFloat(document.getElementById('grupoPesoObjetivo').value);
        if (!pesoObjetivo || pesoObjetivo <= pesoInicial) {
            if (typeof mostrarError === 'function') mostrarError('grupoPesoObjetivo', 'Debe ser mayor al peso inicial');
            return;
        }
        if (!ganancia || ganancia <= 0) {
            if (typeof mostrarError === 'function') mostrarError('grupoGanancia', 'Debe ser mayor a 0');
            return;
        }
        var dias = Math.ceil((pesoObjetivo - pesoInicial) / ganancia);
        var entrada = new Date(fechaEntrada);
        var salida = new Date(entrada.getTime() + dias * 86400000);
        fechaSalida = salida.toISOString().split('T')[0];
    } else {
        fechaSalida = document.getElementById('grupoFechaSalida').value;
        if (!fechaSalida) {
            if (typeof mostrarError === 'function') mostrarError('grupoFechaSalida', 'Ingresa fecha de salida');
            return;
        }
        if (new Date(fechaSalida) <= new Date(fechaEntrada)) {
            if (typeof mostrarError === 'function') mostrarError('grupoFechaSalida', 'Debe ser posterior a la entrada');
            return;
        }
    }

    var costos = {
        compra: parseFloat(document.getElementById('grupoPrecioCompra').value) || 0,
        venta: parseFloat(document.getElementById('grupoPrecioVenta').value) || 0,
        sanidad: parseFloat(document.getElementById('grupoSanidad').value) || 0
    };

    // Leer transicion
    var transicion = null;
    if (categoria === 'vaca' && document.getElementById('cicloCriaCheck') && document.getElementById('cicloCriaCheck').checked) {
        var destinoEl = document.querySelector('input[name="destinoDestete"]:checked');
        var destino = destinoEl ? destinoEl.value : 'vender';
        transicion = {
            tipo: 'cria',
            fechaParto: document.getElementById('cicloFechaParto').value,
            fechaDestete: document.getElementById('cicloFechaDestete').value,
            porcentajeDestete: parseFloat(document.getElementById('cicloDestete').value) || 85,
            porcentajeMachos: parseFloat(document.getElementById('cicloMachos').value) || 50,
            destinoDestete: destino,
            precioTernero: destino === 'vender' ? (parseFloat(document.getElementById('cicloPrecioTernero').value) || 0) : 0
        };
    } else if ((categoria === 'ternero' || categoria === 'ternera') && document.getElementById('cicloRecriaCheck') && document.getElementById('cicloRecriaCheck').checked) {
        var critRecria = document.querySelector('input[name="criterioRecria"]:checked').value;
        transicion = {
            tipo: 'recria',
            criterioTransicion: critRecria,
            nuevaCategoria: CATEGORIAS[categoria].transicionDefecto,
            pesoTransicion: critRecria === 'peso' ? (parseFloat(document.getElementById('cicloPesoTransicion').value) || CATEGORIAS[categoria].pesoTransicion) : null,
            fechaTransicion: critRecria === 'fecha' ? document.getElementById('cicloFechaTransicion').value : null
        };
    }

    var grupoData = {
        categoria: categoria, cantidad: cantidad, pesoInicial: pesoInicial, ganancia: ganancia,
        criterioSalida: criterio, fechaEntrada: fechaEntrada, fechaSalida: fechaSalida,
        pesoObjetivo: pesoObjetivo, costos: costos, modoGanancia: modoGanancia, transicion: transicion
    };

    if (grupoEditandoId !== null) {
        var grupo = esc.grupos.find(function(g) { return g.id === grupoEditandoId; });
        if (grupo) Object.assign(grupo, grupoData);
        grupoEditandoId = null;
        document.getElementById('btnAgregarGrupo').textContent = 'Agregar al escenario';
        document.getElementById('btnCancelarEdicion').style.display = 'none';
    } else {
        grupoData.id = nextId++;
        esc.grupos.push(grupoData);
    }

    actualizarVistaEscenarios();
    limpiarFormGrupo();
}

function editarGrupo(escId, grupoId) {
    var esc = escenarios.find(function(e) { return e.id === escId; });
    if (!esc) return;
    var g = esc.grupos.find(function(gr) { return gr.id === grupoId; });
    if (!g) return;

    escenarioActivoId = escId;
    actualizarSelectEscenarios();

    document.getElementById('grupoCategoria').value = g.categoria;
    document.getElementById('grupoCantidad').value = g.cantidad;
    document.getElementById('grupoPesoInicial').value = g.pesoInicial;
    document.getElementById('grupoGanancia').value = g.ganancia;
    document.getElementById('grupoFechaEntrada').value = g.fechaEntrada;

    var criterio = g.criterioSalida || 'fecha';
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

    // Restaurar transicion
    ajustarPesosDefecto(); // muestra/oculta acordeon segun categoria
    // Restaurar peso/ganancia (ajustarPesosDefecto los sobreescribe con defaults)
    document.getElementById('grupoPesoInicial').value = g.pesoInicial;
    document.getElementById('grupoGanancia').value = g.ganancia;
    if (g.transicion && g.transicion.tipo === 'cria') {
        document.getElementById('cicloCriaCheck').checked = true; toggleCicloCria();
        document.getElementById('cicloFechaParto').value = g.transicion.fechaParto || '';
        document.getElementById('cicloFechaDestete').value = g.transicion.fechaDestete || '';
        document.getElementById('cicloDestete').value = g.transicion.porcentajeDestete || 85;
        document.getElementById('cicloMachos').value = g.transicion.porcentajeMachos || 50;
        var destino = g.transicion.destinoDestete || 'vender';
        var radioDestino = document.querySelector('input[name="destinoDestete"][value="' + destino + '"]');
        if (radioDestino) radioDestino.checked = true;
        toggleDestinoDestete();
        if (destino === 'vender') document.getElementById('cicloPrecioTernero').value = g.transicion.precioTernero || 2200;
    } else if (g.transicion && g.transicion.tipo === 'recria') {
        document.getElementById('cicloRecriaCheck').checked = true; toggleCicloRecria();
        var crit = g.transicion.criterioTransicion || 'peso';
        document.querySelector('input[name="criterioRecria"][value="' + crit + '"]').checked = true;
        toggleCriterioRecria();
        if (crit === 'peso') document.getElementById('cicloPesoTransicion').value = g.transicion.pesoTransicion || 280;
        else document.getElementById('cicloFechaTransicion').value = g.transicion.fechaTransicion || '';
    }

    grupoEditandoId = grupoId;
    document.getElementById('btnAgregarGrupo').textContent = 'Guardar cambios';
    document.getElementById('btnCancelarEdicion').style.display = '';
    document.getElementById('grupoCategoria').scrollIntoView({ behavior: 'smooth' });
}

function cancelarEdicion() {
    grupoEditandoId = null;
    document.getElementById('btnAgregarGrupo').textContent = 'Agregar al escenario';
    document.getElementById('btnCancelarEdicion').style.display = 'none';
    limpiarFormGrupo();
}

function duplicarGrupo(escId, grupoId) {
    var esc = escenarios.find(function(e) { return e.id === escId; });
    if (!esc) return;
    var g = esc.grupos.find(function(gr) { return gr.id === grupoId; });
    if (!g) return;
    var copia = Object.assign({}, g, { id: nextId++, costos: Object.assign({}, g.costos), transicion: g.transicion ? Object.assign({}, g.transicion) : null });
    esc.grupos.push(copia);
    actualizarVistaEscenarios();
}

function eliminarGrupo(escId, grupoId) {
    if (!confirm('Eliminar este grupo?')) return;
    var esc = escenarios.find(function(e) { return e.id === escId; });
    if (!esc) return;
    esc.grupos = esc.grupos.filter(function(g) { return g.id !== grupoId; });
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
    var container = document.getElementById('escenariosContainer');
    if (!container) return;

    if (escenarios.length === 0) {
        container.innerHTML = '<p style="color:#999;text-align:center;">No hay escenarios.</p>';
        return;
    }

    var html = '';
    escenarios.forEach(function(esc) {
        var esActivo = esc.id === escenarioActivoId;
        html += '<div class="escenario-card' + (esActivo ? ' activo' : '') + '">';
        html += '<div class="escenario-header">';
        html += '<span class="escenario-nombre">' + esc.nombre + (esActivo ? ' (activo)' : '') + '</span>';
        var totalCab = esc.grupos.reduce(function(s,g) { return s + g.cantidad; }, 0);
        html += '<span style="font-size:0.85em;color:#7f8c8d;">' + esc.grupos.length + ' grupos - ' + totalCab + ' cabezas</span>';
        html += '</div>';

        if (esc.grupos.length === 0) {
            html += '<p style="color:#aaa;font-size:0.9em;">Sin grupos cargados.</p>';
        } else {
            esc.grupos.forEach(function(g) {
                var cat = CATEGORIAS[g.categoria];
                var dias = Math.floor((new Date(g.fechaSalida) - new Date(g.fechaEntrada)) / 86400000);
                var pesoFinal = g.pesoInicial + g.ganancia * dias;
                var kgProd = g.ganancia * dias * g.cantidad;

                html += '<div class="grupo-item">';
                html += '<div class="grupo-info">';
                html += '<span><strong>' + cat.nombre + '</strong></span>';
                html += '<span>' + g.cantidad + ' cab</span>';
                html += '<span>' + g.pesoInicial + ' &rarr; ' + pesoFinal.toFixed(0) + ' kg</span>';
                html += '<span>' + g.ganancia + ' kg/dia</span>';
                html += '<span>' + dias + ' dias</span>';
                if (g.criterioSalida === 'peso') html += '<span>Obj: ' + g.pesoObjetivo + ' kg</span>';
                if (g.modoGanancia === 'calculada') html += '<span style="color:#3498db;font-weight:600;">Gan. calculada</span>';
                html += '<span>' + formatNum(kgProd) + ' kg prod</span>';
                // Mostrar info de transicion
                if (g.transicion && g.transicion.tipo === 'cria') {
                    var t = g.transicion;
                    var cantMachos = Math.round(g.cantidad * (t.porcentajeDestete||85)/100 * (t.porcentajeMachos||50)/100);
                    var cantHembras = Math.round(g.cantidad * (t.porcentajeDestete||85)/100 * (1-(t.porcentajeMachos||50)/100));
                    var fp = t.fechaParto ? t.fechaParto.substring(5) : '?';
                    var fd = t.fechaDestete ? t.fechaDestete.substring(5) : '?';
                    html += '</div><div style="width:100%;font-size:0.82em;color:#2980b9;padding:2px 0 0 10px;border-top:1px dashed #ddd;margin-top:4px;">';
                    var destinoTxt = (t.destinoDestete || 'vender') === 'vender' ? ' | Venta al destete' : ' | Retener en campo';
                    html += 'Cria: Parto ' + fp + ' &rarr; Destete ' + fd + ' | ' + (t.porcentajeDestete||85) + '% destete &rarr; ' + cantMachos + '&#9794; + ' + cantHembras + '&#9792;' + destinoTxt;
                } else if (g.transicion && g.transicion.tipo === 'recria') {
                    var t = g.transicion;
                    var destCat = CATEGORIAS[t.nuevaCategoria];
                    var info = '';
                    if (t.criterioTransicion === 'peso' && t.pesoTransicion) {
                        var diasTrans = g.ganancia > 0 ? Math.ceil((t.pesoTransicion - g.pesoInicial) / g.ganancia) : 0;
                        var fechaTrans = new Date(new Date(g.fechaEntrada).getTime() + diasTrans * 86400000);
                        info = '&rarr; ' + destCat.nombre + ' a ' + t.pesoTransicion + ' kg (' + fechaTrans.toISOString().substring(0,7) + ')';
                    } else {
                        info = '&rarr; ' + destCat.nombre + ' el ' + (t.fechaTransicion || '?');
                    }
                    html += '</div><div style="width:100%;font-size:0.82em;color:#8e44ad;padding:2px 0 0 10px;border-top:1px dashed #ddd;margin-top:4px;">';
                    html += 'Recria: ' + info;
                }
                html += '</div>';
                html += '<div class="grupo-acciones">';
                html += '<button class="btn-editar" onclick="editarGrupo(' + esc.id + ',' + g.id + ')">Editar</button>';
                html += '<button class="btn-duplicar" onclick="duplicarGrupo(' + esc.id + ',' + g.id + ')">Duplicar</button>';
                html += '<button class="btn-eliminar" onclick="eliminarGrupo(' + esc.id + ',' + g.id + ')">Eliminar</button>';
                html += '</div></div>';
            });
        }
        html += '</div>';
    });

    container.innerHTML = html;

    // Generar tabla de evolucion, composicion y gantt
    generarTablaEvolucion();
    generarGraficoComposicion();

    // Auto-guardar estado
    if (typeof guardarEstadoAuto === 'function') guardarEstadoAuto();
    if (typeof actualizarResumenEjecutivo === 'function') actualizarResumenEjecutivo();
}

// --- Tabla de evolucion mensual del rodeo ---
function generarTablaEvolucion() {
    var seccion = document.getElementById('seccionEvolucion');
    var container = document.getElementById('tablaEvolucionContainer');
    if (!seccion || !container) return;

    var esc = getEscenarioActivo();
    if (!esc || esc.grupos.length === 0) {
        seccion.style.display = 'none';
        return;
    }

    seccion.style.display = '';

    // Determinar rango de meses cubierto por todos los grupos
    var minDate = null, maxDate = null;
    esc.grupos.forEach(function(g) {
        var ent = new Date(g.fechaEntrada);
        var sal = new Date(g.fechaSalida);
        if (!minDate || ent < minDate) minDate = ent;
        if (!maxDate || sal > maxDate) maxDate = sal;
    });

    if (!minDate || !maxDate) { seccion.style.display = 'none'; return; }

    // Generar lista de meses (YYYY-MM)
    var meses = [];
    var cur = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    var fin = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
    while (cur <= fin) {
        meses.push({ year: cur.getFullYear(), month: cur.getMonth() });
        cur.setMonth(cur.getMonth() + 1);
    }

    if (meses.length === 0 || meses.length > 24) {
        container.innerHTML = meses.length > 24 ? '<p style="color:#999;">Periodo demasiado largo para mostrar tabla (>24 meses).</p>' : '';
        return;
    }

    // Cabecera
    var html = '<table><thead><tr><th>Grupo</th>';
    meses.forEach(function(m) {
        html += '<th>' + MESES_LABELS[m.month] + ' ' + (m.year % 100) + '</th>';
    });
    html += '</tr></thead><tbody>';

    // Fila de totales demanda
    var totalDemandaMes = {};
    meses.forEach(function(m) { totalDemandaMes[m.year + '-' + m.month] = 0; });

    esc.grupos.forEach(function(g, gIdx) {
        var cat = CATEGORIAS[g.categoria];
        var entrada = new Date(g.fechaEntrada);
        var salida = new Date(g.fechaSalida);
        var trans = g.transicion || null;

        // Pre-calcular fecha transicion recria
        var fechaTransRecria = null;
        if (trans && trans.tipo === 'recria' && (g.categoria === 'ternero' || g.categoria === 'ternera')) {
            if (trans.criterioTransicion === 'peso' && trans.pesoTransicion && g.ganancia > 0) {
                var diasHastaT = Math.ceil((trans.pesoTransicion - g.pesoInicial) / g.ganancia);
                fechaTransRecria = new Date(entrada.getTime() + diasHastaT * 86400000);
            } else if (trans.criterioTransicion === 'fecha' && trans.fechaTransicion) {
                fechaTransRecria = new Date(trans.fechaTransicion);
            }
        }

        var fechaParto = (trans && trans.tipo === 'cria') ? (trans.fechaParto ? new Date(trans.fechaParto) : null) : null;
        var fechaDestete = (trans && trans.tipo === 'cria') ? (trans.fechaDestete ? new Date(trans.fechaDestete) : null) : null;
        var cantTerneros = 0, cantTerneras = 0;
        if (trans && trans.tipo === 'cria' && fechaParto && fechaDestete) {
            cantTerneros = Math.round(g.cantidad * (trans.porcentajeDestete||85)/100 * (trans.porcentajeMachos||50)/100);
            cantTerneras = Math.round(g.cantidad * (trans.porcentajeDestete||85)/100 * (1-(trans.porcentajeMachos||50)/100));
        }

        html += '<tr><td style="white-space:nowrap;font-weight:600;">' + cat.nombre + ' (' + g.cantidad + ')</td>';

        meses.forEach(function(m) {
            var mesKey = m.year + '-' + m.month;
            var inicioMes = new Date(m.year, m.month, 1);
            var finMes = new Date(m.year, m.month + 1, 0);
            var diaDesde = entrada > inicioMes ? entrada : inicioMes;
            var diaHasta = salida < finMes ? salida : finMes;
            var diasPresente = Math.max(0, Math.floor((diaHasta - diaDesde) / 86400000) + 1);

            if (diasPresente <= 0) {
                html += '<td style="color:#ccc;text-align:center;">-</td>';
                return;
            }

            var mediados = new Date(m.year, m.month, 15);
            var diasDesdeEntrada = Math.max(0, Math.floor((mediados - entrada) / 86400000));
            var pesoActual = g.pesoInicial + g.ganancia * diasDesdeEntrada;

            // Determinar categoria actual (si hay transicion recria)
            var catActual = cat.nombre;
            var consumoCoef = cat.consumo;
            if (trans && trans.tipo === 'recria' && fechaTransRecria && mediados >= fechaTransRecria) {
                var catTrans = CATEGORIAS[trans.nuevaCategoria];
                if (catTrans) {
                    catActual = catTrans.nombre;
                    consumoCoef = catTrans.consumo;
                }
            }

            var consumoDiario = pesoActual * consumoCoef;

            // Estado de la vaca y cria al pie
            var infoEstado = '';
            if (trans && trans.tipo === 'cria' && fechaParto && fechaDestete) {
                if (mediados < fechaParto) {
                    infoEstado = '<br><span style="font-size:0.75em;color:#2980b9;font-weight:600;">Prenada</span>';
                } else if (mediados >= fechaParto && mediados < fechaDestete) {
                    var diasDesdeParto = Math.floor((mediados - fechaParto) / 86400000);
                    var pesoCria = (cat.pesoCria || 80) + 0.6 * diasDesdeParto;
                    consumoDiario += pesoCria * (cat.consumoCria || 0.015) * (trans.porcentajeDestete || 85) / 100;
                    infoEstado = '<br><span style="font-size:0.75em;color:#8e44ad;font-weight:600;">Con cria ' + Math.round(pesoCria) + 'kg</span>';
                } else {
                    infoEstado = '<br><span style="font-size:0.75em;color:#7f8c8d;">Vacia</span>';
                }
            }

            var demandaTotal = consumoDiario * diasPresente * g.cantidad;
            totalDemandaMes[mesKey] += demandaTotal;

            var cellHtml = '<strong>' + Math.round(pesoActual) + '</strong> kg';
            cellHtml += '<br><span style="font-size:0.8em;color:#666;">' + consumoDiario.toFixed(1) + ' kg MS/d</span>';
            if (catActual !== cat.nombre) {
                cellHtml += '<br><span style="font-size:0.75em;color:#2980b9;">' + catActual + '</span>';
            }
            cellHtml += infoEstado;
            if (diasPresente < 28) {
                cellHtml += '<br><span style="font-size:0.7em;color:#999;">' + diasPresente + 'd</span>';
            }

            html += '<td style="text-align:center;line-height:1.3;font-size:0.85em;">' + cellHtml + '</td>';
        });
        html += '</tr>';

        // --- Filas virtuales de terneros/terneras post-destete ---
        if (trans && trans.tipo === 'cria' && fechaDestete && (cantTerneros > 0 || cantTerneras > 0)) {
            var destinoDestete = trans.destinoDestete || 'vender';
            // Peso real al destete (nacimiento + crecimiento durante lactancia)
            var diasLactancia = Math.max(0, Math.floor((fechaDestete - fechaParto) / 86400000));
            var pesoRealDestete = (cat.pesoCria || 80) + 0.6 * diasLactancia;

            if (destinoDestete === 'vender') {
                // Fila informativa: terneros vendidos al destete
                html += '<tr style="background:#fff3e0;"><td style="white-space:nowrap;font-size:0.85em;padding-left:20px;color:#e67e22;">';
                html += '\u{1F4B0} Venta ' + (cantTerneros + cantTerneras) + ' terneros al destete';
                html += '<br><span style="font-size:0.8em;color:#999;">' + Math.round(pesoRealDestete) + ' kg prom. | Salen del campo</span></td>';
                meses.forEach(function(m) {
                    var mediados = new Date(m.year, m.month, 15);
                    var mesDestete = fechaDestete.getFullYear() + '-' + fechaDestete.getMonth();
                    var mesActual = m.year + '-' + m.month;
                    if (mesActual === mesDestete) {
                        html += '<td style="text-align:center;font-size:0.8em;color:#e67e22;font-weight:600;">VENTA<br>' + (cantTerneros + cantTerneras) + ' cab</td>';
                    } else {
                        html += '<td style="color:#ccc;text-align:center;">-</td>';
                    }
                });
                html += '</tr>';
            } else {
                // Retener: mostrar filas virtuales con demanda real
                var virtuales = [];
                if (cantTerneros > 0) virtuales.push({ cant: cantTerneros, cat: CATEGORIAS.ternero, label: 'Terneros', sexo: '\u2642', pesoBase: pesoRealDestete, ganancia: 0.55 });
                if (cantTerneras > 0) virtuales.push({ cant: cantTerneras, cat: CATEGORIAS.ternera, label: 'Terneras', sexo: '\u2640', pesoBase: pesoRealDestete - 10, ganancia: 0.50 });

                virtuales.forEach(function(v) {
                    html += '<tr style="background:#f0f4ff;"><td style="white-space:nowrap;font-size:0.85em;padding-left:20px;color:#8e44ad;">';
                    html += v.sexo + ' ' + v.label + ' (' + v.cant + ')';
                    html += '<br><span style="font-size:0.8em;color:#999;">retenidos - post destete</span></td>';

                    meses.forEach(function(m) {
                        var mesKey = m.year + '-' + m.month;
                        var mediados = new Date(m.year, m.month, 15);
                        var inicioMes = new Date(m.year, m.month, 1);
                        var finMes = new Date(m.year, m.month + 1, 0);

                        var diaDesde = fechaDestete > inicioMes ? fechaDestete : inicioMes;
                        var diaHasta = salida < finMes ? salida : finMes;
                        var diasPresente = Math.max(0, Math.floor((diaHasta - diaDesde) / 86400000) + 1);

                        if (diasPresente <= 0 || mediados < fechaDestete || mediados > salida) {
                            html += '<td style="color:#ccc;text-align:center;">-</td>';
                            return;
                        }

                        var diasDesdeDestete = Math.max(0, Math.floor((mediados - fechaDestete) / 86400000));
                        var pesoActual = v.pesoBase + v.ganancia * diasDesdeDestete;
                        var consumoDiario = pesoActual * v.cat.consumo;
                        var demanda = consumoDiario * diasPresente * v.cant;
                        totalDemandaMes[mesKey] += demanda;

                        var cellHtml = '<strong>' + Math.round(pesoActual) + '</strong> kg';
                        cellHtml += '<br><span style="font-size:0.8em;color:#666;">' + consumoDiario.toFixed(1) + ' kg MS/d</span>';
                        if (diasPresente < 28) {
                            cellHtml += '<br><span style="font-size:0.7em;color:#999;">' + diasPresente + 'd</span>';
                        }
                        html += '<td style="text-align:center;line-height:1.3;font-size:0.85em;">' + cellHtml + '</td>';
                    });
                    html += '</tr>';
                });
            }
        }
    });

    // Fila totales
    html += '<tr class="fila-total"><td style="font-weight:700;">Demanda total (kg MS)</td>';
    meses.forEach(function(m) {
        var mesKey = m.year + '-' + m.month;
        var val = totalDemandaMes[mesKey];
        html += '<td style="text-align:center;font-weight:700;">' + formatNum(Math.round(val)) + '</td>';
    });
    html += '</tr>';

    html += '</tbody></table>';
    container.innerHTML = html;
}

// --- Grafico composicion del rodeo (dona) ---
function generarGraficoComposicion() {
    var seccion = document.getElementById('seccionComposicion');
    var ctx = document.getElementById('chartComposicion');
    var detalle = document.getElementById('composicionDetalle');
    if (!seccion || !ctx) return;

    var esc = getEscenarioActivo();
    if (!esc || esc.grupos.length === 0) { seccion.style.display = 'none'; return; }

    seccion.style.display = '';

    // Agrupar por categoria (incluye virtuales de cria)
    var porCategoria = {};
    var totalCab = 0;
    esc.grupos.forEach(function(g) {
        var cat = CATEGORIAS[g.categoria];
        var nombre = cat ? cat.nombre : g.categoria;
        porCategoria[nombre] = (porCategoria[nombre] || 0) + g.cantidad;
        totalCab += g.cantidad;

        // Agregar terneros/terneras virtuales de cria (solo si se retienen)
        var trans = g.transicion || null;
        if (trans && trans.tipo === 'cria' && trans.fechaDestete && g.categoria === 'vaca' && (trans.destinoDestete || 'vender') === 'retener') {
            var cantT = Math.round(g.cantidad * (trans.porcentajeDestete||85)/100 * (trans.porcentajeMachos||50)/100);
            var cantH = Math.round(g.cantidad * (trans.porcentajeDestete||85)/100 * (1-(trans.porcentajeMachos||50)/100));
            if (cantT > 0) {
                var nomT = CATEGORIAS.ternero.nombre + ' (retenidos)';
                porCategoria[nomT] = (porCategoria[nomT] || 0) + cantT;
                totalCab += cantT;
            }
            if (cantH > 0) {
                var nomH = CATEGORIAS.ternera.nombre + ' (retenidas)';
                porCategoria[nomH] = (porCategoria[nomH] || 0) + cantH;
                totalCab += cantH;
            }
        }
    });

    var labels = Object.keys(porCategoria);
    var valores = labels.map(function(l) { return porCategoria[l]; });
    var colores = labels.map(function(_, i) { return generarColorGrupo(i); });

    if (chartComposicion) chartComposicion.destroy();
    chartComposicion = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{ data: valores, backgroundColor: colores, borderWidth: 2, borderColor: '#fff' }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { font: { size: 12 } } },
                title: { display: false }
            }
        }
    });

    // Detalle textual
    if (detalle) {
        var html = '<table><thead><tr><th>Categoria</th><th>Cabezas</th><th>%</th></tr></thead><tbody>';
        labels.forEach(function(l, i) {
            var pct = (valores[i] / totalCab * 100).toFixed(1);
            html += '<tr><td><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:' + colores[i] + ';margin-right:6px;vertical-align:middle;"></span>' + l + '</td>';
            html += '<td style="text-align:right;">' + valores[i] + '</td>';
            html += '<td style="text-align:right;">' + pct + '%</td></tr>';
        });
        html += '<tr class="fila-total"><td>Total</td><td style="text-align:right;">' + totalCab + '</td><td style="text-align:right;">100%</td></tr>';
        html += '</tbody></table>';
        detalle.innerHTML = html;
    }
}

