import React, { useState } from 'react';
import ACMG_Modal from "./ACMG_Modal";

const ACMG = () => {
    const [score, setScore] = useState("Unknown");
    const [active, setActive] = useState(false);

    return (
        <div>
            <ACMG_Modal score={score} setScore={setScore} active={active} setActive={setActive} />
        </div>
    );
}

export default ACMG;