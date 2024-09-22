import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from '../services/firebaseConfig'; // Asegúrate de tener esta configuración
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { DataContext } from "./dateContext";
import { convertirAJson, convertirAObjeto, obtenerTituloYAño, verificarYLimpiarStorage } from "../components/utilidades/funciones";
import Swal from 'sweetalert2'
export const FireContext = createContext({});

// eslint-disable-next-line react/prop-types
export const FireProvider = ({ children }) => {
    const { mes, año, setMetaHorasPredi } = useContext(DataContext);
    const navigate = useNavigate();
    const [logueado, setLogueado] = useState(true);
    const [localMasActualizada, setLocalMasActualizada] = useState(true);

    const [datosFirebaseGlobal, setDatosFirebaseGlobal] = useState(null);
    const [datosFirebaseAño, setDatosFirebaseAño] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                revisarDatosPrincipales()
                const uid = user.uid
                subirUltimasActualizaciones(uid)
                obtenerColeccionFirebase(uid)
                navigate('/');
            } else {
                localStorage.clear();
                navigate('/iniciarSesion');
                setLogueado(false)
            }
        });
        return () => unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        async function cargarConfig() {
            const datosConfig = await cargarDatosStorage("Config")
            setMetaHorasPredi(datosConfig.metaHorasPredi)
        }
        cargarConfig()
        
    }, [datosFirebaseGlobal]);

    async function obtenerColeccionFirebase(uid) {
        try {
            // Verificamos si los datos globales ya están cargados
            if (datosFirebaseGlobal) {
                console.log('Usando datos del estado global:', datosFirebaseGlobal);
            } else {
                // Cargar la colección "Global"
                const globalCollectionRef = collection(db, 'usuarios', uid, 'Global');
                const globalSnapshot = await getDocs(globalCollectionRef);

                if (globalSnapshot.empty) {
                    console.error('No se encontraron documentos en la colección Global');
                }

                // Almacenar los documentos globales en un objeto
                const documentosGlobal = {};
                globalSnapshot.forEach((doc) => {
                    documentosGlobal[doc.id] = convertirAObjeto(doc.data());
                });
                console.log(documentosGlobal);

                // Guardamos los datos globales en el estado
                setDatosFirebaseGlobal(documentosGlobal);
            }

            // Si se proporciona un año, buscamos la colección correspondiente al año
            if (datosFirebaseAño) {
                console.log('Usando datos del estado global:', datosFirebaseGlobal);
            } else {
                const yearCollectionRef = collection(db, 'usuarios', uid, 'PorAño');
                const yearSnapshot = await getDocs(yearCollectionRef);

                if (yearSnapshot.empty) {
                    console.error(`No se encontraron documentos en la colección para el año ${año}`);
                }

                // Almacenar los documentos del año en un objeto
                const documentosAño = {};
                yearSnapshot.forEach((doc) => {
                    documentosAño[doc.id] = convertirAObjeto(doc.data());
                });
                 console.log(documentosAño);

                // Guardamos los datos del año en el estado
                setDatosFirebaseAño(documentosAño);
            }

        } catch (error) {
            console.error('Error al obtener los documentos de la colección:', error);
        }
    }

    //carga un dato desde la storage y si no esta intenta cargarlo desde firebase
    async function cargarDatosStorage(titulo) {
        try {

            // Primero intentamos obtener el dato del localStorage
            const savedData = localStorage.getItem(titulo);

            //si el dato existe lo retorna y se detiene
            if (savedData) {
                return convertirAObjeto(savedData);
            }

            const nombre = obtenerTituloYAño(titulo).titulo

            const date = new Date();
            const mesActual = date.getMonth()
            const añoActual = date.getFullYear()

            if (datosFirebaseAño) {
                if (datosFirebaseAño[nombre] && datosFirebaseAño[nombre][titulo]) {
                    const datos = datosFirebaseAño[nombre][titulo];
                    if (mesActual == mes && añoActual == año) {
                        localStorage.setItem(titulo, convertirAJson(datos));
                    }
                    console.log(datos);
                    
                    return datos
                }             
            }

            if (datosFirebaseGlobal) {
                if (datosFirebaseGlobal[nombre] && datosFirebaseGlobal[nombre][titulo]) {
                    const datos = datosFirebaseGlobal[nombre][titulo];
                    localStorage.setItem(titulo, convertirAJson(datos));
                    console.log(datos);

                    return datos
                }
            } 
        } catch (error) {
            console.error('Error al obtener los datos:', error);
        }
    }

    //guarda en el storage un dato y lo agrega al archivo de actualizacion para en la proxima carga subirlo a firebase
    function guardarDatoStorage(titulo, fecha, data) {
        if (localMasActualizada) {
            // 1. Obtener los objetos de dependencias y actualizaciones desde localStorage
            const actualizacionData = localStorage.getItem('ActualizacionPendiente');

            // 2. Convertir los datos almacenados en objetos, o iniciar con un objeto vacío si no existen
            const ActualizacionPendiente = actualizacionData ? convertirAObjeto(actualizacionData) : {};
            ActualizacionPendiente[titulo] = fecha;
            const ultimaActualizacion = { fecha: fecha }

            // 5. Guardar ambos objetos actualizados en localStorage
            localStorage.setItem(titulo, convertirAJson(data));
            localStorage.setItem('ActualizacionPendiente', convertirAJson(ActualizacionPendiente));
            localStorage.setItem('ultimaActualizacion', convertirAJson(ultimaActualizacion));
        }
    }

    //sube las ultimas actualizaciones y compara la fecha de ultima actualizacion
    async function subirUltimasActualizaciones(uid) {
        try {
            // Obtener el objeto de actualizaciones pendientes
            const ActualizacionPendiente = convertirAObjeto(localStorage.getItem("ActualizacionPendiente"));

            // Si no existe el archivo de actualizaciones en el storage significa que no hay actualizaciones pendientes
            if (!ActualizacionPendiente) {
                return;
            }

            // Procesar cada clave (título) del objeto de actualizaciones pendientes, ya que la clave hace referencia al nombre para buscarlo
            for (const titulo of Object.keys(ActualizacionPendiente)) {
                // Obtener el dato del localStorage
                const dato = convertirAObjeto(localStorage.getItem(titulo));
                if (dato) {
                    // Subir el dato a la base de datos
                    await subirColeccionFirebase(titulo, uid, dato);
                } else {
                    console.error(`datos faltantes, una actualizacion pendiente no logra encontrarse en el storage: ${titulo}`);
                }
            }

            // Una vez procesadas todas las actualizaciones, eliminar el archivo de actualizaciones
            localStorage.removeItem("ActualizacionPendiente");
        } catch (error) {
            // Si ocurre un error, imprimirlo en consola sin eliminar el archivo de actualizaciones
            console.error('Error al procesar las actualizaciones:', error);
        }
    }

    //sube un dato a firebase se usa dentro de otras funciones
    async function subirColeccionFirebase(titulo, uid, dato) {
        try {
            const collection = obtenerTituloYAño(titulo);
            const año = collection.año
            const nombre = collection.titulo
            const collectionName = año ? 'PorAño' : 'Global';
            const docRef = doc(db, 'usuarios', uid, collectionName, nombre);
            await setDoc(docRef, {
                [titulo]: dato
            }, { merge: true });
            console.log(`Dato subido a la colección "${collectionName}"`);
        } catch (error) {
            console.error(`Error al subir el dato "${titulo}":`, error);
        }
    }

    async function revisarDatosPrincipales() {
        const date = new Date();
        const mes = date.getMonth();
        const año = date.getFullYear();

        // Obtener los datos del localStorage
        const informe = localStorage.getItem(`Informe-${mes + 1}-${año}`);
        const broadcasting = localStorage.getItem(`Broadcasting-${año}`);
        const gratitud = localStorage.getItem(`Gratitud-${año}`);
        const oraciones = localStorage.getItem(`Oraciones-${año}`);

        // Verificar si todos los datos existen
        if (informe && broadcasting && gratitud && oraciones) {
            navigate('/');
        }
    }


    return (
        <FireContext.Provider value={{ logueado, setLogueado, cargarDatosStorage, guardarDatoStorage, datosFirebaseGlobal, datosFirebaseAño }}>
            {children}
        </FireContext.Provider>
    );
};