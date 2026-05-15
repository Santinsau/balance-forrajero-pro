// Datos forrajeros globales para Simulagro Lite.
var DATOS_FORRAJEROS_EMBEBIDOS = {
  "recursos": ["Campo natural","Campo natural con agropiro","Pastura base alfalfa","Pastura consociada","Pastura de agropiro","Pastura de festuca","Promocion de raigras","Promocion intensiva de raigras","Verdeo de avena","Verdeo de invierno","Verdeo de maiz","Verdeo de raigras","Verdeo de sorgo"],
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
    "Campo natural":{"promedio":427.91,"produccion_mejor":481.5,"produccion_peor":357.1},
    "Campo natural con agropiro":{"promedio":430.79,"produccion_mejor":562.9,"produccion_peor":322.9},
    "Pastura base alfalfa":{"promedio":584.36,"produccion_mejor":645.9,"produccion_peor":498.8},
    "Pastura consociada":{"promedio":674.56,"produccion_mejor":767.4,"produccion_peor":551.2},
    "Pastura de agropiro":{"promedio":609.77,"produccion_mejor":658.4,"produccion_peor":540.3},
    "Pastura de festuca":{"promedio":622.68,"produccion_mejor":710.6,"produccion_peor":532.0},
    "Promocion de raigras":{"promedio":578.01,"produccion_mejor":657.2,"produccion_peor":485.6},
    "Promocion intensiva de raigras":{"promedio":728.39,"produccion_mejor":863.9,"produccion_peor":555.4},
    "Verdeo de avena":{"promedio":611.13,"produccion_mejor":750.7,"produccion_peor":375.8},
    "Verdeo de invierno":{"promedio":723.99,"produccion_mejor":897.7,"produccion_peor":341.7},
    "Verdeo de maiz":{"promedio":723.13,"produccion_mejor":961.8,"produccion_peor":467.6},
    "Verdeo de raigras":{"promedio":664.65,"produccion_mejor":851.1,"produccion_peor":432.4},
    "Verdeo de sorgo":{"promedio":708.12,"produccion_mejor":969.3,"produccion_peor":412.9}
  }
};

function clonarDatosForrajeros(data) {
    return JSON.parse(JSON.stringify(data));
}

function construirDatosRegion(promedios, ordenRecursos) {
    var recursos = (ordenRecursos && ordenRecursos.length ? ordenRecursos.slice() : Object.keys(promedios)).filter(function(r) {
        return !!promedios[r];
    });
    var resumen = {};
    recursos.forEach(function(recurso) {
        var mensual = (promedios[recurso].mensual || []).slice(0, 12).map(function(v) { return Number(v) || 0; });
        var anual = promedios[recurso].anual || mensual.reduce(function(a, b) { return a + b; }, 0);
        var promedio = anual / 12;
        resumen[recurso] = {
            promedio: Number(promedio.toFixed(2)),
            produccion_mejor: Number((promedio * 1.15).toFixed(1)),
            produccion_peor: Number((promedio * 0.85).toFixed(1))
        };
        promedios[recurso] = { mensual: mensual, anual: Number(anual.toFixed ? anual.toFixed(1) : anual) };
    });
    return { recursos: recursos, promedios: promedios, resumen: resumen };
}

