import { useState, useEffect, useRef, useContext } from 'react';
import { DataContext } from '../../context/dateContext';
import { FireContext } from '../../context/fireContext';

// eslint-disable-next-line react/prop-types
const Notas = ({ titulo, texto, clases, esMensual }) => {
    const { mes, año, currentFecha } = useContext(DataContext);
    const { cargarDatosStorage, guardarDatoStorage } = useContext(FireContext);

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
            console.error(e)
            return false;
        }
        return true;
    };

    // Obtener los datos desde el storage
    useEffect(() => {
        const fetchData = async () => {
            if (esMensual) {
                const storedData = await cargarDatosStorage(`${titulo}-${año}`);
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
                const storedData = await cargarDatosStorage(titulo);
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mes, año]);

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

            guardarDatoStorage(`${titulo}-${año}`, currentFecha, storedArray)
        } else {
            const data = { content, fecha: currentFecha };

            guardarDatoStorage(titulo, currentFecha, data)
        }

        setFecha(currentFecha);
        setguardado(true);
        setInitialContent(content)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [content]);

    //ajusta la altura del textarea
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
        </div>
    );
};

export default Notas;
