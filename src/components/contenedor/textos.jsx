import { useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const Textos = () => {
    const MySwal = withReactContent(Swal);

    // Estado para manejar la lista de textos
    const [textos, setTextos] = useState([]);

    // Tipos de textos disponibles
    const tipoTextos = ['Estudio Personal', 'Predicacion', 'Profesional'];

    // Función para abrir el modal y agregar un nuevo texto
    const abrirModalAgregarTexto = () => {
        MySwal.fire({
            title: 'Agregar nuevo texto',
            html: `
                <input id="nuevo-texto" class="swal2-input" placeholder="Nuevo texto" />
                <input id="explicacion-texto" class="swal2-input" placeholder="Explicación" />
                <select id="tipo-texto" class="swal2-select">
                    ${tipoTextos
                    .map((tipo) => `<option value="${tipo}">${tipo}</option>`)
                    .join('')}
                </select>
            `,
            showCancelButton: true,
            confirmButtonText: 'Agregar',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const texto = document.getElementById('nuevo-texto').value;
                const explicacion = document.getElementById('explicacion-texto').value;
                const tipo = document.getElementById('tipo-texto').value;

                if (!texto || !explicacion || !tipo) {
                    Swal.showValidationMessage('Por favor, completa todos los campos');
                    return false;
                }

                return { texto, explicacion, tipo };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const { texto, explicacion, tipo } = result.value;
                const nuevoTexto = { texto, explicacion, tipo };
                setTextos((prevTextos) => [...prevTextos, nuevoTexto]);
                Swal.fire('¡Texto agregado!', '', 'success');
            }
        });
    };

    // Función para mostrar los textos agrupados por tipo
    const renderTextosPorTipo = () => {
        return tipoTextos.map((tipoTexto) => (
            <div key={tipoTexto} className="texto-grupo">
                <h3 className="texto-tipo">{tipoTexto}</h3>
                <ul className="texto-lista">
                    {textos
                        .filter((t) => t.tipo === tipoTexto)
                        .map((t, index) => (
                            <li key={index} className="texto-item">
                                <strong className="texto-nombre">{t.texto}:</strong> {t.explicacion}
                            </li>
                        ))}
                </ul>
            </div>
        ));
    };

    return (
        <div className="texto-contenedor">
            <h1 className="titulo">Lista de Textos</h1>

            <button className="texto-boton" onClick={abrirModalAgregarTexto}>
                Agregar nuevo texto
            </button>

            <h2 className="texto-lista-titulo">Textos por Tipo</h2>
            {renderTextosPorTipo()}
        </div>
    );
};

export default Textos;
