// ============================================
// BALANCE FORRAJERO PRO v6.0 - Rotacion de Potreros + Gantt
// ============================================

// --- GESTION DE POTREROS ---

function agregarPotrero() {
    if (typeof limpiarErrores === 'function') limpiarErrores(['potreroNombre', 'potreroSuperficie']);

    var nombre = document.getElementById('potreroNombre').value.trim();
    var superficie = parseFloat(document.getElementById('potreroSuperficie').value) || 0;
    var recurso = document.getElementById('potreroRecurso').value;
    var aguada = document.getElementById('potreroAguada').checked;

    var hayError = false;
    if (!nombre) {
        if (typeof mostrarError === 'function') mostrarError('potreroNombre', 'Ingresa un nombre');
        hayError = true;
    }
    if (superficie <= 0) {
        if (typeof mostrarError === 'function') mostrarError('potreroSuperficie', 'Debe ser mayor a 0');
        hayError = true;
    }
    if (hayError) return;

    var editandoId = document.getElementById('potreroEditandoId').value;
    if (editandoId) {
        var pot = potreros.find(function(p) { return p.id === parseInt(editandoId); });
        if (pot) {
            pot.nombre = nombre;
            pot.superficie = superficie;
            pot.recurso = recurso;
            pot.aguada = aguada;
        }
        document.getElementById('potreroEditandoId').value = '';
        document.getElementById('btnAgregarPotrero').textContent = 'Agregar potrero';
    } else {
        potreros.push({
            id: nextId++,
            nombre: nombre,
            superficie: superficie,
            recurso: recurso,
            aguada: aguada,
            estado: 'disponible'
        });
    }

    limpiarFormPotrero();
    actualizarVistaPotreros();
    sincronizarPotreroConBalance();
}

function editarPotrero(id) {
    var pot = potreros.find(function(p) { return p.id === id; });
    if (!pot) return;
    document.getElementById('potreroNombre').value = pot.nombre;
    document.getElementById('potreroSuperficie').value = pot.superficie;
    document.getElementById('potreroRecurso').value = pot.recurso;
    document.getElementById('potreroAguada').checked = pot.aguada;
    document.getElementById('potreroEditandoId').value = pot.id;
    document.getElementById('btnAgregarPotrero').textContent = 'Guardar cambios';
}

function eliminarPotrero(id) {
    if (!confirm('Eliminar este potrero?')) return;
    potreros = potreros.filter(function(p) { return p.id !== id; });
    rotaciones = rotaciones.filter(function(r) { return r.potreroId !== id; });
    actualizarVistaPotreros();
    sincronizarPotreroConBalance();
}

function limpiarFormPotrero() {
    document.getElementById('potreroNombre').value = '';
    document.getElementById('potreroSuperficie').value = '';
    document.getElementById('potreroRecurso').value = datosForrajeros.recursos[0];
    document.getElementById('potreroAguada').checked = true;
    document.getElementById('potreroEditandoId').value = '';
    document.getElementById('btnAgregarPotrero').textContent = 'Agregar potrero';
}

function actualizarEstadoPotreros() {
    var hoy = new Date();
    potreros.forEach(function(pot) {
        var rotActivas = rotaciones.filter(function(r) {
            return r.potreroId === pot.id &&
                new Date(r.fechaIngreso) <= hoy &&
                new Date(r.fechaEgreso) >= hoy;
        });
        if (rotActivas.length > 0) {
            pot.estado = 'ocupado';
        } else {
            // Verificar si necesita descanso
            var ultimaRot = rotaciones
                .filter(function(r) { return r.potreroId === pot.id && new Date(r.fechaEgreso) <= hoy; })
                .sort(function(a, b) { return new Date(b.fechaEgreso) - new Date(a.fechaEgreso); })[0];

            if (ultimaRot) {
                var diasDesdeUso = Math.floor((hoy - new Date(ultimaRot.fechaEgreso)) / 86400000);
                var nPotreros = potreros.length || 1;
                var descansoMinimo = ultimaRot.diasOcupacion * (nPotreros - 1);
                pot.estado = diasDesdeUso < descansoMinimo ? 'descanso' : 'disponible';
            } else {
                pot.estado = 'disponible';
            }
        }
    });
}

