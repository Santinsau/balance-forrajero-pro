// ============================================
// BALANCE FORRAJERO PRO v6.0 - Nutricion / Ganancia Dinamica
// (c) 2025-2026 Santiago Jose Insaurralde.
// Todos los derechos reservados.
// ============================================

// Calcular ganancia diaria basada en calidad del forraje (modelo NRC simplificado)
function calcularGananciaDinamica(pesoVivo, recurso, mesIndex) {
    var perfil = PERFIL_NUTRICIONAL[recurso];
    if (!perfil) return 0;

    var estacion = getEstacion(mesIndex);
    var calidad = perfil.calidadEstacional[estacion] || perfil;

    var fdn = calidad.fdn;
    var em = calidad.energiaMetab;

    // Consumo voluntario ajustado por FDN (% del PV)
    var consumoMS = pesoVivo * 0.025 * (1 - fdn / 100 * 0.6);

    // Energia disponible
    var energiaDisponible = consumoMS * em;

    // Energia de mantenimiento (NRC simplificado)
    var energiaMantenimiento = 0.077 * Math.pow(pesoVivo, 0.75);

    // Energia para ganancia
    var energiaGanancia = energiaDisponible - energiaMantenimiento;

    // Ganancia en kg/dia - costo energetico con rendimientos decrecientes
    // A mayor excedente energetico, menor eficiencia de conversion (NRC ajustado)
    var costoPorKg = 5.4 * (1 + Math.max(0, energiaGanancia) / 15);
    var ganancia = energiaGanancia > 0 ? Math.min(1.5, energiaGanancia / costoPorKg) : 0;

    return {
        ganancia: Math.round(ganancia * 1000) / 1000,
        consumoMS: Math.round(consumoMS * 100) / 100,
        energiaDisponible: Math.round(energiaDisponible * 100) / 100,
        energiaMantenimiento: Math.round(energiaMantenimiento * 100) / 100,
        energiaGanancia: Math.round(energiaGanancia * 100) / 100,
        proteina: calidad.proteina,
        fdn: calidad.fdn,
        digestibilidad: calidad.digestibilidad,
        em: calidad.energiaMetab
    };
}

// Calcular ganancia mensual para un grupo completo
function calcularGananciaMensualGrupo(grupo, recurso) {
    var ganancias = [];
    var pesoActual = grupo.pesoInicial;
    var entrada = new Date(grupo.fechaEntrada);
    var salida = new Date(grupo.fechaSalida);

    // Iterar mes a mes desde entrada hasta salida (puede cruzar anos)
    // Primero, marcar todos los meses como inactivos
    for (var i = 0; i < 12; i++) {
        ganancias.push({ mes: i, ganancia: 0, activo: false });
    }

    var mesActual = new Date(entrada.getFullYear(), entrada.getMonth(), 1);
    var mesFinal = new Date(salida.getFullYear(), salida.getMonth(), 1);

    while (mesActual <= mesFinal) {
        var mesIdx = mesActual.getMonth();

        var resultado = calcularGananciaDinamica(pesoActual, recurso, mesIdx);
        ganancias[mesIdx] = {
            mes: mesIdx,
            ganancia: resultado.ganancia,
            consumoMS: resultado.consumoMS,
            energiaDisponible: resultado.energiaDisponible,
            pesoPromedio: pesoActual,
            activo: true
        };

        // Avanzar peso
        pesoActual += resultado.ganancia * 30;
        mesActual.setMonth(mesActual.getMonth() + 1);
    }

    return ganancias;
}

// Calcular deficit y suplementacion necesaria
function calcularDeficitNutricional(grupo, recurso, gananciaObjetivo) {
    var sugerencias = [];
    var pesoActual = grupo.pesoInicial;
    var entrada = new Date(grupo.fechaEntrada);
    var salida = new Date(grupo.fechaSalida);

    // Iterar mes a mes desde entrada hasta salida (puede cruzar anos)
    var mesActual = new Date(entrada.getFullYear(), entrada.getMonth(), 1);
    var mesFinal = new Date(salida.getFullYear(), salida.getMonth(), 1);

    while (mesActual <= mesFinal) {
        var mesIdx = mesActual.getMonth();

        var resultado = calcularGananciaDinamica(pesoActual, recurso, mesIdx);

        if (resultado.ganancia < gananciaObjetivo) {
            var deficitGanancia = gananciaObjetivo - resultado.ganancia;
            var deficitEnergia = deficitGanancia * 5.4; // Mcal/dia

            var kgGranoMaiz = deficitEnergia / SUPLEMENTOS_REFERENCIA["Grano de maiz"].energiaMetab;

            sugerencias.push({
                mes: mesIdx,
                mesNombre: MESES_NOMBRES[mesIdx],
                gananciaBase: resultado.ganancia,
                gananciaObjetivo: gananciaObjetivo,
                deficitGanancia: deficitGanancia,
                deficitEnergia: deficitEnergia,
                kgGranoMaiz: Math.round(kgGranoMaiz * 10) / 10,
                pesoPromedio: pesoActual
            });
        }

        pesoActual += Math.max(resultado.ganancia, gananciaObjetivo) * 30;
        mesActual.setMonth(mesActual.getMonth() + 1);
    }

    return sugerencias;
}

