import React, { useState } from 'react';
import { Icon, Modal } from 'semantic-ui-react';
import ACMG_ScoreCriteria from "./ACMG_ScoreCriteria";
import ACMG_Criteria from "./ACMG_Criteria";

const getPathOneResult = (acmgCalculationValue) => {
    if (acmgCalculationValue["PVS"] >= 1) {
        if (acmgCalculationValue["PS"] >= 1 || acmgCalculationValue["PM"] >= 2 || acmgCalculationValue["PP"] >= 2 || (acmgCalculationValue["PM"] >= 1 && acmgCalculationValue["PP"] >= 1)) {
            return "Path";
        } else {
            return "No";
        }
    } else {
        return "No";
    }
}

const getPathTwoResult = (acmgCalculationValue) => {
    if (acmgCalculationValue["PVS"] >= 2 || acmgCalculationValue["PS"] >= 2) {
        return "Path";
    } else {
        return "No";
    }
}

const getPathThreeResult = (acmgCalculationValue) => {
    if (acmgCalculationValue["PS"] >= 1) {
        if (acmgCalculationValue["PM"] >= 3 || (acmgCalculationValue["PM"] >= 2 && acmgCalculationValue["PP"] >= 2) || (acmgCalculationValue["PM"] >= 1 && acmgCalculationValue["PP"] >= 4)) {
            return "Path";
        } else {
            return "No";
        }
    } else {
        return "No";
    }
}

const isPathogenic = (acmgCalculationValue) => {
    if (getPathOneResult(acmgCalculationValue) === "Path" || getPathTwoResult(acmgCalculationValue) === "Path" || getPathThreeResult(acmgCalculationValue) === "Path") {
        return "Yes";
    } else {
        return "No";
    }
}

const isLikelyPath = (acmgCalculationValue) => {
    if (
        (acmgCalculationValue["PVS"] === 1 && acmgCalculationValue["PM"] === 1) ||
        (acmgCalculationValue["PS"] === 1 && acmgCalculationValue["PM"] === 1) ||
        (acmgCalculationValue["PS"] === 1 && acmgCalculationValue["PM"] === 2) ||
        (acmgCalculationValue["PS"] === 1 && acmgCalculationValue["PP"] >= 2) ||
        (acmgCalculationValue["PM"] >= 3) ||
        (acmgCalculationValue["PM"] === 2 && acmgCalculationValue["PP"] >= 2) ||
        (acmgCalculationValue["PM"] === 1 && acmgCalculationValue["PP"] >= 4)
    ) {
        return "Yes";
    } else {
        return "No";
    }
}

const isLikelyBenign = (acmgCalculationValue) => {
    if (acmgCalculationValue["BP"] >= 2 || acmgCalculationValue["BS"] >= 1) {
        return "Yes";
    } else {
        return "No";
    }
}

const isBenign = (acmgCalculationValue) => {
    if (acmgCalculationValue["BA"] >= 1 || acmgCalculationValue["BS"] >= 2) {
        return "Yes";
    } else {
        return "No";
    }
}

const getScore = (acmgCalculationValue) => {
    if (
        acmgCalculationValue["PVS"] === 0 &&
        acmgCalculationValue["PS"] === 0 &&
        acmgCalculationValue["PM"] === 0 &&
        acmgCalculationValue["PP"] === 0 &&
        acmgCalculationValue["BA"] === 0 &&
        acmgCalculationValue["BS"] === 0 &&
        acmgCalculationValue["BP"] === 0
    ) {
        return "Unknown";
    } else if (
        isPathogenic(acmgCalculationValue) === "No" &&
        isLikelyPath(acmgCalculationValue) === "No" &&
        isLikelyBenign(acmgCalculationValue) === "No" &&
        isBenign(acmgCalculationValue) === "No"
    ) {
        return "Uncertain significance"
    } else if (
        (isPathogenic(acmgCalculationValue) === "Yes" || isLikelyPath(acmgCalculationValue) === "Yes") &&
        (isLikelyBenign(acmgCalculationValue) === "Yes" || isBenign(acmgCalculationValue) === "Yes")
    ) {
        return "Conflicting";
    } else if (isPathogenic(acmgCalculationValue) === "Yes") {
        return "Pathogenic";
    } else if (isPathogenic(acmgCalculationValue) === "No" && isLikelyPath(acmgCalculationValue) === "Yes") {
        return "Likely pathogenic";
    } else if (isLikelyBenign(acmgCalculationValue) === "Yes" && isBenign(acmgCalculationValue) === "No") {
        return "Likely benign";
    } else if (isBenign(acmgCalculationValue) === "Yes") {
        return "Benign";
    } else {
        return "Unknown";
    }
}

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
                        <ACMG_Criteria
                            criteria={criteria}
                            setCriteria={setCriteria}
                            acmgCalculationValue={acmgCalculationValue}
                            setAcmgCalculationValue={setAcmgCalculationValue}
                            getScore={getScore}
                            setScore={setScore}
                        />
                    </Modal.Content>
                </Modal>
            </div>
        </div>
    );
};

export default ACMG_Modal;
