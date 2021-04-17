import React from 'react'
import PropTypes from 'prop-types'
import { Divider, Grid, Message } from 'semantic-ui-react'
import { reduxForm } from 'redux-form'
import { connect } from 'react-redux'

import { ModalComponent } from '../../modal/Modal'
import { setModalConfirm, closeModal } from '../../../../redux/utils/modalReducer'
import FileUploadField from '../../form/XHRUploaderField'
import { WORD_REPORT_EXCEL_GENERATION_HEADERS, WORD_REPORT_EXCEL_GENERATION_QUERY_VARIABLES } from '../../../utils/constants'
import { BaseSemanticInput, CheckboxTableGroup } from '../../form/Inputs'
import { VerticalSpacer } from '../../../components/Spacers'


class ReportUploadModal extends React.PureComponent {

  static propTypes = {
    modalName: PropTypes.string,
    modalToggle: PropTypes.any,
    docUrl: PropTypes.string,
  }

  constructor(props) {
    super(props)

    this.state = {
      linkData: null,
      fileDataHeaders: [],
      fileDataContent: [],
      filteredFileDataContent: [],
      modalToggle: props.modalToggle,
      modalOpen: false,
      modalClosing: false,
      fileOK: false,
      initialUpload: true,
      initialTableDisplay: true,
      checkedOptionKey: null,
      missingHeadersMessage: null,
      ascSortToggle: false,
      selectedHeader: null,
      rowsPerPage: 5,
      selectedPage: 0,
      numberOfPages: 0,
    }
    this.modalName = props.modalName

    this.handleUpload = this.handleUpload.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.handleRowOptionClick = this.handleRowOptionClick.bind(this)
    this.handleSort = this.handleSort.bind(this)
    this.handlePageSelect = this.handlePageSelect.bind(this)
  }

  closeModal = () => {
    this.setState({
      modalOpen: false,
      modalClosing: true,
      modalToggle: !this.state.modalToggle,
      initialUpload: true,
      checkedOptionKey: null,
      missingHeadersMessage: null,
    })
  }

  handleUpload(e, data) {
    if (data.uploadedFileId) {
      const { parsedData } = data
      const [parsedDataHeaders, ...parsedDataContent] = parsedData

      const headerIsComplete = () => {
        const headerDifference = WORD_REPORT_EXCEL_GENERATION_HEADERS.filter(x => !parsedDataHeaders.includes(x))
        if (headerDifference.length !== 0) {
          this.setState({
            missingHeadersMessage: `Missing fields are: ${headerDifference.join(',')}`,
          })
        }
        return headerDifference.length === 0
      }

      if (headerIsComplete()) {
        this.setState({
          initialUpload: false,
          initialTableDisplay: false,
          fileOK: true,
          fileDataHeaders: parsedDataHeaders,
          fileDataContent: parsedDataContent,
          filteredFileDataContent: ReportUploadModal.paginateData(0, parsedDataContent, this.state.rowsPerPage).paginatedData,
          missingHeadersMessage: null,
          checkedOptionKey: null,
          numberOfPages: ReportUploadModal.getNumberOfPages(parsedDataContent, this.state.rowsPerPage),
          selectedHeader: null,
          ascSortToggle: false,
          selectedPage: 0,
        })
      } else {
        this.setState({
          initialUpload: false,
          initialTableDisplay: false,
          fileOK: false,
          fileDataHeaders: [],
          fileDataContent: [],
          filteredFileDataContent: [],
          checkedOptionKey: null,
          numberOfPages: 0,
          selectedHeader: null,
          ascSortToggle: false,
          selectedPage: 0,
        })
      }
    }
  }

  static getDataLink(rowContent) {
    const linkData = WORD_REPORT_EXCEL_GENERATION_QUERY_VARIABLES.map((k, i) => `${k}=${rowContent[i]}`)
    return linkData.join('&').trim().replace(/\s/g, '%20')
  }

