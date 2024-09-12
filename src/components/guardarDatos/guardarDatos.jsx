// importar la instancia de Firestore desde el archivo de configuración
import { db } from '../../services/firebaseConfig'; // Asegúrate de tener esta configuración
import { doc, setDoc } from 'firebase/firestore'; // Importa las funciones necesarias

export const guardarNotas = async () => {
    const userEmail = localStorage.getItem('sesion_iniciada'); 
    const mensaje = localStorage.getItem('notas'); 

    if (!userEmail || !mensaje) {
        console.warn('Faltan datos para guardar');
        return;
    }

    try {
        // Definir la referencia al documento 'notasTexto' dentro de la subcolección 'notas'
        const notasTextoRef = doc(db, 'users', userEmail, 'notas', 'notasTexto');

        // Guardar un valor de prueba en el documento 'notasTexto'
        await setDoc(notasTextoRef, {
            texto: mensaje
        });

        console.log('Nota de prueba guardada correctamente');
    } catch (error) {
        console.error('Error al guardar la nota de prueba:', error);
    }
};
