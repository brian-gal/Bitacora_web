import './App.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { DataProvider } from './context/dateContext';
import { FireProvider } from './context/fireContext';

import MenuFecha from './components/menus/menuFecha';
import NavBar from './components/menus/navBar';

import Config from './components/contenedor/config';
import FechasEspeciales from './components/contenedor/fechasEspeciales';
import Enseñanzas from './components/contenedor/enseñanzas';
import Notas from './components/contenedor/notas';
import Informe from './components/contenedor/informe';

import InicioSesion from './components/inicioSesion/inicioSesion';
import CrearCuenta from './components/inicioSesion/crearCuenta';
import PrivateRoute from './components/inicioSesion/privateRoute';

import BotonScroll from './components/utilidades/botonScroll';

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
