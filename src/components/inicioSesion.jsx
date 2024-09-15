import { useState } from "react";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";

const InicioSesion = () => {
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerEmailConfirm, setRegisterEmailConfirm] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");



    //Crear cuenta
    const handleCreateAccount = async () => {
        if (registerEmail !== registerEmailConfirm) {
            alert("Los correos electrónicos no coinciden");
            return;
        }

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

            // Cerrar el modal después de iniciar sesión
            const loginModalElement = document.getElementById("loginModal");
            const loginModal = window.bootstrap.Modal.getInstance(loginModalElement);
            if (loginModal) {
                loginModal.hide();
            }
        } catch (error) {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Error al iniciar sesión:", errorCode, errorMessage);
            alert("Error al iniciar sesión: " + errorMessage);
        }
    };


    return (
        <div>
            {/* Login Modal */}
            <div
                className="modal fade"
                id="loginModal"
                data-bs-backdrop="static"
                data-bs-keyboard="false"
                tabIndex="-1"
                aria-labelledby="loginModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="loginModalLabel">Inicia sesión</h1>
                        </div>
                        <div className="modal-body">
                            <form>
                                <div className="mb-3">
                                    <label htmlFor="loginEmailInput" className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="loginEmailInput"
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)} // Captura el correo
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="loginPasswordInput" className="form-label">Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="loginPasswordInput"
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)} // Captura la contraseña
                                    />
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                data-bs-dismiss="modal"
                                data-bs-toggle="modal"
                                data-bs-target="#registerModal"
                            >
                                Crear Cuenta
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleLogin} // Llama a la función para iniciar sesión
                            >
                                Iniciar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Register Modal */}
            <div
                className="modal fade"
                id="registerModal"
                data-bs-backdrop="static"
                data-bs-keyboard="false"
                tabIndex="-1"
                aria-labelledby="registerModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="registerModalLabel">Crear Cuenta</h1>
                        </div>
                        <div className="modal-body">
                            <form>
                                <div className="mb-3">
                                    <label htmlFor="registerEmailInput" className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="registerEmailInput"
                                        value={registerEmail}
                                        onChange={(e) => setRegisterEmail(e.target.value)} // Captura el correo
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="registerEmailConfirmInput" className="form-label">Confirmar Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="registerEmailConfirmInput"
                                        value={registerEmailConfirm}
                                        onChange={(e) => setRegisterEmailConfirm(e.target.value)} // Captura la confirmación del correo
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="registerPasswordInput" className="form-label">Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="registerPasswordInput"
                                        value={registerPassword}
                                        onChange={(e) => setRegisterPassword(e.target.value)} // Captura la contraseña
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="confirmPasswordInput" className="form-label">Confirmar Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="confirmPasswordInput"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)} // Captura la confirmación de la contraseña
                                    />
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                data-bs-toggle="modal"
                                data-bs-target="#loginModal" // Redirige al modal de inicio de sesión
                            >
                                Iniciar sesión
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleCreateAccount} // Llama a la función para crear la cuenta
                            >
                                Crear Cuenta
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InicioSesion;
