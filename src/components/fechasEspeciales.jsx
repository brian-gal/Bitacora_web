import { useState, useEffect } from 'react';

const FechasEspeciales = () => {
    // Cargar datos del localStorage
    const loadFromLocalStorage = () => {
        const savedData = localStorage.getItem('fechasEspeciales');

        return savedData ? JSON.parse(savedData) : [
            { label: 'Asamblea de Circuito', date: '' },
            { label: 'Asamblea de Circuito 2', date: '' },
            { label: 'Asamblea Regional', date: '' },
            { label: 'Visita del superintendente', date: '' },
            { label: 'Conmemoración', date: '' },
        ];
    };

    const [fechas, setFechas] = useState(loadFromLocalStorage);
    const [newDateLabel, setNewDateLabel] = useState('');

    // Guardar datos en localStorage cada vez que el estado cambia
    useEffect(() => {
        localStorage.setItem('fechasEspeciales', JSON.stringify(fechas));
    }, [fechas]);

    // Maneja el cambio en los inputs de fecha
    const handleDateChange = (index, newDate) => {
        const updatedFechas = [...fechas];
        updatedFechas[index].date = newDate;
        setFechas(updatedFechas);
    };

    // Maneja el cambio en los inputs del modal
    const handleModalLabelChange = (e) => {
        setNewDateLabel(e.target.value);
    };

    // Agregar nueva fecha
    const handleAddDate = () => {
        if (newDateLabel) {
            const updatedFechas = [...fechas, { label: newDateLabel, date: '' }];
            setFechas(updatedFechas);
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
        const updatedFechas = fechas.filter((_, i) => i !== index);
        setFechas(updatedFechas);
    };

    return (
        <div className="container">
            <h1 className='titulo'>Fechas especiales</h1>
            <div className="input-grid">
                {fechas.map((item, index) => (
                    <div key={index}>
                        <label>{item.label}</label>
                        <input
                            type="date"
                            value={item.date}
                            onChange={(e) => handleDateChange(index, e.target.value)}
                        />
                        <i
                            className="bi bi-trash"
                            onClick={() => handleDeleteDate(index)}
                            style={{ cursor: 'pointer', color: 'red', marginLeft: '10px' }}
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
