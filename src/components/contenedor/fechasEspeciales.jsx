import { useState, useEffect, useRef, useContext } from 'react';

import { DataContext } from '../../context/dateContext';
import { FireContext } from '../../context/fireContext';
import { convertirAObjeto } from '../utilidades/funciones';

const FechasEspeciales = () => {
    const { currentFecha } = useContext(DataContext);
    const { cargarDatosStorage, guardarDatoStorage, datosFirebaseGlobal, activarSincronizacion } = useContext(FireContext);
    const [calendario, setCalendario] = useState(arrayFechas());
    const [newDateLabel, setNewDateLabel] = useState('');
    const isInitialized = useRef(false);

    function arrayFechas() {
        return ([
            { label: 'Asamblea de Circuito', date: '', fecha: '' },
            { label: 'Asamblea de Circuito 2', date: '', fecha: '' },
            { label: 'Asamblea Regional', date: '', fecha: '' },
            { label: 'Visita del superintendente', date: '', fecha: '' },
            { label: 'Conmemoración', date: '', fecha: '' },
        ]
        )
    }

    // Cargar datos del localStorage
    const loadFromLocalStorage = async () => {
        try {
            const savedData = await cargarDatosStorage('FechasEspeciales');
            if (savedData) {
                return convertirAObjeto(savedData)
            } else {
                return [
                    { label: 'Asamblea de Circuito', date: '', fecha: '' },
                    { label: 'Asamblea de Circuito 2', date: '', fecha: '' },
                    { label: 'Asamblea Regional', date: '', fecha: '' },
                    { label: 'Visita del superintendente', date: '', fecha: '' },
                    { label: 'Conmemoración', date: '', fecha: '' },
                ];
            }
        } catch (error) {
            console.error('Error loading data from localStorage:', error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const data = await loadFromLocalStorage();
            setCalendario(data);
            isInitialized.current = true;  // Marca que la carga inicial ha finalizado
        };

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [datosFirebaseGlobal]);

    // Guardar datos en localStorage
    const saveToLocalStorage = (dato) => {
        guardarDatoStorage('FechasEspeciales', currentFecha, dato);
    };

    // Maneja el cambio en los inputs de fecha
    const handleDateChange = (index, newDate) => {
        const updatedFechas = [...calendario];
        updatedFechas[index].date = newDate;
        updatedFechas[index].fecha = new Date().toLocaleString();
        setCalendario(updatedFechas);
        saveToLocalStorage(updatedFechas);  // Guarda los datos cada vez que se cambia una fecha
    };

    // Maneja el cambio en los inputs del modal
    const handleModalLabelChange = (e) => {
        setNewDateLabel(e.target.value);
    };

    // Agregar nueva fecha
    const handleAddDate = () => {
        if (newDateLabel) {
            const updatedFechas = [...calendario];  // Copia el array actual
            updatedFechas.push({ label: newDateLabel, date: '', fecha: '' });  // Agrega el nuevo objeto al array
            setCalendario(updatedFechas);  // Actualiza el estado con el nuevo array
            saveToLocalStorage(updatedFechas);  // Guarda los datos cuando se agrega una nueva fecha
            setNewDateLabel('');  // Limpia el campo de entrada después de agregar

            // Cerrar el modal usando bootstrap.Modal.getInstance
            const modalElement = document.querySelector('#exampleModal');
            if (modalElement && window.bootstrap) {
                const modal = window.bootstrap.Modal.getInstance(modalElement);
                modal.hide();
            }
        }
    };

    // Eliminar fecha
    const handleDeleteDate = (index) => {
        const updatedFechas = calendario.filter((_, i) => i !== index);
        setCalendario(updatedFechas);
        saveToLocalStorage(updatedFechas);  // Guarda los datos cuando se elimina una fecha
    };

    return (
        <div className="container">
            <h1 className='titulo'>Fechas especiales</h1>
            <div className="input-grid">
                {calendario.map((item, index) => (
                    <div key={index} className='recuadro-input'>
                        <p>{item.label}</p>

                        <input
                            disabled={!activarSincronizacion}
                            type="date"
                            value={item.date}
                            onChange={(e) => handleDateChange(index, e.target.value)}
                        />
                        <i
                            className="bi bi-trash"
                            onClick={() => handleDeleteDate(index)}
                            style={{ cursor: 'pointer', color: 'red' }}
                        />

                    </div>
                ))}
            </div>

            <button disabled={!activarSincronizacion} type="button" className="btn btn-primary botonFechas" data-bs-toggle="modal" data-bs-target="#exampleModal">
                Agregar Nueva Fecha
            </button>

            {/* Modal para agregar fecha */}
            <div className="modal fade" id="exampleModal" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="exampleModalLabel">Agregar Nueva Fecha</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label htmlFor="newDateLabel" className="form-label">Etiqueta</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="newDateLabel"
                                    value={newDateLabel}
                                    onChange={handleModalLabelChange}
                                    placeholder="Nombre de la fecha"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button disabled={!activarSincronizacion} type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                            <button disabled={!activarSincronizacion} type="button" className="btn btn-primary" onClick={handleAddDate}>Guardar Cambios</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FechasEspeciales;
