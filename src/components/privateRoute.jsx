import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { FireContext } from '../context/fireContext';

const PrivateRoute = ({ element: Component, ...rest }) => {
    const { loading } = useContext(FireContext);

    return loading ? Component : <Navigate to="/iniciarSesion" />;
};

export default PrivateRoute;
