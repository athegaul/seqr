import React from 'react';
import { Table } from 'semantic-ui-react';

const formatCriteria = (criteria) => {
    const formattedCriteria = [];
    
    for (let i = 0; i < criteria.length; i++) {
        formattedCriteria.push(criteria[i]);

        if (i !== criteria.length - 1) {
            formattedCriteria[i] += ", ";
        }
    }

    return formattedCriteria;
}

const ACMG_ScoreCriteria = (props) => {
    const { score, criteria } = props;

    return (
        <div>
            <Table celled padded>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell singleLine>Score</Table.HeaderCell>
                        <Table.HeaderCell>Criteria Applied</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                
                <Table.Body>
                    <Table.Row>
                        <Table.Cell width="5">{score}</Table.Cell>
                        <Table.Cell>{criteria.length === 0 ? "No criteria applied" : formatCriteria(criteria)}</Table.Cell>
                    </Table.Row>
                </Table.Body>
            </Table>
        </div>
    );
}

export default ACMG_ScoreCriteria;
