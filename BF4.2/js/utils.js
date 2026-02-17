// ============================================
// BALANCE FORRAJERO PRO v6.0 - Utilidades
// ============================================

function formatNum(n) {
    return Math.round(n).toLocaleString('es-AR');
}

function formatMoney(n) {
    return '$' + Math.round(n).toLocaleString('es-AR');
}

function formatMoneyCompact(n) {
    var abs = Math.abs(n);
    var signo = n < 0 ? '-' : '';
    if (abs >= 1000000000) return signo + '$' + (n / 1000000000).toFixed(1).replace('.', ',') + ' MM';
    if (abs >= 1000000) return signo + '$' + (n / 1000000).toFixed(1).replace('.', ',') + ' M';
    if (abs >= 100000) return signo + '$' + (n / 1000).toFixed(0) + ' K';
    return formatMoney(n);
}

function formatNumCompact(n) {
    var abs = Math.abs(n);
    if (abs >= 1000000) return (n / 1000000).toFixed(1).replace('.', ',') + ' M';
    if (abs >= 100000) return (n / 1000).toFixed(0) + ' K';
    return formatNum(n);
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(function(tc) { tc.classList.remove('active'); });
    document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
    var tabEl = document.getElementById(tabId);
    if (tabEl) tabEl.classList.add('active');
    document.querySelectorAll('.tab').forEach(function(t) {
        var txt = t.textContent.toLowerCase();
        if ((tabId === 'balance' && txt === 'balance') ||
            (tabId === 'lotes' && txt.indexOf('lotes') >= 0) ||
            (tabId === 'potreros' && txt.indexOf('potrero') >= 0) ||
            (tabId === 'ofertademanda' && txt.indexOf('oferta') >= 0) ||
            (tabId === 'nutricion' && txt.indexOf('nutric') >= 0) ||
            (tabId === 'clima' && txt.indexOf('clima') >= 0) ||
            (tabId === 'economico' && txt.indexOf('econom') >= 0) ||
            (tabId === 'comparador' && txt.indexOf('comparador') >= 0) ||
            (tabId === 'ndvi' && txt.indexOf('ndvi') >= 0)) {
            t.classList.add('active');
        }
    });
}

function toggleAcordeon(header) {
    header.classList.toggle('abierto');
    var body = header.nextElementSibling;
    body.classList.toggle('abierto');
}

function getMesesActivos(recurso) {
    return mesesUsoRecursos[recurso] || Array(12).fill(1);
}

function getEstacion(mesIndex) {
    // mesIndex 0=Enero
    if (mesIndex >= 11 || mesIndex <= 1) return 'verano';
    if (mesIndex >= 2 && mesIndex <= 4) return 'otono';
    if (mesIndex >= 5 && mesIndex <= 7) return 'invierno';
    return 'primavera';
}

function getEstacionNombre(mesIndex) {
    var e = getEstacion(mesIndex);
    var nombres = { verano: 'Verano', otono: 'Otono', invierno: 'Invierno', primavera: 'Primavera' };
    return nombres[e] || e;
}

function generarColorGrupo(idx) {
    var colores = ['#2ecc71','#3498db','#e74c3c','#f39c12','#9b59b6','#1abc9c','#e67e22','#34495e','#16a085','#c0392b','#8e44ad','#d35400','#27ae60'];
    return colores[idx % colores.length];
}

function calcularCargaMaxima(produccionAnual, superficie, manejo) {
    var eficiencia = MODELO_CONFIG.eficienciaPastoreo[manejo] || 0.725;
    return (produccionAnual * eficiencia) / MODELO_CONFIG.consumoAnualEV / superficie;
}

// --- Resumen ejecutivo ---

function toggleResumen() {
    var el = document.getElementById('resumenEjecutivo');
    if (el) el.classList.toggle('abierto');
}

