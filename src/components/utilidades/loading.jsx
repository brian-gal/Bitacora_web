import { useEffect } from 'react';
import Swal from 'sweetalert2';
import { useContext } from 'react';
import { FireContext } from '../../context/fireContext';
import { DataContext } from '../../context/dateContext';

const LoadingModal = () => {
    const { loading, logueado } = useContext(FireContext);
    const { currentLocation } = useContext(DataContext)
    const desactivarBoton = currentLocation === "/iniciarSesion" || currentLocation === "/crearCuenta";

    useEffect(() => {
        let timeoutId;

        if (loading && !desactivarBoton) {
            // Mostrar el modal inicial de "Cargando..."
            Swal.fire({
                title: 'Cargando...',
                html: `
                    <div class="d-flex justify-content-center">
                        <div class="spinner-border" style="width: 2rem; height: 2rem;" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </div>
                `,
                allowOutsideClick: false,
                showConfirmButton: false,
                willClose: () => {
                    // Acciones al cerrar el modal si es necesario
                    clearTimeout(timeoutId); // Limpiar el temporizador cuando el modal se cierra
                }
            });

            // Cambiar el contenido del modal después de 10 segundos
            timeoutId = setTimeout(() => {
                Swal.update({
                    title: 'Verifica tu conexión Wi-Fi',
                    html: `
            <p>La carga está tardando más de lo habitual.</p>
            <p>Por favor, verifica tu conexión Wi-Fi y vuelve a intentarlo.</p>
        `,
                    showConfirmButton: true,
                    confirmButtonText: 'Reintentar',
                    allowOutsideClick: false,
                    confirmButtonColor: '#3085d6',
                    preConfirm: () => {
                        // Recargar la página al hacer clic en "Reintentar"
                        location.reload();
                    },
                    willClose: () => {
                        // Limpiar el temporizador al cerrar el modal
                        clearTimeout(timeoutId);
                    }
                });
            }, 10000); // Cambiar después de 10 segundos
        } else {
            // Cerrar el modal cuando `loading` es false
            Swal.close();
        }

        // Limpiar el temporizador si el componente se desmonta
        return () => clearTimeout(timeoutId);
    }, [loading]);

    return null; // No necesita renderizar nada en el DOM
};

export default LoadingModal;
