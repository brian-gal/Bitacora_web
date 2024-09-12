import { useState, useEffect, useRef, useContext } from 'react';
import { DataContext } from '../context/dateContext';

const Notas = ({ titulo, texto, clases, esMensual }) => {

    const { mes, año } = useContext(DataContext)
    const [content, setContent] = useState('');
    const [fecha, setFecha] = useState('');
    const [guardado, setguardado] = useState(false);

    const timerGuardadoRef = useRef(null);  // Ref para almacenar el temporizador


    // Función para verificar si el string es JSON válido
    const isJSON = (str) => {
        try {
            JSON.parse(str);
        } catch (e) {
            console.log(e);
            return false;
        }
        return true;
    };

    // Obtener las notas del localStorage
    useEffect(() => {
        const storedData = localStorage.getItem(titulo);
        if (esMensual) {
            if (storedData && isJSON(storedData)) {
                const { content: savedContent, fecha: savedFecha, mes: savedMes, año: savedAño } = JSON.parse(storedData);

                if (savedMes === mes && savedAño === año) {
                    setContent(savedContent || '');
                    setFecha(savedFecha || '');
                } else {
                    console.log('No hay datos para esta fecha');
                    setContent('')
                }
            } else {
                console.log('No hay datos válidos en el localStorage');
            }
        } else {
            if (storedData && isJSON(storedData)) {
                const { content: savedContent, fecha: savedFecha } = JSON.parse(storedData);
                setContent(savedContent || '');
                setFecha(savedFecha || '');
            } else if (storedData) {
                // Si no es JSON válido, lo tratamos como contenido simple
                setContent(storedData);
            }
        }
    }, [titulo, esMensual, mes, año]);

    useEffect(() => {
        setguardado(false)
        // Limpiar el temporizador anterior si existe
        if (timerGuardadoRef.current) {
            clearTimeout(timerGuardadoRef.current);
        }

        // Iniciar un nuevo temporizador
        timerGuardadoRef.current = setTimeout(() => {
            const currentFecha = new Date().toLocaleString();

            // Construir el objeto de datos basado en la condición esMensual
            const data = esMensual
                ? { content, fecha: currentFecha, mes, año }
                : { content, fecha: currentFecha };

            // Guardar los datos en localStorage y actualizar la fecha en el estado
            localStorage.setItem(titulo, JSON.stringify(data));
            setFecha(currentFecha);
            setguardado(true)
        }, 1000);
    }, [content, titulo, esMensual, mes, año]);


    // Función para hacer scroll hasta el fondo de la página
    const scrollToBottom = () => {
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth'
        });
    };

    return (
        <div className="notas-container">
            <h1 className="titulo">{titulo}</h1>
            <textarea
                className={clases}
                placeholder={texto}
                value={content}
                onChange={(e) => setContent(e.target.value)}  // Actualiza el estado
            ></textarea>
            <p>{guardado ? `Guardado el: ${fecha}` : "Guardando..."}</p>
            {/* Botón flotante */}
            <i className="bi bi-arrow-down-circle-fill scroll-to-bottom" onClick={scrollToBottom}></i>
        </div>
    );
};

export default Notas;
