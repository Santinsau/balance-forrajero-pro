// ============================================
// BALANCE FORRAJERO PRO v6.0 - Datos Forrajeros
// (c) 2025-2026 Santiago Jose Insaurralde.
// Todos los derechos reservados.
// ============================================

var DATOS_FORRAJEROS_EMBEBIDOS = {
  "recursos": [
    "Campo natural","Campo natural con agropiro","Pastura base alfalfa","Pastura consociada",
    "Pastura de agropiro","Pastura de festuca","Promocion de raigras","Promocion intensiva de raigras",
    "Verdeo de avena","Verdeo de invierno","Verdeo de maiz","Verdeo de raigras","Verdeo de sorgo"
  ],
  "promedios": {
    "Campo natural":{"mensual":[525.9,534.0,524.9,417.0,303.5,256.5,251.2,287.1,362.2,498.6,618.8,563.3],"anual":5143.0},
    "Campo natural con agropiro":{"mensual":[488.4,487.1,513.9,432.8,322.6,271.0,270.6,311.5,395.1,535.7,622.7,522.8],"anual":5174.2},
    "Pastura base alfalfa":{"mensual":[892.9,843.1,682.4,625.3,495.2,412.7,388.9,505.6,607.7,602.7,814.8,758.7],"anual":7630.0},
    "Pastura consociada":{"mensual":[736.3,798.4,785.8,740.2,574.0,484.1,503.1,618.2,774.0,832.9,876.0,764.9],"anual":8487.9},
    "Pastura de agropiro":{"mensual":[663.7,702.8,702.3,619.7,498.4,421.0,414.3,491.0,600.4,654.2,929.6,814.4],"anual":7511.8},
    "Pastura de festuca":{"mensual":[742.1,830.4,832.3,792.0,540.4,405.9,395.0,483.6,670.7,899.3,931.4,781.0],"anual":8304.1},
    "Promocion de raigras":{"mensual":[503.6,491.4,683.1,655.4,548.4,455.0,442.0,513.6,609.7,797.8,872.4,548.3],"anual":7120.7},
    "Promocion intensiva de raigras":{"mensual":[681.3,655.2,742.0,665.9,807.4,732.5,706.4,784.4,919.0,907.1,668.5,630.9],"anual":8900.6},
    "Verdeo de avena":{"mensual":[0,767.0,894.6,815.4,601.0,389.7,471.8,692.0,773.3,541.4,968.2,0],"anual":6914.4},
    "Verdeo de invierno":{"mensual":[0,682.2,699.7,678.3,770.1,671.3,664.9,795.4,846.6,903.0,933.9,0],"anual":7645.4},
    "Verdeo de maiz":{"mensual":[0,673.5,615.9,579.9,673.7,0,0,0,0,741.3,0,945.6],"anual":4229.9},
    "Verdeo de raigras":{"mensual":[0,761.6,802.7,541.4,646.2,597.9,618.9,679.6,721.2,864.2,0,0],"anual":6233.7},
    "Verdeo de sorgo":{"mensual":[817.1,0,0,679.4,771.8,0,0,0,0,608.7,899.2,830.0],"anual":4606.2}
  },
  "resumen": {
    "Campo natural":{"promedio":427.91,"minimo":158.3,"maximo":772.6,"cv":33.08,"anio_mejor":2002,"produccion_mejor":481.5,"anio_peor":2011,"produccion_peor":357.1,"recomendacion":"Alta variabilidad. Bajo potencial productivo. Recomendado para: sistemas extensivos."},
    "Campo natural con agropiro":{"promedio":430.79,"minimo":194.7,"maximo":996.8,"cv":36.25,"anio_mejor":2002,"produccion_mejor":562.9,"anio_peor":2011,"produccion_peor":322.9,"recomendacion":"Alta variabilidad. Bajo potencial productivo. Recomendado para: sistemas extensivos."},
    "Pastura base alfalfa":{"promedio":584.36,"minimo":271.8,"maximo":978.1,"cv":32.55,"anio_mejor":2020,"produccion_mejor":645.9,"anio_peor":2023,"produccion_peor":498.8,"recomendacion":"Alta variabilidad. Bajo potencial productivo. Recomendado para: sistemas extensivos."},
    "Pastura consociada":{"promedio":674.56,"minimo":364.4,"maximo":999.1,"cv":24.94,"anio_mejor":2001,"produccion_mejor":767.4,"anio_peor":2009,"produccion_peor":551.2,"recomendacion":"Estabilidad media. Bajo potencial productivo. Recomendado para: sistemas extensivos."},
    "Pastura de agropiro":{"promedio":609.77,"minimo":347.5,"maximo":998.7,"cv":28.33,"anio_mejor":2018,"produccion_mejor":658.4,"anio_peor":2023,"produccion_peor":540.3,"recomendacion":"Estabilidad media. Bajo potencial productivo. Recomendado para: sistemas extensivos."},
    "Pastura de festuca":{"promedio":622.68,"minimo":329.8,"maximo":996.4,"cv":32.62,"anio_mejor":2018,"produccion_mejor":710.6,"anio_peor":2007,"produccion_peor":532.0,"recomendacion":"Alta variabilidad. Bajo potencial productivo. Recomendado para: sistemas extensivos."},
    "Promocion de raigras":{"promedio":578.01,"minimo":180.2,"maximo":976.0,"cv":29.68,"anio_mejor":2016,"produccion_mejor":657.2,"anio_peor":2017,"produccion_peor":485.6,"recomendacion":"Estabilidad media. Bajo potencial productivo. Recomendado para: sistemas extensivos."},
    "Promocion intensiva de raigras":{"promedio":728.39,"minimo":0.0,"maximo":994.1,"cv":27.07,"anio_mejor":2014,"produccion_mejor":863.9,"anio_peor":2022,"produccion_peor":555.4,"recomendacion":"Estabilidad media. Bajo potencial productivo. Recomendado para: sistemas extensivos."},
    "Verdeo de avena":{"promedio":611.13,"minimo":254.3,"maximo":981.3,"cv":33.86,"anio_mejor":2018,"produccion_mejor":750.7,"anio_peor":2015,"produccion_peor":375.8,"recomendacion":"Alta variabilidad. Bajo potencial productivo. Recomendado para: sistemas extensivos."},
    "Verdeo de invierno":{"promedio":723.99,"minimo":211.5,"maximo":996.5,"cv":25.95,"anio_mejor":2011,"produccion_mejor":897.7,"anio_peor":2009,"produccion_peor":341.7,"recomendacion":"Estabilidad media. Bajo potencial productivo. Recomendado para: sistemas extensivos."},
    "Verdeo de maiz":{"promedio":723.13,"minimo":467.6,"maximo":961.8,"cv":23.11,"anio_mejor":2017,"produccion_mejor":961.8,"anio_peor":2008,"produccion_peor":467.6,"recomendacion":"Estabilidad media. Bajo potencial productivo. Recomendado para: sistemas extensivos."},
    "Verdeo de raigras":{"promedio":664.65,"minimo":157.5,"maximo":997.5,"cv":32.93,"anio_mejor":2018,"produccion_mejor":851.1,"anio_peor":2011,"produccion_peor":432.4,"recomendacion":"Alta variabilidad. Bajo potencial productivo. Recomendado para: sistemas extensivos."},
    "Verdeo de sorgo":{"promedio":708.12,"minimo":412.9,"maximo":990.1,"cv":28.49,"anio_mejor":2018,"produccion_mejor":969.3,"anio_peor":2015,"produccion_peor":412.9,"recomendacion":"Estabilidad media. Bajo potencial productivo. Recomendado para: sistemas extensivos."}
  },
  "estacional": {
    "Campo natural":{"Verano":528.2,"Oto\u00f1o":325.7,"Invierno":300.2,"Primavera":560.2},
    "Campo natural con agropiro":{"Verano":496.7,"Oto\u00f1o":342.1,"Invierno":325.7,"Primavera":560.4},
    "Pastura base alfalfa":{"Verano":769.1,"Oto\u00f1o":511.1,"Invierno":495.4,"Primavera":713.1},
    "Pastura consociada":{"Verano":772.7,"Oto\u00f1o":595.6,"Invierno":629.8,"Primavera":813.9},
    "Pastura de agropiro":{"Verano":692.3,"Oto\u00f1o":513.0,"Invierno":501.9,"Primavera":791.7},
    "Pastura de festuca":{"Verano":801.6,"Oto\u00f1o":576.6,"Invierno":516.4,"Primavera":860.9},
    "Promocion de raigras":{"Verano":557.1,"Oto\u00f1o":551.1,"Invierno":521.8,"Primavera":707.4},
    "Promocion intensiva de raigras":{"Verano":683.1,"Oto\u00f1o":743.7,"Invierno":772.6,"Primavera":662.9},
    "Verdeo de avena":{"Verano":809.5,"Oto\u00f1o":548.8,"Invierno":614.5,"Primavera":683.7},
    "Verdeo de invierno":{"Verano":690.4,"Oto\u00f1o":702.3,"Invierno":741.4,"Primavera":923.6},
    "Verdeo de maiz":{"Verano":644.7,"Oto\u00f1o":626.8,"Invierno":0,"Primavera":766.8},
    "Verdeo de raigras":{"Verano":782.2,"Oto\u00f1o":604.4,"Invierno":662.8,"Primavera":864.2},
    "Verdeo de sorgo":{"Verano":817.1,"Oto\u00f1o":692.6,"Invierno":0,"Primavera":708.1}
  }
};

