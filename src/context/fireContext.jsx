import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from '../services/firebaseConfig'; // Asegúrate de tener esta configuración
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, collection } from "firebase/firestore";
import { DataContext } from "./dateContext";

export const FireContext = createContext({});

export const FireProvider = ({ children }) => {
    const { mes, año } = useContext(DataContext);

    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [uid, setUid] = useState(true);


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                const uid = user.uid
                comprobarDependencias("Dependencias", uid)
                comprobarDependencias("config", uid)
                comprobarDependencias("Notas", uid)
                comprobarDependencias("FechasEspeciales", uid)
                comprobarDependencias(`Broadcasting-${año}`, uid)
                comprobarDependencias(`Gratitud-${año}`, uid)
                comprobarDependencias(`Oraciones-${año}`, uid)
                comprobarDependencias(`Gratitud-${año}`, uid)
                comprobarDependencias(`Informe-${mes + 1}-${año}`, uid)

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

    async function comprobarDependencias(titulo, uid) {
        try {
            // Obtener el dato desde localStorage y verificar si existe
            const storedData = localStorage.getItem(titulo);
            if (!storedData) {
                // Si no hay datos en localStorage, obtenerlos de Firestore
                const dato = await obtenerDato(titulo, uid);

                if (dato) {
                    // Guardar el dato en localStorage después de obtenerlo de Firestore
                    // Verifica si 'dato' ya es una cadena JSON
                    if (typeof dato === 'string') {
                        localStorage.setItem(titulo, dato);
                    } else {
                        // Si 'dato' no es una cadena JSON, conviértelo a JSON y guárdalo
                        localStorage.setItem(titulo, JSON.stringify(dato));
                    }
                } else {
                    console.error(`No se pudo obtener el dato "${titulo}" de Firestore.`);
                }
            }
        } catch (error) {
            console.error(`Error al comprobar o actualizar el dato "${titulo}":`, error);
        }
    }



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

            const dato = localStorage.getItem("Dependencias");
            await subirDato("Dependencias", uid, dato);
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

    async function obtenerDato(titulo, uid) {
        try {
            // Verifica que 'titulo' y 'uid' sean cadenas
            if (typeof titulo !== 'string' || typeof uid !== 'string') {
                console.error('El título o el UID no son cadenas');
                return;
            }

            const docRef = doc(db, 'usuarios', uid);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                return;
            }

            const data = docSnap.data();

            // Verifica si 'titulo' está en los datos del documento
            if (!(titulo in data)) {
                return;
            }

            return data[titulo];
        } catch (error) {
            console.error('Error al obtener los datos:', error);
        }
    }


    async function cargarDatosStorage(titulo) {
        try {
            // Primero intentamos obtener el dato del localStorage
            const savedData = localStorage.getItem(titulo);

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
                    const datos = await obtenerDato(titulo, uid);
                    if (datos) {
                        localStorage.setItem(titulo, datos);
                        return datos
                    }
                } else {
                    // Si el título no está en las dependencias, manejamos el caso
                    console.warn(`El título "${titulo}" no está en las dependencias.`);
                }
            }

        } catch (error) {
            console.error('Error al obtener los datos:', error);
        }
    }


    return (
        <FireContext.Provider value={{ loading, cargarDatosStorage, obtenerDato }}>
            {children}
        </FireContext.Provider>
    );
};