var ORDEN_RECURSOS_REGION = ['Campo natural','Campo natural con agropiro','Campo natural con festuca','Pastura base alfalfa','Pastura de alfalfa pura','Pastura consociada','Pastura de agropiro','Agropiro','Pastura de agropiro y festuca','Pastura de festuca','Pastura de lloron','Pastura de gramma','Promocion de raigras','Promocion intensiva de raigras','Verdeo de avena','Verdeo de avena y vicia','Verdeo de invierno','Verdeo de maiz','Maiz diferido','Verdeo de raigras','Verdeo de sorgo','Sorgo diferido','Verdeo de triticale','Verdeo de verano','Pastura de digitaria','Pastura de panicum coloratum','Silo de maiz'];
var REGION_FORRAJERA_ACTIVA = 'sudeste_ba';
var DATOS_FORRAJEROS_POR_REGION = {
    sudeste_ba: { nombre: 'Sudeste BA', data: clonarDatosForrajeros(DATOS_FORRAJEROS_EMBEBIDOS) },
    mar_y_sierras: { nombre: 'Mar y sierras', data: construirDatosRegion({
        'Campo natural': { mensual: [488.5,517.0,517.5,400.9,301.7,255.0,254.8,292.3,371.7,509.6,590.4,520.5], anual: 5019.9 },
        'Campo natural con agropiro': { mensual: [362.1,375.0,389.5,351.4,293.9,254.8,254.5,293.1,374.7,481.6,486.1,379.5], anual: 4296.2 },
        'Pastura base alfalfa': { mensual: [684.7,756.2,782.9,661.5,462.2,362.4,362.7,480.7,680.6,980.0,1054.9,805.6], anual: 8074.4 },
        'Pastura consociada': { mensual: [719.6,808.9,850.2,747.1,565.9,476.7,488.8,651.5,907.9,1258.7,1082.2,742.9], anual: 9300.4 },
        'Pastura de agropiro y festuca': { mensual: [925.6,888.2,867.9,698.8,540.7,422.5,419.0,546.8,741.1,1098.5,1331.4,1203.6], anual: 9684.1 },
        'Pastura de festuca': { mensual: [304.8,225.8,238.2,177.5,179.8,153.3,249.0,448.8,479.0,611.8,455.2,376.9], anual: 3900.1 },
        'Promocion intensiva de raigras': { mensual: [0.0,0.0,884.3,914.1,670.5,511.5,481.4,623.8,867.6,1354.0,1561.6,104.6], anual: 7973.4 },
        'Verdeo de avena': { mensual: [666.3,677.2,597.4,827.4,738.0,511.9,438.4,525.5,702.2,595.5,544.5,335.2], anual: 7159.5 },
        'Verdeo de invierno': { mensual: [0.0,569.6,725.5,932.7,719.6,509.4,471.9,604.1,847.5,943.7,872.5,0.0], anual: 7196.5 },
        'Verdeo de maiz': { mensual: [2299.8,2958.3,2423.0,1478.9,0.0,0.0,0.0,0.0,0.0,0.0,1660.7,1591.4], anual: 12412.1 },
        'Verdeo de raigras': { mensual: [449.4,440.9,687.9,1232.5,1044.5,833.9,794.8,1002.3,1253.0,1842.8,680.4,544.0], anual: 10806.4 },
        'Verdeo de sorgo': { mensual: [1431.4,1639.3,1516.0,984.3,521.9,268.5,487.7,1188.0,2165.9,1797.1,959.1,838.0], anual: 13797.2 },
        'Verdeo de verano': { mensual: [2124.3,2215.8,2024.5,1437.6,1001.7,0.0,0.0,0.0,0.0,0.0,1846.4,1503.6], anual: 12153.9 }
    }, ORDEN_RECURSOS_REGION) },
    sudoeste_ba: { nombre: 'Sudoeste BA', data: construirDatosRegion({
        'Agropiro': { mensual: [294.6,292.4,330.3,344.0,314.3,268.4,258.3,294.5,356.1,424.6,451.8,338.8], anual: 3968.1 },
        'Campo natural': { mensual: [361.1,367.5,387.6,343.1,280.4,244.2,239.1,264.0,321.8,424.0,479.5,393.9], anual: 4106.2 },
        'Campo natural con agropiro': { mensual: [375.0,377.2,407.8,363.3,294.4,252.9,242.1,268.1,334.3,442.3,495.5,404.9], anual: 4257.8 },
        'Campo natural con festuca': { mensual: [470.5,557.9,574.0,492.4,377.3,292.8,281.5,362.6,485.9,702.8,890.2,590.0], anual: 6077.9 },
        'Pastura base alfalfa': { mensual: [788.3,725.1,690.0,668.9,534.9,413.8,384.6,480.4,722.2,1067.9,1242.8,826.6], anual: 8545.5 },
        'Pastura consociada': { mensual: [747.0,760.1,784.3,669.0,505.9,407.1,386.4,459.4,658.8,959.6,1070.0,773.0], anual: 8180.6 },
        'Pastura de agropiro': { mensual: [522.3,548.2,657.5,606.8,490.2,393.6,366.0,423.9,555.7,765.2,846.5,632.7], anual: 6808.6 },
        'Pastura de agropiro y festuca': { mensual: [642.4,664.7,741.6,632.4,469.4,372.4,359.8,422.8,566.0,805.4,891.0,638.2], anual: 7206.1 },
        'Pastura de alfalfa pura': { mensual: [1297.9,1330.0,1419.9,1216.5,1090.3,939.5,929.5,1027.6,1295.1,1600.6,1641.7,1262.9], anual: 15051.5 },
        'Pastura de festuca': { mensual: [686.5,715.1,781.5,654.1,487.4,396.7,374.8,446.1,616.8,899.6,1047.4,801.5], anual: 7907.5 },
        'Pastura de gramma': { mensual: [527.7,495.6,601.0,255.6,0.0,0.0,0.0,0.0,0.0,0.0,332.1,495.0], anual: 2707.0 },
        'Pastura de lloron': { mensual: [288.1,290.9,307.8,284.5,248.0,220.6,216.9,237.2,279.9,347.3,361.7,302.1], anual: 3385.0 },
        'Promocion de raigras': { mensual: [418.0,468.7,735.1,654.4,552.7,475.9,448.9,550.7,730.4,990.2,1091.4,518.4], anual: 7634.8 },
        'Promocion intensiva de raigras': { mensual: [0.0,156.0,824.4,855.5,629.7,460.2,390.7,505.7,778.1,1557.7,2017.5,93.7], anual: 8269.2 },
        'Verdeo de avena': { mensual: [1053.2,663.8,828.6,725.7,484.2,325.4,300.6,360.9,565.0,463.7,336.3,1039.4], anual: 7146.8 },
        'Verdeo de avena y vicia': { mensual: [0.0,326.8,340.9,468.2,539.1,480.6,447.8,508.9,649.3,868.3,712.1,0.0], anual: 5342.0 },
        'Verdeo de invierno': { mensual: [0.0,603.0,843.0,1038.6,756.6,486.7,391.7,435.7,585.1,1247.3,1258.7,62.6], anual: 7709.0 },
        'Verdeo de maiz': { mensual: [1766.6,2024.8,1892.8,1199.3,257.4,0.0,0.0,0.0,0.0,959.5,1412.6,1233.9], anual: 10746.9 },
        'Verdeo de raigras': { mensual: [0.0,981.8,926.4,999.9,743.8,661.4,571.8,681.4,972.2,0.0,0.0,0.0], anual: 6538.7 },
        'Verdeo de sorgo': { mensual: [1303.4,1517.4,1454.1,867.7,623.6,0.0,0.0,0.0,798.3,817.5,1036.0,862.8], anual: 9280.8 },
        'Verdeo de triticale': { mensual: [0.0,394.5,349.7,262.1,322.8,359.4,363.2,468.0,619.4,446.4,323.5,0.0], anual: 3909.0 },
        'Verdeo de verano': { mensual: [1777.0,2234.0,2007.0,1247.3,917.8,488.3,421.9,560.8,1210.8,1327.0,1747.0,1344.3], anual: 15283.2 }
    }, ORDEN_RECURSOS_REGION) },
    centro_argentina: { nombre: 'Centro Argentina', data: construirDatosRegion({
        'Campo natural': { mensual: [492.4, 496.7, 437.7, 337.8, 273.1, 240.2, 228.0, 231.2, 241.9, 275.3, 343.8, 421.6], anual: 4019.7 },
        'Campo natural con agropiro': { mensual: [436.7, 418.3, 373.2, 329.8, 274.2, 236.2, 227.4, 233.5, 251.4, 280.1, 357.5, 377.2], anual: 3795.5 },
        'Pastura base alfalfa': { mensual: [980.9, 963.9, 793.7, 548.4, 399.9, 324.1, 289.9, 339.4, 463.3, 617.0, 795.5, 945.3], anual: 7461.3 },
        'Pastura de alfalfa pura': { mensual: [2150.1, 2017.0, 1646.5, 1414.5, 1092.8, 951.0, 954.1, 992.2, 1214.2, 1631.7, 1742.2, 1966.0], anual: 17772.3 },
        'Pastura consociada': { mensual: [1100.6, 1079.7, 836.2, 575.9, 423.0, 355.2, 342.4, 406.3, 550.2, 715.0, 806.7, 975.5], anual: 8166.7 },
        'Pastura de agropiro': { mensual: [628.1, 644.9, 554.3, 409.9, 314.6, 290.6, 265.1, 287.5, 357.0, 425.3, 494.6, 554.7], anual: 5226.6 },
        'Pastura de lloron': { mensual: [1001.5, 1028.7, 875.0, 559.0, 314.8, 211.4, 194.9, 229.9, 301.5, 492.1, 747.1, 886.3], anual: 6842.2 },
        'Verdeo de avena': { mensual: [0.0, 652.9, 501.6, 1037.9, 917.3, 599.9, 407.4, 362.1, 371.5, 437.2, 432.2, 0.0], anual: 5720.0 },
        'Verdeo de invierno': { mensual: [0.0, 943.3, 593.6, 472.6, 419.2, 385.1, 359.2, 390.7, 464.9, 590.6, 596.6, 1184.8], anual: 6400.6 },
        'Verdeo de maiz': { mensual: [3724.6, 4387.1, 2832.3, 999.4, 607.4, 296.1, 0.0, 0.0, 0.0, 952.2, 1007.0, 2039.8], anual: 16845.9 },
        'Verdeo de raigras': { mensual: [0.0, 2263.1, 546.2, 332.9, 312.7, 528.4, 704.1, 1577.2, 1131.1, 984.6, 0.0, 0.0], anual: 8380.3 },
        'Verdeo de sorgo': { mensual: [2692.7, 2740.2, 1839.9, 1021.4, 385.5, 206.2, 124.5, 144.2, 189.4, 351.0, 521.4, 1331.6], anual: 11548.0 },
        'Verdeo de verano': { mensual: [3169.0, 3070.5, 764.8, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 351.6, 1065.8, 889.2], anual: 9310.9 },
        'Pastura de digitaria': { mensual: [1011.7, 1065.5, 886.7, 550.2, 278.2, 170.6, 156.2, 188.3, 267.6, 508.4, 768.4, 903.6], anual: 6755.4 },
        'Pastura de panicum coloratum': { mensual: [2022.9, 1505.7, 764.0, 278.3, 106.7, 22.1, 0.0, 0.0, 65.7, 150.6, 441.8, 1090.9], anual: 6448.7 }
    }, ORDEN_RECURSOS_REGION) },
    noroeste_ba: { nombre: 'Noroeste BA', data: construirDatosRegion({
        'Campo natural': { mensual: [550.8, 591.0, 500.3, 354.6, 271.2, 233.8, 228.5, 255.7, 310.2, 408.5, 496.9, 508.2], anual: 4709.7 },
        'Campo natural con agropiro': { mensual: [453.2, 452.8, 425.6, 334.1, 266.4, 227.2, 220.7, 244.3, 286.4, 363.1, 417.6, 413.4], anual: 4104.8 },
        'Campo natural con festuca': { mensual: [657.9, 737.4, 624.2, 406.6, 285.4, 226.4, 222.4, 248.7, 346.0, 479.0, 524.9, 531.1], anual: 5290.0 },
        'Pastura base alfalfa': { mensual: [1400.7, 1250.4, 927.6, 533.4, 395.7, 332.8, 325.9, 473.8, 694.9, 821.1, 1246.7, 1193.9], anual: 9596.9 },
        'Pastura consociada': { mensual: [758.3, 758.7, 647.6, 520.8, 398.5, 348.7, 342.6, 406.9, 505.3, 658.7, 748.6, 752.6], anual: 6847.3 },
        'Pastura de agropiro': { mensual: [951.4, 1032.5, 805.9, 516.0, 413.1, 386.3, 392.8, 473.2, 603.9, 711.1, 922.9, 838.5], anual: 8047.6 },
        'Pastura de agropiro y festuca': { mensual: [543.1, 501.2, 417.0, 638.2, 460.8, 398.0, 384.0, 465.9, 644.5, 555.0, 701.1, 661.8], anual: 6370.6 },
        'Pastura de festuca': { mensual: [1239.2, 1324.3, 1004.3, 662.9, 474.5, 387.4, 393.3, 479.6, 656.7, 758.3, 981.3, 976.2], anual: 9338.0 },
        'Pastura de lloron': { mensual: [468.8, 449.2, 459.7, 382.5, 294.4, 259.1, 252.8, 273.5, 320.5, 441.7, 530.0, 506.5], anual: 4638.7 },
        'Promocion de raigras': { mensual: [708.1, 783.7, 682.6, 501.5, 351.1, 279.1, 262.9, 359.4, 479.3, 641.9, 654.8, 587.3], anual: 6291.7 },
        'Verdeo de avena': { mensual: [0.0, 2710.5, 1568.2, 707.8, 436.0, 441.6, 447.0, 596.0, 705.7, 462.6, 0.0, 0.0], anual: 8075.4 },
        'Verdeo de avena y vicia': { mensual: [0.0, 2481.3, 1754.0, 447.3, 354.0, 520.4, 582.0, 777.5, 1017.2, 0.0, 0.0, 0.0], anual: 7933.7 },
        'Verdeo de invierno': { mensual: [0.0, 1879.4, 507.4, 444.3, 458.9, 405.3, 385.8, 449.2, 492.2, 0.0, 0.0, 0.0], anual: 5022.5 },
        'Verdeo de maiz': { mensual: [3227.3, 3331.0, 2438.9, 1347.6, 1089.8, 0.0, 0.0, 0.0, 0.0, 1166.8, 1570.2, 2430.4], anual: 16602.0 },
        'Verdeo de raigras': { mensual: [0.0, 0.0, 0.0, 0.0, 257.5, 422.9, 475.4, 501.6, 558.0, 649.5, 0.0, 0.0], anual: 2864.9 },
        'Verdeo de sorgo': { mensual: [2001.8, 1922.2, 1374.6, 626.5, 433.0, 0.0, 0.0, 0.0, 0.0, 475.5, 634.6, 1426.9], anual: 8895.1 },
        'Verdeo de triticale': { mensual: [0.0, 962.4, 688.1, 662.4, 723.5, 404.8, 488.7, 672.6, 620.5, 0.0, 0.0, 0.0], anual: 5223.0 },
        'Verdeo de verano': { mensual: [2935.5, 2558.4, 1157.7, 403.4, 354.2, 0.0, 0.0, 0.0, 0.0, 491.2, 890.0, 1573.7], anual: 10364.1 },
        'Silo de maiz': { mensual: [5021.7, 4324.0, 3322.6, 1127.7, 1093.9, 0.0, 0.0, 0.0, 0.0, 1021.2, 1132.5, 1865.8], anual: 18909.4 }
    }, ORDEN_RECURSOS_REGION) }
};

