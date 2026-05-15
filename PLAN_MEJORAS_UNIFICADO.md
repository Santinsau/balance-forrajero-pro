# Plan de Mejoras Unificado - Balance Forrajero PRO
## Observaciones del usuario + Auditoria tecnica (Feb 2026)

---

## FASE 1 - PRIORIDAD ALTA (impacto inmediato)

### 1. Recursos forrajeros como desplegable [USUARIO]
- **Problema**: La pagina de balance es abrumadora, todos los recursos aparecen a la vez
- **Solucion**: Select desplegable para elegir recurso (como el de categorias), boton "Agregar", y que aparezcan solo los elegidos como cards editables
- **Esfuerzo**: Medio
- **Archivos**: balance.js (generarInputsRecursos), index.html

### 2. Datos regionales - Zonas del pais [USUARIO]
- **Problema**: Solo hay datos de una zona (Pampa Humeda). Falta credibilidad para otras regiones
- **Fuentes disponibles**:
  - Tablero Forrajero CREA (acceso libre): datos por zona y ano
  - Excel adjunto 1: PPNA por departamento/partido (525 registros, todas las provincias)
  - Excel adjunto 2: 720 mediciones de PPNA por sitio con coordenadas, suelo, precipitacion
- **Solucion**: Agregar selector de zona/region al inicio. Embeber los datos de los Excel como tablas JS. Minimo 4-5 zonas: Pampa Humeda, Pampa Seca/Semiarida, Litoral/Mesopotamia, Centro, Patagonia
- **Esfuerzo**: Alto (procesar datos, armar estructura por zona)
- **Archivos**: datos.js (nuevo: DATOS_POR_ZONA), balance.js, index.html

### 3. Categoria Toro [USUARIO]
- **Problema**: Falta la categoria toro para completar el rodeo de cria
- **Solucion**: Agregar toro a CATEGORIAS con consumo ~0.025, peso defecto 800kg, ganancia 0
- **Esfuerzo**: Bajo
- **Archivos**: datos.js, index.html (select), BF-Lite

### 4. Cambiar "% Prenez" por "% Destete" [USUARIO]
- **Problema**: En cria, lo que importa es el indice de destete, no el de prenez. El destete incluye perdidas (abortos, mortandad perinatal, etc.)
- **Solucion**: Renombrar el campo a "% Destete" en la UI y en el modelo. El calculo queda igual, pero es mas preciso conceptualmente
- **Esfuerzo**: Bajo
- **Archivos**: lotes.js, index.html, BF-Lite

### 5. Tabla de evolucion mensual del rodeo [USUARIO + TECNICO]
- **Problema**: No se ve como evoluciona peso, ganancia y requerimientos mes a mes. El usuario no puede verificar si las ganancias son realistas con los recursos disponibles
- **Solucion**: Tabla en la pestana Lotes mostrando por grupo: mes, peso estimado, ganancia esperada, consumo MS/dia, consumo MS total. Cruzar con calidad nutricional del recurso si esta disponible
- **Esfuerzo**: Medio
- **Archivos**: lotes.js o demanda.js, index.html

### 6. Ejemplo de datos con transiciones [TECNICO]
- El "Cargar ejemplo" debe incluir vacas de cria con ciclo y terneros con recria
- **Esfuerzo**: Bajo
- **Archivos**: app.js

---

## FASE 2 - PRIORIDAD MEDIA (valor agregado)

### 7. Comparador dinamico de escenarios [USUARIO]
- **Problema**: El comparador es estatico, no se pueden mover ganancias o pesos para "jugar"
- **Solucion**: Sliders interactivos para ajustar ganancia, precio venta, cantidad de cabezas. Que el grafico se actualice en tiempo real
- **Esfuerzo**: Alto
- **Archivos**: comparador.js, index.html

### 8. Valores de referencia en modulo economico [USUARIO]
- **Problema**: El usuario no siempre sabe precios actuales de compra/venta, labores, estructura
- **Solucion**: Boton "Cargar valores de referencia" con precios orientativos (tabla embebida actualizable). Fuentes posibles: Rosgan, Mercado de Liniers (habria que actualizar manualmente o con API)
- **Esfuerzo**: Medio (tabla estatica) / Alto (con API)
- **Archivos**: economico.js, index.html, datos.js

