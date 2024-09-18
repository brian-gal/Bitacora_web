import { useState } from "react";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { Link } from 'react-router-dom';


const InicioSesion = () => {
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
                alert("Por favor, verifica tu correo electrónico antes de iniciar sesión.");
                // Opcional: Cerrar sesión o redirigir al usuario a una página de verificación
                await auth.signOut();
                return;
            }
            localStorage.clear();

        } catch (error) {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Error al iniciar sesión:", errorCode, errorMessage);
            alert("Error al iniciar sesión: " + errorMessage);
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