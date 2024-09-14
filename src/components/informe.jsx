import { useContext, useEffect, useRef, useState } from "react";
import { DataContext } from "../context/dateContext";
import BotonScroll from "./botonScroll";

const Informe = () => {
    const { fechaActual, meses, dia, mes, año, retrocederMes, avanzarMes, retrocederAño, avanzarAño, scrollToPosition } = useContext(DataContext);

    const isInitialized = useRef(false);

    // Estado para almacenar los datos de los inputs
    const [datos, setDatos] = useState(reiniciarValores());

    // Estado para verificar si los datos han sido modificados
    const [modificado, setModificado] = useState(true);

    const isJSON = (str) => {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    };

    function reiniciarValores() {
        return Array.from({ length: new Date(año, mes + 1, 0).getDate() }, (_, i) => ({
            dia: i + 1,
            horas: "",
            estudio: ""
        }));
    }

    // Obtener los datos desde el storage
    useEffect(() => {
        const storedData = localStorage.getItem(`Informe-${mes + 1}-${año}`);

        if (storedData && isJSON(storedData)) {
            const parsedData = JSON.parse(storedData);
            setDatos(parsedData);
        } else {
            // Si no hay datos en el localStorage, reiniciar el estado con días vacíos
            setDatos(reiniciarValores());
        }
    }, [mes, año]);

    // Función para actualizar los datos en el estado
    const handleChange = (day, field, value) => {
        setDatos(prevDatos =>
            prevDatos.map(dato =>
                dato.dia === day ? { ...dato, [field]: value } : dato
            )
        );
        setModificado(true);  // Marca como modificado
    };

    // Función para guardar los datos en localStorage
    const saveToLocalStorage = () => {
        const clave = `Informe-${mes + 1}-${año}`; // La clave en localStorage

        if (isInitialized.current) {

            localStorage.setItem(clave, JSON.stringify(datos));
        } else {

            isInitialized.current = true;
        }
    };

    // Función para manejar el evento de cambio en los inputs
    const handleInputChange = (day, field) => (event) => {
        handleChange(day, field, event.target.value);
    };

    // useEffect para guardar los datos en localStorage solo si han sido modificados
    useEffect(() => {
        if (modificado) {
            saveToLocalStorage();
            setModificado(false);  // Reinicia la bandera después de guardar
        }
    }, [datos, modificado]);

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
            <BotonScroll botonId={`idInformeDia-${dia}`} botonPx="45" />
        </>
    );
};

export default Informe;
