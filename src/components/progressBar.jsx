import { useContext } from "react";
import { DataContext } from "../context/dateContext";

const ProgressBar = () => {
    const { horasPredi, metaHorasPredi } = useContext(DataContext);

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
        >{}
            <div className="progress-bar" style={{ width: `${progreso}%` }}></div>
        </div>
    );
};

export default ProgressBar;
