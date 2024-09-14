import { useContext } from "react"
import { DataContext } from "../context/dateContext"
import { useLocation } from "react-router-dom";
import BotonScroll from "./botonScroll";

const MenuFecha = () => {
    const { fechaActual, meses, dia, mes, año, retrocederMes, avanzarMes } = useContext(DataContext)
    const location = useLocation();
    const date = new Date();
    // Asegurarse de que los índices estén dentro del rango válido
    const mesPrevio = mes > 0 ? meses[mes - 1] : meses[11]; // Mes anterior (Diciembre si es Enero)
    const mesSiguiente = mes < 11 ? meses[mes + 1] : meses[0]; // Mes siguiente (Enero si es Diciembre)

    return (
        <div className="menuFecha">
            <div className="menuFechaMes">
                <button onClick={retrocederMes} disabled={location.pathname === "/notas" || location.pathname === "/fechas"}>{mesPrevio}</button>
                <div onClick={fechaActual}>
                    <h2>{dia} {meses[mes]}</h2>
                    <h3>{año}</h3>
                </div>
                <button onClick={avanzarMes} disabled={location.pathname === "/notas" || location.pathname === "/fechas" || (mes == date.getMonth() && año == date.getFullYear())}>{mesSiguiente}</button>
            </div>
            <i className="bi bi-three-dots-vertical"></i>
          <BotonScroll />

        </div>
    )
}

export default MenuFecha