function actualizarVistaPotreros() {
    actualizarEstadoPotreros();

    var container = document.getElementById('potreroGrid');
    if (!container) return;

    if (potreros.length === 0) {
        container.innerHTML = '<p style="color:#999;text-align:center;grid-column:1/-1;">No hay potreros definidos. Agrega el primero.</p>';
        actualizarResumenPotreros();
        renderGanttRotaciones();
        renderIndicadoresRotacion();
        return;
    }

    var html = '';
    potreros.forEach(function(pot) {
        var claseEstado = pot.estado === 'ocupado' ? 'ocupado' : pot.estado === 'descanso' ? 'descanso' : '';
        var claseEstadoBadge = 'estado-' + (pot.estado === 'en_descanso' ? 'descanso' : pot.estado);

        html += '<div class="potrero-card ' + claseEstado + '">';
        html += '<div class="potrero-nombre">' + pot.nombre + '</div>';
        html += '<div class="potrero-detalle">' + pot.superficie + ' ha - ' + pot.recurso + '</div>';
        html += '<div class="potrero-detalle">Aguada: ' + (pot.aguada ? 'Si' : 'No') + '</div>';
        html += '<span class="potrero-estado ' + claseEstadoBadge + '">' + pot.estado.charAt(0).toUpperCase() + pot.estado.slice(1) + '</span>';
        html += '<div style="margin-top:10px;">';
        html += '<button class="btn-editar" onclick="editarPotrero(' + pot.id + ')">Editar</button> ';
        html += '<button class="btn-eliminar" onclick="eliminarPotrero(' + pot.id + ')">Eliminar</button>';
        html += '</div></div>';
    });

    container.innerHTML = html;
    actualizarResumenPotreros();
    renderGanttRotaciones();
    renderIndicadoresRotacion();

    // Auto-guardar estado
    if (typeof guardarEstadoAuto === 'function') guardarEstadoAuto();
}

function actualizarResumenPotreros() {
    var container = document.getElementById('resumenPotreros');
    if (!container) return;

    if (potreros.length === 0) {
        container.innerHTML = '';
        return;
    }

    var supTotal = potreros.reduce(function(s, p) { return s + p.superficie; }, 0);
    var distribucion = {};
    potreros.forEach(function(p) {
        if (!distribucion[p.recurso]) distribucion[p.recurso] = 0;
        distribucion[p.recurso] += p.superficie;
    });

    var html = '<div class="card-grid">';
    html += '<div class="card"><div class="card-title">Total potreros</div><div class="card-value">' + potreros.length + '</div></div>';
    html += '<div class="card"><div class="card-title">Superficie total</div><div class="card-value">' + supTotal.toFixed(1) + '</div><div class="card-unit">hectareas</div></div>';

    var disponibles = potreros.filter(function(p) { return p.estado === 'disponible'; }).length;
    var ocupados = potreros.filter(function(p) { return p.estado === 'ocupado'; }).length;
    var enDescanso = potreros.filter(function(p) { return p.estado === 'descanso'; }).length;

    html += '<div class="card"><div class="card-title">Disponibles</div><div class="card-value" style="color:#27ae60;">' + disponibles + '</div></div>';
    html += '<div class="card"><div class="card-title">Ocupados</div><div class="card-value" style="color:#e74c3c;">' + ocupados + '</div></div>';
    html += '<div class="card"><div class="card-title">En descanso</div><div class="card-value" style="color:#f39c12;">' + enDescanso + '</div></div>';
    html += '</div>';

    // Distribucion por recurso
    html += '<h3>Distribucion por recurso</h3><table><thead><tr><th>Recurso</th><th>Ha</th><th>%</th></tr></thead><tbody>';
    Object.keys(distribucion).forEach(function(r) {
        html += '<tr><td>' + r + '</td><td>' + distribucion[r].toFixed(1) + '</td><td>' + (distribucion[r] / supTotal * 100).toFixed(1) + '%</td></tr>';
    });
    html += '</tbody></table>';

    container.innerHTML = html;
}

// --- GESTION DE ROTACIONES ---