var RECURSOS_DERIVADOS_REGION = {
    'Maiz diferido': {
        base: 'Verdeo de maiz',
        factorAnual: 0.72,
        pesosDisponibilidad: [0, 0, 0, 0.15, 0.20, 0.25, 0.20, 0.12, 0.05, 0.03, 0, 0]
    },
    'Sorgo diferido': {
        base: 'Verdeo de sorgo',
        factorAnual: 0.78,
        pesosDisponibilidad: [0, 0, 0.08, 0.18, 0.22, 0.20, 0.15, 0.10, 0.05, 0.02, 0, 0]
    }
};

var RECURSOS_ASISTIDOS_BASE = [
    { value: 'Campo natural', label: 'Campo natural', descripcion: 'Base simple para ambientes naturales y promociones.' },
    { value: 'Pastura base alfalfa', label: 'Pastura base alfalfa', descripcion: 'Sirve para alfalfa y pasturas de alta produccion.' },
    { value: 'Pastura consociada', label: 'Pastura consociada', descripcion: 'Buena base para mezclas templadas y planteos equilibrados.' },
    { value: 'Pastura de festuca', label: 'Pastura de festuca', descripcion: 'Util para recursos dominados por festuca o templadas invernales.' },
    { value: 'Pastura de agropiro', label: 'Pastura de agropiro', descripcion: 'Referencia para bajos salinos o ambientes mas duros.' },
    { value: 'Agropiro', label: 'Agropiro', descripcion: 'Opcion simple cuando el recurso es practicamente agropiro puro.' },
    { value: 'Verdeo de invierno', label: 'Verdeo de invierno', descripcion: 'Base general para avena, raigras, centeno o mezclas invernales.' },
    { value: 'Verdeo de raigras', label: 'Verdeo de raigras', descripcion: 'Mejor cuando el recurso se parece mas a un verdeo/raigras de alta calidad.' },
    { value: 'Verdeo de maiz', label: 'Verdeo de maiz', descripcion: 'Para maices de aprovechamiento directo en verano-otono.' },
    { value: 'Maiz diferido', label: 'Maiz diferido', descripcion: 'Pensado para maices diferidos con oferta concentrada en otono-invierno.' },
    { value: 'Verdeo de sorgo', label: 'Verdeo de sorgo', descripcion: 'Para sorgos de pastoreo o aprovechamiento directo.' },
    { value: 'Sorgo diferido', label: 'Sorgo diferido', descripcion: 'Pensado para sorgos diferidos o reservados para otono-invierno.' }
];

