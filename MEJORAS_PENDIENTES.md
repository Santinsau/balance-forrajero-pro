# Mejoras Pendientes - Balance Forrajero PRO

**Actualizado:** 18 de febrero de 2026
**Estado actual:** v6.0 funcional, 62 tests pasan, 2 versiones (PRO + Lite)
**Fuente de prioridades:** Encuesta de validacion (14 respuestas) + revision tecnica

---

## PRIORIDAD ALTA (lo que mas piden los usuarios)

### 1. Alertas predictivas
**Pedido por:** 43% de encuestados | **Esfuerzo:** Medio
**Estado:** No implementado

El feature mas pedido que no tenemos. Los usuarios quieren:
- "En 2 meses vas a necesitar suplementar"
- "En mayo tu campo no cubre la demanda"
- "Con la carga actual, te quedas sin pasto en agosto"

**Implementacion propuesta:**
- Despues de calcular oferta/demanda, recorrer mes a mes
- Si balance mensual < 0 en algun mes futuro, generar alerta
- Mostrar cuantos meses de anticipacion tiene
- Sugerir accion: suplementar (cuanto), vender (cuantas cab), diferir (que recurso)
- Panel de alertas visible en el dashboard/resumen ejecutivo
- Alertas con semaforo: verde (OK), amarillo (ajustado), rojo (deficit)

**Archivos a modificar:** utils.js (alertas), demanda.js (calculo), index.html (panel)

---

### 2. App movil / PWA
**Pedido por:** 43% prefiere celular, 71% quiere offline | **Esfuerzo:** Medio
**Estado:** Responsive basico existe, no hay PWA

La app ya funciona offline con file://, pero no es instalable en el celular.

**Implementacion propuesta:**
- Agregar manifest.json (nombre, iconos, colores, display: standalone)
- Agregar service worker basico para cache de archivos
- Esto permite "Agregar a pantalla de inicio" en Android/iOS
- Se abre como app nativa, sin barra de navegador
- Requiere servir desde HTTPS (GitHub Pages gratuito)

**Archivos nuevos:** manifest.json, sw.js, iconos (192x192, 512x512)
**Archivos a modificar:** index.html (links a manifest y registro SW)

**Nota:** Para la version Lite single-file, PWA no aplica directamente. Considerar version hosted en GitHub Pages.

---

### 3. Reducir carga de datos (defaults inteligentes)
**Pedido por:** 36% solo carga lo basico, 14% no quiere cargar nada | **Esfuerzo:** Bajo
**Estado:** Parcialmente implementado (datos ejemplo)

**Mejoras propuestas:**
- Al seleccionar region/zona, precargar datos tipicos de esa zona (produccion, estacionalidad, precipitaciones)
- Selector de "perfil de campo" rapido: "Campo de cria pampeano 200 ha", "Invernada sobre pasturas 500 ha", etc.
- Autocompletar meses de uso segun recurso seleccionado (ya existe pero mejorar)
- Precios de hacienda actualizables: boton "Usar precios de referencia" que cargue promedios
- Wizard/asistente paso a paso para primera carga (en vez de mostrar todo junto)

**Archivos a modificar:** app.js (perfiles), datos.js (datos regionales), index.html (wizard)

---

### 4. Guia para medir pasto (aforos)
**Pedido por:** 29% cargaria mediciones si la app explica como | **Esfuerzo:** Bajo
**Estado:** No implementado

**Implementacion propuesta:**
- Seccion en ayuda.js con instructivo de aforo: doble muestreo, marco de corte, estimacion visual
- Calculadora simple: peso de muestra (g) / area del marco (m2) = kg MS/ha
- Input opcional en cada recurso: "Medicion de campo (kg MS/ha)" que reemplace la estimacion
- Tabla de referencia visual: fotos de pasturas a distintas alturas con kg MS estimados
- Link a videos de INTA sobre tecnica de aforo

