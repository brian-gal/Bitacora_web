import { getAuth, signOut } from "firebase/auth";
import { useContext, useEffect, useRef } from "react";
import { DataContext } from "../context/dateContext";
import { crearDependencia } from "./storageDependencies";

const Config = () => {
    const { setMetaHorasPredi, metaHorasPredi, currentFecha } = useContext(DataContext);
    const prevMetaHorasPrediRef = useRef(metaHorasPredi);

    function cerrarSesion() {
        const auth = getAuth();
        signOut(auth).then(() => {
            localStorage.clear();
        }).catch((error) => {
            console.log(error);
        });
    }

    useEffect(() => {
        // Solo ejecuta si metaHorasPredi ha cambiado
        if (prevMetaHorasPrediRef.current !== metaHorasPredi) {
            const updatedConfig = { metaHorasPredi: metaHorasPredi };
            localStorage.setItem('Config', JSON.stringify(updatedConfig));
            crearDependencia('Config', currentFecha);

            // Actualiza el valor anterior
            prevMetaHorasPrediRef.current = metaHorasPredi;
        }
    }, [metaHorasPredi, currentFecha]);

    const handleHorasChange = (e) => {
        setMetaHorasPredi(e.target.value);
    };

    return (
        <div className="config-container">
            <div className="config-meta">
                <h2>Meta a cumplir</h2>
                <label htmlFor="horasMeta">Horas de predicación al mes: {metaHorasPredi}</label>
                <input 
                    type="range" 
                    id="horasMeta" 
                    min="0" 
                    max="150" 
                    value={metaHorasPredi} 
                    onChange={handleHorasChange} 
                />
            </div>

            <button className="config-cerrarSesion" onClick={cerrarSesion}>Cerrar Sesión</button>
        </div>
    );
};

export default Config;
