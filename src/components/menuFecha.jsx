import { useContext } from "react"
import { DataContext } from "../context/dateContext"
import { NavLink } from 'react-router-dom';


const MenuFecha = () => {
    const { fechaActual, meses, dia, mes, año, retrocederMes, avanzarMes, currentLocation } = useContext(DataContext)
    const date = new Date();
    // Asegurarse de que los índices estén dentro del rango válido
    const mesPrevio = mes > 0 ? meses[mes - 1] : meses[11]; // Mes anterior (Diciembre si es Enero)
    const mesSiguiente = mes < 11 ? meses[mes + 1] : meses[0]; // Mes siguiente (Enero si es Diciembre)

    const desactivarBoton = currentLocation === "/notas" || currentLocation === "/fechas" || currentLocation === "/iniciarSesion" || currentLocation === "/crearCuenta";

    return (
        <div className="menuFecha">
            <div className="menuFechaMes">
                <button onClick={retrocederMes} disabled={ desactivarBoton }>{mesPrevio}</button>
                <div onClick={fechaActual}>
                    <h2>{dia} {meses[mes]}</h2>
                    <h3>{año}</h3>
                </div>
                <button onClick={avanzarMes} disabled={ desactivarBoton || (mes == date.getMonth() && año == date.getFullYear())}>{mesSiguiente}</button>
            </div>
            <NavLink className="menuFecha-icon" to="/config"><i className="bi bi-list"></i></NavLink>
        </div>
    )
}

export default MenuFecha