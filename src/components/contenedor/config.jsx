import { getAuth, signOut } from "firebase/auth";
import { useContext, useEffect, useRef } from "react";

import { DataContext } from "../../context/dateContext";
import { FireContext } from "../../context/fireContext";

const Config = () => {
    const { setMetaHorasPredi, metaHorasPredi, currentFecha } = useContext(DataContext);
    const { cargarDatosStorage, guardarDatoStorage, uid } = useContext(FireContext);

    const prevMetaHorasPrediRef = useRef(metaHorasPredi);

    //cargar datos del storage
    useEffect(() => {
        const fetchData = async () => {
            const data = await cargarDatosStorage("Config", uid);

            if (data) {
                const meta = JSON.parse(data)
                if (meta.metaHorasPredi) {
                    setMetaHorasPredi(meta.metaHorasPredi)
                }
            }
        };

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (prevMetaHorasPrediRef.current !== metaHorasPredi) {
            // Obtener la configuración actual desde localStorage
            const existingConfig = JSON.parse(localStorage.getItem('Config')) || {};

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
