import React from 'react';
import { Table, Dropdown } from 'semantic-ui-react';
import ACMG_RuleSpecification from "./ACMG_RuleSpecification";

const ACMG_Criteria = (props) => {
    const { criteria, setCriteria } = props;
    const { acmgCalculationValue, setAcmgCalculationValue } = props;

    const criteriaUsed = {};
    criteria.forEach(item => criteriaUsed[item] = true);

    const addOrRemoveCriteria = (event, data) => {
        let [category, value, answer] = data.value.split("_");

        // Supporting keys have dash (-) in their name. It is used to add more information and have unique key as well.
        if (value.includes("-")) {
            const [key, _, text] = value.split("-");
            value = `${key}_${text}`;
        }

        let fullCriteria = value;
        const criteriaCopy = [...criteria];

        const acmgCalculationValueCopy = Object.assign({}, acmgCalculationValue);
        if (answer === "No" && criteriaUsed[fullCriteria] === true) {
            acmgCalculationValueCopy[category] -= 1;
            const filteredCriteria = criteriaCopy.filter(item => item !== fullCriteria);

            setCriteria(filteredCriteria);
            setAcmgCalculationValue(acmgCalculationValueCopy);
        } else if (answer === "Yes" && (criteriaUsed[fullCriteria] === false || criteriaUsed[fullCriteria] === undefined)) {
            acmgCalculationValueCopy[category] += 1;
            criteriaCopy.push(fullCriteria);

            setCriteria(criteriaCopy);
            setAcmgCalculationValue(acmgCalculationValueCopy);
        }
    }

    return (
        <div>
            <Table celled structured textAlign="center" style={{ fontSize: "13px" }}>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell colSpan="1"></Table.HeaderCell>
                        <Table.HeaderCell colSpan="2">Benign</Table.HeaderCell>
                        <Table.HeaderCell colSpan="4">Pathogenic</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    <Table.Row>
                        <Table.Cell></Table.Cell>
                        <Table.Cell width={2}>Strong</Table.Cell>
                        <Table.Cell width={3}>Supporting</Table.Cell>
                        <Table.Cell width={3}>Supporting</Table.Cell>
                        <Table.Cell width={3}>Moderate</Table.Cell>
                        <Table.Cell width={3}>Strong</Table.Cell>
                        <Table.Cell width={3}>Very Strong</Table.Cell>
                    </Table.Row>

                    <Table.Row>
                        <Table.Cell rowSpan="3"><span style={{ writingMode: "sideways-lr", marginLeft: "-10px" }}>Population Data</span></Table.Cell>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>BA1</Table.Cell>
                                        <Table.Cell width={2}>MAF too high<br />(Stand Alone)</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown0"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "BA_BA1_Yes",
                                                        text: "Y",
                                                        value: "BA_BA1_Yes",
                                                    },
                                                    {
                                                        key: "BA_BA1_No",
                                                        text: "N",
                                                        value: "BA_BA1_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["BA1"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                        <Table.Cell></Table.Cell>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>PM2_P</Table.Cell>
                                        <Table.Cell width={2}>Low AF in pop db</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown1"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "PP_PM2-P-Supporting_Yes",
                                                        text: "Y",
                                                        value: "PP_PM2-P-Supporting_Yes",
                                                    },
                                                    {
                                                        key: "PP_PM2-P-Supporting_No",
                                                        text: "N",
                                                        value: "PP_PM2-P-Supporting_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["PM2_Supporting"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>PM2</Table.Cell>
                                        <Table.Cell width={2}>Absent (or rare) in<br />pop db with coverage<br />{">20x"}</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown2"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "PM_PM2_Yes",
                                                        text: "Y",
                                                        value: "PM_PM2_Yes",
                                                    },
                                                    {
                                                        key: "PM_PM2_No",
                                                        text: "N",
                                                        value: "PM_PM2_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["PM2"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                        <Table.Cell></Table.Cell>
                        <Table.Cell></Table.Cell>
                    </Table.Row>

                    <Table.Row>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>BS1</Table.Cell>
                                        <Table.Cell width={2}>MAF too high<br />(Stand Alone)</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown3"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "BS_BS1_Yes",
                                                        text: "Y",
                                                        value: "BS_BS1_Yes",
                                                    },
                                                    {
                                                        key: "BS_BS1_No",
                                                        text: "N",
                                                        value: "BS_BS1_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["BS1"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>BS1_P</Table.Cell>
                                        <Table.Cell width={2}>MAF too high<br />(Supporting)</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown4"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "BP_BS1-P-Supporting_Yes",
                                                        text: "Y",
                                                        value: "BP_BS1-P-Supporting_Yes",
                                                    },
                                                    {
                                                        key: "BP_BS1-P-Supporting_No",
                                                        text: "N",
                                                        value: "BP_BS1-P-Supporting_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["BS1_Supporting"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>PS4_P</Table.Cell>
                                        <Table.Cell width={2}>Proband Count -<br />Supporting</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown5"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "PP_PS4-P-Supporting_Yes",
                                                        text: "Y",
                                                        value: "PP_PS4-P-Supporting_Yes",
                                                    },
                                                    {
                                                        key: "PP_PS4-P-Supporting_No",
                                                        text: "N",
                                                        value: "PP_PS4-P-Supporting_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["PS4_Supporting"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>PS4_M</Table.Cell>
                                        <Table.Cell width={2}>Proband Count -<br />Moderate</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown6"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "PM_PS4-M-Moderate_Yes",
                                                        text: "Y",
                                                        value: "PM_PS4-M-Moderate_Yes",
                                                    },
                                                    {
                                                        key: "PM_PS4-M-Moderate_No",
                                                        text: "N",
                                                        value: "PM_PS4-M-Moderate_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["PS4_Moderate"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>PS4</Table.Cell>
                                        <Table.Cell width={2}>Case-control OR<br />Proband Count</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown7"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "PS_PS4_Yes",
                                                        text: "Y",
                                                        value: "PS_PS4_Yes",
                                                    },
                                                    {
                                                        key: "PS_PS4_No",
                                                        text: "N",
                                                        value: "PS_PS4_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["PS4"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                        <Table.Cell></Table.Cell>
                    </Table.Row>

                    <Table.Row>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>BS2</Table.Cell>
                                        <Table.Cell width={2}>MAF too high<br />(Stand Alone)</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown8"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "BS_BS2_Yes",
                                                        text: "Y",
                                                        value: "BS_BS2_Yes",
                                                    },
                                                    {
                                                        key: "BS_BS2_No",
                                                        text: "N",
                                                        value: "BS_BS2_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["BS2"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                        <Table.Cell></Table.Cell>
                        <Table.Cell></Table.Cell>
                        <Table.Cell></Table.Cell>
                        <Table.Cell></Table.Cell>
                        <Table.Cell></Table.Cell>
                    </Table.Row>

                    <Table.Row>
                        <Table.Cell rowSpan="4"><span style={{ writingMode: "sideways-lr", marginLeft: "-10px" }}>Computational and Predictive Data</span></Table.Cell>
                        <Table.Cell></Table.Cell>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>BP1</Table.Cell>
                                        <Table.Cell width={2}>Truncating disease causing<br />variant missense</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown9"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "BP_BP1_Yes",
                                                        text: "Y",
                                                        value: "BP_BP1_Yes",
                                                    },
                                                    {
                                                        key: "BP_BP1_No",
                                                        text: "N",
                                                        value: "BP_BP1_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["BP1"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                        <Table.Cell></Table.Cell>
                        <Table.Cell></Table.Cell>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>PS1</Table.Cell>
                                        <Table.Cell width={2}>SAME AA change as<br />establish pathogenic variant</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown10"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "PS_PS1_Yes",
                                                        text: "Y",
                                                        value: "PS_PS1_Yes",
                                                    },
                                                    {
                                                        key: "PS_PS1_No",
                                                        text: "N",
                                                        value: "PS_PS1_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["PS1"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                        <Table.Cell></Table.Cell>
                    </Table.Row>

                    <Table.Row>
                        <Table.Cell></Table.Cell>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>BP3</Table.Cell>
                                        <Table.Cell width={2}>In-frame indel in repeat<br />region w/out known function</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown11"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "BP_BP3_Yes",
                                                        text: "Y",
                                                        value: "BP_BP3_Yes",
                                                    },
                                                    {
                                                        key: "BP_BP3_No",
                                                        text: "N",
                                                        value: "BP_BP3_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["BP3"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                        <Table.Cell></Table.Cell>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>PM5</Table.Cell>
                                        <Table.Cell width={2}>Diff pathogenic<br />missense variant at<br />codon</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown12"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "PM_PM5_Yes",
                                                        text: "Y",
                                                        value: "PM_PM5_Yes",
                                                    },
                                                    {
                                                        key: "PM_PM5_No",
                                                        text: "N",
                                                        value: "PM_PM5_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["PM5"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>PM5_S</Table.Cell>
                                        <Table.Cell width={2}>{">=2 diff path"}<br />missense variants at<br />codon</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown13"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "PS_PM5-S-Strong_Yes",
                                                        text: "Y",
                                                        value: "PS_PM5-S-Strong_Yes",
                                                    },
                                                    {
                                                        key: "PS_PM5-S-Strong_No",
                                                        text: "N",
                                                        value: "PS_PM5-S-Strong_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["PM5_Strong"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                        <Table.Cell></Table.Cell>
                    </Table.Row>

                    <Table.Row>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>BP4_S</Table.Cell>
                                        <Table.Cell width={2}>Variant AA found<br />{"in >=3 mammals"}</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown14"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "BS_BP4-S-Strong_Yes",
                                                        text: "Y",
                                                        value: "BS_BP4-S-Strong_Yes",
                                                    },
                                                    {
                                                        key: "BS_BP4-S-Strong_No",
                                                        text: "N",
                                                        value: "BS_BP4-S-Strong_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["PB4_Strong"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>BP4</Table.Cell>
                                        <Table.Cell width={2}>Computational evidence<br />suggests no impact</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown15"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "BP_BP4_Yes",
                                                        text: "Y",
                                                        value: "BP_BP4_Yes",
                                                    },
                                                    {
                                                        key: "BP_BP4_No",
                                                        text: "N",
                                                        value: "BP_BP4_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["BP4"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>PP3</Table.Cell>
                                        <Table.Cell width={2}>Computational<br />evidente suggests<br />impact</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown16"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "PP_PP3_Yes",
                                                        text: "Y",
                                                        value: "PP_PP3_Yes",
                                                    },
                                                    {
                                                        key: "PP_PP3_No",
                                                        text: "N",
                                                        value: "PP_PP3_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["PP3"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>PVS1_M</Table.Cell>
                                        <Table.Cell width={2}>Null variant -<br />Moderate</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown17"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "PM_PVS1-M-Moderate_Yes",
                                                        text: "Y",
                                                        value: "PM_PVS1-M-Moderate_Yes",
                                                    },
                                                    {
                                                        key: "PM_PVS1-M-Moderate_No",
                                                        text: "N",
                                                        value: "PM_PVS1-M-Moderate_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["PVS1_Moderate"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>PVS1_S</Table.Cell>
                                        <Table.Cell width={2}>Null variant -<br />Strong</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown18"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "PS_PVS1-S-Strong_Yes",
                                                        text: "Y",
                                                        value: "PS_PVS1-S-Strong_Yes",
                                                    },
                                                    {
                                                        key: "PS_PVS1-S-Strong_No",
                                                        text: "N",
                                                        value: "PS_PVS1-S-Strong_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["PVS1_Strong"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>PVS1</Table.Cell>
                                        <Table.Cell width={2}>Null variant & LOF<br />known mechanism</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown19"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "PVS_PVS1_Yes",
                                                        text: "Y",
                                                        value: "PVS_PVS1_Yes",
                                                    },
                                                    {
                                                        key: "PVS_PVS1_No",
                                                        text: "N",
                                                        value: "PVS_PVS1_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["PVS1"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                    </Table.Row>

                    <Table.Row>
                        <Table.Cell></Table.Cell>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>BP7</Table.Cell>
                                        <Table.Cell width={2}>Silent or noncons splice<br />(see below) with no<br />predicted splice impact</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown20"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "BP_BP7_Yes",
                                                        text: "Y",
                                                        value: "BP_BP7_Yes",
                                                    },
                                                    {
                                                        key: "BP_BP7_No",
                                                        text: "N",
                                                        value: "BP_BP7_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["BP7"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>PM4_S</Table.Cell>
                                        <Table.Cell width={2}>In-frame indel of 1-2<br />AA</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown21"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "PP_PM4-S-Supporting_Yes",
                                                        text: "Y",
                                                        value: "PP_PM4-S-Supporting_Yes",
                                                    },
                                                    {
                                                        key: "PP_PM4-S-Supporting_No",
                                                        text: "N",
                                                        value: "PP_PM4-S-Supporting_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["PM4_Supporting"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>PM4</Table.Cell>
                                        <Table.Cell width={2}>Pritein length<br />changing variant{">2"}<br />AA) in non-repeat<br />region</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown22"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "PM_PM4_Yes",
                                                        text: "Y",
                                                        value: "PM_PM4_Yes",
                                                    },
                                                    {
                                                        key: "PM_PM4_No",
                                                        text: "N",
                                                        value: "PM_PM4_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["PM4"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                        <Table.Cell></Table.Cell>
                        <Table.Cell></Table.Cell>
                    </Table.Row>

                    <Table.Row>
                        <Table.Cell rowSpan="2"><span style={{ writingMode: "sideways-lr", marginLeft: "-10px" }}>Functional Data</span></Table.Cell>
                        <Table.Cell></Table.Cell>
                        <Table.Cell></Table.Cell>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>PP2</Table.Cell>
                                        <Table.Cell width={2}>Missense in a gene<br />with low rate of<br />benign missense &<br />path missense<br />common</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown23"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "PP_PP2_Yes",
                                                        text: "Y",
                                                        value: "PP_PP2_Yes",
                                                    },
                                                    {
                                                        key: "PP_PP2_No",
                                                        text: "N",
                                                        value: "PP_PP2_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["PP2"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>PM1</Table.Cell>
                                        <Table.Cell width={2}>Mutation hotspot or<br />fxnl domain</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown24"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "PM_PM1_Yes",
                                                        text: "Y",
                                                        value: "PM_PM1_Yes",
                                                    },
                                                    {
                                                        key: "PM_PM1_No",
                                                        text: "N",
                                                        value: "PM_PM1_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["PM1"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                        <Table.Cell></Table.Cell>
                    </Table.Row>

                    <Table.Row>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>BS3</Table.Cell>
                                        <Table.Cell width={2}>Established fxnl<br />study shows no<br />deleterious effect</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown25"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "BS_BS3_Yes",
                                                        text: "Y",
                                                        value: "BS_BS3_Yes",
                                                    },
                                                    {
                                                        key: "BS_BS3_No",
                                                        text: "N",
                                                        value: "BS_BS3_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["BS3"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                        <Table.Cell></Table.Cell>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>PS3_P</Table.Cell>
                                        <Table.Cell width={2}>Functional assay -<br />Supporting</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown26"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "PP_PS3-P-Supporting_Yes",
                                                        text: "Y",
                                                        value: "PP_PS3-P-Supporting_Yes",
                                                    },
                                                    {
                                                        key: "PP_PS3-P-Supporting_No",
                                                        text: "N",
                                                        value: "PP_PS3-P-Supporting_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["PS3_Supporting"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>PS3_M</Table.Cell>
                                        <Table.Cell width={2}>Functional assay -<br />Moderate</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown27"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "PM_PS3-M-Moderate_Yes",
                                                        text: "Y",
                                                        value: "PM_PS3-M-Moderate_Yes",
                                                    },
                                                    {
                                                        key: "PM_PS3-M-Moderate_No",
                                                        text: "N",
                                                        value: "PM_PS3-M-Moderate_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["PS3_Moderate"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>PS3</Table.Cell>
                                        <Table.Cell width={2}>Established fxnl<br />study shows<br />deleterious effect</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown28"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "PS_PS3_Yes",
                                                        text: "Y",
                                                        value: "PS_PS3_Yes",
                                                    },
                                                    {
                                                        key: "PS_PS3_No",
                                                        text: "N",
                                                        value: "PS_PS3_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["PS3"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                        <Table.Cell></Table.Cell>
                    </Table.Row>

                    <Table.Row>
                        <Table.Cell><span style={{ writingMode: "sideways-lr", marginLeft: "-10px" }}>Segregation Data</span></Table.Cell>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>BS4</Table.Cell>
                                        <Table.Cell width={2}>Lack of<br />segregation in<br />affected</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown29"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "BS_BS4_Yes",
                                                        text: "Y",
                                                        value: "BS_BS4_Yes",
                                                    },
                                                    {
                                                        key: "BS_BS4_No",
                                                        text: "N",
                                                        value: "BS_BS4_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["BS4"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                        <Table.Cell></Table.Cell>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>PP1</Table.Cell>
                                        <Table.Cell width={2}>Coseg with disease<br />Dominant: 3 segs<br />Recessive:</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown30"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "PP_PP1_Yes",
                                                        text: "Y",
                                                        value: "PP_PP1_Yes",
                                                    },
                                                    {
                                                        key: "PP_PP1_No",
                                                        text: "N",
                                                        value: "PP_PP1_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["PP1"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>PP1_M</Table.Cell>
                                        <Table.Cell width={2}>Coseg with disease<br />Dominant: 5 segs<br />Recessive:</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown31"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "PM_PP1-M-Moderate_Yes",
                                                        text: "Y",
                                                        value: "PM_PP1-M-Moderate_Yes",
                                                    },
                                                    {
                                                        key: "PM_PP1-M-Moderate_No",
                                                        text: "N",
                                                        value: "PM_PP1-M-Moderate_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["PP1_Moderate"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>PP1_S</Table.Cell>
                                        <Table.Cell width={2}>Coseg with disease<br />Dominant: 7 segs<br />Recessive</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown32"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "PS_PP1-S-Strong_Yes",
                                                        text: "Y",
                                                        value: "PS_PP1-S-Strong_Yes",
                                                    },
                                                    {
                                                        key: "PS_PP1-S-Strong_No",
                                                        text: "N",
                                                        value: "PS_PP1-S-Strong_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["PP1_Strong"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                        <Table.Cell></Table.Cell>
                    </Table.Row>

                    <Table.Row>
                        <Table.Cell rowSpan="2"><span style={{ writingMode: "sideways-lr", marginLeft: "-10px" }}>De Novo Data</span></Table.Cell>
                        <Table.Cell></Table.Cell>
                        <Table.Cell></Table.Cell>
                        <Table.Cell></Table.Cell>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>PM6</Table.Cell>
                                        <Table.Cell width={2}>De novo (neither<br />paternity or maternity<br />confirmed)</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown33"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "PM_PM6_Yes",
                                                        text: "Y",
                                                        value: "PM_PM6_Yes",
                                                    },
                                                    {
                                                        key: "PM_PM6_No",
                                                        text: "N",
                                                        value: "PM_PM6_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["PM6"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>PM6_S</Table.Cell>
                                        <Table.Cell width={2}>{">=2"} independent<br />occurences of PM6</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown34"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "PS_PM6-S-Strong_Yes",
                                                        text: "Y",
                                                        value: "PS_PM6-S-Strong_Yes",
                                                    },
                                                    {
                                                        key: "PS_PM6-S-Strong_No",
                                                        text: "N",
                                                        value: "PS_PM6-S-Strong_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["PM6_Strong"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                        <Table.Cell></Table.Cell>
                    </Table.Row>

                    <Table.Row>
                        <Table.Cell></Table.Cell>
                        <Table.Cell></Table.Cell>
                        <Table.Cell></Table.Cell>
                        <Table.Cell></Table.Cell>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>PS2</Table.Cell>
                                        <Table.Cell width={2}>De novo (paternity<br />and maternity<br />confirmed)</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown35"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "PS_PS2_Yes",
                                                        text: "Y",
                                                        value: "PS_PS2_Yes",
                                                    },
                                                    {
                                                        key: "PS_PS2_No",
                                                        text: "N",
                                                        value: "PS_PS2_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["PS2"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>PS2_VS</Table.Cell>
                                        <Table.Cell width={2}>{">=2"} independent<br />occurences of PS2</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown36"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "PVS_PS2-VS-VeryStrong_Yes",
                                                        text: "Y",
                                                        value: "PVS_PS2-VS-VeryStrong_Yes",
                                                    },
                                                    {
                                                        key: "PVS_PS2-VS-VeryStrong_No",
                                                        text: "N",
                                                        value: "PVS_PS2-VS-VeryStrong_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["PS2_VeryString"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                    </Table.Row>

                    <Table.Row>
                        <Table.Cell><span style={{ writingMode: "sideways-lr", marginLeft: "-10px" }}>Alleleic Data</span></Table.Cell>
                        <Table.Cell></Table.Cell>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>BP2</Table.Cell>
                                        <Table.Cell width={2}>Observed in trans with<br />dominant variant OR<br />observed in cis with<br />path variant</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown37"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "BP_BP2_Yes",
                                                        text: "Y",
                                                        value: "BP_BP2_Yes",
                                                    },
                                                    {
                                                        key: "BP_BP2_No",
                                                        text: "N",
                                                        value: "BP_BP2_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["BP2"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>PM3_P</Table.Cell>
                                        <Table.Cell width={2}>Variant in trans does<br />not meet LP/P criteria</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown38"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "PP_PM3-P-Supporting_Yes",
                                                        text: "Y",
                                                        value: "PP_PM3-P-Supporting_Yes",
                                                    },
                                                    {
                                                        key: "PP_PM3-P-Supporting_No",
                                                        text: "N",
                                                        value: "PP_PM3-P-Supporting_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["PM3_Supporting"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>PM3</Table.Cell>
                                        <Table.Cell width={2}>Detected in trans with<br />P/LP variant<br />(recessive disorders)</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown39"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "PM_PM3_Yes",
                                                        text: "Y",
                                                        value: "PM_PM3_Yes",
                                                    },
                                                    {
                                                        key: "PM_PM3_No",
                                                        text: "N",
                                                        value: "PM_PM3_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["PM3"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>PM3_S</Table.Cell>
                                        <Table.Cell width={2}>2-3 occurences of<br />PM3 (see below)</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown40"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "PS_PM3-S-Strong_Yes",
                                                        text: "Y",
                                                        value: "PS_PM3-S-Strong_Yes",
                                                    },
                                                    {
                                                        key: "PS_PM3-S-Strong_No",
                                                        text: "N",
                                                        value: "PS_PM3-S-Strong_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["PM3_Strong"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>PM3_VS</Table.Cell>
                                        <Table.Cell width={2}>{">=4"} occurences of<br />PM3 (see below)</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown41"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "PVS_PM3-VS-VeryStrong_Yes",
                                                        text: "Y",
                                                        value: "PVS_PM3-VS-VeryStrong_Yes",
                                                    },
                                                    {
                                                        key: "PVS_PM3-VS-VeryStrong_No",
                                                        text: "N",
                                                        value: "PVS_PM3-VS-VeryStrong_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["PM3_VeryStrong"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                    </Table.Row>

                    <Table.Row>
                        <Table.Cell><span style={{ writingMode: "sideways-lr", marginLeft: "-10px" }}>Other Data</span></Table.Cell>
                        <Table.Cell></Table.Cell>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>BP5</Table.Cell>
                                        <Table.Cell width={2}>Found in case with an<br />alternative cause</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown42"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "BP_BP5_Yes",
                                                        text: "Y",
                                                        value: "BP_BP5_Yes",
                                                    },
                                                    {
                                                        key: "BP_BP5_No",
                                                        text: "N",
                                                        value: "BP_BP5_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["BP5"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                        <Table.Cell>
                            <Table size="small">
                                <Table.Body>
                                    <Table.Row textAlign="center">
                                        <Table.Cell width={1}>PP4</Table.Cell>
                                        <Table.Cell width={2}>Patient phenotype or<br />FH high specific for<br />gene</Table.Cell>
                                        <Table.Cell width={1}>
                                            <Dropdown
                                                key="dropdown43"
                                                placeholder="N"
                                                options={[
                                                    {
                                                        key: "PP_PP4_Yes",
                                                        text: "Y",
                                                        value: "PP_PP4_Yes",
                                                    },
                                                    {
                                                        key: "PP_PP4_No",
                                                        text: "N",
                                                        value: "PP_PP4_No",
                                                    }
                                                ]}
                                                onChange={addOrRemoveCriteria}
                                                text={criteriaUsed["PP4"] ? "Y" : ""}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Table.Cell>
                        <Table.Cell></Table.Cell>
                        <Table.Cell></Table.Cell>
                        <Table.Cell></Table.Cell>
                    </Table.Row>
                </Table.Body>
            </Table>
            <br />
            <ACMG_RuleSpecification />
        </div>
    );
}

export default ACMG_Criteria;