// --- CATEGORIAS (6 tipos) ---
var CATEGORIAS = {
    ternero:    { nombre: 'Ternero',    consumo: 0.025, pesoDefecto: 180, gananciaDefecto: 0.55, usaPasto: true,
                  transicionDefecto: 'novillito', pesoTransicion: 280 },
    ternera:    { nombre: 'Ternera',    consumo: 0.025, pesoDefecto: 170, gananciaDefecto: 0.50, usaPasto: true,
                  transicionDefecto: 'vaquillona', pesoTransicion: 260 },
    novillito:  { nombre: 'Novillito',  consumo: 0.028, pesoDefecto: 280, gananciaDefecto: 0.65, usaPasto: true,
                  transicionDefecto: null },
    novillo:    { nombre: 'Novillo',    consumo: 0.025, pesoDefecto: 380, gananciaDefecto: 0.80, usaPasto: true,
                  transicionDefecto: null },
    vaquillona: { nombre: 'Vaquillona', consumo: 0.025, pesoDefecto: 300, gananciaDefecto: 0.60, usaPasto: true,
                  transicionDefecto: null },
    vaca:       { nombre: 'Vaca',       consumo: 0.022, pesoDefecto: 450, gananciaDefecto: 0.00, usaPasto: true,
                  consumoCria: 0.015, pesoCria: 80, pesoDestete: 180,
                  desteteDefecto: 85, porcentajeMachosDefecto: 50 },
    toro:       { nombre: 'Toro',       consumo: 0.025, pesoDefecto: 800, gananciaDefecto: 0.00, usaPasto: true,
                  transicionDefecto: null }
};

