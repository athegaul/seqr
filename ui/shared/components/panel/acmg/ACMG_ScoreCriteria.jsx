import React from 'react';
import { Table } from 'semantic-ui-react';

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
                        <Table.Cell>{score}</Table.Cell>
                        <Table.Cell>{criteria.length === 0 ? "No criteria applied" : criteria}</Table.Cell>
                    </Table.Row>
                </Table.Body>
            </Table>
        </div>
    );
}

export default ACMG_ScoreCriteria;