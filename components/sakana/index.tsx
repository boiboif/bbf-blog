import Image from 'next/image'
import { useState } from 'react'
import { SakanaReact } from 'sakana-react'
import controlIcon from 'sakana-react/dist/assets/favicon.ico'
import chisato from 'sakana-react/dist/assets/img/chisato.png'
import takina from 'sakana-react/dist/assets/img/takina.png'

export default function Sakana() {
    const [character, setCharacter] = useState(takina)

    return (
        <SakanaReact
            width='100%'
            lineWidth={3}
            customCharacter={character.src}
            customControler={<Image src={controlIcon} alt='切换角色' width={26} height={26} draggable={false} className='cursor-move select-none' />}
            onControlerClick={() => setCharacter(current => current === takina ? chisato : takina)}
        />
    )
}