var FACTOR_PRODUCTIVIDAD_ASISTIDA = { baja: 0.8, media: 1, alta: 1.2 };

function construirMensualDerivado(baseMensual, factorAnual, pesosDisponibilidad) {
    var totalBase = (baseMensual || []).reduce(function(a, b) { return a + (Number(b) || 0); }, 0);
    var totalObjetivo = totalBase * (factorAnual || 1);
    var pesos = (pesosDisponibilidad || []).slice(0, 12).map(function(v) { return Number(v) || 0; });
    while (pesos.length < 12) pesos.push(0);
    var sumaPesos = pesos.reduce(function(a, b) { return a + b; }, 0);
    if (sumaPesos <= 0) return { mensual: Array(12).fill(0), anual: 0 };
    var mensual = pesos.map(function(peso) {
        return Number((totalObjetivo * peso / sumaPesos).toFixed(1));
    });
    var totalMensual = mensual.reduce(function(a, b) { return a + b; }, 0);
    var diferencia = Number((totalObjetivo - totalMensual).toFixed(1));
    if (Math.abs(diferencia) >= 0.1) {
        var idx = -1;
        for (var i = mensual.length - 1; i >= 0; i--) {
            if (mensual[i] > 0 || pesos[i] > 0) { idx = i; break; }
        }
        if (idx === -1) idx = 0;
        mensual[idx] = Number((mensual[idx] + diferencia).toFixed(1));
    }
    return {
        mensual: mensual,
        anual: Number(mensual.reduce(function(a, b) { return a + b; }, 0).toFixed(1))
    };
}

