import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { FireContext } from '../context/fireContext';

const PrivateRoute = ({ element: Component, ...rest }) => {
    const { uid, loading } = useContext(FireContext);

    if (loading) {
        return (
        <div className="d-flex justify-content-center">
            <div className="spinner-border" style={{ width: '3rem', height: '3rem' }} role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>); // Muestra una pantalla de carga mientras se verifica el estado de autenticación
    }

    return uid ? Component : <Navigate to="/iniciarSesion" />;
};

export default PrivateRoute;
