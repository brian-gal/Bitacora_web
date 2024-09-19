import { createContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export const DataContext = createContext({});

// eslint-disable-next-line react/prop-types
export const DataProvider = ({ children }) => {
    const date = new Date();
    const dia = date.getDate();
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const location = useLocation();
    const [metaHorasPredi, setMetaHorasPredi] = useState(10);
    const [currentLocation, setCurrentLocation] = useState(location.pathname);
    const [horasPredi, setHorasPredi] = useState(0);
    const [mes, setMes] = useState(date.getMonth());
    const [año, setAño] = useState(date.getFullYear());

    // Actualizar el estado cada vez que cambie la ubicación
    useEffect(() => {
        setCurrentLocation(location.pathname);
    }, [location]);

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

    //funcion para obtener fecha actual
    const fechaActual = () => {
        setMes(date.getMonth())
        setAño(date.getFullYear())
    }

    const currentFecha = new Date().toISOString();

    return (
        <DataContext.Provider
            value={{
                fechaActual,
                retrocederMes,
                avanzarMes,
                retrocederAño,
                avanzarAño,
                setHorasPredi,
                currentLocation,
                currentFecha,
                horasPredi,
                meses,
                dia,
                mes,
                año,
                metaHorasPredi,
                setMetaHorasPredi
            }}
        >
            {children}
        </DataContext.Provider>
    );
};
