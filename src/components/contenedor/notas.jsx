import { useState, useEffect, useRef, useContext } from 'react';
import { DataContext } from '../../context/dateContext';
import { FireContext } from '../../context/fireContext';
import { convertirAObjeto } from '../utilidades/funciones';

// eslint-disable-next-line react/prop-types
const Notas = ({ titulo, texto, clases, esMensual }) => {
    const { mes, año, currentFecha } = useContext(DataContext);
    const { cargarDatosStorage, guardarDatoStorage, datosFirebaseAño, datosFirebaseGlobal, activarSincronizacion } = useContext(FireContext);

    const [content, setContent] = useState('');
    const [initialContent, setInitialContent] = useState('');  // Estado para el contenido inicial
    const [fecha, setFecha] = useState(''); //es clave para que guarde solo cuando hay un cambio
    const [guardado, setguardado] = useState(false);  //es clave para que guarde solo cuando hay un cambio

    const timerGuardadoRef = useRef(null);
    const textareaRef = useRef(null);  // Referencia al textarea

    // Obtener los datos desde el storage
    useEffect(() => {
        const fetchData = async () => {
            if (esMensual) {
                // Cargar los datos del localStorage
                const storedData = await cargarDatosStorage(`Enseñanzas-${año}`);

                if (storedData) {
                    // Convertir a objeto
                    const enseñanzas = convertirAObjeto(storedData);

                    // Acceder a la categoría según el título (Broadcasting, Oraciones, Gratitud)
                    const categoryData = enseñanzas[titulo];

                    // Si existe la categoría y el mes específico
                    if (categoryData && categoryData[mes]) {
                        const savedData = categoryData[mes]; // Datos guardados del mes

                        // Establecer los valores si existen
                        setContent(savedData.content || '');
                        setInitialContent(savedData.content || ''); // Guardar el contenido inicial
                        setFecha(savedData.fecha || '');
                    } else {
                        // Limpiar los valores si no hay datos
                        setContent('');
                        setInitialContent(''); // Limpiar el contenido inicial también
                        setFecha('');
                    }
                } else {
                    // Limpiar los valores si no hay datos guardados en el año
                    setContent('');
                    setInitialContent(''); // Limpiar el contenido inicial también
                    setFecha('');
                }
            } else {
                const storedData = await cargarDatosStorage(titulo);
                if (storedData) {
                    const { content: savedContent, fecha: savedFecha } = convertirAObjeto(storedData);
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
    }, [mes, año, datosFirebaseGlobal, datosFirebaseAño]);

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
            // Inicializar objeto enseñanzas
            let enseñanzas;
            const storedData = localStorage.getItem(`Enseñanzas-${año}`);

            if (storedData) {
                // Si existe, convertir a objeto
                enseñanzas = JSON.parse(storedData);
            } else {
                // Si no existe, crear la estructura inicial
                enseñanzas = {
                    Broadcasting: {},
                    Oraciones: {},
                    Gratitud: {}
                };
            }

            // Crear el nuevo objeto de entrada
            const newEntry = {
                content,
                fecha: currentFecha,
                mes,
                año
            };

            // Asegurarse de no sobrescribir los meses existentes
            // Si la clave 'titulo' ya existe, mantener los meses existentes, y agregar el nuevo
            enseñanzas[titulo] = {
                ...enseñanzas[titulo], // Mantiene los meses ya existentes
                [mes]: newEntry        // Agrega o actualiza el mes actual
            };

            // Guardar el objeto actualizado en localStorage
            guardarDatoStorage(`Enseñanzas-${año}`, currentFecha, enseñanzas);

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
                disabled={!activarSincronizacion}  // Deshabilita si activarSincronizacion es false
            ></textarea>
        </div>
    );
};

export default Notas;
