import React, { useState } from 'react'
import AcmgModal from './AcmgModal'

const Acmg = () => {
  const [score, setScore] = useState('Unknown')
  const [active, setActive] = useState(false)

  return (
    <div>
      <AcmgModal score={score} setScore={setScore} active={active} setActive={setActive} />
    </div>
  )
}

export default Acmg
