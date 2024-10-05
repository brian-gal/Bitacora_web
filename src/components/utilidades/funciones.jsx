import { getAuth, signOut } from "firebase/auth";

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
export function initializeGlobalStorage(guardarDatoStorage, currentFecha, titleKey) {
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

    // Verificamos si la clave específica ya existe en localStorage
    if (!localStorage.getItem(titleKey)) {
        // Guardamos el dato con la clave específica
        guardarDatoStorage(titleKey, currentFecha, globalData[titleKey]);
    }
}


// Función para inicializar los datos por año
export function initializeYearlyStorage(guardarDatoStorage, currentFecha, year, titleKey) {
    const date = new Date();
    const añoActual = date.getFullYear()

    const yearlyData = {
        [`Informe-${year}`]: {},
        [`Enseñanzas-${year}`]: {
            "Broadcasting": {},
            "Oraciones": {},
            "Gratitud": {}
        }
    };

    // Verificamos si la clave específica ya existe en localStorage
    if (!localStorage.getItem(titleKey) && añoActual == year) {
        // Guardamos el dato con la clave específica
        guardarDatoStorage(titleKey, currentFecha, yearlyData[titleKey]);
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

export function addClass(elementId, className) {
    const element = document.getElementById(elementId);
    if (element && !element.classList.contains(className)) {
        element.classList.add(className);
    }
}

export function removeClass(elementId, className) {
    const element = document.getElementById(elementId);
    if (element && element.classList.contains(className)) {
        element.classList.remove(className);
    }
}

export function cerrarSesion() {
    const auth = getAuth();
    signOut(auth).then(() => {
        localStorage.clear();
    }).catch((error) => {
        console.log(error);
    });
}
