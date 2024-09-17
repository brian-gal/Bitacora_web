import { createContext, useEffect, useState } from "react";
import { auth, db } from '../services/firebaseConfig'; // Asegúrate de tener esta configuración
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, collection } from "firebase/firestore";

export const FireContext = createContext({});

export const FireProvider = ({ children }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                comprobarDatos(user.uid); // Pasar el UID al llamar la función
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
        const dependencias = JSON.parse(localStorage.getItem("Dependencias"));
        const existeUid = await verificarExistenciaDocumento(uid)

        if (dependencias) {
            if (existeUid) { //actualiza los datos locales o externos dependiendo cual esta mas actualizado
                console.log("ya existe el usuario, revisar dependencias");
                try {
                    let externaMasReciente = false;
                    let localMasReciente = false;
                    const dependenciasExterna = await obtenerDato("Dependencias", uid);

                    //compara las dependencias para saber si hace falta actualizar algo
                    dependencias.forEach((num) => {
                        const externa = dependenciasExterna.find(ext => ext.titulo === num.titulo);
                        if (externa) {
                            // Comparar fechas
                            if (num.fecha === externa.fecha) {

                            } else if (num.fecha > externa.fecha) {
                                const dato = JSON.parse(localStorage.getItem(num.titulo));
                                subirDato(num.titulo, uid, dato)
                                localMasReciente = true;
                            } else {
                                const datoExterno = obtenerDato(num.titulo, uid);
                                localStorage.setItem(num.titulo, JSON.stringify(datoExterno));
                                externaMasReciente = true;
                            }
                        } else {
                            const dato = JSON.parse(localStorage.getItem(num.titulo));
                            subirDato(num.titulo, uid, dato)
                            localMasReciente = true;
                        }
                    });

                    dependenciasExterna.forEach((ext) => {
                        // Buscar si la dependencia externa existe en la interna
                        const interna = dependencias.find(num => num.titulo === ext.titulo);

                        if (!interna) {
                            // No se encontró en la interna
                            const datoExterno = obtenerDato(ext.titulo, uid);
                            localStorage.setItem(ext.titulo, JSON.stringify(datoExterno));
                            externaMasReciente = true;
                        }
                    });

                    //actualiza el archivo de dependencias
                    if (localMasReciente) {
                        const dato = JSON.parse(localStorage.getItem("Dependencias"));
                        subirDato("Dependencias", uid, dato)
                    } else if (externaMasReciente) {
                        const datoExterno = obtenerDato("Dependencias", uid);
                        localStorage.setItem("Dependencias", JSON.stringify(datoExterno));
                    }
                    else {
                        console.log("no hace falta actualizar nada");
                    }
                    console.log("todo actualizado");


                } catch (error) {
                    console.error("Error al comparar las dependencias en Firestore:", error);
                }
            }
            else { //crea el usuario si no existe
                try {
                    const arrayTitulos = dependencias.map(item => item.titulo);
                    await setDoc(doc(db, 'usuarios', uid), {
                        Dependencias: dependencias
                    });

                    arrayTitulos.forEach(async (num) => {
                        const dato = JSON.parse(localStorage.getItem(num));

                        if (dato) {
                            try {
                                await setDoc(doc(db, 'usuarios', uid), {
                                    [num]: dato
                                }, { merge: true });
                            } catch (error) {
                                console.error(`Error al guardar ${num} en Firestore: `, error);
                            }
                        }
                    });
                } catch (error) {
                    console.error("Error al crear el documento en Firestore:", error);
                }
            }
        } else { //si localmente no esta el archivo de dependencias pero en la base de datos si, lo trae
            if (existeUid) {
                try {
                    const dependenciasExterna = await obtenerDato("Dependencias", uid);
                    localStorage.setItem('Dependencias', JSON.stringify(dependenciasExterna));
                } catch (error) {
                    console.error("Error al crear el archivo de dependencias interno desde el externo:", error);
                }

            } else {
                
            }
        }
    }

    async function obtenerDato(titulo, uid) {
        try {
            const docRef = doc(db, 'usuarios', uid);
            const docSnap = await getDoc(docRef);
            return docSnap.data()[titulo] || null;
        } catch (error) {
            console.error('Error al obtener los datos: ', error);
            return null;
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

    async function verificarExistenciaDocumento(uid) {
        try {
            const docRef = doc(db, 'usuarios', uid);
            const docSnap = await getDoc(docRef);
            return docSnap.exists();
        } catch (error) {
            console.error('Error al verificar la existencia del documento: ', error);
            return false;
        }
    }


    return (
        <FireContext.Provider value={{ loading }}>
            {children}
        </FireContext.Provider>
    );
};