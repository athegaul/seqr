import React, { useState } from 'react';
import { Icon, Modal } from 'semantic-ui-react';
import ACMG_ScoreCriteria from "./ACMG_ScoreCriteria";
import ACMG_Criteria from "./ACMG_Criteria";

const ACMG_Modal = (props) => {
    const { score, setScore, active, setActive } = props;
    const [ criteria, setCriteria ] = useState([]);

    const [ acmgCalculationValue, setAcmgCalculationValue ] = useState({
        "PVS": 0,
        "PS": 0,
        "PM": 0,
        "PP": 0,
        "BA": 0,
        "BS": 0,
        "BP": 0
    });

    return (
        <div>
            <div className="ui blue labels">
                <a className="ui label large" onClick={() => { setActive(true); }}>ACMG<div className="detail">{score}</div></a>
                <Modal open={active} dimmer="blurring" size="fullscreen" >
                    <Icon name="close" onClick={() => { setActive(false); }}/>

                    <Modal.Header>ACMG Calculation</Modal.Header>

                    <Modal.Content>
                        <ACMG_ScoreCriteria score={score} criteria={criteria} />
                        <br />
                        <ACMG_Criteria criteria={criteria} setCriteria={setCriteria} acmgCalculationValue={acmgCalculationValue} setAcmgCalculationValue={setAcmgCalculationValue} />
                    </Modal.Content>
                </Modal>
            </div>
        </div>
    );
};

export default ACMG_Modal;