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
                /* comprobarDependencias("Dependencias", uid)
                comprobarDependencias("config", uid)
                comprobarDependencias("Notas", uid)
                comprobarDependencias("FechasEspeciales", uid)
                comprobarDependencias(`Broadcasting-${año}`, uid)
                comprobarDependencias(`Gratitud-${año}`, uid)
                comprobarDependencias(`Oraciones-${año}`, uid)
                comprobarDependencias(`Gratitud-${año}`, uid)
                comprobarDependencias(`Informe-${mes + 1}-${año}`, uid) */

                /* comprobarDatos(uid); */ // Pasar el UID al llamar la función
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

            //si el dato existe lo retorna y se detiene
            if (savedData) {
                return savedData;
            }

            // Si el dato no está en el localStorage, revisamos el archivo de dependencias
            const dependencias = localStorage.getItem("Dependencias");

            //si el archivo Dependencias existe
            if (dependencias) {

                // Convertimos dependencias a un objeto
                const dependenciasObj = JSON.parse(dependencias);

                // Verificamos si el archivo que buscamos está en alguna clave del archivo de dependencias
                if (titulo in dependenciasObj) {
                    //si lo esta, significa que exite en la base de datos y lo busca
                    const datos = await obtenerDato(titulo, uid);

                    //luego solo si el dato es valido lo guarda para futuras consultas y retorna el dato
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

    function guardarDatoStorage(titulo, fecha, data) {
        // 1. Obtener los objetos de dependencias y actualizaciones desde localStorage
        const storedData = localStorage.getItem('Dependencias');
        const actualizacionData = localStorage.getItem('ActualizacionPendiente');

        // 2. Convertir los datos almacenados en objetos, o iniciar con un objeto vacío si no existen
        const dependencias = storedData ? JSON.parse(storedData) : {};
        const ActualizacionPendiente = actualizacionData ? JSON.parse(actualizacionData) : {};

        // 3. Agregar o actualizar el título en ambos objetos con su respectiva fecha
        dependencias[titulo] = fecha;
        ActualizacionPendiente[titulo] = fecha;

        // 4. Guardar ambos objetos actualizados en localStorage
        localStorage.setItem(titulo, JSON.stringify(data));
        localStorage.setItem('Dependencias', JSON.stringify(dependencias));
        localStorage.setItem('ActualizacionPendiente', JSON.stringify(ActualizacionPendiente));
    };

    return (
        <FireContext.Provider value={{ loading, cargarDatosStorage, guardarDatoStorage, obtenerDato }}>
            {children}
        </FireContext.Provider>
    );
};