// --- MESES ---
var MESES_LABELS = ['E','F','M','A','M','J','J','A','S','O','N','D'];
var MESES_NOMBRES = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
var MESES_NOMBRES_LARGO = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

var MESES_USO_DEFECTO = {
    'Campo natural':                  [1,1,1,1,1,1,1,1,1,1,1,1],
    'Campo natural con agropiro':     [1,1,1,1,1,1,1,1,1,1,1,1],
    'Pastura base alfalfa':           [1,1,1,1,1,1,1,1,1,1,1,1],
    'Pastura consociada':             [1,1,1,1,1,1,1,1,1,1,1,1],
    'Pastura de agropiro':            [1,1,1,1,1,1,1,1,1,1,1,1],
    'Pastura de festuca':             [1,1,1,1,1,1,1,1,1,1,1,1],
    'Promocion de raigras':           [0,0,0,1,1,1,1,1,1,1,1,0],
    'Promocion intensiva de raigras': [0,0,0,1,1,1,1,1,1,1,1,0],
    'Verdeo de avena':                [0,1,1,1,1,1,1,1,1,1,1,0],
    'Verdeo de invierno':             [0,1,1,1,1,1,1,1,1,1,1,0],
    'Verdeo de maiz':                 [1,1,1,1,1,0,0,0,0,1,0,1],
    'Verdeo de raigras':              [0,1,1,1,1,1,1,1,1,1,0,0],
    'Verdeo de sorgo':                [1,0,0,1,1,0,0,0,0,1,1,1]
};

