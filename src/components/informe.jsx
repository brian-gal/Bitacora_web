import { useContext, useEffect, useState } from "react";
import { DataContext } from "../context/dateContext";

const Informe = () => {
    const { fechaActual, meses, dia, mes, año, retrocederMes, avanzarMes, retrocederAño, avanzarAño, scrollToPosition } = useContext(DataContext);

    // Estado para almacenar los datos de los inputs
    const [datos, setDatos] = useState(
        Array.from({ length: new Date(año, mes + 1, 0).getDate() }, (_, i) => ({
            dia: i + 1,
            horas: 0,
            estudio: ""
        }))
    );

    // Función para actualizar los datos en el estado
    const handleChange = (day, field, value) => {
        setDatos(prevDatos =>
            prevDatos.map(dato =>
                dato.dia === day ? { ...dato, [field]: value } : dato
            )
        );
    };

    // Función para guardar los datos en localStorage
    const saveToLocalStorage = () => {
        const clave = `informe-${mes + 1}-${año}`; // La clave en localStorage
        localStorage.setItem(clave, JSON.stringify(datos));
    };

    // Función para manejar el evento de cambio en los inputs
    const handleInputChange = (day, field) => (event) => {
        handleChange(day, field, event.target.value);
    };

    useEffect(() => {
        saveToLocalStorage();
    }, [datos, mes, año]);

    const daysInMonth = new Date(año, mes + 1, 0).getDate();

    return (
        <>
            <table className="activity-table">
                <thead>
                    <tr>
                        <th>Día</th>
                        <th>Horas</th>
                        <th>Estudios</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                        <tr key={day}>
                            <td id={day === dia ? `idInformeDia-${day}` : undefined} style={{ backgroundColor: day === dia ? 'lightblue' : 'transparent' }}>{day}</td>
                            <td><input type="number" placeholder="Horas" value={datos.find(d => d.dia === day)?.horas || ""} onChange={handleInputChange(day, 'horas')} /></td>
                            <td><input type="text" placeholder="Estudios" value={datos.find(d => d.dia === day)?.estudio || ""} onChange={handleInputChange(day, 'estudio')} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <i className="bi bi-arrow-down-circle-fill scroll-to-bottom" onClick={() => scrollToPosition(`idInformeDia-${dia}`)}></i>
        </>
    );
};

export default Informe;
