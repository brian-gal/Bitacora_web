import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from '../services/firebaseConfig'; // Asegúrate de tener esta configuración
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useLocation, useNavigate } from "react-router-dom";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { DataContext } from "./dateContext";
import { addClass, convertirAJson, convertirAObjeto, initializeGlobalStorage, initializeYearlyStorage, obtenerTituloYAño, removeClass } from "../components/utilidades/funciones";
import Swal from 'sweetalert2'
export const FireContext = createContext({});

// eslint-disable-next-line react/prop-types
export const FireProvider = ({ children }) => {
    const { mes, año, currentLocation, fechaActual, currentFecha } = useContext(DataContext);
    const location = useLocation();

    const navigate = useNavigate();
    const [logueado, setLogueado] = useState(true);
    const [loading, setLoading] = useState(false);
    const [datosFirebaseGlobal, setDatosFirebaseGlobal] = useState(null);
    const [datosFirebaseAño, setDatosFirebaseAño] = useState(null);
    //bloquea la escritura y todos los botones si esta en false
    const [activarSincronizacion, setActivarSincronizacion] = useState(true);
    //bloquea solo el icono de sincronización
    const [desactivarIcono, setDesactivarIcono] = useState(true);
    const [uidd, setUidd] = useState(null);

    const date = new Date();
    const mesActual = date.getMonth()
    const añoActual = date.getFullYear()

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                navigate('/');
                const uid = user.uid
                setUidd(uid)
                await manejarSesion(uid)
                await obtenerColeccionFirebase(uid)
            } else {
                localStorage.clear();
                setLoading(true)
                navigate('/iniciarSesion');
                setLogueado(false)
            }
        });
        return () => unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function obtenerColeccionFirebase(uid) {
        try {
            if (!navigator.onLine) {
                throw new Error("No hay conexión a Internet. No se puedo obtener los datos de firebase.");
            }

            // Verificamos si los datos globales ya están cargados
            if (!datosFirebaseGlobal) {
                // Cargar la colección "Global"
                const globalCollectionRef = collection(db, uid, "datos", 'Global');
                const globalSnapshot = await getDocs(globalCollectionRef);

                if (globalSnapshot.empty) {
                    /* initializeGlobalStorage(guardarDatoStorage, currentFecha) */
                }

                // Almacenar los documentos globales en un objeto
                const documentosGlobal = {};
                globalSnapshot.forEach((doc) => {
                    documentosGlobal[doc.id] = convertirAObjeto(doc.data());
                });
                setDatosFirebaseGlobal(documentosGlobal);
            }

            // Si se proporciona un año, buscamos la colección correspondiente al año
            if (!datosFirebaseAño) {
                const yearCollectionRef = collection(db, uid, "datos", 'PorAño');
                const yearSnapshot = await getDocs(yearCollectionRef);

                if (yearSnapshot.empty) {
                    /* initializeYearlyStorage(guardarDatoStorage, currentFecha, añoActual) */
                }

                // Almacenar los documentos del año en un objeto
                const documentosAño = {};
                yearSnapshot.forEach((doc) => {
                    documentosAño[doc.id] = convertirAObjeto(doc.data());
                });
                setDatosFirebaseAño(documentosAño);
            }

            setLoading(true)
        } catch (error) {
            console.error('Error al obtener los documentos de la colección:', error);
            setTimeout(() => {
                obtenerColeccionFirebase(uid)
            }, 20000);
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
            if (!loading && !Swal.isVisible()) {
                Swal.fire({
                    title: 'Cargando...',
                    html: `
                        <div class="d-flex justify-content-center">
                            <div class="spinner-border" style="width: 2rem; height: 2rem;" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    `,
                    allowOutsideClick: false,
                    showConfirmButton: false, // No mostrar botón de confirmación aún
                });

                // Cambiar el mensaje y mostrar el botón "Cancelar" después de 10 segundos
                setTimeout(() => {
                    // Solo actualizar si el popup sigue visible
                    if (Swal.isVisible()) {
                        // Crear un objeto de configuración para Swal.update()
                        const options = {
                            title: 'Cargando...',
                            text: 'Esta demorando más de lo normal, parece que tienes mala conexión',
                            html: `
                                <div class="d-flex justify-content-center">
                                    <div class="spinner-border" style="width: 2rem; height: 2rem;" role="status">
                                        <span class="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            `,
                        };

                        // Verificar si currentLocation no es "/"
                        if (location.pathname !== "/") {
                         options.text = "Está tardando más de lo normal, parece que tienes una mala conexión. El proceso de carga continuará hasta completarse. Si lo prefieres, puedes volver al inicio.";
                            options.showCancelButton = true; // Habilitar el botón de cancelar
                            options.cancelButtonText = 'Volver al Inicio'; // Texto del botón de cancelar
                        }

                        // Actualizar el SweetAlert con las nuevas opciones
                        Swal.update(options);
                        Swal.getCancelButton().addEventListener('click', () => {
                            fechaActual()
                            navigate('/');
                        });

                    }
                }, 10000); // 10000 ms = 10 segundos
            }

            const nombre = obtenerTituloYAño(titulo).titulo

            if (datosFirebaseAño) {
                if (datosFirebaseAño[nombre] && datosFirebaseAño[nombre][titulo]) {
                    const datos = datosFirebaseAño[nombre][titulo];
                    if (añoActual == año) {
                        localStorage.setItem(titulo, convertirAJson(datos));
                    }
                    return datos
                }
            }

            if (datosFirebaseGlobal) {
                if (datosFirebaseGlobal[nombre] && datosFirebaseGlobal[nombre][titulo]) {
                    let datos = datosFirebaseGlobal[nombre][titulo];
                    localStorage.setItem(titulo, convertirAJson(datos));
                    return datos
                }
            }

        } catch (error) {
            console.error('Error al obtener los datos:', error);
        }
    }

    //cierra el modal al cargar las colleciones
    useEffect(() => {
        if (loading) {
            Swal.close();
        }
    }, [loading])

    //guarda en el storage un dato y lo agrega al archivo de actualizacion para en la proxima carga subirlo a firebase
    function guardarDatoStorage(titulo, fecha, data) {
        // 1. Obtener los objetos de dependencias y actualizaciones desde localStorage
        const actualizacionData = localStorage.getItem('ActualizacionPendiente');

        // 2. Convertir los datos almacenados en objetos, o iniciar con un objeto vacío si no existen
        const ActualizacionPendiente = actualizacionData ? convertirAObjeto(actualizacionData) : {};
        ActualizacionPendiente[titulo] = fecha;

        // 5. Guardar ambos objetos actualizados en localStorage
        localStorage.setItem(titulo, convertirAJson(data));
        localStorage.setItem('ActualizacionPendiente', convertirAJson(ActualizacionPendiente));

        const icon = document.getElementById("IconoGuardar");
        if (!icon.classList.contains("bi-exclamation-triangle-fill")) {
            removeClass("IconoGuardar", "bi-check-circle");
            addClass("IconoGuardar", "bi-arrow-repeat");
        }
    }

    //sube las ultimas actualizaciones y compara la fecha de ultima actualizacion
    async function subirUltimasActualizaciones(uid) {
        try {
            removeClass("IconoGuardar", "bi-check-circle");
            removeClass("IconoGuardar", "bi-exclamation-triangle-fill");
            addClass("IconoGuardar", "bi-arrow-repeat");
            addClass("IconoGuardar", "rotate");
            setDesactivarIcono(true)
            setActivarSincronizacion(false)

            // Obtener el objeto de actualizaciones pendientes
            const ActualizacionPendiente = convertirAObjeto(localStorage.getItem("ActualizacionPendiente"));

            // Si no existe el archivo de actualizaciones en el storage significa que no hay actualizaciones pendientes
            if (!ActualizacionPendiente) {
                removeClass("IconoGuardar", "bi-arrow-repeat");
                addClass("IconoGuardar", "bi-check-circle");
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
            removeClass("IconoGuardar", "bi-arrow-repeat");
            addClass("IconoGuardar", "bi-check-circle");
            localStorage.removeItem("ActualizacionPendiente");
        } catch (error) {
            Swal.fire({
                title: "Hay demoras al guardar",
                text: "Intenta guardar los datos más tarde",
                icon: "warning",
                confirmButtonText: "Aceptar",
                allowOutsideClick: false,
            });

            console.error('Error al intentar guardar:', error);
        } finally {
            removeClass("IconoGuardar", "rotate");
            setDesactivarIcono(false)
            setActivarSincronizacion(true)
        }
    }

    //sube un dato a firebase se usa dentro de otras funciones
    async function subirColeccionFirebase(titulo, uid, dato) {
        const timeout = 20000; // Tiempo de espera en milisegundos (10 segundos)

        try {
            const collection = obtenerTituloYAño(titulo);
            const año = collection.año;
            const nombre = collection.titulo;
            const collectionName = año ? 'PorAño' : 'Global';
            const docRef = doc(db, uid, "datos", collectionName, nombre);

            // Crea una promesa que se resolverá o rechazará después del tiempo de espera
            const setDocPromise = setDoc(docRef, {
                [titulo]: dato
            }, { merge: true });

            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error('Tiempo de espera agotado para subir la colección'));
                }, timeout);
            });

            // Espera la primera promesa que se resuelva (setDoc o timeout)
            await Promise.race([setDocPromise, timeoutPromise]);
        } catch (error) {
            console.error(`Error al subir el dato "${titulo}":`, error);
            throw error; // Lanza el error para que se pueda manejar en la función padre
        }
    }


    async function manejarSesion(uid) {
        try {
            if (!navigator.onLine) {
                throw new Error("No hay conexión a Internet. No se puede manejar la sesión.");
            }

            let deviceId = localStorage.getItem('deviceId');

            if (!deviceId) {
                localStorage.clear();
                deviceId = generateRandomId();
                localStorage.setItem('deviceId', deviceId);
                const docRef = doc(db, uid, "datos");
                await setDoc(docRef, { deviceId }, { merge: true });

                // Como es un nuevo deviceId, no necesitamos cerrar la sesión, ya que no hubo comparación.
                subirUltimasActualizaciones(uid)
                return;
            }

            // Ahora, obtenemos el documento {uid}
            const docRef = doc(db, uid, "datos");
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const storedDeviceId = docSnap.data().deviceId;

                // Si el ID en Firebase no coincide con el de localStorage, cerramos la sesión
                if (storedDeviceId && storedDeviceId !== deviceId) {
                    Swal.fire({
                        title: "Sesión en otro dispositivo",
                        text: "Tu cuenta está activa en otro dispositivo. Vuelve a iniciar sesión aquí para continuar.",
                        icon: "warning",
                        confirmButtonText: "Aceptar"
                    });
                    const auth = getAuth();
                    await signOut(auth);
                } else {
                    // Si los IDs coinciden o es la primera vez, actualizamos el deviceId en Firebase
                    await setDoc(docRef, { deviceId }, { merge: true });
                    subirUltimasActualizaciones(uid)
                }
            } else {
                // Si el documento no existe, lo creamos con el deviceId
                await setDoc(docRef, { deviceId });
                subirUltimasActualizaciones(uid)
            }
        } catch (error) {
            console.error(error)
            setDesactivarIcono(false)
            removeClass("IconoGuardar", "bi-check-circle");
            removeClass("IconoGuardar", "bi-arrow-repeat");
            removeClass("IconoGuardar", "rotate");
            addClass("IconoGuardar", "bi-exclamation-triangle-fill");
            setTimeout(() => {
                manejarSesion(uid)
            }, 20000);
        }
    }

    // Función para generar un ID aleatorio de 20 dígitos
    function generateRandomId() {
        return Math.random().toString(36).substr(2, 20);
    }

    return (
        <FireContext.Provider value={{ uidd, logueado, setLogueado, cargarDatosStorage, guardarDatoStorage, datosFirebaseGlobal, datosFirebaseAño, subirUltimasActualizaciones, activarSincronizacion, desactivarIcono }}>
            {children}
        </FireContext.Provider>
    );
};