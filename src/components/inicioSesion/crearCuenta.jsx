import { useState } from "react";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { Link } from 'react-router-dom';


const CrearCuenta = () => {
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    //Crear cuenta
    const handleCreateAccount = async () => {

        if (registerPassword !== confirmPassword) {
            alert("Las contraseñas no coinciden");
            return;
        }

        // Verificar que la contraseña tenga al menos 6 caracteres
        if (registerPassword.length < 6) {
            alert("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        const email = registerEmail;
        const password = registerPassword;

        const auth = getAuth();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            // Enviar correo de verificación
            await sendEmailVerification(user);

            // Mostrar mensaje al usuario
            alert("Cuenta creada exitosamente. Verifica tu correo para confirmar la cuenta.");
        } catch (error) {
            const errorCode = error.code;
            const errorMessage = error.message;
            // Maneja los errores de autenticación aquí
            console.error("Error al crear la cuenta:", errorCode, errorMessage);
            alert("Error al crear la cuenta: " + errorMessage);
        }
    };

    return (
        <>
            <div className="crear-cuenta-container">
                <h2 className="crear-cuenta-titulo">Crear Cuenta</h2>
                <form className="form-crear-cuenta" onSubmit={(e) => e.preventDefault()}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="registerEmail">Correo Electrónico</label>
                        <input
                            type="email"
                            id="registerEmail"
                            className="form-input"
                            value={registerEmail}
                            onChange={(e) => setRegisterEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="registerPassword">Contraseña</label>
                        <input
                            type="password"
                            id="registerPassword"
                            className="form-input"
                            value={registerPassword}
                            onChange={(e) => setRegisterPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="confirmPassword">Confirmar Contraseña</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className="form-input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button className="btn btn-crear-cuenta" type="submit" onClick={handleCreateAccount}>
                        Crear Cuenta
                    </button>
                </form>
            </div>
            <p className="cuenta-info">Si ya tienes una cuenta, <Link className="link-iniciar-sesion" to="/iniciarSesion">inicia sesión aquí</Link>.</p>
        </>
    );

};

export default CrearCuenta;
