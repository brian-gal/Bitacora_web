import { useEffect, useState } from "react";
import { getAuth, updateProfile, updateEmail, updatePassword } from "firebase/auth";
import Swal from "sweetalert2";

const EditarUsuario = () => {
    const auth = getAuth();
    const user = auth.currentUser;

    const [newName, setNewName] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [modalType, setModalType] = useState("");

    // Estado para el nombre y correo actual del usuario
    const [currentName, setCurrentName] = useState("Cargando...");
    const [currentEmail, setCurrentEmail] = useState("Cargando...");

    useEffect(() => {
        if (user) {
            setCurrentName(user.displayName || "");
            setCurrentEmail(user.email || "");
        }
    }, [user]);

    const handleChangeName = async () => {
        if (!newName) {
            Swal.fire("El nombre no puede estar vacío", "", "error");
            return;
        }
        try {
            await updateProfile(user, { displayName: newName });
            setCurrentName(newName); // Actualiza el nombre en el estado
            Swal.fire("Nombre actualizado exitosamente");
            const modal = window.bootstrap.Modal.getInstance(document.getElementById('editarModal'));
            modal.hide(); // Cierra el modal
        } catch (error) {
            Swal.fire("Error al actualizar el nombre", error.message, "error");
        }
    };

    const handleChangeEmail = async () => {
        if (!newEmail) {
            Swal.fire("El correo no puede estar vacío", "", "error");
            return;
        }
        try {
            await updateEmail(user, newEmail);
            setCurrentEmail(newEmail); // Actualiza el correo en el estado
            Swal.fire("Correo actualizado exitosamente");
            const modal = window.bootstrap.Modal.getInstance(document.getElementById('editarModal'));
            modal.hide(); // Cierra el modal
        } catch (error) {
            let message;

            // Manejo de errores específicos
            switch (error.code) {
                case "auth/invalid-email":
                    message = "El correo electrónico proporcionado es inválido.";
                    break;
                case "auth/email-already-in-use":
                    message = "Este correo electrónico ya está en uso por otra cuenta.";
                    break;
                case "auth/requires-recent-login":
                    message = "Debes volver a iniciar sesión para poder actualizar tu correo.";
                    break;
                case "auth/operation-not-allowed":
                    message = "Por favor, verifica tu correo electrónico para realizar esta operación.";
                    break;
                default:
                    message = "Error al actualizar el correo: " + error;
                    break;
            }

            // Mostrar mensaje informativo en lugar de un error crítico
            Swal.fire("Información", message, "info");
        }
    };

    const handleChangePassword = async () => {
        if (!newPassword || !confirmPassword) {
            Swal.fire("Los campos de contraseña no pueden estar vacíos", "", "error");
            return;
        }
        if (newPassword !== confirmPassword) {
            Swal.fire("Las contraseñas no coinciden", "", "error");
            return;
        }
        try {
            await updatePassword(user, newPassword);
            Swal.fire("Contraseña actualizada exitosamente");
            const modal = window.bootstrap.Modal.getInstance(document.getElementById('editarModal'));
            modal.hide(); // Cierra el modal
        } catch (error) {
            const errorCode = error.code;
            let message;

            // Manejo de errores específicos
            switch (errorCode) {
                case "auth/requires-recent-login":
                    message = "Debes volver a iniciar sesión para poder cambiar la contraseña.";
                    break;
                case "auth/weak-password":
                    message = "La nueva contraseña es demasiado débil. Usa una combinación más fuerte.";
                    break;
                case "auth/operation-not-allowed":
                    message = "La operación no está permitida. Contacta al soporte.";
                    break;
                case "auth/invalid-user-token":
                    message = "Tu sesión ha caducado. Inicia sesión nuevamente.";
                    break;
                case "auth/network-request-failed":
                    message = "Problemas de conexión. Verifica tu conexión a Internet.";
                    break;
                default:
                    message = "Error al actualizar la contraseña. Por favor intenta nuevamente.";
                    break;
            }

            // Mostrar el mensaje informativo al usuario
            Swal.fire("Información", message, "info");
        }
    };

    const handleOpenModal = (type) => {
        setModalType(type);
        const modal = new window.bootstrap.Modal(document.getElementById('editarModal'));
        modal.show();
    };

    const handleSave = () => {
        if (modalType === "name") {
            handleChangeName();
        } else if (modalType === "email") {
            handleChangeEmail();
        } else if (modalType === "password") {
            handleChangePassword();
        }
    };

    return (
        <>
            {/* Contenedor con marco para la configuración */}
            <div className="editar-usuario-card">
                <p className="editar-usuario-title">Configuración de Usuario</p>

                <div className="editar-usuario-row">
                    <div className="editar-usuario-label-group">
                        <label htmlFor="name" className="editar-usuario-label">Nombre:</label>
                        <input type="text" id="name" className="editar-usuario-input" value={currentName} disabled />
                    </div>
                    <i className="bi bi-pencil editar-usuario-icon" onClick={() => handleOpenModal("name")} title="Editar Nombre"></i>
                </div>

                <div className="editar-usuario-row">
                    <div className="editar-usuario-label-group">
                        <label htmlFor="email" className="editar-usuario-label">Correo Electrónico:</label>
                        <input type="email" id="email" className="editar-usuario-input" value={currentEmail} disabled />
                    </div>
                    <i className="bi bi-pencil editar-usuario-icon" onClick={() => handleOpenModal("email")} title="Editar Correo"></i>
                </div>

                <div className="editar-usuario-row">
                    <div className="editar-usuario-label-group">
                        <label htmlFor="password" className="editar-usuario-label">Contraseña:</label>
                        <input type="password" id="password" className="editar-usuario-input" value="********" disabled />
                    </div>
                    <i className="bi bi-pencil editar-usuario-icon" onClick={() => handleOpenModal("password")} title="Cambiar Contraseña"></i>
                </div>
            </div>

            {/* Modal para editar nombre, correo o contraseña */}
            <div className="modal fade" id="editarModal" tabIndex="-1" aria-labelledby="editarModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="editarModalLabel">Editar {modalType === "name" ? "Nombre" : modalType === "email" ? "Correo" : "Contraseña"}</h5>
                        </div>
                        <div className="modal-body">
                            {modalType === "name" && (
                                <div>
                                    <label htmlFor="newName">Nuevo Nombre</label>
                                    <input type="text" id="newName" className="form-control" value={newName} onChange={(e) => setNewName(e.target.value)} />
                                </div>
                            )}
                            {modalType === "email" && (
                                <div>
                                    <label htmlFor="newEmail">Nuevo Correo Electrónico</label>
                                    <input type="email" id="newEmail" className="form-control" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                                </div>
                            )}
                            {modalType === "password" && (
                                <div>
                                    <label htmlFor="newPassword">Nueva Contraseña</label>
                                    <input type="password" id="newPassword" className="form-control" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                                    <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                                    <input type="password" id="confirmPassword" className="form-control" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                            <button type="button" className="btn btn-primary" onClick={handleSave}>Guardar Cambios</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EditarUsuario;
