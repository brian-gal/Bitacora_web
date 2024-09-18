import { useContext } from "react"
import Notas from "./notas"
import { DataContext } from "../../context/dateContext"


const Enseñanzas = () => {
    const { mes, meses } = useContext(DataContext)
    const esteMes = meses[mes].toLowerCase()

    return (
        <>
            <Notas titulo="Broadcasting" texto={`Escribe que aprendiste del broadcasting de ${esteMes}`} clases="textarea-enseñanzas" esMensual={true} />
            <Notas titulo="Gratitud" texto={`Anota las cosas por las cuales agradecer en ${esteMes}`} clases="textarea-enseñanzas" esMensual={true} />
            <Notas titulo="Oraciones" texto={`¿Cuántas oraciones respondió Jehová en ${esteMes}? Anótalas así no te olvidas ninguna`} clases="textarea-enseñanzas" esMensual={true} />
        </>
    )
}

export default Enseñanzas