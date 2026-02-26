// ============================================
// BALANCE FORRAJERO PRO v6.0 - Utilidades
// (c) 2025-2026 Santiago Jose Insaurralde.
// Todos los derechos reservados.
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
    var secciones = document.getElementById('resumenSecciones');
    var semaforo = document.getElementById('resumenSemaforo');
    if (!container || !secciones) return;

    // --- Recopilar datos ---

    // Superficie y recursos activos
    var supTotal = 0;
    var nRecursos = 0;
    if (typeof recursosActivos !== 'undefined' && recursosActivos.length > 0) {
        nRecursos = recursosActivos.length;
        recursosActivos.forEach(function(r) {
            var inputId = 'ha_' + r.replace(/\s+/g, '_');
            var el = document.getElementById(inputId);
            if (el) supTotal += parseFloat(el.value) || 0;
        });
    } else if (datosForrajeros && datosForrajeros.recursos) {
        datosForrajeros.recursos.forEach(function(r) {
            var inputId = 'ha_' + r.replace(/\s+/g, '_');
            var el = document.getElementById(inputId);
            var v = el ? (parseFloat(el.value) || 0) : 0;
            if (v > 0) { supTotal += v; nRecursos++; }
        });
    }

    // Cabezas y produccion carne
    var totalCab = 0;
    var totalGrupos = 0;
    var kgCarne = 0;
    var esc = typeof getEscenarioActivo === 'function' ? getEscenarioActivo() : null;
    if (esc && esc.grupos) {
        totalGrupos = esc.grupos.length;
        esc.grupos.forEach(function(g) {
            totalCab += g.cantidad;
            var dias = Math.floor((new Date(g.fechaSalida) - new Date(g.fechaEntrada)) / 86400000);
            kgCarne += g.ganancia * dias * g.cantidad;
        });
    }

    // Potreros
    var nPotreros = typeof potreros !== 'undefined' ? potreros.length : 0;

    // Balance (si ya se calculo)
    var produccionAnual = 0;
    var cargaMax = 0;
    var manejo = 'rotativo';
    var eficiencia = MODELO_CONFIG.eficienciaPastoreo.rotativo;
    if (configuracionCampo && configuracionCampo.produccionMensualTotal) {
        produccionAnual = configuracionCampo.produccionMensualTotal.reduce(function(a, b) { return a + b; }, 0);
        manejo = configuracionCampo.manejo || 'rotativo';
        eficiencia = MODELO_CONFIG.eficienciaPastoreo[manejo];
        cargaMax = supTotal > 0 ? calcularCargaMaxima(produccionAnual, supTotal, manejo) : 0;
    }

    // Carga real y tasa de uso
    var cargaReal = 0;
    var demandaAnual = 0;
    var tasaUso = 0;
    if (esc && esc.grupos && supTotal > 0) {
        esc.grupos.forEach(function(g) {
            var cat = CATEGORIAS[g.categoria];
            if (!cat.usaPasto) return;
            var dias = Math.floor((new Date(g.fechaSalida) - new Date(g.fechaEntrada)) / 86400000);
            var pesoPromedio = g.pesoInicial + g.ganancia * dias / 2;
            demandaAnual += pesoPromedio * cat.consumo * dias * g.cantidad;
        });
        cargaReal = demandaAnual / MODELO_CONFIG.consumoAnualEV / supTotal;
        var ofertaAprov = produccionAnual * eficiencia;
        if (ofertaAprov > 0) tasaUso = demandaAnual / ofertaAprov * 100;
    }

    // Meses deficit (de alertas predictivas)
    var mesesDeficit = 0;
    if (typeof alertasPredictivas !== 'undefined' && alertasPredictivas.length > 0) {
        alertasPredictivas.forEach(function(a) {
            var match = a.detalle ? a.detalle.match(/(\d+) meses/) : null;
            if (a.tipo === 'critica' && match) mesesDeficit = parseInt(match[1]);
        });
    }

    // Solo mostrar si hay datos minimos
    if (supTotal === 0 && totalCab === 0 && nPotreros === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = '';

    // --- Semaforo global ---
    if (semaforo) {
        if (produccionAnual === 0 || totalCab === 0) {
            semaforo.className = 'resumen-semaforo semaforo-sin-datos';
            semaforo.textContent = 'Sin calcular';
        } else if (tasaUso > 100 || mesesDeficit >= 3) {
            semaforo.className = 'resumen-semaforo semaforo-critico';
            semaforo.textContent = 'Sobrecarga';
        } else if (tasaUso > 85 || mesesDeficit > 0) {
            semaforo.className = 'resumen-semaforo semaforo-atencion';
            semaforo.textContent = 'Ajustado';
        } else {
            semaforo.className = 'resumen-semaforo semaforo-ok';
            semaforo.textContent = 'Equilibrado';
        }
    }

    // --- Construir secciones ---
    var html = '';

    // SECCION: Campo
    html += '<div class="resumen-seccion"><div class="resumen-seccion-titulo">Campo</div><div class="resumen-grid">';
    html += _riCard(supTotal.toFixed(0), 'Ha totales');
    html += _riCard(nRecursos, 'Recursos');
    if (produccionAnual > 0) {
        html += _riCard(formatNum(Math.round(produccionAnual)), 'Prod. bruta (kg MS)');
        html += _riCard(supTotal > 0 ? formatNum(Math.round(produccionAnual / supTotal)) : '-', 'kg MS/ha/ano');
    }
    if (nPotreros > 0) html += _riCard(nPotreros, 'Potreros');
    html += '</div></div>';

    // SECCION: Rodeo
    if (totalCab > 0) {
        html += '<div class="resumen-seccion"><div class="resumen-seccion-titulo">Rodeo</div><div class="resumen-grid">';
        html += _riCard(totalCab, 'Cabezas');
        html += _riCard(totalGrupos, 'Grupos');
        if (kgCarne > 0) {
            html += _riCard(formatNum(Math.round(kgCarne)), 'kg carne prod.');
            if (supTotal > 0) html += _riCard(Math.round(kgCarne / supTotal), 'kg carne/ha');
        }
        html += '</div></div>';
    }

    // SECCION: Balance
    if (produccionAnual > 0 && totalCab > 0) {
        html += '<div class="resumen-seccion"><div class="resumen-seccion-titulo">Balance</div><div class="resumen-grid">';
        html += _riCard(cargaMax.toFixed(2), 'Carga max (EV/ha)');

        var ratio = cargaMax > 0 ? cargaReal / cargaMax * 100 : 0;
        var claseEstado = ratio > 100 ? 'ri-danger' : ratio > 85 ? 'ri-warning' : 'ri-ok';
        var textoEstado = ratio > 100 ? 'Sobrecarga' : ratio > 85 ? 'Limite' : 'OK';
        html += _riCard(cargaReal.toFixed(2), 'Carga real (EV/ha)', claseEstado, textoEstado);

        var claseTasa = tasaUso > 100 ? 'ri-danger' : tasaUso > 85 ? 'ri-warning' : 'ri-ok';
        html += _riCard(tasaUso.toFixed(0) + '%', 'Tasa de uso', claseTasa);

        var manejoLabel = manejo === 'continuo' ? 'Continuo' : manejo === 'intensivo' ? 'Intensivo' : 'Rotativo';
        html += _riCard(manejoLabel, 'Manejo (' + (eficiencia * 100).toFixed(0) + '%)');

        html += '</div></div>';
    }

    secciones.innerHTML = html;

    // Renderizar alertas predictivas si existen
    if (typeof alertasPredictivas !== 'undefined' && alertasPredictivas.length > 0) {
        if (typeof renderAlertasPredictivas === 'function') renderAlertasPredictivas();
    }

    // --- Validaciones cruzadas ---
    var validaciones = [];

    // 1. Superficie recursos vs potreros
    if (nPotreros > 0 && supTotal > 0) {
        var supPotreros = 0;
        if (typeof potreros !== 'undefined') potreros.forEach(function(p) { supPotreros += p.superficie || 0; });
        if (supPotreros > 0 && Math.abs(supTotal - supPotreros) > 1) {
            validaciones.push({ tipo: 'warning', msg: 'Superficie de recursos (' + supTotal.toFixed(0) + ' ha) difiere de potreros (' + supPotreros.toFixed(0) + ' ha). Verificar consistencia.' });
        }
    }

    // 2. Balance calculado pero sin rodeo
    if (produccionAnual > 0 && totalCab === 0) {
        validaciones.push({ tipo: 'info', msg: 'Balance calculado pero sin rodeo cargado. Agrega grupos en Lotes/Rodeo para ver la demanda.' });
    }

    // 3. Rodeo cargado pero sin balance
    if (totalCab > 0 && produccionAnual === 0) {
        validaciones.push({ tipo: 'info', msg: 'Rodeo cargado pero sin balance calculado. Configura los recursos en la pestana Balance.' });
    }

    // 4. Grupos con ganancia 0 que no son vacas ni toros
    if (esc && esc.grupos) {
        var gruposSinGanancia = [];
        esc.grupos.forEach(function(g) {
            if (g.ganancia === 0 && g.categoria !== 'vaca' && g.categoria !== 'toro') {
                gruposSinGanancia.push(CATEGORIAS[g.categoria].nombre);
            }
        });
        if (gruposSinGanancia.length > 0) {
            validaciones.push({ tipo: 'warning', msg: 'Grupos con ganancia 0: ' + gruposSinGanancia.join(', ') + '. Verificar si es intencional.' });
        }
    }

    // Renderizar validaciones
    if (validaciones.length > 0) {
        var vHtml = '<div style="margin-top:10px;">';
        validaciones.forEach(function(v) {
            var icon = v.tipo === 'warning' ? '&#9888;' : '&#8505;';
            var bg = v.tipo === 'warning' ? '#fff3e0' : '#e3f2fd';
            var border = v.tipo === 'warning' ? '#ff9800' : '#2196f3';
            vHtml += '<div style="padding:8px 12px;margin:4px 0;border-radius:8px;font-size:0.85em;background:' + bg + ';border-left:4px solid ' + border + ';">' + icon + ' ' + v.msg + '</div>';
        });
        vHtml += '</div>';
        secciones.innerHTML += vHtml;
    }
}