function agregarRotacion() {
    if (typeof limpiarErrores === 'function') limpiarErrores(['rotacionGrupo', 'rotacionPotrero', 'rotacionFechaIngreso']);

    var grupoId = parseInt(document.getElementById('rotacionGrupo').value);
    var potreroId = parseInt(document.getElementById('rotacionPotrero').value);
    var fechaIngreso = document.getElementById('rotacionFechaIngreso').value;
    var diasOcupacion = parseInt(document.getElementById('rotacionDias').value) || 14;

    var hayError = false;
    if (!grupoId) {
        if (typeof mostrarError === 'function') mostrarError('rotacionGrupo', 'Selecciona un grupo');
        hayError = true;
    }
    if (!potreroId) {
        if (typeof mostrarError === 'function') mostrarError('rotacionPotrero', 'Selecciona un potrero');
        hayError = true;
    }
    if (!fechaIngreso) {
        if (typeof mostrarError === 'function') mostrarError('rotacionFechaIngreso', 'Ingresa fecha');
        hayError = true;
    }
    if (hayError) return;

    var pot = potreros.find(function(p) { return p.id === potreroId; });
    var esc = getEscenarioActivo();
    var grupo = null;
    if (esc) grupo = esc.grupos.find(function(g) { return g.id === grupoId; });

    if (!pot || !grupo) { alert('Potrero o grupo no encontrado.'); return; }

    var fechaEgreso = new Date(new Date(fechaIngreso).getTime() + diasOcupacion * 86400000).toISOString().split('T')[0];

    // Calcular carga instantanea
    var cat = CATEGORIAS[grupo.categoria];
    var diasDesdeEntrada = Math.max(0, Math.floor((new Date(fechaIngreso) - new Date(grupo.fechaEntrada)) / 86400000));
    var pesoPromedio = grupo.pesoInicial + grupo.ganancia * diasDesdeEntrada;
    var evAnimal = pesoPromedio * cat.consumo / (MODELO_CONFIG.consumoAnualEV / 365);
    var cargaInstantanea = (evAnimal * grupo.cantidad) / pot.superficie;

    rotaciones.push({
        id: nextId++,
        grupoId: grupoId,
        potreroId: potreroId,
        fechaIngreso: fechaIngreso,
        fechaEgreso: fechaEgreso,
        diasOcupacion: diasOcupacion,
        cargaInstantanea: cargaInstantanea
    });

    // Verificar descanso
    verificarDescansoRotacion(potreroId);

    document.getElementById('rotacionFechaIngreso').value = '';
    actualizarVistaPotreros();
    actualizarVistaRotaciones();
}

function eliminarRotacion(id) {
    if (!confirm('Eliminar esta rotacion?')) return;
    rotaciones = rotaciones.filter(function(r) { return r.id !== id; });
    actualizarVistaPotreros();
    actualizarVistaRotaciones();
}

function verificarDescansoRotacion(potreroId) {
    var rotsDeEstePotrero = rotaciones
        .filter(function(r) { return r.potreroId === potreroId; })
        .sort(function(a, b) { return new Date(a.fechaIngreso) - new Date(b.fechaIngreso); });

    var nPotreros = potreros.length || 1;
    var alertas = [];

    for (var i = 1; i < rotsDeEstePotrero.length; i++) {
        var anterior = rotsDeEstePotrero[i - 1];
        var actual = rotsDeEstePotrero[i];
        var diasDescanso = Math.floor((new Date(actual.fechaIngreso) - new Date(anterior.fechaEgreso)) / 86400000);
        var descansoMinimo = anterior.diasOcupacion * (nPotreros - 1);

        if (diasDescanso < descansoMinimo) {
            var pot = potreros.find(function(p) { return p.id === potreroId; });
            alertas.push('Potrero "' + (pot ? pot.nombre : potreroId) + '": solo ' + diasDescanso + ' dias de descanso (minimo recomendado: ' + descansoMinimo + ')');
        }
    }

    if (alertas.length > 0) {
        alert('Alerta de descanso insuficiente:\n' + alertas.join('\n'));
    }
}

