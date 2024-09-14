import { useContext, useEffect, useState } from "react";
import { DataContext } from "../context/dateContext";

const BotonScroll = () => {
    const { dia, currentLocation } = useContext(DataContext);
    const [visible, setVisible] = useState(false);
    const [primerToque, setPrimerToque] = useState(true);


    //carga la flecha al iniciar el componente
    useEffect(() => {

        const handleScroll = () => {

            const atBottom = document.body.scrollHeight > window.innerHeight + 100;

            if (atBottom) {
                // Ocultar el botón si estamos en la parte superior o al final de la página
                setVisible(true);
            } else {
                // Mostrar el botón si el usuario está en medio de la página
                setVisible(false);
            }

        };

        if (currentLocation == "/notas") {
            setTimeout(() => {
                handleScroll()
            }, 100)
        } else {
            handleScroll()
        }

    }, [currentLocation]);


    useEffect(() => {
        const handleScroll = () => {
            const atBottom = window.scrollY >= document.body.scrollHeight - window.innerHeight + 100;

            if (atBottom) {
                // Ocultar el botón si estamos en la parte superior o al final de la página
                setVisible(false);
            } else {
                // Mostrar el botón si el usuario está en medio de la página
                setVisible(true);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);


    const scrollToPosition = () => {

        if (currentLocation === "/" && primerToque) {
            const element = document.getElementById(`idInformeDia-${dia}`);
            if (element) {
                // Desplazar el elemento específico
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                const elementPosition = element.getBoundingClientRect().top + window.scrollY;
                window.scrollTo({
                    top: elementPosition - "60",
                    behavior: 'smooth'
                });
                setPrimerToque(false)
            }
        } else {
            // Desplazar hacia el final de la página
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
            setPrimerToque(true)
        }
    };

    return (
        <i
            style={currentLocation === "/" && primerToque ? { color: '#a57ee1' } : null}
            className={`bi bi-caret-down-fill scroll-to-bottom ${visible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 fixed bottom-5 right-5 w-12 h-12 flex items-center justify-center`}
            onClick={() => scrollToPosition()}
        ></i>

    );
}

export default BotonScroll;