// Helper para generar card de resumen
function _riCard(valor, label, claseEstado, textoEstado) {
    var h = '<div class="resumen-item"><div class="ri-valor">' + valor + '</div><div class="ri-label">' + label + '</div>';
    if (textoEstado) h += '<span class="ri-estado ' + (claseEstado || '') + '">' + textoEstado + '</span>';
    h += '</div>';
    return h;
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

        // Regenerar inputs con meses restaurados y hectareas guardadas
        generarInputsRecursos(data.hectareasRecursos || {});

        // Restaurar escenarios
        if (data.escenarios && data.escenarios.length > 0) {
            escenarios = data.escenarios;
            escenarioActivoId = data.escenarioActivoId || escenarios[0].id;
        }
        if (data.nextId) nextId = data.nextId;
        if (data.potreros) potreros = data.potreros;
        if (data.rotaciones) rotaciones = data.rotaciones;
        if (data.datosClima) datosClima = data.datosClima;

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

            // Regenerar UI con hectareas importadas
            generarInputsRecursos(data.hectareasRecursos || {});

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

// Generar informe imprimible
function generarInforme() {
    var div = document.getElementById('informeImprimible');
    if (!div) return;
    var html = '';
    var fecha = new Date().toLocaleDateString('es-AR');

    // Header
    html += '<div class="informe-header">';
    html += '<h1>Balance Forrajero PRO - Informe</h1>';
    html += '<p>Generado el ' + fecha + '</p>';
    html += '</div>';

    // Datos del campo
    if (configuracionCampo) {
        html += '<div class="informe-seccion"><h2>Datos del Campo</h2>';
        html += '<div class="informe-kpi">';
        html += '<div class="informe-kpi-item"><div class="kpi-label">Superficie</div><div class="kpi-value">' + configuracionCampo.superficie + ' ha</div></div>';
        var nRec = recursosActivos ? recursosActivos.length : 0;
        html += '<div class="informe-kpi-item"><div class="kpi-label">Recursos</div><div class="kpi-value">' + nRec + '</div></div>';
        if (configuracionCampo.produccionAnual) {
            html += '<div class="informe-kpi-item"><div class="kpi-label">Produccion anual</div><div class="kpi-value">' + formatNumCompact(configuracionCampo.produccionAnual) + ' kg MS</div></div>';
        }
        html += '</div>';

        // Tabla de recursos
        if (configuracionCampo.recursos && configuracionCampo.recursos.length > 0) {
            html += '<table><thead><tr><th>Recurso</th><th>Hectareas</th></tr></thead><tbody>';
            configuracionCampo.recursos.forEach(function(rc) {
                html += '<tr><td>' + rc.recurso + '</td><td>' + rc.hectareas + '</td></tr>';
            });
            html += '</tbody></table>';
        }
        html += '</div>';
    }

    // Rodeo
    var esc = getEscenarioActivo();
    if (esc && esc.grupos.length > 0) {
        html += '<div class="informe-seccion"><h2>Rodeo - ' + esc.nombre + '</h2>';
        var totalCab = esc.grupos.reduce(function(s,g) { return s + g.cantidad; }, 0);
        html += '<div class="informe-kpi">';
        html += '<div class="informe-kpi-item"><div class="kpi-label">Grupos</div><div class="kpi-value">' + esc.grupos.length + '</div></div>';
        html += '<div class="informe-kpi-item"><div class="kpi-label">Cabezas</div><div class="kpi-value">' + totalCab + '</div></div>';
        html += '</div>';

        html += '<table><thead><tr><th>Categoria</th><th>Cab</th><th>Peso ini</th><th>Ganancia</th><th>Entrada</th><th>Salida</th></tr></thead><tbody>';
        esc.grupos.forEach(function(g) {
            var cat = CATEGORIAS[g.categoria];
            html += '<tr><td>' + cat.nombre + '</td><td>' + g.cantidad + '</td><td>' + g.pesoInicial + ' kg</td>';
            html += '<td>' + g.ganancia + ' kg/d</td><td>' + g.fechaEntrada + '</td><td>' + g.fechaSalida + '</td></tr>';
        });
        html += '</tbody></table></div>';
    }

    // Balance forrajero (copiar tabla de produccion si existe)
    var tablaProduccion = document.getElementById('tablaProduccionRecursos');
    if (tablaProduccion && tablaProduccion.innerHTML) {
        html += '<div class="informe-seccion"><h2>Produccion Forrajera por Recurso</h2>';
        html += tablaProduccion.innerHTML;
        html += '</div>';
    }

    // Tabla detalle mensual (oferta vs demanda)
    var tablaDetMensual = document.getElementById('tablaDetalleMensualBody');
    if (tablaDetMensual && tablaDetMensual.innerHTML) {
        html += '<div class="informe-seccion"><h2>Balance Oferta - Demanda Mensual</h2>';
        html += '<table><thead><tr><th>Mes</th><th>Oferta (kg MS)</th><th>Demanda (kg MS)</th><th>Balance</th><th>Estado</th></tr></thead><tbody>';
        html += tablaDetMensual.innerHTML;
        html += '</tbody></table></div>';
    }

    // Resultados economicos (copiar tablas si existen)
    var tablaDetEco = document.getElementById('tablaDetalleEconomico');
    if (tablaDetEco && tablaDetEco.innerHTML) {
        html += '<div class="informe-seccion"><h2>Resultado Economico</h2>';

        // KPIs economicos
        html += '<div class="informe-kpi">';
        var ecoIds = ['inversionTotal', 'ingresoTotal', 'margenBrutoTotal', 'margenBrutoHa', 'margenNetoTotal'];
        var ecoLabels = ['Inversion', 'Ingreso Bruto', 'Margen Bruto', 'Margen Bruto/ha', 'Margen Neto'];
        ecoIds.forEach(function(id, i) {
            var el = document.getElementById(id);
            if (el) {
                var val = el.title || el.textContent;
                html += '<div class="informe-kpi-item"><div class="kpi-label">' + ecoLabels[i] + '</div><div class="kpi-value" style="color:' + (el.style.color || '#2c3e50') + ';">' + val + '</div></div>';
            }
        });
        html += '</div>';

        html += '<h3 style="font-size:1em;margin:12px 0 6px;">Detalle por grupo</h3>';
        html += tablaDetEco.innerHTML;

        var tablaCostos = document.getElementById('tablaComposicionCostos');
        if (tablaCostos && tablaCostos.innerHTML) {
            html += '<h3 style="font-size:1em;margin:12px 0 6px;">Composicion de costos</h3>';
            html += tablaCostos.innerHTML;
        }

        var tablaSens = document.getElementById('tablaSensibilidad');
        if (tablaSens && tablaSens.innerHTML) {
            html += '<h3 style="font-size:1em;margin:12px 0 6px;">Sensibilidad de precios</h3>';
            html += tablaSens.innerHTML;
        }
        html += '</div>';
    }

    // Footer
    html += '<div class="informe-footer">Balance Forrajero PRO v6.0 | ' + fecha + '</div>';

    div.innerHTML = html;
    setTimeout(function() { window.print(); }, 100);
}
