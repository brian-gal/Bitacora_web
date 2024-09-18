import { useContext, useEffect, useRef, useState } from "react";
import { DataContext } from "../context/dateContext";
import { crearDependencia } from "./storageDependencies";
import { FireContext } from "../context/fireContext";

const Informe = () => {
    const { dia, mes, año, currentFecha } = useContext(DataContext);
    const { cargarDatosStorage } = useContext(FireContext);

    const isInitialized = useRef(false);

    // Estado para almacenar los datos de los inputs
    const [datos, setDatos] = useState(reiniciarValores());

    // Estado para verificar si los datos han sido modificados
    const [modificado, setModificado] = useState(true);

    const isJSON = (str) => {
        try {
            JSON.parse(str);
        } catch (e) {
            console.error(e)
            return false;
        }
        return true;
    };

    function reiniciarValores() {
        return Array.from({ length: new Date(año, mes + 1, 0).getDate() }, (_, i) => ({
            dia: i + 1,
            horas: "",
            revisitas: "",
            publicaciones: ""
        }));
    }

    // Obtener los datos desde el storage
    useEffect(() => {
        async function prueba() {
            const titulo = `Informe-${mes + 1}-${año}`;
            const storedData = await cargarDatosStorage(titulo);
            console.log(storedData);

            if (storedData && isJSON(storedData)) {
                const parsedData = JSON.parse(storedData);
                setDatos(parsedData);
            } else {
                // Si no hay datos en el localStorage, reiniciar el estado con días vacíos
                setDatos(reiniciarValores());
            }
        }
        prueba()
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
            crearDependencia(clave, currentFecha)

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
            <h1 className='titulo'>Informe</h1>
            <table className="activity-table">
                <thead>
                    <tr>
                        <th>Día</th>
                        <th>Horas</th>
                        <th>Revisitas</th>
                        <th>Publicaciones y videos</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                        <tr key={day}>
                            <td id={day === dia ? `idInformeDia-${day}` : undefined} style={{ backgroundColor: day === dia ? 'lightblue' : 'transparent' }}>{day}</td>
                            <td><input type="number" placeholder="Horas" value={datos.find(d => d.dia === day)?.horas || ""} onChange={handleInputChange(day, 'horas')} /></td>
                            <td><input type="text" placeholder="Revisitas" value={datos.find(d => d.dia === day)?.revisitas || ""} onChange={handleInputChange(day, 'revisitas')} /></td>
                            <td><input type="number" placeholder="Publicaciones" value={datos.find(d => d.dia === day)?.publicaciones || ""} onChange={handleInputChange(day, 'publicaciones')} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
};

export default Informe;
