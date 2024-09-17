import { createContext, useEffect, useState } from "react";
import { auth, db } from '../services/firebaseConfig'; // Asegúrate de tener esta configuración
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, collection } from "firebase/firestore";

export const FireContext = createContext({});

export const FireProvider = ({ children }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [uid, setUid] = useState(true);


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                const uid = user.uid
                comprobarDatos(uid); // Pasar el UID al llamar la función
                setUid(uid)
                navigate('/');
                setLoading(true); // Cambia a false después de la navegación
            } else {
                navigate('/iniciarSesion');
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    async function comprobarDatos(uid) {
        try {
            // Obtener el objeto de actualizaciones pendientes
            const ActualizacionPendiente = JSON.parse(localStorage.getItem("ActualizacionPendiente"));

            // Si no hay actualizaciones pendientes, no hacer nada
            if (!ActualizacionPendiente || Object.keys(ActualizacionPendiente).length === 0) {
                return;
            }

            // Procesar cada clave (título) del objeto de actualizaciones pendientes
            for (const titulo of Object.keys(ActualizacionPendiente)) {
                // Obtener el dato del localStorage
                const dato = localStorage.getItem(titulo);
                if (dato) {
                    // Subir el dato a la base de datos
                    await subirDato(titulo, uid, dato);
                } else {
                    console.error(`No se encontró el dato para "${titulo}" en el localStorage.`);
                }
            }

            // Una vez procesadas todas las actualizaciones, eliminar el archivo de actualizaciones
            localStorage.removeItem("ActualizacionPendiente");
        } catch (error) {
            // Si ocurre un error, imprimirlo en consola sin eliminar el archivo de actualizaciones
            console.error('Error al procesar las actualizaciones:', error);
        }
    }


    async function subirDato(titulo, uid, dato) {
        try {
            const docRef = doc(db, 'usuarios', uid);

            await setDoc(docRef, {
                [titulo]: dato
            }, { merge: true });

        } catch (error) {
            console.error(`Error al actualizar el dato "${titulo}":`, error);
        }
    }

    async function obtenerDato(titulo) {
        try {
            const docRef = doc(db, 'usuarios', uid);
            const docSnap = await getDoc(docRef);
            return docSnap.data()[titulo];
        } catch (error) {
            console.error('Error al obtener los datos: ', error);
        }
    }

    async function cargarDatosStorage(titulo) {
        try {
            // Primero intentamos obtener el dato del localStorage
            const savedData = localStorage.getItem(titulo);
            console.log(titulo);

            if (savedData) {
                return savedData;
            }

            // Si el dato no está en el localStorage, revisamos el archivo de dependencias
            const dependencias = localStorage.getItem("Dependencias");
            if (dependencias) {

                // Convertimos dependencias a un objeto
                const dependenciasObj = JSON.parse(dependencias);

                // Verificamos si el título está en las dependencias
                if (titulo in dependenciasObj) {
                    const datos = await obtenerDato(titulo);
                    console.log(datos);
                    localStorage.setItem(titulo, datos);
                    return datos
                } else {
                    // Si el título no está en las dependencias, manejamos el caso
                    console.warn(`El título "${titulo}" no está en las dependencias.`);
                }
            }

        } catch (error) {
            console.error('Error al obtener los datos:', error);
        }
    }



    /* async function verificarExistenciaDocumento(uid) {
        try {
            const docRef = doc(db, 'usuarios', uid);
            const docSnap = await getDoc(docRef);
            return docSnap.exists();
        } catch (error) {
            console.error('Error al verificar la existencia del documento: ', error);
            return false;
        }
    } */


    return (
        <FireContext.Provider value={{ loading, cargarDatosStorage }}>
            {children}
        </FireContext.Provider>
    );
};