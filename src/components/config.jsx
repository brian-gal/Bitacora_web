import { getAuth, signOut } from "firebase/auth";


const Config = () => {

    function cerrarSesion() {

        const auth = getAuth();
        signOut(auth).then(() => {
            localStorage.clear();
        }).catch((error) => {
            console.log(error);
        });
    }

    return (
        <button onClick={cerrarSesion}>Cerrar Sesion</button>
    )
}

export default Config