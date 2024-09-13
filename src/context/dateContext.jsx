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

    const scrollToPosition = (elementId = null) => {
        if (elementId) {
            const element = document.getElementById(elementId);
            if (element) {
                // Desplazar el elemento para que esté en vista
                element.scrollIntoView({
                    behavior: 'smooth', // Desplazamiento suave
                    block: 'start'      // Alinear el elemento con la parte superior de la ventana
                });
    
                // Ajustar la posición para asegurar que el elemento quede alineado con la parte superior
                // A veces scrollIntoView no alinea exactamente, así que ajustamos la posición manualmente
                const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                window.scrollTo({
                    top: elementPosition,
                    behavior: 'smooth'
                });
            }
        } else {
            // Si no se pasa un ID, desplazarse al final de la página
            window.scrollTo({
                top: document.documentElement.scrollHeight,  // Desplazar al final
                behavior: 'smooth'
            });
        }
    };
    
    
    
    

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
                avanzarAño,
                scrollToPosition
            }}
        >
            {children}
        </DataContext.Provider>
    );
};