// --- INTERFAZ NUTRICION ---

function renderTabNutricion() {
    var container = document.getElementById('nutricionContenido');
    if (!container) return;

    var html = '';

    // Tabla de perfiles nutricionales
    html += '<div class="section"><h2>Perfiles nutricionales por recurso</h2>';
    html += '<div class="alert alert-info">Valores promedio anuales. La calidad varia por estacion (ver detalle debajo).</div>';
    html += '<div class="tabla-scroll"><table><thead><tr><th>Recurso</th><th>Proteina (%PB)</th><th>FDN (%)</th><th>Digestibilidad (%)</th><th>EM (Mcal/kg MS)</th></tr></thead><tbody>';

    datosForrajeros.recursos.forEach(function(r) {
        var p = PERFIL_NUTRICIONAL[r];
        if (!p) return;
        html += '<tr><td>' + r + '</td>';
        html += '<td>' + p.proteina + '</td>';
        html += '<td>' + p.fdn + '</td>';
        html += '<td>' + p.digestibilidad + '</td>';
        html += '<td>' + p.energiaMetab.toFixed(2) + '</td></tr>';
    });

    html += '</tbody></table></div></div>';

    // Simulador de ganancia
    html += '<div class="section"><h2>Simulador de ganancia dinamica</h2>';
    html += '<div class="alert alert-info">Calcula la ganancia diaria estimada segun peso del animal, recurso forrajero y estacion del ano.</div>';
    html += '<div class="input-grid">';
    html += '<div class="input-group"><label>Peso vivo (kg)</label><input type="number" id="nutricionPeso" value="350" min="100"></div>';
    html += '<div class="input-group"><label>Recurso forrajero</label><select id="nutricionRecurso">';
    datosForrajeros.recursos.forEach(function(r) {
        html += '<option value="' + r + '">' + r + '</option>';
    });
    html += '</select></div>';
    html += '<div class="input-group"><label>Mes</label><select id="nutricionMes">';
    for (var m = 0; m < 12; m++) {
        html += '<option value="' + m + '">' + MESES_NOMBRES_LARGO[m] + '</option>';
    }
    html += '</select></div></div>';
    html += '<button class="btn" onclick="simularGanancia()">Simular</button>';
    html += '<div id="resultadoSimulacion" style="margin-top:20px;"></div>';
    html += '</div>';

    // Ganancia por grupo (si hay grupos)
    html += '<div class="section"><h2>Ganancia estimada por grupo</h2>';
    html += '<div class="alert alert-info">Comparacion de ganancia manual vs calculada para cada grupo del escenario activo.</div>';
    html += '<div id="gananciaGruposContainer"></div>';
    html += '</div>';

    // Suplementacion
    html += '<div class="section"><h2>Sugerencia de suplementacion</h2>';
    html += '<div class="alert alert-info">Cuando la ganancia calculada es menor que la objetivo, se sugiere suplementacion.</div>';
    html += '<div id="suplementacionContainer"></div>';
    html += '</div>';

    container.innerHTML = html;

    renderGananciaGrupos();
}

function simularGanancia() {
    var peso = parseFloat(document.getElementById('nutricionPeso').value) || 350;
    var recurso = document.getElementById('nutricionRecurso').value;
    var mes = parseInt(document.getElementById('nutricionMes').value);

    var resultado = calcularGananciaDinamica(peso, recurso, mes);
    var estacion = getEstacionNombre(mes);

    var html = '<div class="nutricion-grid">';
    html += '<div class="nutricion-card"><h4>Ganancia estimada</h4>';
    html += '<div style="font-size:2em;font-weight:700;color:#27ae60;">' + resultado.ganancia.toFixed(3) + ' kg/dia</div>';
    html += '<div class="nutricion-detalle" style="margin-top:10px;">';
    html += '<span>Estacion: ' + estacion + '</span>';
    html += '</div></div>';

    html += '<div class="nutricion-card"><h4>Consumo estimado</h4>';
    html += '<div style="font-size:1.5em;font-weight:700;color:#3498db;">' + resultado.consumoMS.toFixed(1) + ' kg MS/dia</div>';
    html += '<div class="nutricion-detalle"><span>' + (resultado.consumoMS / peso * 100).toFixed(1) + '% del PV</span></div></div>';

    html += '<div class="nutricion-card"><h4>Balance energetico</h4>';
    html += '<div class="nutricion-detalle">';
    html += '<div>Disponible: ' + resultado.energiaDisponible.toFixed(1) + ' Mcal/dia</div>';
    html += '<div>Mantenimiento: ' + resultado.energiaMantenimiento.toFixed(1) + ' Mcal/dia</div>';
    html += '<div style="font-weight:700;color:' + (resultado.energiaGanancia > 0 ? '#27ae60' : '#e74c3c') + ';">Para ganancia: ' + resultado.energiaGanancia.toFixed(1) + ' Mcal/dia</div>';
    html += '</div></div>';

    html += '<div class="nutricion-card"><h4>Calidad del forraje (' + estacion + ')</h4>';
    html += '<div class="nutricion-detalle">';
    html += '<div>Proteina: ' + resultado.proteina + '% PB</div>';
    html += '<div>FDN: ' + resultado.fdn + '%</div>';
    html += '<div>Digestibilidad: ' + resultado.digestibilidad + '%</div>';
    html += '<div>EM: ' + resultado.em.toFixed(2) + ' Mcal/kg MS</div>';
    html += '</div>';

    // Barras visuales
    html += '<div style="margin-top:10px;">';
    html += '<div style="font-size:0.8em;color:#777;">Proteina</div><div class="nutricion-barra"><div class="nutricion-barra-fill" style="width:' + Math.min(100, resultado.proteina / 25 * 100) + '%;background:#3498db;"></div></div>';
    html += '<div style="font-size:0.8em;color:#777;">Energia</div><div class="nutricion-barra"><div class="nutricion-barra-fill" style="width:' + Math.min(100, resultado.em / 3.2 * 100) + '%;background:#27ae60;"></div></div>';
    html += '<div style="font-size:0.8em;color:#777;">FDN (menor=mejor)</div><div class="nutricion-barra"><div class="nutricion-barra-fill" style="width:' + resultado.fdn + '%;background:#e74c3c;"></div></div>';
    html += '</div></div></div>';

    document.getElementById('resultadoSimulacion').innerHTML = html;
}

