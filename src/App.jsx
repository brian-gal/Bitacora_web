import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css'
import NavBar from './components/navBar';
import { DataProvider } from './context/dateContext';
import Informe from './components/informe';
import InicioSesion from './components/inicioSesion';
import Notas from './components/notas';
import { FireProvider } from './context/fireContext';
import Enseñanzas from './components/enseñanzas';

function App() {


  return (
    <BrowserRouter>
      <FireProvider>
        <DataProvider>
          <InicioSesion />
          <div className='contenedor'>
            <Routes>
              <Route path="/enseñanzas" element={<Enseñanzas />} />
              <Route path="/" element={<Informe />} />
              <Route path="/notas" element={<Notas titulo="Notas" texto="Escribe tus notas aquí..." clases="textarea-notas" esMensual={false} />} />
            </Routes>
          </div>
          <NavBar />
        </DataProvider>
      </FireProvider>
    </BrowserRouter>
  )
}

export default App
