import { NavLink } from 'react-router-dom';

const NavBar = () => {
    return (
        <nav className="navbar">
            <NavLink to="/" className="nav-Link">
                <i className="bi bi-pencil-square"></i>
                <p>Informe</p>
            </NavLink>
            <NavLink to="/fechas" className="nav-Link">
                <i className="bi bi-calendar-heart-fill"></i>
                <p>Fechas</p>
            </NavLink>
            <NavLink to="/enseñanzas" className="nav-Link" >
                <i className="bi bi-book"></i>
                <p>Enseñanzas</p>
            </NavLink>
            <NavLink to="/notas" className="nav-Link">
                <i className="bi bi-journal-bookmark-fill"></i>
                <p>Notas</p>
            </NavLink>
        </nav>
    );
};

export default NavBar;