function asegurarResumenRegionRecurso(data, recurso) {
    if (!data || !data.promedios || !data.promedios[recurso]) return;
    if (!data.resumen) data.resumen = {};
    var anual = Number(data.promedios[recurso].anual) || 0;
    var promedio = anual / 12;
    data.resumen[recurso] = {
        promedio: Number(promedio.toFixed(2)),
        produccion_mejor: Number((promedio * 1.15).toFixed(1)),
        produccion_peor: Number((promedio * 0.85).toFixed(1))
    };
}

function reordenarRecursosRegion(data) {
    if (!data || !data.promedios) return;
    var vistos = {};
    var ordenados = [];
    ORDEN_RECURSOS_REGION.forEach(function(recurso) {
        if (data.promedios[recurso] && !vistos[recurso]) {
            ordenados.push(recurso);
            vistos[recurso] = true;
        }
    });
    Object.keys(data.promedios).forEach(function(recurso) {
        if (!vistos[recurso]) ordenados.push(recurso);
    });
    data.recursos = ordenados;
}

function enriquecerRegionConRecursosDerivados(data) {
    if (!data || !data.promedios) return;
    Object.keys(RECURSOS_DERIVADOS_REGION).forEach(function(nombreDerivado) {
        if (data.promedios[nombreDerivado]) return;
        var definicion = RECURSOS_DERIVADOS_REGION[nombreDerivado];
        var base = data.promedios[definicion.base];
        if (!base || !base.mensual) return;
        data.promedios[nombreDerivado] = construirMensualDerivado(base.mensual, definicion.factorAnual, definicion.pesosDisponibilidad);
        asegurarResumenRegionRecurso(data, nombreDerivado);
    });
    reordenarRecursosRegion(data);
}

