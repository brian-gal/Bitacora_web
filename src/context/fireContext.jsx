import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from '../services/firebaseConfig'; // Asegúrate de tener esta configuración
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { DataContext } from "./dateContext";
import { convertirAJson, convertirAObjeto, obtenerTituloYAño } from "../components/utilidades/funciones";
import Swal from 'sweetalert2'
export const FireContext = createContext({});

// eslint-disable-next-line react/prop-types
export const FireProvider = ({ children }) => {
    const { mes, año, currentLocation, fechaActual } = useContext(DataContext);
    const navigate = useNavigate();
    const [logueado, setLogueado] = useState(true);
    const [loading, setLoading] = useState(false);
    const [datosFirebaseGlobal, setDatosFirebaseGlobal] = useState(null);
    const [datosFirebaseAño, setDatosFirebaseAño] = useState(null);
    const [activarSincronizacion, setActivarSincronizacion] = useState(true);
    const [uidd, setUidd] = useState(null);

    const date = new Date();
    const mesActual = date.getMonth()
    const añoActual = date.getFullYear()

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                navigate('/');
                const uid = user.uid
                setUidd(uid)
                manejarSesion(uid)
                setTimeout(() => {
                    obtenerColeccionFirebase(uid)
                }, 10000)

            } else {
                localStorage.clear();
                navigate('/iniciarSesion');
                setLogueado(false)
            }
        });
        return () => unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function obtenerColeccionFirebase(uid) {
        try {
            // Función para verificar la conectividad
            function isOnline() {
                return navigator.onLine;
            }

            if (!isOnline()) {
                console.error('No tienes conexión a Internet.');
                setTimeout(() => {
                    obtenerColeccionFirebase(uid)
                }, 10000);
                return;
            }

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
                setDatosFirebaseGlobal(documentosGlobal);
            }

            // Si se proporciona un año, buscamos la colección correspondiente al año
            if (datosFirebaseAño) {
                console.log('Usando datos del estado global:', datosFirebaseGlobal);
            } else {
                const yearCollectionRef = collection(db, 'usuarios', uid, 'PorAño');
                const yearSnapshot = await getDocs(yearCollectionRef);

                if (yearSnapshot.empty) {
                    console.error(`No se encontraron documentos en la colección`);
                }

                // Almacenar los documentos del año en un objeto
                const documentosAño = {};
                yearSnapshot.forEach((doc) => {
                    documentosAño[doc.id] = convertirAObjeto(doc.data());
                });
                console.log(documentosAño);
                setDatosFirebaseAño(documentosAño);
            }

            setLoading(true)
        } catch (error) {
            console.error('Error al obtener los documentos de la colección:', error);
            setTimeout(() => {
                obtenerColeccionFirebase(uid)
            }, 10000);
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
                            html: `
                            <p>Esta demorando mas de lo normal, parece que tienes mála conexión<p/>
                                <div class="d-flex justify-content-center">
                                    <div class="spinner-border" style="width: 2rem; height: 2rem;" role="status">
                                        <span class="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            `,
                        };

                        // Verificar si currentLocation no es "/"
                        if (!(currentLocation === "/" && mesActual === mes)) {
                            options.showCancelButton = true; // Habilitar el botón de cancelar
                            options.cancelButtonText = 'Cancelar'; // Texto del botón de cancelar
                        }

                        // Actualizar el SweetAlert con las nuevas opciones
                        Swal.update(options);
                        Swal.getCancelButton().addEventListener('click', () => {
                            fechaActual()
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
                } else {
                    if (titulo == "Config") {
                        const datos = { metaHorasPredi: 10 }
                        localStorage.setItem(titulo, convertirAJson(datos));
                        return datos
                    }
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

        const icon = document.getElementById("miIcono");
        icon.classList.remove("bi-check-circle");
        icon.classList.add("bi-arrow-repeat");
    }

    //sube las ultimas actualizaciones y compara la fecha de ultima actualizacion
    async function subirUltimasActualizaciones(uid) {
        const icon = document.getElementById("miIcono");
        const iconb = document.getElementById("miIconoB");

        let timeoutId;
        let sweetAlertModalOpen = false;

        try {
            // Obtener el objeto de actualizaciones pendientes
            const ActualizacionPendiente = convertirAObjeto(localStorage.getItem("ActualizacionPendiente"));

            // Si no existe el archivo de actualizaciones en el storage significa que no hay actualizaciones pendientes
            if (!ActualizacionPendiente) {
                icon.classList.remove("bi-arrow-repeat");
                icon.classList.add("bi-check-circle");
                return;
            }

            function isOnline() {
                return navigator.onLine;
            }

            if (!isOnline()) {
                Swal.fire({
                    title: "Parece que no tienes internet",
                    text: "Intenta guardar los datos más tarde",
                    icon: "warning",
                    confirmButtonText: "Aceptar",
                    allowOutsideClick: true,
                });

                return;
            }

            setActivarSincronizacion(false)
            iconb.classList.add("rotate");

            timeoutId = setTimeout(() => {
                sweetAlertModalOpen = true;
                Swal.fire({
                    title: 'Hay demoras al guardar',
                    text: 'Parece que hay problemas con la conexión. Puedes esperar a que termine o recargar la página.',
                    icon: 'warning',
                    allowOutsideClick: false,
                    showConfirmButton: true,
                    confirmButtonText: 'Recargar página',
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Recargar la página
                        window.location.reload();
                    }
                });
            }, 10000); // 10 segundos de espera

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

            // Limpiar el temporizador para evitar que el modal se abra después de terminar
            clearTimeout(timeoutId);

            // Cerrar el modal si estaba abierto
            if (sweetAlertModalOpen) {
                Swal.close();
            }

            // Una vez procesadas todas las actualizaciones, eliminar el archivo de actualizaciones
            localStorage.removeItem("ActualizacionPendiente");
            icon.classList.remove("bi-arrow-repeat");
            icon.classList.add("bi-check-circle");
        } catch (error) {
            icon.classList.remove("bi-check-circle");
            icon.classList.add("bi-arrow-repeat");
            console.error('Error al procesar las actualizaciones:', error);
        } finally {
            setActivarSincronizacion(true)
            iconb.classList.remove("rotate");
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

    async function manejarSesion(uid) {
        // Función para verificar la conectividad
        function isOnline() {
            return navigator.onLine;
        }

        if (!isOnline()) {
            console.error('No tienes conexión a Internet.');
            setTimeout(() => {
                manejarSesion(uid)
            }, 10000);
            return;
        }

        // Obtener o generar el deviceId
        let deviceId = localStorage.getItem('deviceId');

        if (!deviceId) {
            localStorage.clear();
            deviceId = generateRandomId();
            localStorage.setItem('deviceId', deviceId);
            const docRef = doc(db, "usuarios", uid);
            await setDoc(docRef, { deviceId }, { merge: true });

            // Como es un nuevo deviceId, no necesitamos cerrar la sesión, ya que no hubo comparación.
            subirUltimasActualizaciones(uid)
            return;
        }

        // Ahora, obtenemos el documento usuarios/{uid}
        const docRef = doc(db, "usuarios", uid);
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
    }

    // Función para generar un ID aleatorio de 20 dígitos
    function generateRandomId() {
        return Math.random().toString(36).substr(2, 20);
    }

    return (
        <FireContext.Provider value={{ uidd, logueado, setLogueado, cargarDatosStorage, guardarDatoStorage, datosFirebaseGlobal, datosFirebaseAño, subirUltimasActualizaciones, activarSincronizacion }}>
            {children}
        </FireContext.Provider>
    );
};