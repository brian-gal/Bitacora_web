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

 export async function revisarSiExistePrincipalStorage(titulo) {
    const storedData = localStorage.getItem(titulo);

    if (storedData) {
        setLoading(true);
        navigate('/');
    }
} 

    export function obtenerTituloYAño(titulo) {
        // Detecta si tiene formato "Algo-Año" (por ejemplo, "Enseñanzas-2024")
        if (/^[A-Za-zÀ-ÿñÑ\s]+-\d{4}$/.test(titulo)) {
            const partes = titulo.split('-');
            const tituloBase = partes[0].trim(); // Elimina espacios en blanco
            const año = parseInt(partes[1], 10);
            return { titulo: tituloBase, año: año };
        }
    
        // Detecta si tiene formato "Algo-Mes-Año" (por ejemplo, "Informe-9-2024")
        if (/^[A-Za-zÀ-ÿñÑ\s]+-\d{1,2}-\d{4}$/.test(titulo)) {
            const partes = titulo.split('-');
            const tituloBase = partes[0].trim();
            const mes = partes[1];
            const año = parseInt(partes[2], 10);
            return { titulo: tituloBase, año: año };
        }
    
        // Detecta si es solo una palabra sin año
        if (/^[A-Za-zÀ-ÿñÑ]+$/.test(titulo)) {
            return { titulo: titulo, año: null };
        }
    
        // Si no coincide con ningún formato conocido
        return null;
    }


