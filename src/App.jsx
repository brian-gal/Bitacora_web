import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css'
import NavBar from './components/navBar';
import MenuFecha from './components/menuFecha';
import { DataProvider } from './context/dateContext';
import Informe from './components/informe';
import InicioSesion from './components/inicioSesion';
import Notas from './components/notas';

function App() {


  return (
    <BrowserRouter>
      <DataProvider>
        <InicioSesion />

        <div className='contendor'>
          <Routes>
            <Route path="/" element={<MenuFecha />} />
            <Route path="/enseñanzas" element={<MenuFecha />} />

            <Route path="/" element={<Informe />} />
            <Route path="/notas" element={<Notas />} />
          </Routes>
        </div>
        <NavBar />
      </DataProvider>
    </BrowserRouter>
  )
}

export default App
