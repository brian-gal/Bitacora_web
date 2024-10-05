import { useContext, useEffect } from "react";
import { DataContext } from "../../context/dateContext";
import { FireContext } from "../../context/fireContext";
import { initializeGlobalStorage } from "./funciones";

const ProgressBar = () => {
    const { horasPredi, metaHorasPredi, setMetaHorasPredi, currentFecha } = useContext(DataContext);
    const { cargarDatosStorage, datosFirebaseGlobal, guardarDatoStorage } = useContext(FireContext);

    //cargar datos del storage
    useEffect(() => {
        async function cargarConfig() {
            const datosConfig = await cargarDatosStorage("Config")
            if (datosConfig && datosConfig.metaHorasPredi) {
                setMetaHorasPredi(datosConfig.metaHorasPredi)
            } else {
                initializeGlobalStorage(guardarDatoStorage, currentFecha, "Config");
            }
        }
        cargarConfig()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [datosFirebaseGlobal]);

    // Calcula el progreso en porcentaje
    const progreso = (horasPredi / metaHorasPredi) * 100;

    return (
        <div
            className="progress"
            role="progressbar"
            aria-label="Example 2px high"
            aria-valuenow="25"
            aria-valuemin="0"
            aria-valuemax="100"
            style={{ height: '2px' }}
        >{ }
            <div className="progress-bar" style={{ width: `${progreso}%` }}></div>
        </div>
    );
};

export default ProgressBar;
