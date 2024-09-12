import { createContext, useEffect } from "react";
import { db } from '../services/firebaseConfig'; // Asegúrate de tener esta configuración
import { doc, getDoc } from 'firebase/firestore'; // Importa las funciones necesarias

export const FireContext = createContext({});

// Al montar el componente, verifica si la sesión está iniciada
const sesionIniciada = localStorage.getItem('sesion_iniciada') ? true : false;
const userEmail = localStorage.getItem('sesion_iniciada')

async function revisaStorage(clave) {
    const notasVacio = localStorage.getItem(clave) ? true : false;
    console.log(notasVacio);

    if (notasVacio) {
        try {
            // Definir la referencia al documento 'notasTexto' dentro de la subcolección 'notas'
            const notasTextoRef = doc(db, 'users', userEmail, 'notas', 'notas');
            const response = await getDoc(notasTextoRef);
            const data = response.data();
            console.log('base de datos:', data);
            console.log(data.notas);
            localStorage.setItem('notas', data.notas);

        } catch (error) {
            console.error('Error al obtener productos:', error);
        } finally {
            console.log('Operación finalizada');
        }
    }

}

// Componente proveedor del contexto
export const FireProvider = ({ children }) => {

    return (
        <FireContext.Provider
            value={{ sesionIniciada }}
        >
            {children}
        </FireContext.Provider>
    );
};