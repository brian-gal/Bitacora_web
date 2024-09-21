import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { FireContext } from '../../context/fireContext';

// eslint-disable-next-line react/prop-types
const PrivateRoute = ({ element: Component }) => {
    const { loading, logueado } = useContext(FireContext);

    //si no estoy logueado retorna la pagina de inciar sesion
    if (!logueado) {
        return <Navigate to="/iniciarSesion" />
    }

    //si estoy logueado y ya cargo entonces retorno el componente
    if (logueado) {
        return Component
    }

    // si no cargo y estoy logueado carga pestaña de carga
    if (loading === false || logueado === true) {
        return (
            <div className="d-flex justify-content-center">
                <div className="spinner-border" style={{ width: '3rem', height: '3rem' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>);
    }
}

export default PrivateRoute;
