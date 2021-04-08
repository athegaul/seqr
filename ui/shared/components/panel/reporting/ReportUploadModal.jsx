import React from 'react'
import PropTypes from 'prop-types'
import { Button, Divider, Grid, Message } from 'semantic-ui-react'
import { reduxForm } from 'redux-form'

import DispatchRequestButton from 'shared/components/buttons/DispatchRequestButton'
import { ModalComponent } from 'shared/components/modal/Modal'
import { connect } from 'react-redux'
import { setModalConfirm, closeModal } from '../../../../redux/utils/modalReducer'
import FileUploadField from '../../form/XHRUploaderField'
import { WORD_REPORT_EXCEL_GENERATION_HEADERS } from '../../../utils/constants'


class ReportUploadModal extends React.PureComponent {

  static propTypes = {
    modalName: PropTypes.string,
    modalToggle: PropTypes.any,
  }

  constructor(props) {
    super(props)

    this.state = {
      linkData: [],
      fileDataHeader: [],
      fileDataContent: [],
      modalToggle: props.modalToggle,
      modalOpen: false,
      modalClosing: false,
      fileOK: false,
      initialUpload: true,
    }
    this.modalName = props.modalName

    this.handleUpload = this.handleUpload.bind(this)
    this.submit = this.submit.bind(this)
    this.closeModal = this.closeModal.bind(this)
  }

  submit = () => {
    this.state.linkData.push('Hello')
    this.closeModal()
  }

  closeModal = () => {
    this.setState({
      modalOpen: false,
      modalClosing: true,
      modalToggle: !this.state.modalToggle,
      initialUpload: true,
    })
  }

  handleUpload(e, data) {
    if (data.uploadedFileId) {
      const { parsedData } = data
      const [parsedDataHeaders, ...parsedDataContent] = parsedData

      const headerIsComplete = () => {
        const headerDifference = WORD_REPORT_EXCEL_GENERATION_HEADERS.filter(x => !parsedDataHeaders.includes(x))
        return headerDifference.length === 0
      }

      if (headerIsComplete()) {
        this.setState({
          initialUpload: false,
          fileOK: true,
          fileDataHeader: parsedDataHeaders,
          fileDataContent: parsedDataContent,
        })
      } else {
        this.setState({
          initialUpload: false,
          fileOK: false,
          fileDataHeader: [],
          fileDataContent: [],
        })
      }
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
            <Message error content="It seems that the uploaded file is missing some required headers. Please review the file and upload it again" />
          </Grid.Column>
        </Grid.Row>
        }
        <Divider />
        <DispatchRequestButton
          onSubmit={this.submit}
          onSuccess={this.closeModal}
          confirmDialog="Are you sure want to generate a report using selected file?"
        >
          <Button content="Generate" primary disabled={!this.state.fileOK} />
        </DispatchRequestButton>
      </ModalComponent>
    )
  }
}

const mapDispatchToProps = { setModalConfirm, closeModal }
export const UploadExcelFileModal = reduxForm({
  form: 'reportUploadFormModal',
})(connect(null, mapDispatchToProps)(ReportUploadModal))
