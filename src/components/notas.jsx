import { useState, useEffect, useRef, useContext } from 'react';
import { DataContext } from '../context/dateContext';
import BotonScroll from './botonScroll';

const Notas = ({ titulo, texto, clases, esMensual }) => {
    const { mes, año } = useContext(DataContext);
    const [content, setContent] = useState('');
    const [initialContent, setInitialContent] = useState('');  // Estado para el contenido inicial
    const [fecha, setFecha] = useState('');
    const [guardado, setguardado] = useState(false);

    const timerGuardadoRef = useRef(null);
    const textareaRef = useRef(null);  // Referencia al textarea

    const isJSON = (str) => {
        try {
            JSON.parse(str);
        } catch (e) {

            return false;
        }
        return true;
    };

    // Obtener los datos desde el storage
    useEffect(() => {
        const fetchData = () => {
            if (esMensual) {
                const storedData = localStorage.getItem(`${titulo}-${año}`);
                let storedArray = Array(12).fill(null);

                if (storedData && isJSON(storedData)) {
                    storedArray = JSON.parse(storedData);
                }

                const savedData = storedArray[mes];

                if (savedData) {
                    setContent(savedData.content || '');
                    setInitialContent(savedData.content || '');  // Guardar el contenido inicial
                    setFecha(savedData.fecha || '');
                } else {
                    setContent('');
                    setInitialContent('');  // Limpiar el contenido inicial también
                    setFecha('');
                }
            } else {
                const storedData = localStorage.getItem(titulo);
                if (storedData && isJSON(storedData)) {
                    const { content: savedContent, fecha: savedFecha } = JSON.parse(storedData);
                    setContent(savedContent || '');
                    setInitialContent(savedContent || '');  // Guardar el contenido inicial
                    setFecha(savedFecha || '');
                } else {
                    setContent('');
                    setInitialContent('');  // Limpiar el contenido inicial también
                    setFecha('');
                }
            }
        };

        fetchData();
    }, [titulo, esMensual, mes, año]);

    useEffect(() => {
        if (esMensual == false) {
            // Ajustar la altura del textarea cada vez que el contenido cambie
            const adjustTextareaHeight = () => {
                if (textareaRef.current) {
                    const textarea = textareaRef.current;
                    textarea.style.height = 'auto';  // Restablecer altura a auto
                    textarea.style.height = `${textarea.scrollHeight + 20}px`;  // Ajustar altura al contenido
                }
            };

            adjustTextareaHeight();  // Llamar a la función para ajustar la altura al montar el componente

            // Ajustar la altura del textarea cada vez que el contenido cambie
            const timer = setTimeout(adjustTextareaHeight, 0);  // Usar un timeout para asegurarse de que el DOM se actualice

            return () => clearTimeout(timer);  // Limpiar el timeout cuando el componente se desmonte

        }

    }, [content, esMensual]);

    // Guardar los datos en el storage
    useEffect(() => {
        setguardado(false);
        // Limpiar el timer si el contenido ha cambiado
        if (timerGuardadoRef.current) {
            clearTimeout(timerGuardadoRef.current);
        }
        // Si el contenido es igual al inicial, no hacemos nada
        if (content === initialContent) {
            if (content.trim() === '' && initialContent.trim() !== '') {
                setguardado(false);  // Permitir el guardado si se ha borrado el contenido
            } else {
                return setguardado(true);  // No guardar si el contenido no ha cambiado
            }
        }

        timerGuardadoRef.current = setTimeout(() => {
            const currentFecha = new Date().toLocaleString();

            if (esMensual) {
                const storedData = localStorage.getItem(`${titulo}-${año}`);
                let storedArray = Array(12).fill(null);

                if (storedData && isJSON(storedData)) {
                    storedArray = JSON.parse(storedData);
                }

                const newEntry = {
                    content,
                    fecha: currentFecha,
                    mes,
                    año
                };

                storedArray[mes] = newEntry;
                localStorage.setItem(`${titulo}-${año}`, JSON.stringify(storedArray));
            } else {
                const data = { content, fecha: currentFecha };
                localStorage.setItem(titulo, JSON.stringify(data));
            }

            setFecha(currentFecha);
            setguardado(true);
            setInitialContent(content)
        }, 1000);
    }, [content, titulo, esMensual, mes, año, initialContent]);

    return (
        <div className="notas-container">
            <h1 className="titulo">{titulo}</h1>
            <textarea
                ref={textareaRef}  // Asigna la referencia al textarea
                className={clases}
                placeholder={texto}
                value={content}
                onChange={(e) => setContent(e.target.value)}  // Actualiza el estado
            ></textarea>
            {fecha !== null && fecha !== undefined && fecha.trim() !== "" && (
                <p className='fechaGuardado'>
                    {guardado ? `Guardado el: ${fecha}` : "Guardando..."}
                </p>
            )}
            <BotonScroll />

        </div>
    );
};

export default Notas;
