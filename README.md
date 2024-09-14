# Plan de Sincronización entre Storage Local y Base de Datos

## 1. Almacenamiento Local y Base de Datos

- **Storage Local**: Se almacenarán datos recientes (por ejemplo, un mes o hasta un año) en el almacenamiento local del navegador para mejorar el rendimiento y la velocidad de carga de la aplicación.
- **Base de Datos**: Todos los datos se mantendrán a largo plazo en la base de datos para asegurar la persistencia y evitar la pérdida de información.

## 2. Sincronización entre Storage Local y Base de Datos

- **Clave de "Última Actualización"**: Cada vez que se realice un cambio en el storage local, se actualizará una clave llamada `ultimaActualizacion` con la fecha del último cambio.
- **Proceso de Sincronización**:
  - Al **cerrar la página**, los datos del storage local y la fecha de última actualización se enviarán a la base de datos.
  - Al **abrir la página**, se comparará la fecha de última actualización entre el storage local y la base de datos:
    - **Fechas iguales**: Se usan los datos del storage local.
    - **Fecha más reciente en la base de datos**: Se actualizan los datos del storage local desde la base de datos.
    - **Fecha más reciente en el storage local**: Se actualiza la base de datos con los datos del storage local.

## 3. Manejo de Datos Faltantes

- Si se solicita información que no está presente en el storage local (como datos más antiguos), se realizará una consulta a la base de datos.
- La decisión de almacenar esos datos en el storage o solo utilizarlos para la sesión actual dependerá de la estrategia de optimización.

## 4. Actualización Programada del Storage

- Se implementará un **sistema de actualización programada**, donde cada cierto intervalo de tiempo (por ejemplo, semanal o mensual), los datos del storage local se actualizarán desde la base de datos, incluso si la clave de `ultimaActualizacion` es la misma.
- Esto ayuda a evitar que el storage local almacene información obsoleta o incorrecta.

---

Este plan garantiza que el almacenamiento local se mantenga sincronizado de manera eficiente con la base de datos, mejorando la persistencia de datos y asegurando un buen rendimiento.
