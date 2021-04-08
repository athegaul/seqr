import React from 'react'
import PropTypes from 'prop-types'
import { Button, Divider } from 'semantic-ui-react'
import { reduxForm } from 'redux-form'

import DispatchRequestButton from 'shared/components/buttons/DispatchRequestButton'
import { ModalComponent } from 'shared/components/modal/Modal'
import { connect } from 'react-redux'
import { setModalConfirm, closeModal } from '../../../../redux/utils/modalReducer'
import FileUploadField from '../../form/XHRUploaderField'


class ReportUploadModal extends React.PureComponent {

  static propTypes = {
    modalName: PropTypes.string,
    modalToggle: PropTypes.any,
  }

  constructor(props) {
    super(props)

    this.state = {
      linkData: [],
      modalToggle: props.modalToggle,
      modalOpen: false,
      modalClosing: false,
      submitActive: false,
    }
    this.modalName = props.modalName

    this.onUpload = this.onUpload.bind(this)
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
    })
  }

  onUpload(e, data) {
    if (data.uploadedFileId) {
      this.setState({
        submitActive: true,
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
    return (
      <ModalComponent
        isOpen={this.state.modalOpen}
        open={this.openModal}
        close={this.closeModal}
        title="Upload Excel File"
        modalName={this.modalName}
        size="fullscreen"
        id="reportUploadModal"
      >
        <FileUploadField
          clearTimeOut={0}
          dropzoneLabel="Click here to upload an excel file, which will be used for generate a report"
          auto
          required
          name="excelUploadField"
          onChange={(e, data) => { this.onUpload(e, data) }}
        />
        <Divider />
        <DispatchRequestButton
          onSubmit={this.submit}
          onSuccess={this.closeModal}
          confirmDialog="Are you sure want to generate a report using selected file?"
        >
          <Button content="Submit" primary disabled={!this.state.submitActive} />
        </DispatchRequestButton>
      </ModalComponent>
    )
  }
}

const mapDispatchToProps = { setModalConfirm, closeModal }
export const UploadExcelFileModal = reduxForm({
  form: 'reportUploadFormModal',
})(connect(null, mapDispatchToProps)(ReportUploadModal))
