# Plan Simulagro - Prioridades Abril 2026

## Objetivo
Ordenar la evolucion de Simulagro sin perder la version funcional actual, priorizando:
- estabilidad
- credibilidad tecnica
- facilidad de uso para productores
- base de datos regional

---

## Estado actual
- La version principal de trabajo es `BF-Lite/balance_forrajero_demo_simulagro.html`
- Ya se corrigieron puntos criticos de beta/autoria, limpieza de estado y tolerancia a falla de graficos
- La app sigue estando concentrada en un unico HTML grande, lo que aumenta el riesgo de regresiones

---

## Prioridad 1 - Estabilidad del producto

### 1. Separar la app en modulos
- Pasar de un HTML unico a estructura `html + css + js + datos`
- Separacion minima sugerida:
  - `simulagro.html`
  - `css/simulagro.css`
  - `js/core.js`
  - `js/balance.js`
  - `js/rodeo.js`
  - `js/demanda.js`
  - `js/economico.js`
  - `js/datos-regiones.js`
- Beneficio:
  - menos riesgo al editar
  - mas facil testear
  - mas simple agregar regiones y nuevas pantallas

### 2. Version offline real
- Guardar `Chart.js` local en el proyecto
- Evitar dependencia de CDN para productores en zonas con conectividad pobre
- Mantener fallback a tablas si el grafico no carga

### 3. Validaciones cruzadas
- Alertar si el usuario borra recursos y quedan resultados viejos
- Alertar si hay rodeo sin balance recalculado
- Alertar si las fechas del rodeo exceden el ejercicio esperado

---

## Prioridad 2 - Credibilidad tecnica y regionalizacion

### 4. Regiones del pais
- Incorporar selector de region al inicio
- Zonas iniciales sugeridas:
  - Pampa Humeda
  - Centro
  - Litoral / Mesopotamia
  - SemiArida
  - Patagonia
  - Sudoeste BA

### 5. Sudoeste BA
- Es totalmente viable
- El Excel `Mejoras e info/datos_de_ofertaforrajera.xlsx` ya contiene partidos utiles para armar esa zona:
  - Adolfo Alsina
  - Bahia Blanca
  - Coronel Dorrego
  - Coronel Pringles
  - Coronel Suarez
  - Patagones
  - Puan
  - Saavedra
  - Tornquist
  - Villarino
- Recomendacion:
  - armar `Sudoeste BA` como una zona agregada
  - luego permitir un modo mas fino por partido

### 6. Curvas forrajeras regionales
- Si ya descargaste curvas por zona, conviene integrarlas como dataset propio de Simulagro
- Estructura sugerida:
  - `REGIONES_FORRAJERAS = { region: { recurso: { anual, mensual[] } } }`
- Orden de carga:
  1. datos base nacional
  2. override por region
  3. ajuste por clima
  4. ajuste por manejo

---

## Prioridad 3 - UX y decision

### 7. Recomendaciones accionables
- En deficit no solo mostrar "suplementar o vender"
- Tambien sugerir:
  - suplementar X kg/cab/dia
  - reducir X cabezas
  - sembrar X ha de verdeo
  - diferir X ha

### 8. Estado de pastura por lote
- En version pro, migrar de recurso generico a lote/potrero con estado:
  - nuevo
  - bueno
  - regular
  - degradado
- Eso mejora mucho la sensibilidad real del modelo

### 9. Carga por potrero sin duplicar hectareas
- Hoy hay una friccion si se cargan potreros y ademas se deben repetir hectareas en balance
- Objetivo:
  - que el balance pueda tomar superficies directamente desde potreros
  - dejar opcion manual solo como modo rapido

---

## Prioridad 4 - Economico y comparacion

### 10. Valores de referencia
- Mantener boton de valores orientativos
- Version siguiente:
  - separar referencias por categoria
  - registrar fecha de actualizacion
  - permitir editar y guardar como perfil

### 11. Comparador dinamico
- Permitir jugar con:
  - cantidad
  - ganancia
  - peso objetivo
  - precio de venta
- Ideal para extension comercial y validacion con productores

### 12. Informe ejecutivo
- Mejorar informe imprimible con:
  - resultados economicos integrados
  - comparacion normal vs seco
  - recomendaciones resumidas
  - nombre del establecimiento y asesor

---

## Orden sugerido de implementacion

1. Modularizar Simulagro sin cambiar funcionalidad
2. Pasar `Chart.js` a local
3. Agregar selector de regiones
4. Incorporar `Sudoeste BA`
5. Integrar curvas regionales descargadas
6. Conectar balance con potreros para no duplicar hectareas
7. Mejorar recomendaciones de accion
8. Mejorar comparador y economico

---

## Estrategia de trabajo recomendada
- Mantener `balance_forrajero_demo.html` como historico
- Mantener `balance_forrajero_demo_simulagro.html` como base viva actual
- Hacer los cambios nuevos en rama dedicada
- Commits chicos por tema:
  - hardening beta
  - limpieza de estado
  - offline/graficos
  - regiones
  - sudoeste BA
  - recomendaciones
