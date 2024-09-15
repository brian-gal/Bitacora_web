import { createContext, useEffect, useState } from "react";
import { auth, db } from '../services/firebaseConfig'; // Asegúrate de tener esta configuración
import { getAuth, onAuthStateChanged } from "firebase/auth";

export const FireContext = createContext({});

// Componente proveedor del contexto
export const FireProvider = ({ children }) => {
    const [uid, setUid] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUid(user.uid);
                console.log("Usuario autenticado:", uid);

            } else {
                localStorage.clear();
                setUid(null);
                console.log("Usuario no autenticado");
                const loginModal = new window.bootstrap.Modal(document.getElementById("loginModal"));
                loginModal.show();
            }
        });

        return () => unsubscribe();
    }, [uid]);

    return (
        <FireContext.Provider
            value={{ uid }}
        >
            {children}
        </FireContext.Provider>
    );
};