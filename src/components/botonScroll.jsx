import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const BotonScroll = ({ botonId, botonPx }) => {
    const [visible, setVisible] = useState(false);
    const [primerToque, setPrimerToque] = useState(true);
    const location = useLocation().pathname;

    useEffect(() => {
        setVisible(true);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            // Mostrar el botón si el usuario no está al final de la página
            if (window.scrollY < document.body.scrollHeight - window.innerHeight + 140) {
                setVisible(true);
            } else {
                setVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToPosition = (elementId = null, marginTop = 0) => {

        if (elementId && primerToque) {
            const element = document.getElementById(elementId);
            if (element) {
                // Desplazar el elemento específico
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                const elementPosition = element.getBoundingClientRect().top + window.scrollY;
                window.scrollTo({
                    top: elementPosition - marginTop,
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
    console.log(location);

    return (
        <i
            style={location === "/" && primerToque ? { color: '#a57ee1' } : null}
            className={`bi bi-arrow-down-circle-fill scroll-to-bottom ${visible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 fixed bottom-5 right-5 w-12 h-12 flex items-center justify-center`}
            onClick={() => scrollToPosition(botonId, botonPx)}
        ></i>

    );
}

export default BotonScroll;
