// ============================================
// BALANCE FORRAJERO PRO v6.0 - Lotes / Escenarios
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
        grupos: esc.grupos.map(function(g) { return Object.assign({}, g, { id: nextId++, costos: Object.assign({}, g.costos) }); })
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

    if (grupoEditandoId !== null) {
        var grupo = esc.grupos.find(function(g) { return g.id === grupoEditandoId; });
        if (grupo) {
            Object.assign(grupo, {
                categoria: categoria, cantidad: cantidad, pesoInicial: pesoInicial, ganancia: ganancia,
                criterioSalida: criterio, fechaEntrada: fechaEntrada, fechaSalida: fechaSalida,
                pesoObjetivo: pesoObjetivo, costos: costos, modoGanancia: modoGanancia
            });
        }
        grupoEditandoId = null;
        document.getElementById('btnAgregarGrupo').textContent = 'Agregar al escenario';
        document.getElementById('btnCancelarEdicion').style.display = 'none';
    } else {
        esc.grupos.push({
            id: nextId++, categoria: categoria, cantidad: cantidad, pesoInicial: pesoInicial, ganancia: ganancia,
            criterioSalida: criterio, fechaEntrada: fechaEntrada, fechaSalida: fechaSalida,
            pesoObjetivo: pesoObjetivo, costos: costos, modoGanancia: modoGanancia
        });
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
    esc.grupos.push(Object.assign({}, g, { id: nextId++, costos: Object.assign({}, g.costos) }));
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

    // Auto-guardar estado
    if (typeof guardarEstadoAuto === 'function') guardarEstadoAuto();
    if (typeof actualizarResumenEjecutivo === 'function') actualizarResumenEjecutivo();
}
