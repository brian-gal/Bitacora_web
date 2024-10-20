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
    const { año, fechaActual, currentFecha } = useContext(DataContext);
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
    const [permitirGuardar, setPermitirGuardar] = useState(false);

    const date = new Date();
    const añoActual = date.getFullYear()

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                navigate('/');
                setLoading(false)
                const uid = user.uid
                setUidd(uid)
                await manejarSesion(uid)
                await obtenerColeccionFirebase(uid)
            } else {
                setLoading(true)
                setLogueado(false)
                localStorage.clear();
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
                    throw new Error("No hay conexión a Internet.");
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
                    throw new Error("No hay conexión a Internet.");
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
                        <p>Este proceso puede demorar</p>
                        <div class="d-flex justify-content-center">
                            <div class="spinner-border" style="width: 2rem; height: 2rem;" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    `,
                    allowOutsideClick: false,
                    showConfirmButton: location.pathname !== "/", // Mostrar botón si no estamos en "/"
                    confirmButtonText: "Volver al Inicio",
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Ejecutar si el botón de confirmación fue presionado
                        fechaActual();
                        navigate('/');
                    }
                });
            }

            const nombre = obtenerTituloYAño(titulo).titulo
            const year = obtenerTituloYAño(titulo).año

            if (datosFirebaseAño && year) {
                if (datosFirebaseAño[nombre] && datosFirebaseAño[nombre][titulo]) {
                    const datos = datosFirebaseAño[nombre][titulo];
                    if (añoActual == año) {
                        localStorage.setItem(titulo, convertirAJson(datos));
                    }
                    return datos
                } else if (loading) {
                    initializeYearlyStorage(guardarDatoStorage, currentFecha, año, titulo);
                }
            } else if (datosFirebaseGlobal) {
                if (datosFirebaseGlobal[nombre] && datosFirebaseGlobal[nombre][titulo]) {
                    let datos = datosFirebaseGlobal[nombre][titulo];
                    localStorage.setItem(titulo, convertirAJson(datos));
                    return datos
                } else if (loading) {
                    initializeGlobalStorage(guardarDatoStorage, currentFecha, titulo);
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
    async function subirUltimasActualizaciones(uid, permitir) {
        try {
            if (!permitir) {
                alert("Error detectado: se intentó ejecutar la función de guardado cuando no estaba permitido. La aplicación está en fase beta, por favor contacta al desarrollador para informar sobre este problema.");
                return;
            }

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
                setPermitirGuardar(true);
                localStorage.clear();
                deviceId = generateRandomId();
                localStorage.setItem('deviceId', deviceId);
                const docRef = doc(db, uid, "datos", "Global", "DeviceId");
                const docRef2 = doc(db, uid, "datos", "PorAño", "DeviceId");

                await setDoc(docRef, { deviceId }, { merge: true });
                await setDoc(docRef2, { deviceId }, { merge: true });

                // Como es un nuevo deviceId, no necesitamos cerrar la sesión, ya que no hubo comparación.
                subirUltimasActualizaciones(uid, true)
                return;
            }

            // Ahora, obtenemos el documento {uid}
            const docRef = doc(db, uid, "datos", "Global", "DeviceId");
            const docRef2 = doc(db, uid, "datos", "PorAño", "DeviceId");
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
                    cerrarSesion()
                } else {
                    setPermitirGuardar(true);
                    // Si los IDs coinciden o es la primera vez, actualizamos el deviceId en Firebase
                    await setDoc(docRef, { deviceId }, { merge: true });
                    await setDoc(docRef2, { deviceId }, { merge: true });
                    subirUltimasActualizaciones(uid, true)
                }
            } else {
                setPermitirGuardar(true);
                // Si el documento no existe, lo creamos con el deviceId
                await setDoc(docRef, { deviceId });
                await setDoc(docRef2, { deviceId });
                subirUltimasActualizaciones(uid, true)
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

    function cerrarSesion() {
        // Obtener el objeto de actualizaciones pendientes
        const ActualizacionPendiente = convertirAObjeto(localStorage.getItem("ActualizacionPendiente"));
        if (ActualizacionPendiente && permitirGuardar) {
            Swal.fire({
                title: "Atención",
                text: "Por favor, primero guarda los últimos cambios y luego cierra la sesión.",
                icon: "warning",
                button: "Entendido"
            });
            return;
        }

        const auth = getAuth();
        signOut(auth).then(() => {
            localStorage.clear();
            window.location.reload()
        }).catch((error) => {
            console.log(error);
        });
    }

    // Función para generar un ID aleatorio de 20 dígitos
    function generateRandomId() {
        return Math.random().toString(36).substr(2, 20);
    }

    return (
        <FireContext.Provider value={{ cerrarSesion, uidd, logueado, setLogueado, cargarDatosStorage, guardarDatoStorage, datosFirebaseGlobal, datosFirebaseAño, subirUltimasActualizaciones, activarSincronizacion, desactivarIcono, loading, permitirGuardar }}>
            {children}
        </FireContext.Provider>
    );
};