  handleRowOptionClick(rowContent, checkedState) {
    if (this.state.checkedOptionKey == null) {
      if (checkedState) {
        this.setState({
          checkedOptionKey: rowContent.join(''),
          linkData: `&${ReportUploadModal.getDataLink(rowContent)}`,
        })
      } else {
        this.setState({
          checkedOptionKey: null,
          linkData: null,
        })
      }
    } else {
      this.setState({
        checkedOptionKey: rowContent.join(''),
        linkData: `&${ReportUploadModal.getDataLink(rowContent)}`,
      })
    }
  }

  static fileDataContainsSearchData = (fileDataContentArray, searchValue) => {

    if (searchValue === undefined || searchValue === '') {
      return true
    }

    const filteredData = Object.values(fileDataContentArray).filter((fileDataContent) => {
      return fileDataContent.indexOf(searchValue) !== -1
    })
    return filteredData.length > 0
  }

  static getNumberOfPages(dataContent, rowsPerPage) {
    if (dataContent.length === 0) {
      return 0
    }
    return Math.ceil(dataContent.length / rowsPerPage)
  }

  handleXLSSearch(searchValue) {
    const fileDataContent = Object.values(this.state.fileDataContent).map((fileDataContentRow) => {
      if (ReportUploadModal.fileDataContainsSearchData(fileDataContentRow, searchValue)) {
        return fileDataContentRow
      }
      return []
    })
    const filteredFileDataContent = Object.values(fileDataContent).filter((fileDataContentData) => {
      return fileDataContentData.length > 0
    })
    const filteredAndSortedFileDataContent = ReportUploadModal.sortDataByHeader(this.state.selectedHeader, this.state.fileDataHeaders, filteredFileDataContent, this.state.ascSortToggle, false)
    this.setState({
      numberOfPages: ReportUploadModal.getNumberOfPages(filteredFileDataContent, this.state.rowsPerPage),
      filteredFileDataContent: ReportUploadModal.paginateData(0, filteredAndSortedFileDataContent, this.state.rowsPerPage).paginatedData,
      selectedPage: 1,
    })
  }

  static getDerivedStateFromProps(props, currentState) {
    if (currentState.modalToggle !== props.modalToggle) {
      return {
        modalOpen: true,
        modalClosing: false,
      }
    }
    if (currentState.modalClosing) {
      return {
        modalClosing: false,
      }
    }

    return null
  }

  static sortDataByHeader(header, headers, dataContent, ascSortToggle, shouldChangeToggle = true) {

    let ascToggle = ascSortToggle
    if (shouldChangeToggle) {
      ascToggle = !ascSortToggle
    }

    const headerValueIndex = headers.indexOf(header)

    if (headerValueIndex !== -1) {
      const mappedContentArray = dataContent.map((tableContentDataArray, index) => {
        return {
          arrayValue: tableContentDataArray[headerValueIndex],
          arrayPositionIndex: index,
        }
      })

      mappedContentArray.sort((a, b) => {
        if (Number.isNaN(Number.parseInt(a.arrayValue, 10)) && Number.isNaN(Number.parseInt(b.arrayValue, 10))) {
          if (ascToggle) {
            return a.arrayValue.localeCompare(b.arrayValue)
          }
          return b.arrayValue.localeCompare(a.arrayValue)
        }
        else if (!Number.isNaN(Number.parseInt(a.arrayValue, 10)) && !Number.isNaN(Number.parseInt(b.arrayValue, 10))) {
          if (ascToggle) {
            return parseInt(a.arrayValue, 10) - parseInt(b.arrayValue, 10)
          }
          return parseInt(b.arrayValue, 10) - parseInt(a.arrayValue, 10)
        }
        return 0
      })
      return mappedContentArray.map((mappedContent) => {
        return dataContent[mappedContent.arrayPositionIndex]
      })
    }
    return dataContent
  }

  handleSort(header) {
    const sortedContentArray = ReportUploadModal.sortDataByHeader(header, this.state.fileDataHeaders, this.state.fileDataContent, this.state.ascSortToggle)

    this.setState({
      fileDataContent: sortedContentArray,
      filteredFileDataContent: ReportUploadModal.paginateData(this.state.selectedPage, sortedContentArray, this.state.rowsPerPage).paginatedData,
      ascSortToggle: !this.state.ascSortToggle,
      selectedHeader: header,
    })
  }

