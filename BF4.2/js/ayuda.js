// ============================================
// BALANCE FORRAJERO PRO v6.0 - Sistema de Ayuda
// ============================================

var INSTRUCTIVOS = {

    balance: {
        titulo: 'Como usar: Balance Forrajero',
        contenido: '\
<p>El balance forrajero estima cuanta <strong>materia seca (MS)</strong> produce tu campo a lo largo del ano, mes a mes.</p>\
<h4>Pasos para calcular</h4>\
<ol>\
<li><strong>Mes de inicio:</strong> Selecciona cuando arranca tu ejercicio ganadero (tipicamente julio para zona pampeana).</li>\
<li><strong>Recursos y hectareas:</strong> Ingresa las hectareas de cada recurso forrajero. Si definiste potreros en la pestana "Potreros", las hectareas se sincronizan automaticamente.</li>\
<li><strong>Meses de uso:</strong> Clickea los botones de cada mes para activar/desactivar. Los meses grises no aportan produccion (ej: verdeos de invierno no producen en verano).</li>\
<li><strong>Ajuste de productividad:</strong> Slider del 50% al 150%. Usalo para simular anos secos (70-80%) o muy buenos (120-130%).</li>\
<li><strong>Escenario climatico:</strong> "Comparar los 3" es lo mas util: muestra curvas de ano bueno, promedio y malo superpuestas.</li>\
<li><strong>Manejo del pastoreo:</strong> Determina que porcentaje del forraje producido realmente se aprovecha:\
    <ul>\
    <li>Continuo (55%): pastoreo sin subdivision, se desperdicia mucho por pisoteo y seleccion.</li>\
    <li>Rotativo (72.5%): subdivision en potreros con descanso, buen balance costo/eficiencia.</li>\
    <li>Intensivo (82.5%): parcelas chicas, alta frecuencia de movimiento, maxima eficiencia.</li>\
    </ul>\
</li>\
<li>Pulsa <strong>"Calcular Balance"</strong> para ver resultados.</li>\
</ol>\
<h4>Interpretacion de resultados</h4>\
<ul>\
<li><strong>Produccion Anual (kg MS/ano):</strong> Total bruto del campo. No es lo que come el animal, hay perdidas.</li>\
<li><strong>Carga Max Teorica (EV/ha):</strong> Techo de carga. Un Equivalente Vaca (EV) consume ~10 kg MS/dia = 3.650 kg MS/ano.</li>\
<li><strong>Produccion/ha:</strong> Productividad promedio. Campos buenos de pampa humeda: 6.000-9.000 kg MS/ha/ano.</li>\
<li><strong>Grafico de lineas:</strong> Produccion total mensual. Busca los baches invernales: ahi es donde vas a necesitar reservas o suplementacion.</li>\
<li><strong>Grafico apilado:</strong> Cuanto aporta cada recurso. Util para ver si un recurso domina o hay buena diversificacion.</li>\
<li><strong>Tabla por recurso:</strong> Detalle numerico mes a mes de cada recurso.</li>\
</ul>\
<div class="tip"><strong>Tip:</strong> Si cargaste datos de clima en la pestana "Clima", la produccion se ajusta automaticamente segun precipitaciones reales. El factor aparece en las alertas.</div>\
<div class="tip"><strong>Tip:</strong> Si es tu primera vez, pulsa "Cargar ejemplo" en la barra superior para ver datos precargados y entender la mecanica.</div>'
    },

    lotes: {
        titulo: 'Como usar: Lotes y Rodeo',
        contenido: '\
<p>Aca configuras los <strong>animales</strong> que van a consumir el forraje. Podes armar distintos <strong>escenarios</strong> (rodeos alternativos) para comparar estrategias.</p>\
<h4>Conceptos clave</h4>\
<ul>\
<li><strong>Escenario:</strong> Un rodeo completo (conjunto de grupos). Podes tener varios y compararlos en la pestana "Comparador".</li>\
<li><strong>Grupo:</strong> Un lote de animales de la misma categoria (ej: 100 novillos de 350 kg).</li>\
<li><strong>EV (Equivalente Vaca):</strong> Unidad de medida de consumo. 1 EV = vaca de 400 kg con cria al pie = ~10 kg MS/dia.</li>\
</ul>\
<h4>Pasos para cargar animales</h4>\
<ol>\
<li><strong>Escenario activo:</strong> Por defecto tenes "Escenario Base". Usa "+ Nuevo" para crear alternativas o "Duplicar" para copiar uno existente y modificarlo.</li>\
<li><strong>Categoria:</strong> Selecciona tipo de animal. Los pesos y ganancias por defecto se ajustan automaticamente segun la categoria.</li>\
<li><strong>Cantidad:</strong> Cabezas del grupo.</li>\
<li><strong>Peso inicial:</strong> Peso al momento del ingreso (kg vivo).</li>\
<li><strong>Ganancia diaria:</strong> kg/dia esperados. Valores tipicos:\
    <ul>\
    <li>Terneros/as: 0.4-0.6 kg/dia</li>\
    <li>Novillitos: 0.5-0.7 kg/dia</li>\
    <li>Novillos en pastura: 0.6-0.9 kg/dia</li>\
    <li>Vacas adultas (mantenimiento): 0.0 kg/dia</li>\
    </ul>\
</li>\
<li><strong>Modo ganancia:</strong>\
    <ul>\
    <li>"Manual": vos definis el valor fijo para todo el periodo.</li>\
    <li>"Calculada (NRC)": el modelo estima la ganancia mes a mes segun la calidad del forraje. Ver pestana "Nutricion" para detalles.</li>\
    </ul>\
</li>\
<li><strong>Fechas:</strong> Fecha de ingreso y salida. Puede cruzar de un ano al siguiente (ej: noviembre a abril). Tambien podes elegir "Peso objetivo" y se calcula la fecha de salida automaticamente.</li>\
<li><strong>Datos economicos (desplegable):</strong> Precio de compra y venta ($/kg vivo) y costo de sanidad ($/cabeza). Se usan en la pestana "Economico".</li>\
</ol>\
<div class="tip"><strong>Tip:</strong> Duplica el escenario base, cambia la cantidad de cabezas o la ganancia, y luego compara ambos en la pestana "Comparador" para ver el impacto en carga y deficit.</div>\
<div class="ejemplo"><strong>Ejemplo tipico:</strong> 100 novillos de 350 kg, ganancia 0.7 kg/dia, ingreso 1 de marzo, salida 30 de noviembre. Precio compra $1.200/kg, venta $1.400/kg, sanidad $5.000/cab.</div>'
    },

    potreros: {
        titulo: 'Como usar: Potreros y Rotaciones',
        contenido: '\
<p>Esta pestana permite definir los <strong>potreros fisicos</strong> de tu campo, asignarles un recurso forrajero, y <strong>planificar rotaciones</strong> con un diagrama Gantt visual.</p>\
<h4>Parte 1: Definir potreros</h4>\
<ol>\
<li><strong>Nombre:</strong> Identifica cada potrero (ej: "Potrero Norte", "Lote 3", etc.).</li>\
<li><strong>Superficie (ha):</strong> Hectareas del potrero.</li>\
<li><strong>Recurso forrajero:</strong> Que hay sembrado/implantado (pastura, verdeo, campo natural).</li>\
<li><strong>Aguada:</strong> Marca si tiene acceso a agua. Util para planificar rotaciones.</li>\
<li>Pulsa <strong>"Agregar potrero"</strong>.</li>\
</ol>\
<div class="tip"><strong>Importante:</strong> Al definir potreros, las hectareas por recurso se sincronizan automaticamente con la pestana "Balance". No necesitas cargar las hectareas en ambos lados.</div>\
<h4>Parte 2: Planificar rotaciones</h4>\
<ol>\
<li>Primero carga al menos un <strong>grupo de animales</strong> en la pestana "Lotes".</li>\
<li>Pulsa <strong>"Actualizar listas"</strong> para que aparezcan los grupos y potreros en los selectores.</li>\
<li>Selecciona un <strong>grupo</strong>, un <strong>potrero</strong>, la <strong>fecha de ingreso</strong> y los <strong>dias de ocupacion</strong>.</li>\
<li>Pulsa <strong>"Agregar rotacion"</strong>.</li>\
<li>Repeti para planificar todo el ejercicio.</li>\
</ol>\
<h4>El diagrama Gantt</h4>\
<ul>\
<li>Eje horizontal: los 12 meses del ejercicio (desde el mes de inicio configurado en Balance).</li>\
<li>Eje vertical: cada potrero.</li>\
<li>Barras de colores: representan periodos donde un grupo ocupa ese potrero.</li>\
<li>Util para visualizar si hay solapamientos, potreros sin uso, o descansos muy cortos.</li>\
</ul>\
<h4>Regla de descanso</h4>\
<p>El sistema alerta si el descanso entre pastoreos es insuficiente. La regla general es:</p>\
<p style="text-align:center;font-size:1.1em;"><strong>Descanso minimo = Dias de ocupacion x (N potreros - 1)</strong></p>\
<div class="ejemplo"><strong>Ejemplo:</strong> Con 5 potreros y 7 dias de ocupacion, el descanso minimo es 7 x 4 = 28 dias. Si rotaciones de 14 dias: 14 x 4 = 56 dias de descanso.</div>\
<h4>Indicadores</h4>\
<ul>\
<li><strong>Carga instantanea (EV/ha):</strong> Carga durante la ocupacion. Es mas alta que la carga promedio porque los animales estan concentrados.</li>\
<li><strong>Descanso promedio:</strong> Media de dias de descanso entre pastoreos sucesivos.</li>\
<li><strong>Descanso insuficiente:</strong> Cantidad de rotaciones donde el descanso fue menor al minimo. Si es > 0, revisalo.</li>\
</ul>\
<div class="tip"><strong>Tip:</strong> Las tarjetas de potreros muestran el estado actual: <span style="color:#2e7d32;">Disponible</span> / <span style="color:#c62828;">Ocupado</span> / <span style="color:#e65100;">En descanso</span>.</div>'
    },

    ofertademanda: {
        titulo: 'Como usar: Oferta vs Demanda',
        contenido: '\
<p>Este analisis cruza la <strong>produccion forrajera</strong> (oferta) con el <strong>consumo animal</strong> (demanda) para detectar meses con deficit o excedente.</p>\
<h4>Requisitos previos</h4>\
<ol>\
<li>Haber calculado el <strong>Balance</strong> (pestana Balance).</li>\
<li>Haber cargado al menos un <strong>grupo de animales</strong> (pestana Lotes).</li>\
</ol>\
<h4>Que hace el analisis</h4>\
<ul>\
<li>Calcula la <strong>oferta aprovechable</strong> = produccion x eficiencia de pastoreo.</li>\
<li>Calcula el <strong>consumo mensual</strong> de cada grupo segun su peso, ganancia y dias presentes.</li>\
<li>Aplica <strong>diferimiento</strong>: el forraje sobrante de un mes se transfiere al siguiente (con 5% de perdida mensual por deterioro).</li>\
<li>El <strong>stock inicial de MS</strong> (configurado en Balance) se suma al primer mes como reserva previa.</li>\
</ul>\
<h4>Interpretacion</h4>\
<ul>\
<li><strong>Tasa de Uso:</strong> Demanda / Oferta aprovechable. Ideal: 70-85%. Mayor a 100% = sobrecarga.</li>\
<li><strong>Carga Real vs Carga Max:</strong> Si la real supera la maxima, estas sobreexigiendo el campo.</li>\
<li><strong>Meses en DEFICIT (rojo):</strong> No alcanza el forraje. Opciones: reducir carga, suplementar, diferir de meses sobrantes.</li>\
<li><strong>Grafico Oferta vs Demanda:</strong> Las barras verdes deben superar a las rojas. La linea azul es el balance neto.</li>\
<li><strong>Grafico Diferimiento:</strong> Muestra como se acumula y gasta la reserva de pasto diferido.</li>\
</ul>\
<h4>Suplementacion sugerida</h4>\
<p>Si hay meses con deficit, la app calcula automaticamente cuantos kg de suplemento se necesitan para cubrir el bache. Aparece al final de esta pestana.</p>\
<div class="tip"><strong>Tip:</strong> Si el deficit es solo en 1-2 meses de invierno, a menudo conviene diferir forraje de otono (dejar potreros sin pastorear en abril-mayo) antes que comprar suplemento.</div>'
    },

    nutricion: {
        titulo: 'Como usar: Nutricion y Ganancia Dinamica',
        contenido: '\
<p>Esta pestana permite <strong>estimar la ganancia diaria</strong> de un animal segun la calidad del forraje que consume, usando un modelo simplificado del NRC (National Research Council).</p>\
<h4>Tabla de perfiles nutricionales</h4>\
<p>Muestra los valores promedio de cada recurso:</p>\
<ul>\
<li><strong>Proteina (%PB):</strong> Proteina bruta. Alfalfa ~18%, campo natural ~8%. Debajo de 7% limita el consumo.</li>\
<li><strong>FDN (%):</strong> Fibra Detergente Neutro. A mayor FDN, menor consumo voluntario. Campo natural ~68%, alfalfa ~42%.</li>\
<li><strong>Digestibilidad (%):</strong> Que % del forraje comido realmente se aprovecha. Buenas pasturas: >60%.</li>\
<li><strong>EM (Mcal/kg MS):</strong> Energia metabolizable. Es la "nafta" del forraje. Buenas pasturas: >2.3 Mcal.</li>\
</ul>\
<p>Estos valores <strong>varian por estacion</strong>: en primavera la calidad es mejor (mas proteina, menos fibra) y en invierno peor.</p>\
<h4>Simulador de ganancia</h4>\
<ol>\
<li>Ingresa el <strong>peso del animal</strong> (kg vivo).</li>\
<li>Selecciona el <strong>recurso forrajero</strong> que esta pastoreando.</li>\
<li>Selecciona el <strong>mes</strong> para considerar la calidad estacional.</li>\
<li>Pulsa <strong>"Simular"</strong> para ver la ganancia estimada y el desglose energetico.</li>\
</ol>\
<h4>Como funciona el modelo</h4>\
<p>La ganancia se calcula asi:</p>\
<ol>\
<li><strong>Consumo:</strong> Cuanto come por dia (depende del peso y la fibra del forraje).</li>\
<li><strong>Energia disponible:</strong> Consumo x Energia del forraje.</li>\
<li><strong>Mantenimiento:</strong> Cuanta energia gasta solo para vivir (sin engordar).</li>\
<li><strong>Ganancia:</strong> La energia sobrante despues de mantenimiento se convierte en kg de carne.</li>\
</ol>\
<h4>Ganancia por grupo</h4>\
<p>Si tenes grupos cargados en "Lotes", aca se muestra una tabla comparando la <strong>ganancia manual</strong> que ingresaste vs la <strong>ganancia calculada</strong> por el modelo, mes a mes. Si la calculada es menor, significa que el forraje no alcanza para la ganancia que esperabas.</p>\
<h4>Sugerencia de suplementacion</h4>\
<p>Cuando la ganancia calculada es menor que la objetivo, se sugiere cuantos kg de grano de maiz por cabeza por dia se necesitan para cubrir el deficit energetico.</p>\
<div class="ejemplo"><strong>Ejemplo:</strong> Un novillo de 350 kg en campo natural en julio (invierno) tiene ganancia estimada de ~0.25 kg/dia. Si tu objetivo es 0.7 kg/dia, necesitas suplementar con ~2-3 kg de grano de maiz por cabeza por dia.</div>\
<div class="tip"><strong>Tip:</strong> Valores de referencia INTA para zona pampeana: novillo en campo natural invierno ~0.2-0.3 kg/dia; en pastura de alfalfa primavera ~0.8-1.0 kg/dia.</div>'
    },

    clima: {
        titulo: 'Como usar: Integracion Climatica',
        contenido: '\
<p>El clima (especialmente las lluvias) afecta directamente cuanto pasto crece. Esta pestana permite <strong>ajustar la produccion forrajera segun precipitaciones reales</strong>.</p>\
<h4>Dos modos de uso</h4>\
<h4>Modo 1: Consulta online (recomendado si hay internet)</h4>\
<ol>\
<li>Ingresa las <strong>coordenadas</strong> de tu campo (latitud y longitud). Valores tipicos para Buenos Aires: lat -34 a -38, lon -58 a -63.</li>\
<li>Pulsa <strong>"Consultar clima (online)"</strong>.</li>\
<li>El sistema consulta la API gratuita <strong>Open-Meteo</strong> y trae las precipitaciones del ultimo ano.</li>\
<li>Los datos se guardan automaticamente en tu navegador para la proxima vez.</li>\
</ol>\
<div class="tip"><strong>Como obtener coordenadas:</strong> Abri Google Maps, hace click derecho en tu campo, y copia los numeros que aparecen (ej: -36.62, -59.83). El primero es latitud, el segundo longitud.</div>\
<h4>Modo 2: Ingreso manual (offline)</h4>\
<ol>\
<li>Completa las <strong>casillas de precipitacion</strong> (mm) para cada mes. Podes consultar datos del SMN o de tu pluviometro.</li>\
<li>Los valores se comparan automaticamente con el promedio historico de la zona.</li>\
</ol>\
<h4>Modo 3: Slider de sequia (rapido)</h4>\
<p>Si no tenes datos exactos, usa el <strong>slider "Indice de sequia"</strong>:</p>\
<ul>\
<li><strong>40%:</strong> Sequia severa (produccion al 40% del normal).</li>\
<li><strong>70-80%:</strong> Ano seco.</li>\
<li><strong>100%:</strong> Ano normal (sin ajuste).</li>\
<li><strong>120-130%:</strong> Ano muy lluvioso (produccion algo mayor, con rendimientos decrecientes).</li>\
</ul>\
<h4>Como afecta al balance</h4>\
<p>Cuando hay datos de precipitacion cargados, el calculo de balance aplica un <strong>factor de ajuste por mes</strong>:</p>\
<ul>\
<li>Si llovio igual al promedio: factor = 1.0 (sin cambio).</li>\
<li>Si llovio 50% menos: factor ~0.65 (produccion baja un 35%).</li>\
<li>Si llovio 50% mas: factor ~1.15 (sube un 15%, rendimientos decrecientes).</li>\
<li>Minimo: 0.4 | Maximo: 1.3.</li>\
</ul>\
<h4>Tabla de indicadores</h4>\
<ul>\
<li><strong>Iconos por mes:</strong> Sol = precipitacion muy baja, nube = normal, lluvia = por encima del promedio.</li>\
<li><strong>Factor ajuste:</strong> Multiplicador que se aplica a la produccion de ese mes.</li>\
<li><strong>Grafico barras + linea:</strong> Azul = lluvia real, naranja = promedio historico.</li>\
</ul>\
<div class="ejemplo"><strong>Ejemplo:</strong> Si en julio llovieron 15 mm (promedio 38 mm), el factor es ~0.58. La produccion de julio se reduce un 42%. Esto se refleja en el grafico de Oferta/Demanda.</div>\
<div class="tip"><strong>Tip:</strong> Despues de cargar datos de clima, volve a la pestana "Balance" y recalcula. Vas a ver la produccion ajustada.</div>'
    },

    economico: {
        titulo: 'Como usar: Modulo Economico',
        contenido: '\
<p>Calcula la <strong>rentabilidad</strong> de tu rodeo: cuanto invertis, cuanto entra, y cual es el margen bruto y neto.</p>\
<h4>Datos que necesitas</h4>\
<ol>\
<li><strong>Precios de compra/venta y sanidad:</strong> Se cargan por grupo en la pestana "Lotes" (dentro del acordeon "Datos economicos").</li>\
<li><strong>Costos por hectarea:</strong>\
    <ul>\
    <li>Labores: siembra, fertilizacion, pulverizaciones, etc.</li>\
    <li>Estructura: sueldos, impuestos, amortizaciones, etc.</li>\
    </ul>\
</li>\
<li><strong>Suplementacion:</strong> Costo del suplemento ($/kg) y cantidad total anual (kg).</li>\
<li><strong>Comercializacion (desplegable):</strong> Comision de venta (tipico 4%) y flete por cabeza.</li>\
</ol>\
<h4>Resultados</h4>\
<ul>\
<li><strong>Inversion Total:</strong> Compra de hacienda + sanidad.</li>\
<li><strong>Ingreso Bruto:</strong> Peso final x cantidad x precio venta.</li>\
<li><strong>Margen Bruto:</strong> Ingreso - costos directos (compra + sanidad + comision + flete).</li>\
<li><strong>Margen Bruto/ha:</strong> Margen dividido la superficie total. Util para comparar con agricultura.</li>\
<li><strong>Margen Neto:</strong> Margen bruto - gastos generales (labores + estructura + suplementacion).</li>\
</ul>\
<div class="tip"><strong>Tip:</strong> El margen bruto/ha es el indicador mas usado para comparar con actividades alternativas (soja, trigo, etc.).</div>\
<div class="ejemplo"><strong>Referencia:</strong> Un margen bruto ganadero de $50.000-100.000/ha/ano en zona pampeana es razonable (valores orientativos, dependen del momento).</div>'
    },

    comparador: {
        titulo: 'Como usar: Comparador de Escenarios',
        contenido: '\
<p>Compara lado a lado los distintos escenarios de rodeo que armaste en "Lotes".</p>\
<h4>Pasos</h4>\
<ol>\
<li>Necesitas al menos <strong>2 escenarios</strong> creados en la pestana "Lotes".</li>\
<li>Haber calculado el <strong>Balance</strong> previamente.</li>\
<li>Pulsa <strong>"Comparar Escenarios"</strong>.</li>\
</ol>\
<h4>Que muestra</h4>\
<ul>\
<li><strong>Tabla comparativa:</strong> Cabezas, demanda total, kg producidos, tasa de uso, carga real, meses con deficit.</li>\
<li><strong>Grafico de barras:</strong> Demanda vs produccion de carne por escenario.</li>\
</ul>\
<h4>Como interpretar</h4>\
<ul>\
<li>Un escenario con <strong>tasa de uso 70-85%</strong> y <strong>0 meses de deficit</strong> es seguro.</li>\
<li>Si un escenario tiene meses de deficit pero produce mas kg de carne, evalua si el costo de la suplementacion se justifica.</li>\
<li>Compara el escenario "conservador" (menos animales) vs "intensivo" (mas animales) para encontrar el punto optimo.</li>\
</ul>\
<div class="tip"><strong>Tip:</strong> Crea un escenario con la carga actual de tu campo y otro con un 20% mas. Si el segundo no genera deficit, tenes margen para crecer.</div>'
    },

    ndvi: {
        titulo: 'Como usar: NDVI Satelital',
        contenido: '\
<p>El NDVI (Indice de Vegetacion de Diferencia Normalizada) es una medicion <strong>satelital</strong> que indica que tan verde/activa esta la vegetacion de tu campo.</p>\
<h4>Estado actual</h4>\
<p>Esta funcion esta en <strong>fase de desarrollo</strong>. Actualmente ofrece un simulador para entender la relacion entre NDVI y produccion forrajera. La conexion con datos satelitales reales (Sentinel Hub / Copernicus) requiere registro y API key, y se implementara en futuras versiones.</p>\
<h4>Como interpretar el NDVI</h4>\
<ul>\
<li><strong>0.0 - 0.2:</strong> Suelo desnudo, sin vegetacion. Posible sobrepastoreo severo o tierra arada.</li>\
<li><strong>0.2 - 0.4:</strong> Vegetacion escasa o en estres hidrico. Produccion muy baja.</li>\
<li><strong>0.4 - 0.6:</strong> Vegetacion moderada. Produccion reducida, monitorear.</li>\
<li><strong>0.6 - 0.8:</strong> Vegetacion vigorosa. Produccion normal a buena.</li>\
<li><strong>0.8 - 1.0:</strong> Vegetacion muy densa. Produccion excelente.</li>\
</ul>\
<h4>Simulador</h4>\
<ol>\
<li>Mueve el <strong>slider de NDVI</strong> entre 0 y 1.</li>\
<li>Observa como cambia el <strong>factor de produccion</strong> (multiplicador).</li>\
<li>Un NDVI de 0.5 equivale a produccion al ~80%. Un NDVI de 0.3 baja al ~45%.</li>\
</ol>\
<h4>Para que sirve en la practica</h4>\
<ul>\
<li><strong>Validar estimaciones:</strong> Si tu balance dice que el campo produce X, pero el NDVI esta bajo, algo no cierra (sequia, plagas, sobrepastoreo).</li>\
<li><strong>Alertas tempranas:</strong> Un NDVI en baja sostenida indica problemas antes de que sean visibles a campo.</li>\
<li><strong>Comparar potreros:</strong> Potreros con NDVI muy diferente pueden necesitar manejos distintos.</li>\
</ul>\
<div class="tip"><strong>Como obtener NDVI real de tu campo (gratis):</strong> Entra a <strong>Copernicus Browser</strong> (browser.dataspace.copernicus.eu), registrate gratis, busca tu campo en el mapa, y selecciona la capa NDVI de Sentinel-2. Actualiza cada 5 dias.</div>\
<div class="tip"><strong>Tip:</strong> En Argentina, tambien podes consultar el visor del <strong>INTA GeoINTA</strong> (geointa.inta.gob.ar) que tiene capas de NDVI actualizadas.</div>'
    }
};

// Renderizar todos los instructivos al cargar
function renderizarInstructivos() {
    Object.keys(INSTRUCTIVOS).forEach(function(tabId) {
        var contenedor = document.getElementById('ayuda_' + tabId);
        if (!contenedor) return;

        var inst = INSTRUCTIVOS[tabId];
        contenedor.innerHTML = '\
            <div class="acordeon-header" onclick="toggleAcordeon(this)">\
                ' + inst.titulo + ' <span class="flecha">&#9660;</span>\
            </div>\
            <div class="acordeon-body">' + inst.contenido + '</div>';
    });
}