function actualizarResumenEjecutivo() {
    var container = document.getElementById('resumenEjecutivo');
    var grid = document.getElementById('resumenGrid');
    if (!container || !grid) return;

    // Superficie
    var supTotal = 0;
    if (datosForrajeros && datosForrajeros.recursos) {
        datosForrajeros.recursos.forEach(function(r) {
            var inputId = 'ha_' + r.replace(/\s+/g, '_');
            var el = document.getElementById(inputId);
            if (el) supTotal += parseFloat(el.value) || 0;
        });
    }

    // Cabezas
    var totalCab = 0;
    var totalGrupos = 0;
    var esc = typeof getEscenarioActivo === 'function' ? getEscenarioActivo() : null;
    if (esc && esc.grupos) {
        totalGrupos = esc.grupos.length;
        esc.grupos.forEach(function(g) { totalCab += g.cantidad; });
    }

    // Potreros
    var nPotreros = typeof potreros !== 'undefined' ? potreros.length : 0;

    // Balance (si ya se calculo)
    var produccionAnual = 0;
    var cargaMax = 0;
    if (configuracionCampo && configuracionCampo.produccionMensualTotal) {
        produccionAnual = configuracionCampo.produccionMensualTotal.reduce(function(a, b) { return a + b; }, 0);
        var manejo = configuracionCampo.manejo || 'rotativo';
        cargaMax = supTotal > 0 ? calcularCargaMaxima(produccionAnual, supTotal, manejo) : 0;
    }

    // Carga real
    var cargaReal = 0;
    if (esc && esc.grupos && supTotal > 0) {
        var demandaAnual = 0;
        esc.grupos.forEach(function(g) {
            var cat = CATEGORIAS[g.categoria];
            if (!cat.usaPasto) return;
            var dias = Math.floor((new Date(g.fechaSalida) - new Date(g.fechaEntrada)) / 86400000);
            var pesoPromedio = g.pesoInicial + g.ganancia * dias / 2;
            demandaAnual += pesoPromedio * cat.consumo * dias * g.cantidad;
        });
        cargaReal = demandaAnual / MODELO_CONFIG.consumoAnualEV / supTotal;
    }

    // Solo mostrar si hay datos minimos
    if (supTotal === 0 && totalCab === 0 && nPotreros === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = '';
    if (!container.classList.contains('abierto')) container.classList.add('abierto');

    var html = '';

    html += '<div class="resumen-item"><div class="ri-valor">' + supTotal.toFixed(0) + '</div><div class="ri-label">Ha totales</div></div>';
    html += '<div class="resumen-item"><div class="ri-valor">' + totalCab + '</div><div class="ri-label">Cabezas</div></div>';
    html += '<div class="resumen-item"><div class="ri-valor">' + nPotreros + '</div><div class="ri-label">Potreros</div></div>';

    if (produccionAnual > 0) {
        html += '<div class="resumen-item"><div class="ri-valor">' + (produccionAnual / 1000).toFixed(0) + 'k</div><div class="ri-label">Prod. (kg MS)</div></div>';
        html += '<div class="resumen-item"><div class="ri-valor">' + cargaMax.toFixed(2) + '</div><div class="ri-label">Carga max (EV/ha)</div></div>';
    }

    if (cargaReal > 0) {
        var ratio = cargaMax > 0 ? cargaReal / cargaMax * 100 : 0;
        var claseEstado = ratio > 100 ? 'ri-danger' : ratio > 85 ? 'ri-warning' : 'ri-ok';
        var textoEstado = ratio > 100 ? 'Sobrecarga' : ratio > 85 ? 'Limite' : 'OK';
        html += '<div class="resumen-item"><div class="ri-valor">' + cargaReal.toFixed(2) + '</div><div class="ri-label">Carga real (EV/ha)</div><span class="ri-estado ' + claseEstado + '">' + textoEstado + '</span></div>';
    }

    grid.innerHTML = html;
}

// --- Validacion inline ---

function mostrarError(inputId, mensaje) {
    var el = document.getElementById(inputId);
    if (!el) return;
    var grupo = el.closest('.input-group') || el.parentElement;
    grupo.classList.add('input-error');
    // Remover error previo si existe
    var prev = grupo.querySelector('.error-msg');
    if (prev) prev.remove();
    var msg = document.createElement('div');
    msg.className = 'error-msg';
    msg.textContent = mensaje;
    grupo.appendChild(msg);
}

function limpiarError(inputId) {
    var el = document.getElementById(inputId);
    if (!el) return;
    var grupo = el.closest('.input-group') || el.parentElement;
    grupo.classList.remove('input-error');
    var prev = grupo.querySelector('.error-msg');
    if (prev) prev.remove();
}

function limpiarErrores(ids) {
    ids.forEach(function(id) { limpiarError(id); });
}

// --- Auto-persistencia localStorage ---
var STORAGE_KEY = 'balanceForrajero_estado';

function guardarEstadoAuto() {
    try {
        var data = {
            version: '6.0',
            fecha: new Date().toISOString(),
            mesesUsoRecursos: mesesUsoRecursos,
            escenarios: escenarios,
            escenarioActivoId: escenarioActivoId,
            potreros: potreros,
            rotaciones: rotaciones,
            datosClima: datosClima,
            nextId: nextId,
            hectareasRecursos: {},
            configuracionBalance: {},
            costos: {}
        };

        // Leer hectareas de inputs
        if (datosForrajeros && datosForrajeros.recursos) {
            datosForrajeros.recursos.forEach(function(r) {
                var inputId = 'ha_' + r.replace(/\s+/g, '_');
                var el = document.getElementById(inputId);
                if (el) data.hectareasRecursos[r] = parseFloat(el.value) || 0;
            });
        }

        // Leer configuracion del balance
        var ids = { mesInicio: 'mesInicioSelect', stockInicial: 'stockInicialInput',
            ajusteProductividad: 'ajusteProductividad', escenarioClimatico: 'escenarioSelect',
            manejo: 'manejoPastoreo' };
        Object.keys(ids).forEach(function(key) {
            var el = document.getElementById(ids[key]);
            data.configuracionBalance[key] = el ? el.value : '';
        });

        // Leer costos
        var costIds = { labores: 'costoLabores', estructura: 'costosEstructura',
            costoSuplemento: 'costoSuplemento', kgSuplemento: 'kgSuplemento',
            comisionVenta: 'comisionVenta', flete: 'costoFlete' };
        Object.keys(costIds).forEach(function(key) {
            var el = document.getElementById(costIds[key]);
            data.costos[key] = el ? (parseFloat(el.value) || 0) : 0;
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch(e) {
        console.warn('No se pudo guardar estado:', e.message);
    }
}

function restaurarEstadoAuto() {
    try {
        var saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return false;
        var data = JSON.parse(saved);
        if (!data.version) return false;

        // Restaurar meses de uso ANTES de regenerar inputs
        if (data.mesesUsoRecursos) mesesUsoRecursos = data.mesesUsoRecursos;

        // Regenerar inputs con meses restaurados
        generarInputsRecursos();

        // Restaurar escenarios
        if (data.escenarios && data.escenarios.length > 0) {
            escenarios = data.escenarios;
            escenarioActivoId = data.escenarioActivoId || escenarios[0].id;
        }
        if (data.nextId) nextId = data.nextId;
        if (data.potreros) potreros = data.potreros;
        if (data.rotaciones) rotaciones = data.rotaciones;
        if (data.datosClima) datosClima = data.datosClima;

        // Restaurar hectareas en DOM
        if (data.hectareasRecursos) {
            Object.keys(data.hectareasRecursos).forEach(function(r) {
                var inputId = 'ha_' + r.replace(/\s+/g, '_');
                var el = document.getElementById(inputId);
                if (el) el.value = data.hectareasRecursos[r];
            });
        }

        // Restaurar config balance en DOM
        if (data.configuracionBalance) {
            var cb = data.configuracionBalance;
            var el;
            el = document.getElementById('mesInicioSelect'); if (el && cb.mesInicio) el.value = cb.mesInicio;
            el = document.getElementById('stockInicialInput'); if (el && cb.stockInicial) el.value = cb.stockInicial;
            el = document.getElementById('ajusteProductividad');
            if (el && cb.ajusteProductividad) {
                el.value = cb.ajusteProductividad;
                var disp = document.getElementById('ajusteValor');
                if (disp) disp.textContent = cb.ajusteProductividad + '%';
            }
            el = document.getElementById('escenarioSelect'); if (el && cb.escenarioClimatico) el.value = cb.escenarioClimatico;
            el = document.getElementById('manejoPastoreo'); if (el && cb.manejo) el.value = cb.manejo;
        }

        // Restaurar costos en DOM
        if (data.costos) {
            var c = data.costos;
            var costMap = { costoLabores: 'labores', costosEstructura: 'estructura',
                costoSuplemento: 'costoSuplemento', kgSuplemento: 'kgSuplemento',
                comisionVenta: 'comisionVenta', costoFlete: 'flete' };
            Object.keys(costMap).forEach(function(elId) {
                var el = document.getElementById(elId);
                if (el) el.value = c[costMap[elId]] || 0;
            });
        }

        // Restaurar clima inputs
        if (datosClima && datosClima.precipitacionesMensuales) {
            for (var m = 0; m < 12; m++) {
                var el = document.getElementById('climaPrec_' + m);
                if (el) el.value = Math.round(datosClima.precipitacionesMensuales[m] || 0);
            }
            var latEl = document.getElementById('climaLatitud');
            var lonEl = document.getElementById('climaLongitud');
            if (latEl && datosClima.latitud) latEl.value = datosClima.latitud;
            if (lonEl && datosClima.longitud) lonEl.value = datosClima.longitud;
        }

        // Actualizar vistas
        actualizarSelectEscenarios();
        actualizarVistaEscenarios();
        if (typeof actualizarVistaPotreros === 'function') actualizarVistaPotreros();
        if (typeof cargarSelectsRotacion === 'function') cargarSelectsRotacion();

        return true;
    } catch(e) {
        console.warn('No se pudo restaurar estado:', e.message);
        return false;
    }
}

// Guardar/cargar configuracion completa (archivo JSON)
function exportarConfiguracion() {
    var data = {
        version: '6.0',
        fecha: new Date().toISOString(),
        configuracionCampo: configuracionCampo,
        mesesUsoRecursos: mesesUsoRecursos,
        escenarios: escenarios,
        escenarioActivoId: escenarioActivoId,
        potreros: potreros,
        rotaciones: rotaciones,
        datosClima: datosClima,
        hectareasRecursos: {}
    };
    // Guardar hectareas de cada recurso
    if (datosForrajeros) {
        datosForrajeros.recursos.forEach(function(r) {
            var inputId = 'ha_' + r.replace(/\s+/g, '_');
            var el = document.getElementById(inputId);
            if (el) data.hectareasRecursos[r] = parseFloat(el.value) || 0;
        });
    }
    // Guardar costos economicos
    data.costos = {
        labores: parseFloat(document.getElementById('costoLabores').value) || 0,
        estructura: parseFloat(document.getElementById('costosEstructura').value) || 0,
        costoSuplemento: parseFloat(document.getElementById('costoSuplemento').value) || 0,
        kgSuplemento: parseFloat(document.getElementById('kgSuplemento').value) || 0,
        comisionVenta: parseFloat(document.getElementById('comisionVenta').value) || 0,
        flete: parseFloat(document.getElementById('costoFlete').value) || 0
    };

    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'balance_forrajero_' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    URL.revokeObjectURL(url);
}

function importarConfiguracion(event) {
    var file = event.target.files[0];
    if (!file) return;

    var reader = new FileReader();
    reader.onload = function(e) {
        try {
            var data = JSON.parse(e.target.result);
            if (!data.version) { alert('Archivo no valido.'); return; }

            // Restaurar meses de uso
            if (data.mesesUsoRecursos) mesesUsoRecursos = data.mesesUsoRecursos;

            // Restaurar escenarios
            if (data.escenarios) {
                escenarios = data.escenarios;
                escenarioActivoId = data.escenarioActivoId || (escenarios[0] ? escenarios[0].id : null);
                // Recalcular nextId
                var maxId = 0;
                escenarios.forEach(function(e) {
                    if (e.id > maxId) maxId = e.id;
                    e.grupos.forEach(function(g) { if (g.id > maxId) maxId = g.id; });
                });
                nextId = maxId + 1;
            }

            // Restaurar potreros
            if (data.potreros) {
                potreros = data.potreros;
                potreros.forEach(function(p) { if (p.id >= nextId) nextId = p.id + 1; });
            }
            if (data.rotaciones) {
                rotaciones = data.rotaciones;
                rotaciones.forEach(function(r) { if (r.id >= nextId) nextId = r.id + 1; });
            }

            // Restaurar clima
            if (data.datosClima) datosClima = data.datosClima;

            // Regenerar UI
            generarInputsRecursos();

            // Restaurar hectareas
            if (data.hectareasRecursos) {
                Object.keys(data.hectareasRecursos).forEach(function(r) {
                    var inputId = 'ha_' + r.replace(/\s+/g, '_');
                    var el = document.getElementById(inputId);
                    if (el) el.value = data.hectareasRecursos[r];
                });
            }

            // Restaurar costos
            if (data.costos) {
                var c = data.costos;
                if (document.getElementById('costoLabores')) document.getElementById('costoLabores').value = c.labores || 0;
                if (document.getElementById('costosEstructura')) document.getElementById('costosEstructura').value = c.estructura || 0;
                if (document.getElementById('costoSuplemento')) document.getElementById('costoSuplemento').value = c.costoSuplemento || 0;
                if (document.getElementById('kgSuplemento')) document.getElementById('kgSuplemento').value = c.kgSuplemento || 0;
                if (document.getElementById('comisionVenta')) document.getElementById('comisionVenta').value = c.comisionVenta || 0;
                if (document.getElementById('costoFlete')) document.getElementById('costoFlete').value = c.flete || 0;
            }

            actualizarSelectEscenarios();
            actualizarVistaEscenarios();
            if (typeof actualizarVistaPotreros === 'function') actualizarVistaPotreros();
            if (typeof actualizarVistaClima === 'function') actualizarVistaClima();

            alert('Configuracion importada correctamente.');
        } catch(err) {
            alert('Error al leer archivo: ' + err.message);
        }
    };
    reader.readAsText(file);
}
