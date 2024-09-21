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

/* export async function revisarSiExistePrincipalStorage(titulo, titulo2) {
    const storedData = localStorage.getItem(titulo);
    const storedData2 = localStorage.getItem(titulo2);

    if (storedData && storedData2) {
        setLoading(true);
        navigate('/');
    }
} */

export function obtenerTituloYAño(titulo) {
    // Detecta si tiene formato "Algo-Año" (por ejemplo, "Broadcasting-2024")
    if (/^\w+-\d{4}$/.test(titulo)) {
        const partes = titulo.split('-');
        const tituloBase = partes[0]; // El título está en la primera parte
        const año = parseInt(partes[1], 10); // El año está en la segunda parte
        return { titulo: tituloBase, año: año };
    }

    // Detecta si tiene formato "Algo-Mes-Año" (por ejemplo, "Informe-9-2024")
    if (/^\w+-\d{1,2}-\d{4}$/.test(titulo)) {
        const partes = titulo.split('-');
        const tituloBase = partes[0]; // El título está en la primera parte
        const mes = partes[1]; // El mes está en la segunda parte (aunque no se usa en este caso)
        const año = parseInt(partes[2], 10); // El año está en la tercera parte
        return { titulo: tituloBase, año: año };
    }

    // Detecta si es solo una palabra sin año, como "Notas"
    if (/^\w+$/.test(titulo)) {
        return { titulo: titulo, año: null }; // No hay año en este caso
    }

    // Si no coincide con ningún formato conocido
    return null;
}


