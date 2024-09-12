import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css'
import NavBar from './components/navBar';
import MenuFecha from './components/menuFecha';
import { DataProvider } from './context/dateContext';
import Informe from './components/informe';
import InicioSesion from './components/inicioSesion';

function App() {


  return (
    <BrowserRouter>
      <DataProvider>
        <MenuFecha />
        <div className='contendor'>
          <Routes>
            <Route path="/" element={<InicioSesion />} />
          </Routes>
        </div>
        <NavBar />
      </DataProvider>
    </BrowserRouter>
  )
}

export default App
