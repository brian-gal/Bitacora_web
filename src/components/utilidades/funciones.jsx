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

// Función para inicializar los datos globales (sin año)
export function initializeGlobalStorage(guardarDatoStorage, currentFecha) {
    const globalData = {
        "Config": { "metaHorasPredi": "10" },
        "FechasEspeciales": [
            { "label": "Asamblea de Circuito", "date": "", "fecha": "" },
            { "label": "Asamblea de Circuito 2", "date": "", "fecha": "" },
            { "label": "Asamblea Regional", "date": "", "fecha": "" },
            { "label": "Visita del superintendente", "date": "", "fecha": "" },
            { "label": "Conmemoración", "date": "", "fecha": "" }
        ],
        "Notas": { content: "", fecha: "" }
    };

    for (const [key, value] of Object.entries(globalData)) {
        if (!localStorage.getItem(key)) {
            guardarDatoStorage(key, currentFecha, value); // Usas la función directamente
        }
    }
}

// Función para inicializar los datos por año
export function initializeYearlyStorage(guardarDatoStorage, currentFecha, year) {
    const yearlyData = {
        [`Informe-${year}`]: {},
        [`Enseñanzas-${year}`]: {
            "Broadcasting": {},
            "Oraciones": {},
            "Gratitud": {}
        }
    };

    for (const [key, value] of Object.entries(yearlyData)) {
        if (!localStorage.getItem(key)) {
            guardarDatoStorage(key, currentFecha, value); // Usas la función directamente
        }
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


