import { createContext, useState } from "react";

// Crear el contexto
export const DataContext = createContext({});

// Meses del año
const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

// Componente proveedor del contexto
export const DataProvider = ({ children }) => {
    const date = new Date();

    // Estado para manejar el día, mes y año
    const dia = date.getDate();

    const [mes, setMes] = useState(date.getMonth());
    const [año, setAño] = useState(date.getFullYear());

    // Función para retroceder en el mes
    const retrocederMes = () => {
        if (mes === 0) { // Si es enero, retrocedemos al año anterior
            setMes(11); // Diciembre
            setAño(año - 1);
        } else {
            setMes(mes - 1);
        }
    };

    // Función para avanzar en el mes
    const avanzarMes = () => {
        if (mes < date.getMonth() || año < date.getFullYear()) {
            if (mes === 11) { // Si es diciembre, avanzamos al siguiente año
                setMes(0); // Enero
                setAño(año + 1);
            } else {
                setMes(mes + 1);
            }
        }
    };

    // Función para retroceder en el año
    const retrocederAño = () => {
        setAño(año - 1);
    };

    // Función para avanzar en el año
    const avanzarAño = () => {
        if (año < date.getFullYear()) {
            setAño(año + 1);
        }
    };

    const fechaActual = () => {
        setMes(date.getMonth())
        setAño(date.getFullYear())
    }

    return (
        <DataContext.Provider
            value={{
                meses,
                dia,
                mes,
                año,
                fechaActual,
                retrocederMes,
                avanzarMes,
                retrocederAño,
                avanzarAño
            }}
        >
            {children}
        </DataContext.Provider>
    );
};
