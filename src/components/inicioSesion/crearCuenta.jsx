import { useState } from "react";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { Link } from 'react-router-dom';
import Swal from "sweetalert2";

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
            Swal.fire("Cuenta creada exitosamente. Verifica tu correo para confirmar la cuenta.");
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
                    <div className="terminos-modal">
                        <p > Al crear una cuenta, aceptas los </p>
                        <a href="#" data-bs-toggle="modal" data-bs-target="#staticBackdrop">
                            términos y condiciones.
                        </a>
                    </div>

                    <div className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h1 className="modal-title fs-5" id="staticBackdropLabel">Términos y Condiciones</h1>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div className="modal-body">
                                    <p>A continuación se presentan los términos y condiciones de uso de nuestra aplicación:</p>
                                    <p>1. Aceptación de los términos: Al crear una cuenta, aceptas estos términos y condiciones en su totalidad. Si no estás de acuerdo con alguno de los términos, no deberías utilizar la aplicación.</p>
                                    <p>2. Uso de la aplicación: Eres responsable de mantener la confidencialidad de tu información de inicio de sesión y de todas las actividades que ocurran bajo tu cuenta. No compartas tus datos con nadie, incluyendo a terceros.</p>
                                    <p>3. Limitación de responsabilidad: No nos hacemos responsables por la pérdida de datos o cualquier daño en los mismos que pueda surgir.</p>
                                    <p>4. Robos de datos: Aunque hemos implementado medidas de seguridad para proteger tus datos, no nos hacemos responsables de cualquier robo de datos.</p>
                                    <p>5. Confidencialidad de los datos: Todos los datos proporcionados son confidenciales y no se compartirán con terceros sin tu consentimiento.</p>
                                    <p>6. Eliminación de datos: Tienes derecho a solicitar la eliminación de todos tus datos de nuestra base en cualquier momento. Puedes hacerlo a través del soporte de la aplicación.</p>
                                    <p>7. Modificaciones: Nos reservamos el derecho de modificar estos términos y condiciones en cualquier momento. Te notificaremos sobre los cambios a través de la aplicación.</p>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                                </div>
                            </div>
                        </div>
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