**Archivos a modificar:** ayuda.js (instructivo), index.html (inputs opcionales), balance.js (usar medicion si existe)

---

## PRIORIDAD MEDIA

### 5. Reemplazar alert() restantes
**Esfuerzo:** Bajo | **Estado:** Parcial (se reemplazaron los principales, quedan 14)

Quedan alert() en:
- app.js: 1 (datos ejemplo cargados)
- comparador.js: 2 (necesita escenarios, necesita balance)
- economico.js: 2 (necesita balance, necesita lotes)
- lotes.js: 2 (al menos un escenario, selecciona escenario)
- rotaciones.js: 2 (potrero/grupo no encontrado, alerta descanso)
- utils.js: 3 (archivo no valido, importado OK, error lectura)

**Implementacion:** Reemplazar con notificaciones toast (div temporal que aparece arriba y desaparece en 3-5s) para mensajes informativos, y con inline validation para errores de formulario.

**Archivos a modificar:** Todos los JS mencionados, styles.css (estilos toast)

---

### 6. Mejoras mobile especificas
**Esfuerzo:** Medio | **Estado:** Responsive basico existe

**Mejoras propuestas:**
- Tabs scrolleables horizontalmente (ahora se comprimen demasiado en mobile)
- Botones mas grandes para tactil (min 44x44px)
- Gantt de rotaciones: scroll horizontal con touch
- Tablas: scroll horizontal en mobile (ya parcial con .tabla-scroll)
- Graficos: reducir a 250px en mobile, agregar gesto de zoom
- Bottom navigation fija para tabs principales
- Tooltips: mostrar con tap (long-press) en mobile en vez de hover

**Archivos a modificar:** styles.css, index.html (estructura tabs)

---

### 7. Adaptacion regional (otros paises)
**Pedido por:** 29% es de fuera de Argentina | **Esfuerzo:** Alto
**Estado:** Solo datos argentinos

Hay interes desde Uruguay, Chile y Mexico.

**Implementacion propuesta:**
- Selector de pais/region al inicio
- Datos forrajeros por region:
  - Argentina Pampeana (actual)
  - Argentina NOA/NEA (agregar recursos subtropicales: gatton panic, grama rhodes, buffel grass)
  - Uruguay (similar a pampeana, ajustar produccion)
  - Chile zona sur (praderas de trebol/ballica, muy diferente estacionalidad)
  - Mexico (clima tropical, pastos tropicales: estrella, bermuda, tanzania)
- Moneda configurable (ARS, UYU, CLP, MXN)
- Precipitaciones promedio por region (ya existe para Pampeana)
- Categorias animales: agregar ovinos, caprinos (para NOA, Patagonia)

**Archivos a modificar:** datos.js (multiples datasets), config.js (region activa), index.html (selector)

---

### 8. Soporte tecnico / feedback in-app
**Pedido por:** 1 encuestado lo menciona como motivo de descarte | **Esfuerzo:** Bajo

**Implementacion propuesta:**
- Boton "Reportar problema" o "Sugerir mejora" en footer
- Abre formulario simple: tipo (bug/sugerencia/pregunta), descripcion, email
- Envia por mailto: o Google Forms embebido
- FAQ basico en la seccion ayuda
- Link a grupo de WhatsApp/Telegram de soporte beta

**Archivos a modificar:** index.html (boton + footer), ayuda.js (FAQ)

---

## PRIORIDAD BAJA (nice to have)

### 9. Historial y tendencias
**Esfuerzo:** Medio

- Guardar snapshots mensuales del estado del campo en localStorage
- Grafico de tendencia: produccion, carga, balance a lo largo del ano
- Comparar ano actual vs ano anterior
- Exportar historial a CSV

---

### 10. Integracion con datos publicos
**Esfuerzo:** Alto

- Consultar precios de hacienda automaticamente (Rosgan, MAG)
- Consultar precio de granos (BCR Rosario)
- Descargar datos meteorologicos historicos de la zona (ya parcial con Open-Meteo)
- NDVI automatico desde Sentinel/Copernicus (diseño base ya existe)