Object.keys(DATOS_FORRAJEROS_POR_REGION).forEach(function(regionId) {
    enriquecerRegionConRecursosDerivados(DATOS_FORRAJEROS_POR_REGION[regionId].data);
});

var MESES_USO_DEFECTO = {
    'Campo natural': [1,1,1,1,1,1,1,1,1,1,1,1],
    'Campo natural con agropiro': [1,1,1,1,1,1,1,1,1,1,1,1],
    'Campo natural con festuca': [1,1,1,1,1,1,1,1,1,1,1,1],
    'Pastura base alfalfa': [1,1,1,1,1,1,1,1,1,1,1,1],
    'Pastura de alfalfa pura': [1,1,1,1,1,1,1,1,1,1,1,1],
    'Pastura consociada': [1,1,1,1,1,1,1,1,1,1,1,1],
    'Agropiro': [1,1,1,1,1,1,1,1,1,1,1,1],
    'Pastura de agropiro': [1,1,1,1,1,1,1,1,1,1,1,1],
    'Pastura de agropiro y festuca': [1,1,1,1,1,1,1,1,1,1,1,1],
    'Pastura de festuca': [1,1,1,1,1,1,1,1,1,1,1,1],
    'Pastura de lloron': [1,1,1,1,1,1,1,1,1,1,1,1],
    'Pastura de gramma': [1,1,1,1,1,1,1,1,1,1,1,1],
    'Promocion de raigras': [0,0,0,1,1,1,1,1,1,1,1,0],
    'Promocion intensiva de raigras': [0,0,0,1,1,1,1,1,1,1,1,0],
    'Verdeo de avena': [0,1,1,1,1,1,1,1,1,1,1,0],
    'Verdeo de avena y vicia': [0,1,1,1,1,1,1,1,1,1,1,0],
    'Verdeo de invierno': [0,1,1,1,1,1,1,1,1,1,1,0],
    'Verdeo de maiz': [1,1,1,1,1,0,0,0,0,1,0,1],
    'Maiz diferido': [0,0,0,1,1,1,1,1,0,0,0,0],
    'Verdeo de raigras': [0,1,1,1,1,1,1,1,1,1,0,0],
    'Verdeo de sorgo': [1,0,0,1,1,0,0,0,0,1,1,1],
    'Sorgo diferido': [0,0,1,1,1,1,1,0,0,0,0,0],
    'Verdeo de triticale': [0,1,1,1,1,1,1,1,1,1,1,0],
    'Verdeo de verano': [1,1,1,1,1,0,0,0,0,1,1,1],
    'Pastura de digitaria': [1,1,1,1,1,1,1,1,1,1,1,1],
    'Pastura de panicum coloratum': [1,1,1,1,1,1,1,1,1,1,1,1],
    'Silo de maiz': [1,1,1,1,1,1,1,1,1,1,1,1]
};

