import MenuFecha from "./menuFecha"
import Notas from "./notas"

const Enseñanzas = () => {
    return (
        <>
            <MenuFecha />
            <Notas titulo="Broadcasting" texto="Escribe que aprendiste del broadcasting de este mes" clases="textarea-enseñanzas" esMensual={true} />
            <Notas titulo="Gratitud" texto="Anota las cosas por las cuales agradecer este mes" clases="textarea-enseñanzas" esMensual={true} />
            <Notas titulo="Oraciones" texto="¿Cuántas oraciones respondió Jehová este mes? Anótalas así no te olvidas ninguna" clases="textarea-enseñanzas" esMensual={true} />
        </>
    )
}

export default Enseñanzas