// --- PERFILES NUTRICIONALES (Fase 3) ---
var PERFIL_NUTRICIONAL = {
    "Campo natural": {
        proteina: 8, fdn: 68, digestibilidad: 52, energiaMetab: 1.85,
        calidadEstacional: {
            verano:    { proteina: 10, fdn: 62, digestibilidad: 58, energiaMetab: 2.05 },
            otono:     { proteina: 7,  fdn: 72, digestibilidad: 48, energiaMetab: 1.70 },
            invierno:  { proteina: 6,  fdn: 75, digestibilidad: 45, energiaMetab: 1.60 },
            primavera: { proteina: 12, fdn: 58, digestibilidad: 62, energiaMetab: 2.20 }
        }
    },
    "Campo natural con agropiro": {
        proteina: 9, fdn: 65, digestibilidad: 54, energiaMetab: 1.90,
        calidadEstacional: {
            verano:    { proteina: 10, fdn: 60, digestibilidad: 58, energiaMetab: 2.05 },
            otono:     { proteina: 8,  fdn: 68, digestibilidad: 50, energiaMetab: 1.78 },
            invierno:  { proteina: 7,  fdn: 72, digestibilidad: 48, energiaMetab: 1.70 },
            primavera: { proteina: 12, fdn: 56, digestibilidad: 62, energiaMetab: 2.20 }
        }
    },
    "Pastura base alfalfa": {
        proteina: 18, fdn: 42, digestibilidad: 68, energiaMetab: 2.45,
        calidadEstacional: {
            verano:    { proteina: 17, fdn: 44, digestibilidad: 66, energiaMetab: 2.38 },
            otono:     { proteina: 19, fdn: 40, digestibilidad: 70, energiaMetab: 2.50 },
            invierno:  { proteina: 16, fdn: 46, digestibilidad: 64, energiaMetab: 2.30 },
            primavera: { proteina: 20, fdn: 38, digestibilidad: 72, energiaMetab: 2.58 }
        }
    },
    "Pastura consociada": {
        proteina: 15, fdn: 48, digestibilidad: 64, energiaMetab: 2.30,
        calidadEstacional: {
            verano:    { proteina: 14, fdn: 50, digestibilidad: 62, energiaMetab: 2.22 },
            otono:     { proteina: 15, fdn: 48, digestibilidad: 64, energiaMetab: 2.30 },
            invierno:  { proteina: 13, fdn: 52, digestibilidad: 60, energiaMetab: 2.15 },
            primavera: { proteina: 18, fdn: 42, digestibilidad: 68, energiaMetab: 2.45 }
        }
    },
    "Pastura de agropiro": {
        proteina: 10, fdn: 60, digestibilidad: 56, energiaMetab: 2.00,
        calidadEstacional: {
            verano:    { proteina: 9,  fdn: 62, digestibilidad: 54, energiaMetab: 1.92 },
            otono:     { proteina: 10, fdn: 60, digestibilidad: 56, energiaMetab: 2.00 },
            invierno:  { proteina: 9,  fdn: 64, digestibilidad: 52, energiaMetab: 1.85 },
            primavera: { proteina: 12, fdn: 55, digestibilidad: 60, energiaMetab: 2.15 }
        }
    },
    "Pastura de festuca": {
        proteina: 12, fdn: 55, digestibilidad: 60, energiaMetab: 2.15,
        calidadEstacional: {
            verano:    { proteina: 11, fdn: 58, digestibilidad: 58, energiaMetab: 2.05 },
            otono:     { proteina: 12, fdn: 55, digestibilidad: 60, energiaMetab: 2.15 },
            invierno:  { proteina: 10, fdn: 60, digestibilidad: 55, energiaMetab: 1.96 },
            primavera: { proteina: 15, fdn: 48, digestibilidad: 65, energiaMetab: 2.35 }
        }
    },
    "Promocion de raigras": {
        proteina: 14, fdn: 45, digestibilidad: 65, energiaMetab: 2.35,
        calidadEstacional: {
            verano:    { proteina: 12, fdn: 50, digestibilidad: 60, energiaMetab: 2.15 },
            otono:     { proteina: 15, fdn: 42, digestibilidad: 68, energiaMetab: 2.45 },
            invierno:  { proteina: 14, fdn: 44, digestibilidad: 66, energiaMetab: 2.38 },
            primavera: { proteina: 16, fdn: 40, digestibilidad: 70, energiaMetab: 2.52 }
        }
    },
    "Promocion intensiva de raigras": {
        proteina: 16, fdn: 40, digestibilidad: 70, energiaMetab: 2.50,
        calidadEstacional: {
            verano:    { proteina: 14, fdn: 45, digestibilidad: 65, energiaMetab: 2.35 },
            otono:     { proteina: 17, fdn: 38, digestibilidad: 72, energiaMetab: 2.58 },
            invierno:  { proteina: 16, fdn: 40, digestibilidad: 70, energiaMetab: 2.50 },
            primavera: { proteina: 18, fdn: 36, digestibilidad: 74, energiaMetab: 2.65 }
        }
    },
    "Verdeo de avena": {
        proteina: 13, fdn: 48, digestibilidad: 65, energiaMetab: 2.35,
        calidadEstacional: {
            verano:    { proteina: 10, fdn: 55, digestibilidad: 58, energiaMetab: 2.05 },
            otono:     { proteina: 15, fdn: 42, digestibilidad: 70, energiaMetab: 2.52 },
            invierno:  { proteina: 14, fdn: 45, digestibilidad: 68, energiaMetab: 2.45 },
            primavera: { proteina: 12, fdn: 50, digestibilidad: 62, energiaMetab: 2.22 }
        }
    },
    "Verdeo de invierno": {
        proteina: 15, fdn: 42, digestibilidad: 68, energiaMetab: 2.45,
        calidadEstacional: {
            verano:    { proteina: 12, fdn: 50, digestibilidad: 62, energiaMetab: 2.22 },
            otono:     { proteina: 16, fdn: 40, digestibilidad: 70, energiaMetab: 2.52 },
            invierno:  { proteina: 15, fdn: 42, digestibilidad: 68, energiaMetab: 2.45 },
            primavera: { proteina: 14, fdn: 44, digestibilidad: 66, energiaMetab: 2.38 }
        }
    },
    "Verdeo de maiz": {
        proteina: 8, fdn: 55, digestibilidad: 62, energiaMetab: 2.25,
        calidadEstacional: {
            verano:    { proteina: 9,  fdn: 52, digestibilidad: 65, energiaMetab: 2.35 },
            otono:     { proteina: 7,  fdn: 58, digestibilidad: 58, energiaMetab: 2.10 },
            invierno:  { proteina: 6,  fdn: 62, digestibilidad: 55, energiaMetab: 1.96 },
            primavera: { proteina: 8,  fdn: 55, digestibilidad: 62, energiaMetab: 2.25 }
        }
    },
    "Verdeo de raigras": {
        proteina: 16, fdn: 40, digestibilidad: 70, energiaMetab: 2.52,
        calidadEstacional: {
            verano:    { proteina: 13, fdn: 48, digestibilidad: 64, energiaMetab: 2.30 },
            otono:     { proteina: 17, fdn: 38, digestibilidad: 72, energiaMetab: 2.58 },
            invierno:  { proteina: 16, fdn: 40, digestibilidad: 70, energiaMetab: 2.52 },
            primavera: { proteina: 18, fdn: 36, digestibilidad: 74, energiaMetab: 2.65 }
        }
    },
    "Verdeo de sorgo": {
        proteina: 9, fdn: 58, digestibilidad: 58, energiaMetab: 2.10,
        calidadEstacional: {
            verano:    { proteina: 10, fdn: 55, digestibilidad: 62, energiaMetab: 2.22 },
            otono:     { proteina: 8,  fdn: 60, digestibilidad: 56, energiaMetab: 2.00 },
            invierno:  { proteina: 7,  fdn: 65, digestibilidad: 50, energiaMetab: 1.78 },
            primavera: { proteina: 9,  fdn: 58, digestibilidad: 58, energiaMetab: 2.10 }
        }
    }
};

// --- PRECIPITACIONES PROMEDIO (mm/mes) zona Pampa Humeda ---
var PRECIPITACION_PROMEDIO = {
    ENE: 95, FEB: 90, MAR: 105, ABR: 85,
    MAY: 60, JUN: 40, JUL: 38, AGO: 42,
    SEP: 55, OCT: 90, NOV: 95, DIC: 100
};

// --- SUPLEMENTOS REFERENCIA ---
var SUPLEMENTOS_REFERENCIA = {
    "Grano de maiz":  { energiaMetab: 3.20, proteina: 9,  costoRefKg: 200 },
    "Grano de sorgo":  { energiaMetab: 3.05, proteina: 10, costoRefKg: 180 },
    "Pellet de girasol":{ energiaMetab: 2.60, proteina: 32, costoRefKg: 250 },
    "Silo de maiz":    { energiaMetab: 2.50, proteina: 8,  costoRefKg: 80 },
    "Silo de sorgo":   { energiaMetab: 2.30, proteina: 7,  costoRefKg: 70 },
    "Rollo de pastura": { energiaMetab: 1.80, proteina: 8, costoRefKg: 60 },
    "Heno de alfalfa":  { energiaMetab: 2.10, proteina: 17, costoRefKg: 120 }
};
