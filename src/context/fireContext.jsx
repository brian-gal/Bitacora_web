import { createContext, useEffect, useState } from "react";
import { auth, db } from '../services/firebaseConfig'; // Asegúrate de tener esta configuración
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export const FireContext = createContext({});

// Componente proveedor del contexto
export const FireProvider = ({ children }) => {
    const navigate = useNavigate();
    const [uid, setUid] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        navigate('/');
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUid(user.uid);
                console.log("Usuario autenticado:", uid);
                navigate('/');
            } else {
                localStorage.clear();
                setUid(null);
            }
            setLoading(false)
        });

        return () => unsubscribe();
    }, [uid]);

    return (
        <FireContext.Provider
            value={{ uid, loading }}
        >
            {children}
        </FireContext.Provider>
    );
};