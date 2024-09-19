import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from '../services/firebaseConfig'; // Asegúrate de tener esta configuración
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { DataContext } from "./dateContext";

export const FireContext = createContext({});

// eslint-disable-next-line react/prop-types
export const FireProvider = ({ children }) => {
    const { mes, año } = useContext(DataContext);

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [logueado, setLogueado] = useState(true);
    const [localMasActualizada, setLocalMasActualizada] = useState(false);

    const [uid, setUid] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                revisarSiExistePrincipalStorage(`Informe-${mes + 1}-${año}`, "Dependencias")
                const uid = user.uid
                setUid(uid)
                /* subirUltimasActualizaciones(uid) */
                console.log("seguir actualizando")
                cargarArchivosInicioDependencia("Dependencias", uid)
                cargarArchivosInicio(`Informe-${mes + 1}-${año}`, uid)
                cargarArchivosInicio("Config", uid)
                setLoading(true); //una vez cargados los tres primeros archivo carga el componente
                revisarSincronizacion(uid)
                navigate('/');
                cargarArchivosInicio("FechasEspeciales", uid)
                cargarArchivosInicio("Notas", uid)
                cargarArchivosInicio(`Broadcasting-${año}`, uid)
                cargarArchivosInicio(`Gratitud-${año}`, uid)
                cargarArchivosInicio(`Oraciones-${año}`, uid)
            } else {
                localStorage.clear();
                navigate('/iniciarSesion');
                setLogueado(false)
            }
        });
        return () => unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function revisarSiExistePrincipalStorage(titulo, titulo2) {
        const storedData = localStorage.getItem(titulo);
        const storedData2 = localStorage.getItem(titulo2);

        if (storedData && storedData2) {
            setLoading(true);
            navigate('/');
            console.log("cargar pagina principal");

        }
    }

    //revisa si existe el archivo principal Dependencias
    async function cargarArchivosInicioDependencia(titulo, uid) {
        try {
            // Obtener el dato desde localStorage y verificar si existe
            const storedData = localStorage.getItem(titulo);

            if (storedData) {
                return;
            } else {
                // Si no hay datos en localStorage, obtenerlos de Firestore
                const dato = await obtenerDatoFirebase("Dependencias", uid);

                if (dato) {
                    guardaStorage(titulo, dato);
                } else {
                    console.log(`el dato no existe en firebase: ${titulo}`);
                }
            }
        } catch (error) {
            console.error(`Error al cargar archivo de inicio ${titulo}:`, error);
        }
    }
    /* -----------------------------------------------------revisar--------------------------------------------------- */
    //una vez obtenido o no el archivo principal revisa si existen otros archivo secundarios, en base al principal
    async function cargarArchivosInicio(titulo, uid) {
        try {
            // Obtener el dato desde localStorage y verificar si existe
            const storedData = localStorage.getItem(titulo);

            if (storedData) {
                console.log("ya existe el dato");
                return
            }

            const dato = await obtenerDatoFirebase(titulo, uid);

            if (dato) {
                guardaStorage(titulo, dato);
            } else {
                console.log(`el dato no existe en firebase: ${titulo}`);
            }

        } catch (error) {
            console.error(`Error al cargar archivo de inicio ${titulo}:`, error);
        }
    }

    //carga un dato desde la storage y si no esta intenta cargarlo desde firebase
    async function cargarDatosStorage(titulo, uid) {
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
                    const datos = await obtenerDatoFirebase(titulo, uid);

                    //luego solo si el dato es valido lo guarda para futuras consultas y retorna el dato
                    if (datos) {
                        localStorage.setItem(titulo, datos);
                        return datos
                    }
                } else {
                    // Si el título no está en las dependencias, manejamos el caso
                    console.log(`El título "${titulo}" no está en las dependencias.`);
                }
            }

        } catch (error) {
            console.error('Error al obtener los datos:', error);
        }
    }

    //guarda en el storage un dato, pero a la vez actualiza el archivo dependencias y lo agrega al archivo de actualizacion para en la proxima carga subirlo a firebase
    function guardarDatoStorage(titulo, fecha, data) {
        if (localMasActualizada) {
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
        }
    }


    //funcion que guarda en el storage un dato, sin preocuoparse del tipo ya que ahi revisa si hace falta parsearlo o no
    function guardaStorage(titulo, dato) {
        if (typeof dato === 'string') {
            localStorage.setItem(titulo, dato);
        } else {
            // Si 'dato' no es una cadena JSON, conviértelo a JSON y guárdalo
            localStorage.setItem(titulo, JSON.stringify(dato));
        }
    }

    //obtiene un dato desde fireBase y lo retorna si existe, se usa dentro de otras funciones
    async function obtenerDatoFirebase(titulo, uid) {
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
            console.error(`Error obtener en la base de datos el dato "${titulo}":`, error);
        }
    }

    //sube las ultimas actualizaciones y compara la fecha de ultima actualizacion
    async function subirUltimasActualizaciones(uid) {
        try {
            // Obtener el objeto de actualizaciones pendientes
            const ActualizacionPendiente = JSON.parse(localStorage.getItem("ActualizacionPendiente"));

            // Si no existe el archivo de actualizaciones en el storage significa que no hay actualizaciones pendientes
            if (!ActualizacionPendiente) {
                return;
            }

            // Procesar cada clave (título) del objeto de actualizaciones pendientes, ya que la clave hace referencia al nombre para buscarlo
            for (const titulo of Object.keys(ActualizacionPendiente)) {
                // Obtener el dato del localStorage
                const dato = localStorage.getItem(titulo);
                if (dato) {
                    // Subir el dato a la base de datos
                    await subirDatoFirebase(titulo, uid, dato);
                } else {
                    console.error(`datos faltantes, una actualizacion pendiente no logra encontrarse en el storage: ${titulo}`);
                }
            }

            const dato = localStorage.getItem("Dependencias");
            await subirDatoFirebase("Dependencias", uid, dato);

            // Una vez procesadas todas las actualizaciones, eliminar el archivo de actualizaciones
            localStorage.removeItem("ActualizacionPendiente");
        } catch (error) {
            // Si ocurre un error, imprimirlo en consola sin eliminar el archivo de actualizaciones
            console.error('Error al procesar las actualizaciones:', error);
        }
    }

    //sube un dato a firebase se usa dentro de otras funciones
    async function subirDatoFirebase(titulo, uid, dato) {
        try {
            const docRef = doc(db, 'usuarios', uid);

            await setDoc(docRef, {
                [titulo]: dato
            }, { merge: true });

        } catch (error) {
            console.error(`Error al actualizar el dato "${titulo}":`, error);
        }
    }

    async function revisarSincronizacion(uid) {
        try {
            // Obtener el objeto de actualizaciones pendientes
            const config = JSON.parse(localStorage.getItem("config"));
            if (!config || !config.ultimaActualizacion) {
                // Si no hay configuración o última actualización local, consideramos los datos locales como los más actualizados
                setLocalMasActualizada(true);
                return;
            }

            const ultimaActualizacionLocal = config.ultimaActualizacion;

            // Obtener la configuración externa desde Firebase
            const configExterna = await obtenerDatoFirebase(config, uid);

            if (configExterna && configExterna.ultimaActualizacion) {
                const ultimaActualizacionExterna = configExterna.ultimaActualizacion;
                const comparacion = ultimaActualizacionLocal > ultimaActualizacionExterna;

                if (comparacion) {
                    setLocalMasActualizada(true);
                } else {
                    setLocalMasActualizada(false);
                    alert("Los datos están desactualizados");
                }
            } else {
                // Si no hay datos externos, asumimos que los datos locales son los más actualizados
                setLocalMasActualizada(true);
            }
        } catch (error) {
            console.error('Error al revisar sincronización:', error);
            setLocalMasActualizada(true); // Asumimos que los datos locales son más actualizados en caso de error
        }
    }

    return (
        <FireContext.Provider value={{ loading, logueado, setLogueado, cargarDatosStorage, guardarDatoStorage, uid }}>
            {children}
        </FireContext.Provider>
    );
};