---

### 11. Modo "asesor" multi-campo
**Esfuerzo:** Alto

Para asesores que manejan varios campos:
- Selector de campo/establecimiento
- Cada campo con su propia configuracion guardada
- Dashboard resumen de todos los campos
- Comparar rendimiento entre campos

---

### 12. Reportes PDF
**Esfuerzo:** Medio | **Estado:** CSS print basico existe

- Generar PDF completo con: resumen ejecutivo, balance, oferta/demanda, economico
- Logo del campo/asesor personalizable
- Formato profesional para presentar a bancos, propietarios, etc.
- Usar html2pdf.js o similar (libreria client-side)

---

### 13. Pesos objetivo y seguimiento
**Pedido por:** 1 encuestado (Chile) | **Esfuerzo:** Bajo

- Definir peso objetivo por grupo (ya existe el campo)
- Grafico de curva de crecimiento esperada vs real
- Alerta si la ganancia no alcanza para llegar al peso objetivo en la fecha de salida
- Sugerir ajuste de ganancia o extension de plazo

---

## DEUDA TECNICA

### T1. Eliminar archivos legacy
- app_v2.js (version monolitica, reemplazada por modulos)
- index_v2.html (reemplazado por index.html)
- datos_forrajeros.json (datos embebidos en datos.js)
- Mantener en git history pero borrar del directorio activo

### T2. Tests para nuevas funcionalidades
- Agregar tests para alertas predictivas cuando se implementen
- Tests para PWA service worker
- Tests de responsive (verificar que layout no se rompe)
- Aumentar cobertura: apuntar a 80+ tests

### T3. Minificacion para produccion
- Concatenar todos los JS en un solo archivo para produccion
- Minificar CSS
- Comprimir para distribucion (ZIP con todo incluido)
- Esto facilita compartir y reduce tiempos de carga

### T4. Documentacion de API/funciones
- Documentar funciones principales para futuros colaboradores
- Diagrama de flujo de datos entre modulos
- Guia de contribucion si se abre el codigo

---

## MODELO DE NEGOCIO (basado en encuesta)

### Propuesta freemium
| Version | Precio | Incluye |
|---|---|---|
| **Lite (gratis)** | $0 | Balance basico, 4 tabs, sin clima/satelite |
| **PRO mensual** | $3.500/mes | Todo: 9 tabs, clima, NDVI, escenarios, alertas |
| **PRO anual** | $35.000/ano (~$2.900/mes) | Mismo que PRO con descuento |

**Justificacion:** 72% pagaria algo. Rango mas popular $2.500-$5.000/mes. Pago anual pedido por 29%.

### Canal de distribucion
- GitHub Pages para version web (gratis, HTTPS, habilita PWA)
- Link directo para version offline (ZIP descargable)
- Redes sociales agro (grupos de WhatsApp, foros ganaderos)
- Convenios con INTA, universidades, asociaciones de productores

---

## ORDEN DE IMPLEMENTACION SUGERIDO

| # | Mejora | Esfuerzo | Impacto | Proxima sesion? |
|---|---|---|---|---|
| 1 | Alertas predictivas | Medio | Alto | Si |
| 2 | Reemplazar alert() restantes | Bajo | Medio | Si |
| 3 | PWA basico (manifest + SW) | Medio | Alto | Si |
| 4 | Defaults inteligentes / perfiles | Bajo | Alto | Si |
| 5 | Guia de aforos | Bajo | Medio | Opcional |
| 6 | Mejoras mobile | Medio | Alto | Siguiente |
| 7 | Adaptacion regional | Alto | Alto | Posterior |
| 8 | Eliminar archivos legacy | Bajo | Bajo | Cuando sea |

---

*Archivo generado a partir de revision tecnica + analisis de 14 respuestas de encuesta de validacion.*
