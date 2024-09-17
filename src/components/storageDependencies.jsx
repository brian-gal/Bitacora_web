export const crearDependencia = (titulo, fecha, estaEnStorage, direccion) => {
    // 1. Obtener el array de dependencias desde localStorage
    const storedData = localStorage.getItem('Dependencias');
    const dependencias = storedData ? JSON.parse(storedData) : [];

    // 2. Buscar si ya existe una dependencia con el mismo título
    const index = dependencias.findIndex(dep => dep.titulo === titulo);

    const nuevaDependencia = {
        titulo: titulo,
        fecha: fecha,
    };

    if (index !== -1) {
        // Si existe, actualizar el objeto
        dependencias[index] = nuevaDependencia;
    } else {
        // Si no existe, agregar el nuevo objeto al array
        dependencias.push(nuevaDependencia);
    }

    // 3. Guardar el array actualizado en localStorage
    localStorage.setItem('Dependencias', JSON.stringify(dependencias));
};