var MESES_PASTOREO_DEFECTO = {
    'Campo natural':                    { inicio: null, fin: null },
    'Campo natural con agropiro':       { inicio: null, fin: null },
    'Campo natural con festuca':        { inicio: null, fin: null },
    'Pastura base alfalfa':             { inicio: null, fin: null },
    'Pastura de alfalfa pura':          { inicio: null, fin: null },
    'Pastura consociada':               { inicio: null, fin: null },
    'Agropiro':                         { inicio: null, fin: null },
    'Pastura de agropiro':              { inicio: null, fin: null },
    'Pastura de agropiro y festuca':    { inicio: null, fin: null },
    'Pastura de festuca':               { inicio: null, fin: null },
    'Pastura de lloron':                { inicio: null, fin: null },
    'Pastura de gramma':                { inicio: null, fin: null },
    'Promocion de raigras':             { inicio: 3,    fin: 10   },
    'Promocion intensiva de raigras':   { inicio: 3,    fin: 10   },
    'Verdeo de avena':                  { inicio: 1,    fin: 10   },
    'Verdeo de avena y vicia':          { inicio: 1,    fin: 10   },
    'Verdeo de invierno':               { inicio: 1,    fin: 10   },
    'Verdeo de triticale':              { inicio: 1,    fin: 10   },
    'Verdeo de raigras':                { inicio: 1,    fin: 9    },
    'Verdeo de maiz':                   { inicio: 11,   fin: 3    },
    'Verdeo de sorgo':                  { inicio: 11,   fin: 4    },
    'Verdeo de verano':                 { inicio: 11,   fin: 4    },
    'Maiz diferido':                    { inicio: 3,    fin: 7    },
    'Sorgo diferido':                   { inicio: 2,    fin: 6    },
    'Pastura de digitaria':             { inicio: null, fin: null },
    'Pastura de panicum coloratum':     { inicio: null, fin: null },
    'Silo de maiz':                     { inicio: null, fin: null }
};