function actualizarVistaRotaciones() {
    var container = document.getElementById('listaRotaciones');
    if (!container) return;

    if (rotaciones.length === 0) {
        container.innerHTML = '<p style="color:#999;">No hay rotaciones programadas.</p>';
        return;
    }

    var esc = getEscenarioActivo();
    var html = '<table><thead><tr><th>Potrero</th><th>Grupo</th><th>Ingreso</th><th>Egreso</th><th>Dias</th><th>Carga inst. (EV/ha)</th><th>Accion</th></tr></thead><tbody>';

    rotaciones.forEach(function(rot) {
        var pot = potreros.find(function(p) { return p.id === rot.potreroId; });
        var grupo = null;
        if (esc) grupo = esc.grupos.find(function(g) { return g.id === rot.grupoId; });
        var catNombre = grupo ? CATEGORIAS[grupo.categoria].nombre : '?';

        html += '<tr>';
        html += '<td>' + (pot ? pot.nombre : '?') + '</td>';
        html += '<td>' + catNombre + (grupo ? ' (' + grupo.cantidad + ' cab)' : '') + '</td>';
        html += '<td>' + rot.fechaIngreso + '</td>';
        html += '<td>' + rot.fechaEgreso + '</td>';
        html += '<td>' + rot.diasOcupacion + '</td>';
        html += '<td>' + rot.cargaInstantanea.toFixed(2) + '</td>';
        html += '<td><button class="btn-eliminar" onclick="eliminarRotacion(' + rot.id + ')">Eliminar</button></td>';
        html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;

    // Auto-guardar estado
    if (typeof guardarEstadoAuto === 'function') guardarEstadoAuto();
}

function cargarSelectsRotacion() {
    var selectGrupo = document.getElementById('rotacionGrupo');
    var selectPotrero = document.getElementById('rotacionPotrero');
    if (!selectGrupo || !selectPotrero) return;

    var esc = getEscenarioActivo();
    selectGrupo.innerHTML = '<option value="">-- Seleccionar grupo --</option>';
    if (esc) {
        esc.grupos.forEach(function(g) {
            var cat = CATEGORIAS[g.categoria];
            selectGrupo.innerHTML += '<option value="' + g.id + '">' + cat.nombre + ' (' + g.cantidad + ' cab)</option>';
        });
    }

    selectPotrero.innerHTML = '<option value="">-- Seleccionar potrero --</option>';
    potreros.forEach(function(p) {
        selectPotrero.innerHTML += '<option value="' + p.id + '">' + p.nombre + ' (' + p.superficie + ' ha - ' + p.recurso + ')</option>';
    });
}

// --- DIAGRAMA GANTT ---

function renderGanttRotaciones() {
    var container = document.getElementById('ganttContainer');
    if (!container) return;

    if (potreros.length === 0 || rotaciones.length === 0) {
        container.innerHTML = '<p style="color:#999;text-align:center;">Agrega potreros y rotaciones para ver el diagrama Gantt.</p>';
        return;
    }

    var mesInicio = parseInt(document.getElementById('mesInicioSelect').value);
    var mesesOrden = [];
    for (var i = 0; i < 12; i++) {
        mesesOrden.push((mesInicio + i) % 12);
    }

    // Calcular rango de fechas (12 meses desde mes inicio)
    var anioActual = new Date().getFullYear();
    var fechaInicio = new Date(anioActual, mesInicio, 1);
    var fechaFin = new Date(anioActual + 1, mesInicio, 0);
    var totalDias = Math.floor((fechaFin - fechaInicio) / 86400000);

    var esc = getEscenarioActivo();
    var grupoColores = {};
    var colorIdx = 0;
    if (esc) {
        esc.grupos.forEach(function(g) {
            grupoColores[g.id] = generarColorGrupo(colorIdx++);
        });
    }

    var html = '<table class="gantt-table"><thead><tr><th>Potrero</th>';
    mesesOrden.forEach(function(m) { html += '<th>' + MESES_NOMBRES[m] + '</th>'; });
    html += '</tr></thead><tbody>';

    potreros.forEach(function(pot) {
        html += '<tr><td>' + pot.nombre + ' (' + pot.superficie + ' ha)</td>';

        mesesOrden.forEach(function(m, idx) {
            var inicioMes = new Date(anioActual, m < mesInicio ? m + 12 : m, 1);
            if (m < mesInicio) inicioMes = new Date(anioActual + 1, m, 1);
            var finMes = new Date(inicioMes.getFullYear(), inicioMes.getMonth() + 1, 0);
            var diasMes = finMes.getDate();

            html += '<td style="position:relative;">';

            var rotsEsteMes = rotaciones.filter(function(r) {
                if (r.potreroId !== pot.id) return false;
                var ri = new Date(r.fechaIngreso);
                var re = new Date(r.fechaEgreso);
                return ri <= finMes && re >= inicioMes;
            });

            rotsEsteMes.forEach(function(rot) {
                var ri = new Date(rot.fechaIngreso);
                var re = new Date(rot.fechaEgreso);
                var diaInicio = Math.max(0, Math.floor((ri - inicioMes) / 86400000));
                var diaFin = Math.min(diasMes, Math.ceil((re - inicioMes) / 86400000));
                var left = (diaInicio / diasMes * 100);
                var width = ((diaFin - diaInicio) / diasMes * 100);

                var color = grupoColores[rot.grupoId] || '#999';
                var grupo = null;
                if (esc) grupo = esc.grupos.find(function(g) { return g.id === rot.grupoId; });
                var label = grupo ? CATEGORIAS[grupo.categoria].nombre.substring(0, 4) : '';

                html += '<div class="gantt-bar" style="left:' + left + '%;width:' + Math.max(width, 3) + '%;background:' + color + ';" title="' +
                    (grupo ? CATEGORIAS[grupo.categoria].nombre + ' - ' + rot.diasOcupacion + ' dias' : '') + '">' + label + '</div>';
            });

            html += '</td>';
        });

        html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

// --- INDICADORES DE ROTACION ---

function renderIndicadoresRotacion() {
    var container = document.getElementById('indicadoresRotacion');
    if (!container) return;

    if (potreros.length === 0 || rotaciones.length === 0) {
        container.innerHTML = '';
        return;
    }

    var nPotreros = potreros.length;
    var totalDiasOcupacion = 0;
    var totalDiasDescanso = 0;
    var contDescanso = 0;
    var potrerosConProblema = 0;

    potreros.forEach(function(pot) {
        var rots = rotaciones
            .filter(function(r) { return r.potreroId === pot.id; })
            .sort(function(a, b) { return new Date(a.fechaIngreso) - new Date(b.fechaIngreso); });

        var diasOcupado = 0;
        rots.forEach(function(r) { diasOcupado += r.diasOcupacion; totalDiasOcupacion += r.diasOcupacion; });

        for (var i = 1; i < rots.length; i++) {
            var descanso = Math.floor((new Date(rots[i].fechaIngreso) - new Date(rots[i-1].fechaEgreso)) / 86400000);
            totalDiasDescanso += descanso;
            contDescanso++;
            var descansoMin = rots[i-1].diasOcupacion * (nPotreros - 1);
            if (descanso < descansoMin) potrerosConProblema++;
        }
    });

    var cargaPromedio = 0;
    if (potreros.length > 0) {
        var supTotal = potreros.reduce(function(s, p) { return s + p.superficie; }, 0);
        var totalEV = rotaciones.reduce(function(s, r) { return s + r.cargaInstantanea; }, 0);
        cargaPromedio = totalEV / rotaciones.length;
    }

    var descansoPromedio = contDescanso > 0 ? (totalDiasDescanso / contDescanso) : 0;

    var html = '<div class="indicador-rotacion">';
    html += '<div class="indicador-item"><div class="ind-valor">' + (cargaPromedio).toFixed(2) + '</div><div class="ind-label">Carga inst. promedio (EV/ha)</div></div>';
    html += '<div class="indicador-item"><div class="ind-valor">' + Math.round(descansoPromedio) + '</div><div class="ind-label">Descanso promedio (dias)</div></div>';
    html += '<div class="indicador-item"><div class="ind-valor" style="color:' + (potrerosConProblema > 0 ? '#e74c3c' : '#27ae60') + ';">' + potrerosConProblema + '</div><div class="ind-label">Descanso insuficiente</div></div>';
    html += '<div class="indicador-item"><div class="ind-valor">' + rotaciones.length + '</div><div class="ind-label">Rotaciones programadas</div></div>';
    html += '</div>';

    container.innerHTML = html;
}

// --- SINCRONIZACION CON BALANCE ---

function sincronizarPotreroConBalance() {
    if (potreros.length === 0) return;

    var superficiePorRecurso = {};
    potreros.forEach(function(p) {
        if (!superficiePorRecurso[p.recurso]) superficiePorRecurso[p.recurso] = 0;
        superficiePorRecurso[p.recurso] += p.superficie;
    });

    // Actualizar inputs de hectareas en el balance
    if (datosForrajeros) {
        datosForrajeros.recursos.forEach(function(r) {
            var inputId = 'ha_' + r.replace(/\s+/g, '_');
            var el = document.getElementById(inputId);
            if (el) {
                el.value = superficiePorRecurso[r] || 0;
            }
        });
    }
}
