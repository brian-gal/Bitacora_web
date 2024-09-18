import { useContext, useEffect, useState } from "react";

import { FireContext } from "../../context/fireContext";
import { DataContext } from "../../context/dateContext";

const Informe = () => {
    const { dia, mes, año, currentFecha, setHorasPredi, horasPredi } = useContext(DataContext);
    const { cargarDatosStorage, guardarDatoStorage } = useContext(FireContext);

    // Estado para almacenar los datos de los inputs
    const [datos, setDatos] = useState(reiniciarValores());

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

            if (storedData && isJSON(storedData)) {
                const parsedData = JSON.parse(storedData);
                setDatos(parsedData);
            } else {
                // Si no hay datos en el localStorage, reiniciar el estado con días vacíos
                setDatos(reiniciarValores());
            }
        }
        prueba()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mes, año]);


    // Función para manejar el evento de cambio en los inputs
    const handleChange = (day, field, value) => {
        setDatos(prevDatos => {
            const updatedDatos = prevDatos.map(dato =>
                dato.dia === day ? { ...dato, [field]: value } : dato
            );

            // Guardar en localStorage cuando se actualiza el estado
            const clave = `Informe-${mes + 1}-${año}`;

            guardarDatoStorage(clave, currentFecha, updatedDatos);
            return updatedDatos;
        });
    };

    // Función para manejar el evento de cambio en los inputs
    const handleInputChange = (day, field) => (event) => {
        handleChange(day, field, event.target.value);
    };

    const daysInMonth = new Date(año, mes + 1, 0).getDate();


    useEffect(() => {
        // Calcular y guardar el total de horas cada vez que cambian los datos
        const totalHoras = datos.reduce((acc, cur) => acc + (parseFloat(cur.horas) || 0), 0);
        setHorasPredi(totalHoras);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [datos]);

    return (
        <>
            <h1 className='titulo'>Informe</h1>
            <table className="activity-table">
                <thead>
                    <tr>
                        <th>Día</th>
                        <th>Horas</th>
                        <th>Estudios</th>
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
                <tfoot>
                    <tr>
                        <td><strong>Total</strong></td>
                        <td>{horasPredi}</td>
                        <td>{datos.reduce((acc, cur) => acc + (parseFloat(cur.revisitas) || 0), 0)}</td>
                        <td>{datos.reduce((acc, cur) => acc + (parseFloat(cur.publicaciones) || 0), 0)}</td>
                    </tr>
                </tfoot>

            </table>
        </>
    );
};

export default Informe;