var PERFIL_NRC = {
    'Campo natural':                 { fdn: {inv:75, pri:58}, em: {inv:1.60, pri:2.20} },
    'Campo natural con agropiro':    { fdn: {inv:72, pri:56}, em: {inv:1.70, pri:2.20} },
    'Campo natural con festuca':     { fdn: {inv:68, pri:54}, em: {inv:1.75, pri:2.28} },
    'Pastura base alfalfa':          { fdn: {inv:46, pri:38}, em: {inv:2.30, pri:2.58} },
    'Pastura de alfalfa pura':       { fdn: {inv:42, pri:34}, em: {inv:2.40, pri:2.65} },
    'Pastura consociada':            { fdn: {inv:52, pri:42}, em: {inv:2.15, pri:2.45} },
    'Agropiro':                      { fdn: {inv:64, pri:55}, em: {inv:1.85, pri:2.15} },
    'Pastura de agropiro':           { fdn: {inv:64, pri:55}, em: {inv:1.85, pri:2.15} },
    'Pastura de agropiro y festuca': { fdn: {inv:58, pri:48}, em: {inv:1.95, pri:2.28} },
    'Pastura de festuca':            { fdn: {inv:60, pri:48}, em: {inv:1.96, pri:2.35} },
    'Pastura de lloron':             { fdn: {inv:70, pri:60}, em: {inv:1.75, pri:2.10} },
    'Pastura de gramma':             { fdn: {inv:72, pri:62}, em: {inv:1.70, pri:2.00} },
    'Promocion de raigras':          { fdn: {inv:44, pri:40}, em: {inv:2.38, pri:2.52} },
    'Promocion intensiva de raigras':{ fdn: {inv:40, pri:36}, em: {inv:2.50, pri:2.65} },
    'Verdeo de avena':               { fdn: {inv:45, pri:50}, em: {inv:2.45, pri:2.22} },
    'Verdeo de avena y vicia':       { fdn: {inv:44, pri:42}, em: {inv:2.45, pri:2.35} },
    'Verdeo de invierno':            { fdn: {inv:42, pri:44}, em: {inv:2.45, pri:2.38} },
    'Verdeo de maiz':                { fdn: {inv:62, pri:55}, em: {inv:1.96, pri:2.25} },
    'Maiz diferido':                 { fdn: {inv:70, pri:64}, em: {inv:1.62, pri:1.92} },
    'Verdeo de raigras':             { fdn: {inv:40, pri:36}, em: {inv:2.52, pri:2.65} },
    'Verdeo de sorgo':               { fdn: {inv:65, pri:58}, em: {inv:1.78, pri:2.10} },
    'Sorgo diferido':                { fdn: {inv:72, pri:64}, em: {inv:1.55, pri:1.88} },
    'Verdeo de triticale':           { fdn: {inv:46, pri:44}, em: {inv:2.35, pri:2.30} },
    'Verdeo de verano':              { fdn: {inv:58, pri:52}, em: {inv:2.00, pri:2.25} },
    'Pastura de digitaria':          { fdn: {inv:70, pri:60}, em: {inv:1.75, pri:2.10} },
    'Pastura de panicum coloratum':  { fdn: {inv:70, pri:60}, em: {inv:1.75, pri:2.10} },
    'Silo de maiz':                  { fdn: {inv:62, pri:55}, em: {inv:1.96, pri:2.25} }
};
