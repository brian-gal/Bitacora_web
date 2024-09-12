import { useContext } from "react"
import { DataContext } from "../context/dateContext"

const MenuFecha = () => {
    const { fechaActual, meses, dia, mes, año, retrocederMes, avanzarMes, retrocederAño, avanzarAño } = useContext(DataContext)

    // Asegurarse de que los índices estén dentro del rango válido
    const mesPrevio = mes > 0 ? meses[mes - 1] : meses[11]; // Mes anterior (Diciembre si es Enero)
    const mesSiguiente = mes < 11 ? meses[mes + 1] : meses[0]; // Mes siguiente (Enero si es Diciembre)

    return (
        <div className="menuFecha">
            <div className="menuFechaAño">
                <i className="bi bi-arrow-left" onClick={retrocederAño}></i>
                <h1>{año}</h1>
                <i className="bi bi-arrow-right" onClick={avanzarAño}></i>
            </div>
            <div className="menuFechaMes">
                <button onClick={retrocederMes}>{mesPrevio}</button>
                <div onClick={fechaActual}>
                    <h2>{meses[mes]}</h2>
                    <h3>{dia}</h3>
                </div>
                <button onClick={avanzarMes}>{mesSiguiente}</button>
            </div>
        </div>
    )
}

export default MenuFecha