import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import NavBar from './components/navBar';
import { DataProvider } from './context/dateContext';
import Informe from './components/informe';
import Notas from './components/notas';
import { FireProvider } from './context/fireContext';
import Enseñanzas from './components/enseñanzas';
import FechasEspeciales from './components/fechasEspeciales';
import MenuFecha from './components/menuFecha';
import BotonScroll from './components/botonScroll';
import Config from './components/config';
import InicioSesion from './components/inicioSesion';
import CrearCuenta from './components/crearCuenta';
import PrivateRoute from './components/privateRoute';

function App() {
    return (
        <BrowserRouter>
            <DataProvider>
                <FireProvider>
                    <MenuFecha />
                    <div className='contenedor' id='contenedorTotal'>
                        <Routes>
                            <Route path="/iniciarSesion" element={<InicioSesion />} />
                            <Route path="/crearCuenta" element={<CrearCuenta />} />
                            <Route path="/" element={<PrivateRoute element={<Informe titulo="Informe" />} />} />
                            <Route path="/enseñanzas" element={<PrivateRoute element={<Enseñanzas />} />} />
                            <Route path="/fechas" element={<PrivateRoute element={<FechasEspeciales />} />} />
                            <Route path="/notas" element={<PrivateRoute element={<Notas titulo="Notas" texto="Escribe tus notas aquí..." clases="textarea-notas" esMensual={false} />} />} />
                            <Route path="/config" element={<PrivateRoute element={<Config />} />} />
                        </Routes>
                        <BotonScroll />
                    </div>
                    <NavBar />
                </FireProvider>
            </DataProvider>
        </BrowserRouter>
    );
}

export default App;
