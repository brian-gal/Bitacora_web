import { useContext, useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { Link } from 'react-router-dom';
import { FireContext } from "../../context/fireContext";
import Swal from 'sweetalert2'
import { useNavigate } from "react-router-dom";

const InicioSesion = () => {
    const { setLogueado } = useContext(FireContext);
    const navigate = useNavigate();
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    //iniciar sesion
    const handleLogin = async () => {
        const auth = getAuth();
        const email = loginEmail;
        const password = loginPassword;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const userName = user.displayName || "usuario";

            if (!user.emailVerified) {
                Swal.fire("Por favor, verifica tu correo electrónico antes de iniciar sesión.");
                await auth.signOut();
                return;
            }
            setLogueado(true)
            navigate('/');
            const Toast = Swal.mixin({
                toast: true,
                position: "center",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.onmouseenter = Swal.stopTimer;
                    toast.onmouseleave = Swal.resumeTimer;
                }
            });
            Toast.fire({
                icon: "success",
                title: `Bienvenido, ${userName}, a la beta de la aplicación`
            });

        } catch (error) {
            const errorCode = error.code;
            let message;

            // Manejo de errores específicos
            switch (errorCode) {
                case "auth/invalid-email":
                    message = "El formato del correo electrónico es inválido.";
                    break;
                case "auth/user-disabled":
                    message = "La cuenta ha sido deshabilitada. Contacta al soporte.";
                    break;
                case "auth/user-not-found":
                    message = "No se encontró ninguna cuenta asociada con este correo electrónico.";
                    break;
                case "auth/wrong-password":
                    message = "La contraseña es incorrecta. Verifica e intenta nuevamente.";
                    break;
                case "auth/too-many-requests":
                    message = "Demasiadas solicitudes. Intenta nuevamente más tarde.";
                    break;
                case "auth/network-request-failed":
                    message = "Problemas de conexión. Verifica tu conexión a Internet.";
                    break;
                case "auth/requires-recent-login":
                    message = "Necesitas volver a iniciar sesión para realizar esta acción.";
                    break;
                default:
                    message = "Error al iniciar sesión. Por favor verifica tu correo o contraseña: " + error;
                    break;
            }

            // Mostrar el mensaje informativo al usuario
            Swal.fire("Error de Inicio de Sesión", message, "error");
        }
    };


    return (
        <>
            <div className="crear-cuenta-container">
                <h2 className="crear-cuenta-titulo">Iniciar Sesión</h2>
                <form className="form-crear-cuenta" onSubmit={(e) => e.preventDefault()}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="loginEmail">Correo Electrónico</label>
                        <input
                            type="email"
                            id="loginEmail"
                            className="form-input"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="loginPassword">Contraseña</label>
                        <input
                            type="password"
                            id="loginPassword"
                            className="form-input"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button className="btn btn-crear-cuenta" type="submit" onClick={handleLogin}>
                        Iniciar Sesión
                    </button>
                </form>
            </div>
            <p className="cuenta-info">¿No tienes una cuenta? <Link to="/crearCuenta" className="link-iniciar-sesion">Crea una aquí</Link>.</p>
        </>
    );

};

export default InicioSesion;
