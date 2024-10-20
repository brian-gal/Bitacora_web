import { useContext } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { FireContext } from '../../context/fireContext';

// eslint-disable-next-line react/prop-types
const PrivateRoute = ({ element: Component }) => {
    const { logueado } = useContext(FireContext);
    const navigate = useNavigate();

    //si no estoy logueado retorna la pagina de inciar sesion
    if (!logueado) {
        return <Navigate to="/iniciarSesion" />
    }

    //si estoy logueado y ya cargo entonces retorno el componente
    if (logueado) {
        navigate('/');
        return Component
    }
}

export default PrivateRoute;
