import { getDoc, doc, setDoc, collection, getDocs, writeBatch, query } from "firebase/firestore";
import { db } from "../services/firebaseConfig";

export const crearDependencia = (titulo, fecha, estaEnStorage, direccion) => {
    // 1. Obtener el objeto de dependencias desde localStorage
    const storedData = localStorage.getItem('Dependencias');
    const dependencias = storedData ? JSON.parse(storedData) : {};

    // 2. Actualizar el objeto con el título especificado
    dependencias[titulo] = {
        fecha: fecha,
        estaEnStorage: estaEnStorage,
        direccion: direccion
    };

    // 3. Guardar el objeto actualizado en localStorage
    localStorage.setItem('Dependencias', JSON.stringify(dependencias));
};

//agregar datos
export const agregarDatos = async (uid, tipo, datos) => {
    try {
        const userRef = doc(db, "users", uid);
        const tipoRef = doc(userRef, tipo, datos.id); // Asume que `datos.id` es el identificador del documento en la subcolección

        await setDoc(tipoRef, datos);

        console.log(`${tipo} agregado exitosamente para el usuario ${uid}.`);
    } catch (error) {
        console.error(`Error al agregar ${tipo} para el usuario ${uid}: `, error);
    }
};

