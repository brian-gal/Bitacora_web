import { useContext, useEffect, useState } from "react"
import { DataContext } from "../../context/dateContext"
import { NavLink } from 'react-router-dom';
import ProgressBar from "../utilidades/progressBar";
import { FireContext } from "../../context/fireContext";
import Swal from "sweetalert2";


const MenuFecha = () => {
    const { fechaActual, meses, dia, mes, año, retrocederMes, avanzarMes, currentLocation } = useContext(DataContext)
    const { subirUltimasActualizaciones, uidd, desactivarIcono, permitirGuardar, cerrarSesion } = useContext(FireContext)

    const date = new Date();
    // Asegurarse de que los índices estén dentro del rango válido
    const mesPrevio = mes > 0 ? meses[mes - 1] : meses[11]; // Mes anterior (Diciembre si es Enero)
    const mesSiguiente = mes < 11 ? meses[mes + 1] : meses[0]; // Mes siguiente (Enero si es Diciembre)

    const desactivarBoton = currentLocation === "/notas" || currentLocation === "/fechas" || currentLocation === "/config" || currentLocation === "/iniciarSesion" || currentLocation === "/crearCuenta";

    const handleIconClick = () => {
        const icon = document.getElementById("IconoGuardar");
        if (icon.classList.contains("bi-arrow-repeat") && !icon.classList.contains("rotate")) {
            subirUltimasActualizaciones(uidd, permitirGuardar); // Ejecutar si la clase es bi-arrow-repeat
        } else if (icon.classList.contains("bi-exclamation-triangle-fill")) {
            Swal.fire({
                title: "Hubo un error al verificar la sesión",
                text: "No se pudo comprobar si estás en la última sesión. La comprobación se reintentará cada minuto. Los datos no se guardarán en la nube hasta que se valide la sesión. Si continúas, podrías perder datos si la sesión es antigua.",
                icon: "warning",
                showCancelButton: true,
                allowOutsideClick: false,
                confirmButtonText: "Continuar",
                cancelButtonText: "Cerrar sesión"
            }).then((result) => {
                if (!result.isConfirmed) {
                    cerrarSesion()
                }
            });
        } else {
            Swal.fire({
                title: "¡Datos guardados!",
                icon: "success"
            });
        }
    };


    return (
        <div className="containerMenuFecha">
            <div className="menuFecha">
                <button className="icon-sincronizar bi bi-arrow-repeat rotate" id="IconoGuardar" onClick={handleIconClick} disabled={desactivarIcono}></button>
                <div className="menuFechaMes">
                    <button onClick={retrocederMes} disabled={desactivarBoton}>{mesPrevio}</button>
                    <div onClick={fechaActual}>
                        <h2>{dia} {meses[mes]}</h2>
                        <h3>{año}</h3>
                    </div>
                    <button onClick={avanzarMes} disabled={desactivarBoton || (mes == date.getMonth() && año == date.getFullYear())}>{mesSiguiente}</button>
                </div>
                <NavLink className={({ isActive }) => isActive ? "menuFecha-icon nav-Link active" : "menuFecha-icon nav-Link"} to="/config"><i className="bi bi-list"></i></NavLink>
            </div>
            <ProgressBar />
        </div>
    )
}

export default MenuFecha