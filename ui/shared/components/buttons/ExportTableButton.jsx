/* eslint-disable no-multi-spaces */

import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import { Table, Popup } from 'semantic-ui-react'

import { NoBorderTable, ButtonLink } from '../StyledComponents'

const NameCell = styled(Table.Cell)`
 height: 20px;
 padding: 3px;
`

const LinkCell = styled(Table.Cell)`
  padding: 3px 3px 3px 20px;
  width: 80px;
 verticalAlign: middle;
`

const EXT_CONFIG = {
  tsv: {
    dataType: 'tab-separated-values',
    delimiter: '\t',
  },
  xls: {
    imageName: 'excel',
    dataType: 'csv',
    delimiter: ',',
    dataExt: 'csv',
  },
  doc: {
    dataType: 'doc',
    dataExt: 'doc',
  },
}

const escapeExportItem = item => (item.replace ? item.replace(/"/g, '\'\'') : item)

const acmgCriteria = {}
let rowsToIncludeInReport = []

export const updateRowsToIncludeInReport = (newRowsToIncludeInReport) => {
  rowsToIncludeInReport = newRowsToIncludeInReport
}

export const updateAcmgCriteriaForFileDownload = (variantId, score, criteria) => {
  acmgCriteria[variantId] = { score, criteria }
}

const docFileLinkStyle = {
  cursor: 'pointer',
  outline: 'none',
}

export const DocFileLink = React.memo(({ openModal, url }) => {
  const extConfig = EXT_CONFIG.doc

  if (!url.includes('?')) {
    url += '?'
  }
  if (!url.endsWith('?')) {
    url += '&'
  }

  const newUrl = `${url}file_format=doc&acmg_criteria=${btoa(JSON.stringify(acmgCriteria))}&filtered_indexes=${btoa(rowsToIncludeInReport.toString())}`

  return (<a style={docFileLinkStyle} role="button" tabIndex={0} onClick={() => { openModal(newUrl) }}><span><img alt="doc" src={`/static/images/table_${extConfig.imageName || 'doc'}.png`} /> .doc</span></a>)
})

DocFileLink.propTypes = {
  openModal: PropTypes.func,
  url: PropTypes.string,
}

export const FileLink = React.memo(({ url, data, ext, linkContent }) => {
  const extConfig = EXT_CONFIG[ext]
  if (!linkContent) {
    linkContent =
      <span><img alt={ext} src={`/static/images/table_${extConfig.imageName || ext}.png`} /> &nbsp; .{ext}</span>
  }

  if (data) {
    let content = data.rawData.map(row => data.processRow(row).map(
      item => `"${(item === null || item === undefined) ? '' : escapeExportItem(item)}"`,
    ).join(extConfig.delimiter)).join('\n')
    if (data.headers) {
      content = `${data.headers.join(extConfig.delimiter)}\n${content}`
    }
    const href = URL.createObjectURL(new Blob([content], { type: 'application/octet-stream' }))

    return <a href={href} download={`${data.filename}.${extConfig.dataExt || ext}`}>{linkContent}</a>
  }

  if (!url.includes('?')) {
    url += '?'
  }
  if (!url.endsWith('?')) {
    url += '&'
  }

  return <a href={`${url}file_format=${ext}&acmg_criteria=${btoa(JSON.stringify(acmgCriteria))}&filtered_indexes=${btoa(rowsToIncludeInReport.toString())}`}>{linkContent}</a>
})

FileLink.propTypes = {
  ext: PropTypes.string.isRequired,
  url: PropTypes.string,
  data: PropTypes.object,
  linkContent: PropTypes.node,
}

const style = { zIndex: '2' }

const ExportTableButton = React.memo(({ downloads, buttonText, openModal, ...buttonProps }) =>
  <Popup
    trigger={
      <ButtonLink icon="download" content={buttonText || 'Download Table'} {...buttonProps} />
    }
    style={style}
    content={
      <NoBorderTable>
        <Table.Body>
          {
            downloads.map(({ name, url, data }) => {
              return [
                <Table.Row key={1}>
                  <NameCell colSpan="2">
                    <b>{name}:</b>
                  </NameCell>
                </Table.Row>,
                <Table.Row key={2}>
                  <LinkCell>
                    <DocFileLink openModal={openModal} url={url} />
                  </LinkCell>
                  <LinkCell>
                    <FileLink url={url} data={data} ext="xls" />
                  </LinkCell>
                  <LinkCell>
                    <FileLink url={url} data={data} ext="tsv" /><br />
                  </LinkCell>
                </Table.Row>,
              ]
            })
          }
        </Table.Body>
      </NoBorderTable>
    }
    on="click"
    position="bottom center"
  />,
)


ExportTableButton.propTypes = {
  /**
   * An array of urls with names:
   *  [{ name: 'table1', url: '/table1-export'},  { name: 'table2', url: '/table2-export' }]
   */
  downloads: PropTypes.array.isRequired,
  buttonText: PropTypes.string,
  openModal: PropTypes.func,
}

export default ExportTableButton
