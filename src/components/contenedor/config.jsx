import { getAuth, signOut } from "firebase/auth";
import { useContext, useEffect, useRef } from "react";

import { DataContext } from "../../context/dateContext";
import { FireContext } from "../../context/fireContext";
import { convertirAObjeto } from "../utilidades/funciones";

const Config = () => {
    const { currentFecha, metaHorasPredi, setMetaHorasPredi } = useContext(DataContext);
    const { guardarDatoStorage, datosFirebaseGlobal, activarSincronizacion } = useContext(FireContext);
    const prevMetaHorasPrediRef = useRef(metaHorasPredi);

    useEffect(() => {
        if (prevMetaHorasPrediRef.current !== metaHorasPredi) {
            // Obtener la configuración actual desde localStorage
            const existingConfig = convertirAObjeto(localStorage.getItem('Config')) || {};
            // Actualizar solo la clave metaHorasPredi, preservando las otras claves
            const updatedConfig = { ...existingConfig, metaHorasPredi: metaHorasPredi };
            // Guardar la configuración actualizada
            guardarDatoStorage('Config', currentFecha, updatedConfig);
            // Actualiza el valor anterior
            prevMetaHorasPrediRef.current = metaHorasPredi;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [metaHorasPredi]);


    const handleHorasChange = (e) => {
        setMetaHorasPredi(e.target.value);
    };

    function cerrarSesion() {
        const auth = getAuth();
        signOut(auth).then(() => {
            localStorage.clear();
        }).catch((error) => {
            console.log(error);
        });
    }

    return (
        <div className="config-container">
            <div className="config-meta">
                <h2>Meta a cumplir</h2>
                <label htmlFor="horasMeta">Horas de predicación al mes: {metaHorasPredi}</label>
                <input
                    disabled={!activarSincronizacion}
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
