export function convertirAObjeto(data) {
    if (typeof data === 'string') {
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error("Error al parsear JSON:", e);
            return data;
        }
    }
    return data;
}

export function convertirAJson(data) {
    if (typeof data === 'object') {
        try {
            return JSON.stringify(data);
        } catch (e) {
            console.error("Error al convertir a JSON:", e);
            return data;
        }
    }
    return data;
}

export function verificarYLimpiarStorage() {
    const ultimaLimpieza = localStorage.getItem('ultimaLimpieza');
    const ahora = Date.now();
    const tresMesesEnMilisegundos = 90 * 24 * 60 * 60 * 1000; // 90 días

    if (!ultimaLimpieza || ahora - Number(ultimaLimpieza) >= tresMesesEnMilisegundos) {
        localStorage.clear();

        // Actualizar la fecha de la última limpieza
        localStorage.setItem('ultimaLimpieza', ahora.toString());
    }
}



