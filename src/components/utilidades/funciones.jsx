import { getAuth, signOut } from "firebase/auth";
import { useContext } from "react";
import { FireContext } from "../../context/fireContext";
import Swal from "sweetalert2";

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
            { label: 'Asamblea de Circuito', date: '', fecha: '' },
            { label: 'Asamblea de Circuito 2', date: '', fecha: '' },
            { label: 'Asamblea Regional', date: '', fecha: '' },
            { label: 'Visita del superintendente', date: '', fecha: '' },
            { label: 'Conmemoración', date: '', fecha: '' },
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

export function errorMessage(error) {
    let message = "";
    const errorCode = error.code;  // Extrae el código del error
    switch (errorCode) {
        // Errores de autenticación (Firebase Auth)
        case "auth/invalid-email":
            message = "El formato del correo electrónico es inválido.";
            break;
        case "auth/email-already-in-use":
            message = "Este correo electrónico ya está en uso por otra cuenta.";
            break;
        case "auth/weak-password":
            message = "La contraseña es demasiado débil. Usa una más segura.";
            break;
        case "auth/user-not-found":
            message = "No se encontró ninguna cuenta asociada con este correo electrónico.";
            break;
        case "auth/wrong-password":
            message = "La contraseña es incorrecta. Verifica e intenta nuevamente.";
            break;
        case "auth/user-disabled":
            message = "La cuenta ha sido deshabilitada. Contacta al soporte.";
            break;
        case "auth/requires-recent-login":
            message = "Debes volver a iniciar sesión para poder realizar esta acción.";
            break;
        case "auth/operation-not-allowed":
            message = "El método de autenticación no está habilitado.";
            break;
        case "auth/too-many-requests":
            message = "Has realizado demasiadas solicitudes en poco tiempo. Intenta nuevamente más tarde.";
            break;
        case "auth/network-request-failed":
            message = "Problemas de conexión. Verifica tu conexión a Internet.";
            break;
        case "auth/invalid-user-token":
            message = "Tu sesión ha caducado. Inicia sesión nuevamente.";
            break;
        case "auth/credential-already-in-use":
            message = "Estas credenciales ya están asociadas a otra cuenta.";
            break;
        case "auth/missing-email":
            message = "No se proporcionó un correo electrónico.";
            break;
        case "auth/account-exists-with-different-credential":
            message = "Este correo electrónico ya está en uso con otro método de autenticación.";
            break;
        case "auth/invalid-credential":
            message = "Las credenciales proporcionadas son inválidas.";
            break;
        case "auth/invalid-verification-code":
            message = "El código de verificación es incorrecto.";
            break;
        case "auth/invalid-verification-id":
            message = "El ID de verificación no es válido.";
            break;

        // Errores de base de datos Firestore
        case "permission-denied":
            message = "No tienes permisos para realizar esta acción.";
            break;
        case "unavailable":
            message = "El servicio no está disponible en este momento. Intenta nuevamente más tarde.";
            break;
        case "deadline-exceeded":
            message = "La operación tomó demasiado tiempo. Intenta nuevamente.";
            break;
        case "resource-exhausted":
            message = "Has alcanzado el límite de uso de Firestore.";
            break;
        case "not-found":
            message = "El documento o la colección solicitada no existe.";
            break;
        case "already-exists":
            message = "El documento que intentas crear ya existe.";
            break;
        case "failed-precondition":
            message = "Condiciones necesarias no cumplidas. Verifica tu operación.";
            break;
        case "aborted":
            message = "La operación fue interrumpida. Intenta de nuevo.";
            break;
        case "out-of-range":
            message = "El valor está fuera de los límites permitidos.";
            break;
        case "data-loss":
            message = "Pérdida de datos irrecuperable.";
            break;

        // Errores de almacenamiento (Firebase Storage)
        case "storage/unauthorized":
            message = "No tienes autorización para realizar esta acción en el almacenamiento.";
            break;
        case "storage/canceled":
            message = "La operación fue cancelada.";
            break;
        case "storage/unknown":
            message = "Ha ocurrido un error desconocido.";
            break;
        case "storage/object-not-found":
            message = "No se encontró el archivo solicitado.";
            break;
        case "storage/quota-exceeded":
            message = "Se ha superado el límite de almacenamiento.";
            break;
        case "storage/retry-limit-exceeded":
            message = "Se ha superado el límite de reintentos para esta operación.";
            break;
        case "storage/invalid-checksum":
            message = "El archivo subido no pasó la verificación de integridad.";
            break;

        // Otros errores no mapeados
        default:
            message = "Error desconocido: " + errorCode;
            break;
    }

    // Mostrar el mensaje de error con SwalFire
    Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: message,
    });
}