### 9. Grafico de demanda desglosada por categoria [TECNICO]
- Barras apiladas mostrando cuanto consume cada grupo/categoria por mes
- **Esfuerzo**: Medio
- **Archivos**: demanda.js

### 10. Informe imprimible / PDF [TECNICO]
- Vista optimizada para imprimir con todos los resultados
- **Esfuerzo**: Medio-Alto
- **Archivos**: nuevo archivo o seccion en index.html

### 11. Dashboard / resumen ejecutivo mejorado [TECNICO]
- Panel tipo semaforo con indicadores clave visibles sin navegar
- **Esfuerzo**: Medio
- **Archivos**: utils.js (actualizarResumenEjecutivo), index.html

### 12. Calculo automatico al cambiar datos [TECNICO]
- Recalcular balance automaticamente sin apretar boton (con debounce)
- **Esfuerzo**: Bajo
- **Archivos**: balance.js

---

## FASE 3 - MEJORAS COMPLEMENTARIAS

### 13. Suplementacion detallada con tipos de suplemento [TECNICO]
- Elegir tipo (maiz, silo, rollo) de SUPLEMENTOS_REFERENCIA, calcular costo
- **Esfuerzo**: Medio

### 14. Sensibilidad de precios [TECNICO]
- Tabla: "que pasa si el precio baja/sube 10-20%?"
- **Esfuerzo**: Medio

### 15. Timeline visual del rodeo (Gantt) [TECNICO]
- Diagrama mostrando periodos de cada grupo con transiciones marcadas
- **Esfuerzo**: Medio

### 16. Validacion cruzada entre pestanas [TECNICO]
- Alertar si ha recursos != ha potreros, fechas fuera de rango, etc.
- **Esfuerzo**: Medio

### 17. Eficiencia de conversion (kg pasto / kg carne) [TECNICO]
- Indicador clave, calculo simple
- **Esfuerzo**: Bajo

### 18. Composicion del rodeo (torta/dona) [TECNICO]
- Grafico de proporcion de categorias
- **Esfuerzo**: Bajo

---

## DATOS DISPONIBLES PARA FASE 1.2 (Zonas del pais)

### Excel 1: datos_de_ofertaforrajera.xlsx
- 525 filas, una por departamento/partido
- Columnas clave: Provincia, Departamento, Sup_ha, PPNA.gral_kgha/ano
- Cubre todo el pais

### Excel 2: PPNA-anual-a-partir-de-cortes-secuenciales-de-biomasa.xlsx
- 720 mediciones puntuales
- Con coordenadas (LAT/LON), recurso forrajero, composicion floristica
- PPNA medido en kg/ha/ano con desvio estandar
- Tiene precipitacion, temperatura, tipo de suelo
- Ideal para armar promedios por zona y tipo de recurso

### Tablero Forrajero CREA
- URL: tableroforrajero.crea.org.ar
- Acceso libre (usuario libre, aceptar TyC)
- Datos por zona, ano, recurso
- Se puede exportar - habria que procesar offline y embeber

---

## ORDEN DE IMPLEMENTACION SUGERIDO

| Orden | Item | Descripcion corta | Esfuerzo |
|-------|------|-------------------|----------|
| 1 | #6 | Ejemplo con transiciones | 1 hora |
| 2 | #3 | Categoria toro | 1 hora |
| 3 | #4 | % Prenez → % Destete | 1 hora |
| 4 | #1 | Recursos como desplegable | 3-4 horas |
| 5 | #5 | Tabla evolucion mensual | 3-4 horas |
| 6 | #12 | Calculo automatico | 1-2 horas |
| 7 | #2 | Datos regionales/zonas | 6-8 horas |
| 8 | #9 | Demanda por categoria | 3 horas |
| 9 | #7 | Comparador dinamico | 4-5 horas |
| 10 | #8 | Valores ref. economico | 3-4 horas |
