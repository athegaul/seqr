import React from 'react'
import PropTypes from 'prop-types'
import { Button, Divider, Grid, Message } from 'semantic-ui-react'
import { reduxForm } from 'redux-form'
import { connect } from 'react-redux'

import DispatchRequestButton from '../../buttons/DispatchRequestButton'
import { ModalComponent } from '../../modal/Modal'
import { setModalConfirm, closeModal } from '../../../../redux/utils/modalReducer'
import FileUploadField from '../../form/XHRUploaderField'
import { WORD_REPORT_EXCEL_GENERATION_HEADERS, WORD_REPORT_EXCEL_GENERATION_QUERY_VARIABLES } from '../../../utils/constants'
import { CheckboxTableGroup } from '../../form/Inputs'
import { VerticalSpacer } from '../../../components/Spacers'


class ReportUploadModal extends React.PureComponent {

  static propTypes = {
    modalName: PropTypes.string,
    modalToggle: PropTypes.any,
  }

  constructor(props) {
    super(props)

    this.state = {
      linkData: null,
      fileDataHeaders: [],
      fileDataContent: [],
      modalToggle: props.modalToggle,
      modalOpen: false,
      modalClosing: false,
      fileOK: false,
      initialUpload: true,
      initialTableDisplay: true,
      checkedOptionKey: null,
      missingHeadersMessage: null,
    }
    this.modalName = props.modalName

    this.handleUpload = this.handleUpload.bind(this)
    this.submit = this.submit.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.handleRowOptionClick = this.handleRowOptionClick.bind(this)
  }

  submit = () => {
    console.log('We should submit the links here!')
    this.closeModal()
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
          missingHeadersMessage: null,
          checkedOptionKey: null,
        })
      } else {
        this.setState({
          initialUpload: false,
          initialTableDisplay: false,
          fileOK: false,
          fileDataHeaders: [],
          fileDataContent: [],
          checkedOptionKey: null,
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
          linkData: `?${ReportUploadModal.getDataLink(rowContent)}`,
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
        linkData: `?${ReportUploadModal.getDataLink(rowContent)}`,
      })
    }
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
    const checkboxTableStyle = {
      maxHeight: '180px',
      overflowY: 'auto',
    }
    const errorMessageContent = `It seems that the uploaded file is missing some required headers. Please review the file and upload it again. ${this.state.missingHeadersMessage}`
    console.log(this.state.linkData)
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
          <VerticalSpacer height={15} />
          <div style={checkboxTableStyle}>
            <CheckboxTableGroup
              tableHeaders={this.state.fileDataHeaders}
              tableContent={this.state.fileDataContent}
              checkedOptionKey={this.state.checkedOptionKey}
              onRowOptionClick={this.handleRowOptionClick}
              tableKey="excelUploadCheckboxGroup"
            />
          </div>
          <VerticalSpacer height={5} />
        </div>
        }
        <Divider />
        <DispatchRequestButton
          onSubmit={this.submit}
          onSuccess={this.closeModal}
          confirmDialog="Are you sure want to generate a report using selected excel file entry?"
        >
          <Button content="Generate" primary disabled={!this.state.fileOK || this.state.checkedOptionKey === null} />
        </DispatchRequestButton>
      </ModalComponent>
    )
  }
}

const mapDispatchToProps = { setModalConfirm, closeModal }
export const UploadExcelFileModal = reduxForm({
  form: 'reportUploadFormModal',
})(connect(null, mapDispatchToProps)(ReportUploadModal))
