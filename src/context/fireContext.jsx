import { createContext, useEffect, useState } from "react";
import { auth, db } from '../services/firebaseConfig'; // Asegúrate de tener esta configuración
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, collection } from "firebase/firestore";

export const FireContext = createContext({});

export const FireProvider = ({ children }) => {
    const navigate = useNavigate();
    const [uid, setUid] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUid(user.uid);
                navigate('/');
                setLoading(true); // Cambia a false después de la navegación
                leerDependencias(user.uid); // Pasar el UID al llamar la función
            } else {
                navigate('/iniciarSesion');
                setUid(null);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    async function leerDependencias(uid) {
        const dependencias = JSON.parse(localStorage.getItem("Dependencias"));
        const existeUid = await verificarExistenciaDocumento(uid)

        if (dependencias) {
            const arrayTitulos = dependencias.map(item => item.titulo);

            if (existeUid) { //compara las dependencias
                console.log("ya existe el usuario, revisar dependencias");
                try {
                    const dependenciasExterna = await obtenerDato("Dependencias", uid)

                    console.log(dependenciasExterna);
                    console.log(dependencias);

                    dependencias.forEach(async (num) => {
                        console.log(num.titulo);
                        console.log(num.fecha);
                    });

                    dependenciasExterna.forEach(async (num) => {
                        console.log(num.titulo);
                        console.log(num.fecha);
                    });

                } catch (error) {
                    console.error("Error al crear el documento en Firestore:", error);
                }
            } else { //crea el usuario si no existe
                console.log("crea el usuario");
                try {
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
        } else {
            console.log("aun no hay dependencias locales");

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