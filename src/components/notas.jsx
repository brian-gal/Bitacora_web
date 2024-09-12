import { useState, useRef, useEffect } from 'react';

const Notas = () => {
    const [content, setContent] = useState('');
    const textareaRef = useRef(null);

    // Función para ajustar el alto del textarea según el contenido
    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current;
        textarea.style.height = 'auto'; // Reseteamos el alto
        // Ajustamos según el contenido y añadimos un margen adicional
        textarea.style.height = `${textarea.scrollHeight + 50}px`;
    };

    // Efecto para ajustar el alto cuando cambia el contenido
    useEffect(() => {
        adjustTextareaHeight();
    }, [content]);

    // Función para hacer scroll hasta el fondo de la página
    const scrollToBottom = () => {
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth'
        });
    };

    return (
        <div className="notas-container">
            <h1 className="titulo">Mis apuntes...</h1>
            <textarea
                ref={textareaRef}
                className="textarea-notas"
                placeholder="Escribe tus notas aquí..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
            ></textarea>
            {/* Botón flotante */}
            <i className="bi bi-arrow-down-circle-fill scroll-to-bottom" onClick={scrollToBottom}></i>
        </div>
    );
};

export default Notas;