function renderGananciaGrupos() {
    var container = document.getElementById('gananciaGruposContainer');
    if (!container) return;

    var esc = getEscenarioActivo();
    if (!esc || esc.grupos.length === 0) {
        container.innerHTML = '<p style="color:#999;">No hay grupos cargados en el escenario activo.</p>';
        return;
    }

    // Determinar recurso principal (el de mayor superficie)
    var recursoPrincipal = datosForrajeros.recursos[0];
    if (configuracionCampo && configuracionCampo.recursos.length > 0) {
        var maxHa = 0;
        configuracionCampo.recursos.forEach(function(r) {
            if (r.hectareas > maxHa) {
                maxHa = r.hectareas;
                recursoPrincipal = r.recurso;
            }
        });
    }

    var html = '<div class="alert alert-info">Recurso principal usado para calculo: <strong>' + recursoPrincipal + '</strong></div>';

    esc.grupos.forEach(function(grupo) {
        var cat = CATEGORIAS[grupo.categoria];
        var ganancias = calcularGananciaMensualGrupo(grupo, recursoPrincipal);

        html += '<h3>' + cat.nombre + ' (' + grupo.cantidad + ' cab, ' + grupo.pesoInicial + ' kg)</h3>';
        html += '<table><thead><tr><th>Mes</th><th>Peso prom.</th><th>Gan. manual</th><th>Gan. calculada</th><th>Diferencia</th><th>Consumo MS</th></tr></thead><tbody>';

        ganancias.forEach(function(g) {
            if (!g.activo) return;
            var dif = g.ganancia - grupo.ganancia;
            var colorDif = dif >= 0 ? '#27ae60' : '#e74c3c';
            html += '<tr>';
            html += '<td>' + MESES_NOMBRES[g.mes] + '</td>';
            html += '<td>' + Math.round(g.pesoPromedio) + ' kg</td>';
            html += '<td>' + grupo.ganancia.toFixed(3) + '</td>';
            html += '<td style="font-weight:700;">' + g.ganancia.toFixed(3) + '</td>';
            html += '<td style="color:' + colorDif + ';font-weight:700;">' + (dif >= 0 ? '+' : '') + dif.toFixed(3) + '</td>';
            html += '<td>' + (g.consumoMS || 0).toFixed(1) + ' kg/dia</td>';
            html += '</tr>';
        });

        html += '</tbody></table>';

        // Suplementacion si hay deficit
        var suplementacion = calcularDeficitNutricional(grupo, recursoPrincipal, grupo.ganancia);
        if (suplementacion.length > 0) {
            html += '<div class="alert alert-warning"><strong>Suplementacion necesaria para alcanzar ' + grupo.ganancia + ' kg/dia:</strong></div>';
            html += '<table><thead><tr><th>Mes</th><th>Gan. base</th><th>Deficit</th><th>Grano maiz (kg/cab/dia)</th></tr></thead><tbody>';
            suplementacion.forEach(function(s) {
                html += '<tr>';
                html += '<td>' + s.mesNombre + '</td>';
                html += '<td>' + s.gananciaBase.toFixed(3) + '</td>';
                html += '<td style="color:#e74c3c;">' + s.deficitGanancia.toFixed(3) + ' kg/dia</td>';
                html += '<td>' + s.kgGranoMaiz + '</td>';
                html += '</tr>';
            });
            html += '</tbody></table>';
        }
    });

    container.innerHTML = html;
}
