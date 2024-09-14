import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const BotonScroll = ({botonId, botonPx}) => {
    const location = useLocation().pathname;
    const [containerHeight, setContainerHeight] = useState("");
    const [viewportHeight, setViewportHeight] = useState("");

    useEffect(() => {
        const contenedorTotal = document.getElementById('contenedorTotal');

        if (contenedorTotal) {
            setContainerHeight(contenedorTotal.offsetHeight);
            setViewportHeight(window.innerHeight);
        }
        console.log(containerHeight);
        console.log(viewportHeight);

        
    }, [location]);

    const scrollToPosition = (elementId = null, marginTop = 0) => {

        if (elementId) {
            const element = document.getElementById(elementId);
            if (element) {
                // Desplazar el elemento para que esté en vista
                element.scrollIntoView({
                    behavior: 'smooth', // Desplazamiento suave
                    block: 'start'      // Alinear el elemento con la parte superior de la ventana
                });

                // Ajustar la posición para asegurar que el elemento quede alineado con un margen superior
                const elementPosition = element.getBoundingClientRect().top + window.scrollY;
                window.scrollTo({
                    top: elementPosition - marginTop, // Aplicar el margen superior aquí
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
        containerHeight > viewportHeight ? (
            <i 
                className="bi bi-arrow-down-circle-fill scroll-to-bottom" 
                onClick={() => scrollToPosition(botonId, botonPx)}
            ></i>
        ) : null
    );
    
}

export default BotonScroll