import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css'
import NavBar from './components/navBar';
import { DataProvider } from './context/dateContext';
import Informe from './components/informe';
import InicioSesion from './components/inicioSesion';
import Notas from './components/notas';
import { FireProvider } from './context/fireContext';
import Enseñanzas from './components/enseñanzas';
import FechasEspeciales from './components/fechasEspeciales';
import MenuFecha from './components/menuFecha';
import BotonScroll from './components/botonScroll';
import Config from './components/config';

function App() {

  return (
    <BrowserRouter>
      <FireProvider>
        <DataProvider>
          <InicioSesion />
          <MenuFecha />
          <div className='contenedor' id='contenedorTotal'>
            <Routes>
              <Route path="/" element={<Informe titulo="Informe" />} />
              <Route path="/enseñanzas" element={<Enseñanzas />} />
              <Route path="/fechas" element={<FechasEspeciales />} />
              <Route path="/notas" element={<Notas titulo="Notas" texto="Escribe tus notas aquí..." clases="textarea-notas" esMensual={false} />} />
              <Route path="/config" element={<Config />} />
            </Routes>
            <BotonScroll />
          </div>
          <NavBar />
        </DataProvider>
      </FireProvider>
    </BrowserRouter>
  )
}

export default App
