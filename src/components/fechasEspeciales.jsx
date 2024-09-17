import { useState, useEffect, useRef } from 'react';
import { crearDependencia } from './storageDependencies';

const FechasEspeciales = () => {
    const isInitialized = useRef(false);


    // Cargar datos del localStorage
    const loadFromLocalStorage = () => {
        const savedData = localStorage.getItem('FechasEspeciales');

        return savedData ? JSON.parse(savedData) : [
            { label: 'Asamblea de Circuito', date: '', fecha: '' },
            { label: 'Asamblea de Circuito 2', date: '', fecha: '' },
            { label: 'Asamblea Regional', date: '', fecha: '' },
            { label: 'Visita del superintendente', date: '', fecha: '' },
            { label: 'Conmemoración', date: '', fecha: '' },
        ];
    };

    const [calendario, setCalendario] = useState(loadFromLocalStorage);
    const [newDateLabel, setNewDateLabel] = useState('');

    // Guardar datos en localStorage cada vez que el estado cambia
    useEffect(() => {
        const currentFecha = new Date().toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false // Para formato de 24 horas
        });




        if (isInitialized.current) {
            localStorage.setItem('FechasEspeciales', JSON.stringify(calendario));
            crearDependencia('FechasEspeciales', currentFecha, true, "probando")

        } else {
            isInitialized.current = true;
        }
    }, [calendario]);



    // Maneja el cambio en los inputs de fecha
    const handleDateChange = (index, newDate) => {
        const updatedFechas = [...calendario];
        updatedFechas[index].date = newDate;
        updatedFechas[index].fecha = new Date().toLocaleString();
        setCalendario(updatedFechas);
    };

    // Maneja el cambio en los inputs del modal
    const handleModalLabelChange = (e) => {
        setNewDateLabel(e.target.value);
    };

    // Agregar nueva fecha
    const handleAddDate = () => {
        if (newDateLabel) {
            const updatedFechas = [...calendario, { label: newDateLabel, date: '' }];
            setCalendario(updatedFechas);
            setNewDateLabel('');

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
    };

    return (
        <div className="container">
            <h1 className='titulo'>Fechas especiales</h1>
            <div className="input-grid">
                {calendario.map((item, index) => (
                    <div key={index} className='recuadro-input'>
                        <p>{item.label}</p>

                        <input
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

            <button type="button" className="btn btn-primary botonFechas" data-bs-toggle="modal" data-bs-target="#exampleModal">
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
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                            <button type="button" className="btn btn-primary" onClick={handleAddDate}>Guardar Cambios</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FechasEspeciales;