  handlePageSelect(newPage) {
    const { paginatedData } = ReportUploadModal.paginateData(newPage, this.state.fileDataContent, this.state.rowsPerPage)
    this.setState({
      filteredFileDataContent: paginatedData,
      selectedPage: newPage,
    })
  }

  static paginateData(newPage, dataToPaginate, rowsPerPage) {
    const startIndex = (newPage * rowsPerPage)
    let endIndex = (newPage * rowsPerPage) + (rowsPerPage - 1)

    if (endIndex > dataToPaginate.length) {
      endIndex = dataToPaginate.length - 1
    }
    return {
      paginatedData: dataToPaginate.slice(startIndex, endIndex + 1),
    }
  }

  render() {
    const errorMessageStyle = {
      paddingTop: '15px',
    }
    const checkboxTableStyle = {
      maxHeight: '180px',
      overflowY: 'auto',
    }
    const tableDataSearchStyle = {
      textAlign: 'center',
    }
    const searchInputStyle = {
      width: '250px',
    }
    const displayGenerateButton = !this.state.fileOK || this.state.checkedOptionKey === null
    const errorMessageContent = `It seems that the uploaded file is missing some required headers. Please review the file and upload it again. ${this.state.missingHeadersMessage}`
    const buttonClassName = !displayGenerateButton ? 'ui primary button' : 'ui primary button disabled'
    const xlsButtonClassName = 'ui download button'
    const xlsFileDownloadLink = ''
    return (
      <ModalComponent
        isOpen={this.state.modalOpen}
        open={this.openModal}
        close={this.closeModal}
        title="Upload Excel File With Additional Fields"
        modalName={this.modalName}
        size="fullscreen"
        id="reportUploadModal"
      >
        <FileUploadField
          clearTimeOut={0}
          dropzoneLabel="Click here to upload the excel file with additional fields, which will be used to generate word report"
          auto
          required
          name="excelUploadField"
          returnParsedData
          onChange={(e, data) => { this.handleUpload(e, data) }}
        />
        {!this.state.initialUpload && !this.state.fileOK &&
        <Grid.Row style={errorMessageStyle}>
          <Grid.Column>
            <Message error content={errorMessageContent} />
          </Grid.Column>
        </Grid.Row>
        }
        {!this.state.initialTableDisplay && this.state.fileOK &&
        <div>
          <VerticalSpacer height={45} />
          <div style={tableDataSearchStyle}>
            {/* eslint-disable-next-line jsx-a11y/label-has-for */}
            <label> Search uploaded data: </label>
            <BaseSemanticInput
              inputType="Input"
              onChange={(searchVal) => { this.handleXLSSearch(searchVal) }}
              inputStyle={searchInputStyle}
            />
          </div>
          <VerticalSpacer height={15} />
          <div style={checkboxTableStyle}>
            <CheckboxTableGroup
              tableHeaders={this.state.fileDataHeaders}
              tableContent={this.state.filteredFileDataContent}
              checkedOptionKey={this.state.checkedOptionKey}
              onRowOptionClick={this.handleRowOptionClick}
              tableKey="excelUploadCheckboxGroup"
              handleSort={this.handleSort}
              selectedHeader={this.state.selectedHeader}
              handlePageSelect={this.handlePageSelect}
              numberOfPages={this.state.numberOfPages}
              selectedPage={this.state.selectedPage}
            />
          </div>
          <VerticalSpacer height={5} />
        </div>
        }
        <Divider />
        <a href={`${this.props.docUrl}${this.state.linkData}`} className={buttonClassName} >Generate</a>
        <a href={`${xlsFileDownloadLink}`} className={xlsButtonClassName} download>Download Excel File Template</a>
      </ModalComponent>
    )
  }
}

const mapDispatchToProps = { setModalConfirm, closeModal }
export const UploadExcelFileModal = reduxForm({
  form: 'reportUploadFormModal',
})(connect(null, mapDispatchToProps)(ReportUploadModal))
