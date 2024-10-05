import { useContext, useEffect, useRef } from "react";

import { DataContext } from "../../context/dateContext";
import { FireContext } from "../../context/fireContext";
import EditarUsuario from "../inicioSesion/editarUsuario";
import { convertirAObjeto } from "../utilidades/funciones";

const Config = () => {
    const { currentFecha, metaHorasPredi, setMetaHorasPredi } = useContext(DataContext);
    const { guardarDatoStorage, activarSincronizacion, cerrarSesion } = useContext(FireContext);
    const prevMetaHorasPrediRef = useRef(metaHorasPredi);

    useEffect(() => {
        if (prevMetaHorasPrediRef.current !== metaHorasPredi) {
            const existingConfig = convertirAObjeto(localStorage.getItem('Config')) || {};
            const updatedConfig = { ...existingConfig, metaHorasPredi: metaHorasPredi };
            guardarDatoStorage('Config', currentFecha, updatedConfig);
            // Actualiza el valor anterior
            prevMetaHorasPrediRef.current = metaHorasPredi;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [metaHorasPredi]);


    const handleHorasChange = (e) => {
        setMetaHorasPredi(e.target.value);
    };

    return (
        <div className="config-container">

            <EditarUsuario />

            <div className="config-meta editar-usuario-card">
                <p className="editar-usuario-title">Meta a cumplir</p>

                <label htmlFor="horasMeta">Horas de predicación al mes:</label>
                <input
                    disabled={!activarSincronizacion}
                    type="range"
                    id="horasMeta"
                    min="0"
                    max="150"
                    value={metaHorasPredi}
                    onChange={handleHorasChange}
                />
                <p>{metaHorasPredi} horas</p>
            </div>


            <button className="config-cerrarSesion" onClick={cerrarSesion}>Cerrar Sesión</button>
        </div>
    );
};

export default Config;
