import React from 'react'
import PropTypes from 'prop-types'
import { Divider, Grid, Message, Tab, Header, Image } from 'semantic-ui-react'
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
    allAffectedIndividuals: PropTypes.array,
    docUrl: PropTypes.string,
  }

  constructor(props) {
    super(props)

    this.state = {
      linkData: null,
      affectedIndividualsLink: '',
      fileDataHeaders: [],
      fileDataContent: [],
      filteredFileDataContent: [],
      affectedIndividualsDataHeaders: ['Index', 'Display Name', 'Family GUID', 'Individual ID', 'Individual GUID'],
      modalToggle: props.modalToggle,
      modalOpen: false,
      modalClosing: false,
      fileOK: false,
      initialUpload: true,
      initialXLSTableDisplay: true,
      missingXLSTableHeadersMessage: null,
      rowsPerPage: 5,
      selectedAffectedIndividual: null,
      resetSelectedOptionKeysToggle: false,
    }
    this.modalName = props.modalName

    this.handleUpload = this.handleUpload.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.getLinkValue = this.getLinkValue.bind(this)
    this.getAffectedPatientsTab = this.getAffectedPatientsTab.bind(this)
    this.getUploadExcelFileTab = this.getUploadExcelFileTab.bind(this)
    this.setSelectedAffectedIndividual = this.setSelectedAffectedIndividual.bind(this)
    this.handleAffectedPatientSelect = this.handleAffectedPatientSelect.bind(this)
    this.getAffectedPatientLink = this.getAffectedPatientLink.bind(this)
  }

  getLinkValue = (value) => {
    this.setState({
      linkData: value,
    })
  }

  getAffectedPatientLink(selectedAffectedIndividualRowIndex, selectedAffectedIndividualId) {
    const selectedAffectedIndividuals = this.props.allAffectedIndividuals.filter((affectedIndividual) => {
      return affectedIndividual.rowIdx === Number.parseInt(selectedAffectedIndividualRowIndex, 10) && affectedIndividual.affectedIndividual.individualId === selectedAffectedIndividualId
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

  setSelectedAffectedIndividual(selectedAffectedIndividual) {
    this.setState({
      selectedAffectedIndividual,
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
        const displayNameIndex = parsedDataHeaders.indexOf('Display Name')
        const filteredParsedDataContent = parsedDataContent.filter((parsedContentData) => {
          return parsedContentData[displayNameIndex] === this.state.selectedAffectedIndividual
        })
        this.setState({
          initialUpload: false,
          initialXLSTableDisplay: false,
          fileOK: true,
          fileDataHeaders: parsedDataHeaders,
          fileDataContent: parsedDataContent,
          filteredFileDataContent: this.state.selectedAffectedIndividual !== null ? filteredParsedDataContent : parsedDataContent,
          missingXLSTableHeadersMessage: null,
        })
      } else {
        this.setState({
          initialUpload: false,
          initialXLSTableDisplay: false,
          fileOK: false,
          fileDataHeaders: [],
          fileDataContent: [],
          filteredFileDataContent: [],
        })
      }
    }
  }

  static getDerivedStateFromProps(props, currentState) {
    if (currentState.modalToggle !== props.modalToggle) {
      localStorage.setItem('resetIndex', 'yes')
      return {
        modalOpen: true,
        modalClosing: false,
      }
    }
    if (currentState.modalClosing) {
      localStorage.setItem('resetIndex', 'no')
      return {
        modalClosing: false,
      }
    }

    return null
  }

  handleAffectedPatientSelect(affectedPatient) {
    const fileDataDisplayNameIndex = this.state.fileDataHeaders.indexOf('Display Name')
    const filteredFileDataContent = this.state.fileDataContent.filter((fileData) => {
      return fileData[fileDataDisplayNameIndex] === affectedPatient
    })
    this.setState(prevState => ({
      filteredFileDataContent,
      resetSelectedOptionKeysToggle: !prevState.resetSelectedOptionKeysToggle,
    }))
  }

  getAffectedPatientsTab = () => {
    return (
      <Tab.Pane>
        <SearchableTable
          tableHeaders={this.state.affectedIndividualsDataHeaders}
          tableContent={this.props.affectedIndividuals}
          tableEmptyMessage="There are no affected individuals for the current search"
          searchFieldLabel="Search affected individuals data"
          searchFieldHelpText="By using the search field bellow you can search for desired affected patients by their attributes"
          rowsPerPage={this.state.rowsPerPage}
          setSelectedAffectedPatient={this.setSelectedAffectedIndividual}
          displaySearch
          tableKey="affectedPatientsUploadCheckboxGroup"
          handleAffectedPatientSelect={this.handleAffectedPatientSelect}
          getAffectedPatientLink={this.getAffectedPatientLink}
        />
      </Tab.Pane>)
  }

  getUploadExcelFileTab = (errorMessageStyle, errorMessageContent) => {
    return (
      <Tab.Pane>
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
          tableContent={this.state.filteredFileDataContent}
          searchFieldLabel="Search uploaded data"
          searchFieldHelpText="By using the search field bellow you can search for desired rows from uploaded file by their attributes"
          rowsPerPage={this.state.rowsPerPage}
          getLinkData={this.getLinkValue}
          displaySearch
          tableKey="excelUploadCheckboxGroup"
          resetSelectedOptionKeysToggle={this.state.resetSelectedOptionKeysToggle}
        />
        }
      </Tab.Pane>
    )
  }

  howToTab = () => {
    return (
      <Tab.Pane>
        <Header as="h1">Overview</Header>

        <p>Generating a report is based around two tabs, Affected Patients and Upload Excel file.</p>

        <Header as="h2">Affected Patients</Header>
        <p>The Affected Patients tab represents all affected patients that are shown on the current page of found variants. These are either circles or squares that are filled with solid gray color.</p>
        <Image src="/static/images/how-to/generate-report/affected-patients.png" size="massive" />

        <Header as="h2">Upload Excel File</Header>
        <p>Uplaod Excel File tab allows you to upload on the UI side additional patients information such as YOB, Sex, CRGD Accession ID, Test Codes, and similar. These are located at the top of the header docx file.</p>
        <Image src="/static/images/how-to/generate-report/upload-excel-file.png" size="massive" />

        <p>This excel file contains mapping that are mentioned above for each patient</p>
        <Image src="/static/images/how-to/generate-report/excel-file-content.png" size="massive" />

        <Header as="h3">Generating</Header>
        <p>Once you upload your excel file with additional informaton, you will have to select from the Affected Patients tab a patient that you want to be included in the report, including additional information from the Upload Excel File tab. Upload Excel File will have only one patient selected when you select the patient in the Affected Patients tab - so you don&apos;t have to worry about which one to choose. This Affected Patients and Upload Excel File tab selection work based on their display name.</p>
        <p>Once you select your patient, Generate button will become blue, where you can download your report.</p>
        <Image src="/static/images/how-to/generate-report/generate-report.png" size="massive" />
      </Tab.Pane>
    )
  }

  render() {
    const errorMessageStyle = {
      paddingTop: '15px',
    }
    const displayGenerateButton = !this.state.fileOK || this.state.linkData === null
    const errorMessageContent = `It seems that the uploaded file is missing some required headers. Please review the file and upload it again. ${this.state.missingXLSTableHeadersMessage}`
    const buttonClassName = !displayGenerateButton ? 'ui primary button' : 'ui primary button disabled'
    const xlsButtonClassName = 'ui download button'
    const xlsFileDownloadLink = 'http://diagnostic-report-templates.s3.amazonaws.com/XLSX_file_template.xlsx'
    const modalPanes = [
      { menuItem: 'Affected Patients', render: () => this.getAffectedPatientsTab() },
      { menuItem: 'Upload Excel File', render: () => this.getUploadExcelFileTab(errorMessageStyle, errorMessageContent) },
      { menuItem: 'How To', render: () => this.howToTab() },
    ]
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
        <Tab panes={modalPanes} />
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
