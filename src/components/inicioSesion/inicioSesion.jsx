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

            if (!user.emailVerified) {
                Swal.fire("Por favor, verifica tu correo electrónico antes de iniciar sesión.");
                // Opcional: Cerrar sesión o redirigir al usuario a una página de verificación
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
                title: "Bienvenido a la beta de la aplicación"
            });

        } catch (error) {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Error al iniciar sesión:", errorCode, errorMessage);
            Swal.fire("correo o clave incorrecto, si no tienes una cuenta create una");
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
