export const crearDependencia = (titulo, fecha) => {
    // 1. Obtener los objetos de dependencias y actualizaciones desde localStorage
    const storedData = localStorage.getItem('Dependencias');
    const actualizacionData = localStorage.getItem('ActualizacionPendiente');

    // 2. Convertir los datos almacenados en objetos, o iniciar con un objeto vacío si no existen
    const dependencias = storedData ? JSON.parse(storedData) : {};
    const ActualizacionPendiente = actualizacionData ? JSON.parse(actualizacionData) : {};

    // 3. Agregar o actualizar el título en ambos objetos con su respectiva fecha
    dependencias[titulo] = fecha;
    ActualizacionPendiente[titulo] = fecha;

    // 4. Guardar ambos objetos actualizados en localStorage
    localStorage.setItem('Dependencias', JSON.stringify(dependencias));
    localStorage.setItem('ActualizacionPendiente', JSON.stringify(ActualizacionPendiente));
};





