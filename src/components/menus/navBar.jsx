import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { DataContext } from '../../context/dateContext';

const NavBar = () => {
    const { fechaActual } = useContext(DataContext)

    return (
        <nav className="navbar">
            <NavLink
                to="/"
                className={({ isActive }) => isActive ? "nav-Link active" : "nav-Link"}
                onClick={fechaActual}
            >
                <i className="bi bi-pencil-square"></i>
                <p>Informe</p>
            </NavLink>
            <NavLink
                to="/fechas"
                className={({ isActive }) => isActive ? "nav-Link active" : "nav-Link"}
                onClick={fechaActual}
            >
                <i className="bi bi-calendar-heart"></i>
                <p>Fechas</p>
            </NavLink>
            <NavLink
                to="/enseñanzas"
                className={({ isActive }) => isActive ? "nav-Link active" : "nav-Link"}
                onClick={fechaActual}
            >
                <i className="bi bi-book"></i>
                <p>Enseñanzas</p>
            </NavLink>
            <NavLink
                to="/notas"
                className={({ isActive }) => isActive ? "nav-Link active" : "nav-Link"}
                onClick={fechaActual}
            >
                <i className="bi bi-journal-bookmark-fill"></i>
                <p>Notas</p>
            </NavLink>
        </nav>
    );
};

export default NavBar;
