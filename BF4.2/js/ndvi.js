// ============================================
// BALANCE FORRAJERO PRO v6.0 - NDVI Satelital (base)
// ============================================

// Modelo de correlacion NDVI → produccion
function calcularFactorNDVI(ndviValor) {
    if (ndviValor === null || ndviValor === undefined) return 1;

    // NDVI > 0.6 = produccion normal/buena
    // NDVI 0.4-0.6 = produccion reducida
    // NDVI < 0.4 = estres hidrico / baja produccion
    if (ndviValor >= 0.6) return 1.0 + (ndviValor - 0.6) * 0.5; // hasta 1.2
    if (ndviValor >= 0.4) return 0.6 + (ndviValor - 0.4) * 2.0; // 0.6 a 1.0
    return Math.max(0.3, ndviValor / 0.4 * 0.6); // 0.3 a 0.6
}

function getNDVICategoria(ndviValor) {
    if (ndviValor === null) return { texto: 'Sin datos', color: '#999' };
    if (ndviValor >= 0.6) return { texto: 'Bueno', color: '#27ae60' };
    if (ndviValor >= 0.4) return { texto: 'Moderado', color: '#f39c12' };
    return { texto: 'Bajo', color: '#e74c3c' };
}

// Renderizar tab NDVI
function renderTabNDVI() {
    var container = document.getElementById('ndviContenido');
    if (!container) return;

    var html = '';

    html += '<div class="section"><h2>NDVI Satelital</h2>';
    html += '<div class="alert alert-warning"><strong>Fase en desarrollo:</strong> La integracion con Sentinel Hub o Copernicus Data Space requiere registro y API key. Por ahora se ofrece un simulador para entender la correlacion NDVI-produccion.</div>';

    // Coordenadas
    html += '<div class="input-grid" style="max-width:600px;">';
    html += '<div class="input-group"><label>Latitud</label><input type="number" id="ndviLatitud" step="0.01" value="' + datosNDVI.latitud + '"></div>';
    html += '<div class="input-group"><label>Longitud</label><input type="number" id="ndviLongitud" step="0.01" value="' + datosNDVI.longitud + '"></div>';
    html += '</div>';

    // Simulador NDVI manual
    html += '<h3>Simulador NDVI</h3>';
    html += '<div class="input-grid" style="max-width:400px;">';
    html += '<div class="input-group"><label>Valor NDVI (0 a 1)</label>';
    html += '<input type="range" id="ndviValorSlider" min="0" max="1" step="0.05" value="0.55" oninput="actualizarNDVISimulacion()">';
    html += '<div style="text-align:center;font-size:1.3em;font-weight:700;" id="ndviValorDisplay">0.55</div>';
    html += '</div></div>';

    html += '<div id="ndviResultado"></div>';
    html += '</div>';

    // Escala de referencia
    html += '<div class="section"><h2>Escala de referencia NDVI</h2>';
    html += '<div class="ndvi-barra">';
    html += '<div class="ndvi-segmento" style="background:#8B4513;">0-0.2 Suelo</div>';
    html += '<div class="ndvi-segmento" style="background:#DAA520;">0.2-0.4 Bajo</div>';
    html += '<div class="ndvi-segmento" style="background:#9ACD32;">0.4-0.6 Moderado</div>';
    html += '<div class="ndvi-segmento" style="background:#228B22;">0.6-0.8 Bueno</div>';
    html += '<div class="ndvi-segmento" style="background:#006400;">0.8-1.0 Excelente</div>';
    html += '</div>';

    html += '<table><thead><tr><th>Rango NDVI</th><th>Interpretacion</th><th>Factor produccion</th><th>Accion sugerida</th></tr></thead><tbody>';
    html += '<tr><td>< 0.2</td><td>Suelo desnudo / sin vegetacion</td><td>0.15 - 0.30</td><td>Revisar cobertura, posible sobrepastoreo severo</td></tr>';
    html += '<tr><td>0.2 - 0.4</td><td>Vegetacion escasa / estres hidrico</td><td>0.30 - 0.60</td><td>Reducir carga, evaluar suplementacion</td></tr>';
    html += '<tr><td>0.4 - 0.6</td><td>Vegetacion moderada</td><td>0.60 - 1.00</td><td>Monitorear, ajustar segun tendencia</td></tr>';
    html += '<tr><td>0.6 - 0.8</td><td>Vegetacion vigorosa</td><td>1.00 - 1.10</td><td>Condiciones normales/buenas</td></tr>';
    html += '<tr><td>> 0.8</td><td>Vegetacion muy densa</td><td>1.10 - 1.20</td><td>Optimo, considerar mayor carga</td></tr>';
    html += '</tbody></table></div>';

    container.innerHTML = html;

    // Trigger simulacion inicial
    actualizarNDVISimulacion();
}

function actualizarNDVISimulacion() {
    var slider = document.getElementById('ndviValorSlider');
    var display = document.getElementById('ndviValorDisplay');
    var resultado = document.getElementById('ndviResultado');
    if (!slider || !resultado) return;

    var ndvi = parseFloat(slider.value);
    display.textContent = ndvi.toFixed(2);

    var factor = calcularFactorNDVI(ndvi);
    var cat = getNDVICategoria(ndvi);

    var html = '<div class="card-grid" style="margin-top:15px;">';
    html += '<div class="card"><div class="card-title">NDVI</div><div class="card-value" style="color:' + cat.color + ';">' + ndvi.toFixed(2) + '</div><div class="card-unit">' + cat.texto + '</div></div>';
    html += '<div class="card"><div class="card-title">Factor produccion</div><div class="card-value">' + factor.toFixed(2) + '</div><div class="card-unit">multiplicador</div></div>';
    html += '<div class="card"><div class="card-title">Efecto</div><div class="card-value" style="color:' + (factor >= 1 ? '#27ae60' : '#e74c3c') + ';">' + ((factor - 1) * 100).toFixed(0) + '%</div><div class="card-unit">vs normal</div></div>';
    html += '</div>';

    // Barra visual
    html += '<div style="margin-top:10px;position:relative;height:30px;">';
    html += '<div class="ndvi-barra">';
    html += '<div class="ndvi-segmento" style="background:#8B4513;"></div>';
    html += '<div class="ndvi-segmento" style="background:#DAA520;"></div>';
    html += '<div class="ndvi-segmento" style="background:#9ACD32;"></div>';
    html += '<div class="ndvi-segmento" style="background:#228B22;"></div>';
    html += '<div class="ndvi-segmento" style="background:#006400;"></div>';
    html += '</div>';
    html += '<div style="position:absolute;left:' + (ndvi * 100) + '%;top:-5px;transform:translateX(-50%);font-size:1.5em;">&#9660;</div>';
    html += '</div>';

    resultado.innerHTML = html;
}
