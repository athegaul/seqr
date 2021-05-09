import React from 'react'
import PropTypes from 'prop-types'
import { Divider, Grid, Message } from 'semantic-ui-react'
import { reduxForm } from 'redux-form'
import { connect } from 'react-redux'

import { ModalComponent } from '../../modal/Modal'
import { setModalConfirm, closeModal } from '../../../../redux/utils/modalReducer'
import FileUploadField from '../../form/XHRUploaderField'
import { WORD_REPORT_EXCEL_GENERATION_HEADERS } from '../../../utils/constants'
import SearchableTable from '../../page/SearchableTable'


class ReportUploadModal extends React.PureComponent {

  static propTypes = {
    modalName: PropTypes.string,
    modalToggle: PropTypes.any,
    affectedIndividuals: PropTypes.array,
    docUrl: PropTypes.string,
  }

  constructor(props) {
    super(props)

    this.state = {
      linkData: null,
      affectedIndividualsLink: '',
      fileDataHeaders: [],
      fileDataContent: [],
      affectedIndividualsDataHeaders: ['Index', 'Display Name', 'Family GUID', 'Individual ID', 'Individual GUID'],
      modalToggle: props.modalToggle,
      modalOpen: false,
      modalClosing: false,
      fileOK: false,
      initialUpload: true,
      initialXLSTableDisplay: true,
      missingXLSTableHeadersMessage: null,
      rowsPerPage: 5,
    }
    this.modalName = props.modalName

    this.handleUpload = this.handleUpload.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.getLinkValue = this.getLinkValue.bind(this)
    this.getAffectedPatientsData = this.getAffectedPatientsData.bind(this)
  }

  getLinkValue = (value) => {
    this.setState({
      linkData: value,
    })
  }

  getAffectedIndividualsLinkValue = (selectedAffectedIndividualIndexes) => {
    const selectedAffectedIndividuals = []
    Object.values(selectedAffectedIndividualIndexes).forEach((selectedAffectedIndividualIndex) => {
      selectedAffectedIndividuals.push(this.props.affectedIndividuals[selectedAffectedIndividualIndex])
    })
    this.setState({
      affectedIndividualsLink: `&patients=${btoa(JSON.stringify(selectedAffectedIndividuals))}`,
    })
  }

  closeModal = () => {
    this.setState({
      modalOpen: false,
      modalClosing: true,
      modalToggle: !this.state.modalToggle,
      initialUpload: true,
      missingXLSTableHeadersMessage: null,
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
            missingXLSTableHeadersMessage: `Missing fields are: ${headerDifference.join(',')}`,
          })
        }
        return headerDifference.length === 0
      }

      if (headerIsComplete()) {
        this.setState({
          initialUpload: false,
          initialXLSTableDisplay: false,
          fileOK: true,
          fileDataHeaders: parsedDataHeaders,
          fileDataContent: parsedDataContent,
          missingXLSTableHeadersMessage: null,
        })
      } else {
        this.setState({
          initialUpload: false,
          initialXLSTableDisplay: false,
          fileOK: false,
          fileDataHeaders: [],
          fileDataContent: [],
        })
      }
    }
  }

  getAffectedPatientsData() {
    const affectedPatientsDataContent = []
    this.props.affectedIndividuals.map((affectedIndividualData) => {
      const affectedMember = affectedIndividualData.affectedIndividual
      affectedPatientsDataContent.push([
        affectedIndividualData.rowIdx.toString(),
        affectedMember.displayName,
        affectedMember.familyGuid,
        affectedMember.individualId,
        affectedMember.individualGuid,
      ])
      return affectedIndividualData
    })
    return affectedPatientsDataContent
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

  render() {
    const errorMessageStyle = {
      paddingTop: '15px',
    }
    const displayGenerateButton = !this.state.fileOK || this.state.linkData === null
    const errorMessageContent = `It seems that the uploaded file is missing some required headers. Please review the file and upload it again. ${this.state.missingXLSTableHeadersMessage}`
    const buttonClassName = !displayGenerateButton ? 'ui primary button' : 'ui primary button disabled'
    const xlsButtonClassName = 'ui download button'
    const xlsFileDownloadLink = ''
    const affectedMembers = this.getAffectedPatientsData()
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
        <SearchableTable
          tableHeaders={this.state.affectedIndividualsDataHeaders}
          tableContent={affectedMembers}
          rowsPerPage={this.state.rowsPerPage}
          getLinkData={this.getAffectedIndividualsLinkValue}
          displaySearch
          tableKey="affectedPatientsUploadCheckboxGroup"
          multiSelectEnabled
        />
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
        {!this.state.initialXLSTableDisplay && this.state.fileOK &&
        <SearchableTable
          tableHeaders={this.state.fileDataHeaders}
          tableContent={this.state.fileDataContent}
          rowsPerPage={this.state.rowsPerPage}
          getLinkData={this.getLinkValue}
          displaySearch
          tableKey="excelUploadCheckboxGroup"
        />
        }
        <Divider />
        <a href={`${this.props.docUrl}${this.state.linkData}${this.state.affectedIndividualsLink}`} className={buttonClassName} >Generate</a>
        <a href={`${xlsFileDownloadLink}`} className={xlsButtonClassName} download>Download Excel File Template</a>
      </ModalComponent>
    )
  }
}

const mapDispatchToProps = { setModalConfirm, closeModal }
export const UploadExcelFileModal = reduxForm({
  form: 'reportUploadFormModal',
})(connect(null, mapDispatchToProps)(ReportUploadModal))
