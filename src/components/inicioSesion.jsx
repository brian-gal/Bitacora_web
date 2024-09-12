import { getDocs, collection, query, where, setDoc, doc } from "firebase/firestore";
import { db } from "../services/firebaseConfig.js";
import { useContext, useState } from "react"; // Necesario para manejar el estado del formulario
import { useEffect } from "react";
import { FireContext } from "../context/fireContext.jsx";



const InicioSesion = () => {
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loginEmail, setLoginEmail] = useState(""); // Para el inicio de sesión
    const [loginPassword, setLoginPassword] = useState(""); // Para el inicio de sesión
    const { sesionIniciada } = useContext(FireContext);

    useEffect(() => {

        if (!sesionIniciada) {
            const loginModal = new window.bootstrap.Modal(document.getElementById("loginModal"));
            loginModal.show();
        }

    }, [sesionIniciada]);

    // Función para manejar la creación de cuenta
    const handleCreateAccount = async () => {
        if (registerPassword !== confirmPassword) {
            alert("Las contraseñas no coinciden");
            return;
        }

        try {
            // Verificar si el correo ya está registrado
            const q = query(collection(db, "users"), where("email", "==", registerEmail));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // Si el correo ya existe, mostramos un mensaje
                alert("El correo ya está registrado. Por favor, utiliza otro.");
                return;
            }

            // Si el correo no existe, procede a crear la cuenta
            await setDoc(doc(db, "users", registerEmail), {
                email: registerEmail,
                password: registerPassword
            });
            alert("Cuenta creada exitosamente, inicie sesion");

            // Simular el clic en el botón "Iniciar Sesión" del modal de registro
            const loginModalButton = document.querySelector("#registerModal .btn-secondary");
            if (loginModalButton) {
                loginModalButton.click();
            }

        } catch (error) {
            console.error("Error al crear la cuenta: ", error);
        }
    };

    // Función para manejar el inicio de sesión
    const handleLogin = async () => {
        try {
            // Consultar Firestore para buscar el usuario con el correo ingresado
            const q = query(collection(db, "users"), where("email", "==", loginEmail));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                alert("Usuario no encontrado");
                return;
            }

            // Verificar si la contraseña ingresada coincide
            let loginSuccessful = false;
            querySnapshot.forEach((doc) => {
                const userData = doc.data();
                if (userData.password === loginPassword) {
                    alert("Inicio de sesión exitoso");

                    // Guardar la sesión iniciada en localStorage
                    localStorage.setItem("sesion_iniciada", loginEmail);

                    // Indicar que el inicio de sesión fue exitoso
                    loginSuccessful = true;
                } else {
                    alert("Contraseña incorrecta");
                }
            });

            // Cerrar el modal solo si el inicio de sesión fue exitoso
            if (loginSuccessful) {
                const loginModalElement = document.getElementById("loginModal");
                const loginModal = window.bootstrap.Modal.getInstance(loginModalElement);
                if (loginModal) {
                    loginModal.hide();
                }
            }
        } catch (error) {
            console.error("Error al iniciar sesión: ", error);
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
                                    <label htmlFor="confirmPasswordInput" className="form-label">Confirm Password</label>
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
                                data-bs-target="#loginModal"
                            >
                                Iniciar Sesion
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleCreateAccount} // Llama a la función al hacer clic
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
