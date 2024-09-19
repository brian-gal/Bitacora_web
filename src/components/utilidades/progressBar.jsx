import { useContext, useEffect } from "react";
import { DataContext } from "../../context/dateContext";
import { FireContext } from "../../context/fireContext";

const ProgressBar = () => {
    const { horasPredi, metaHorasPredi, setMetaHorasPredi } = useContext(DataContext);
    const { cargarDatosStorage, uid } = useContext(FireContext);

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
        console.log("probando");

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
