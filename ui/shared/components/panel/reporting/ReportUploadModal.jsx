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
    modalOpen: PropTypes.any,
  }

  constructor(props) {
    super(props)

    this.state = {
      linkData: [],
      modalOpen: props.modalOpen,
      firstOpen: true,
    }
    this.modalName = props.modalName
  }

  submit = () => {
    this.state.linkData.push('Hello')
    console.log('Submit')
  }

  closeModal = () => {
    this.setState({
      modalOpen: false,
      ownUpdate: true,
      firstOpen: false,
    })
  }

  static getDerivedStateFromProps(props, currentState) {
    if (currentState.ownUpdate) {
      return {
        modalOpen: currentState.modalOpen,
        ownUpdate: false,
      }
    }
    if (currentState.firstOpen && currentState.modalOpen !== props.modalOpen) {
      return {
        modalOpen: props.modalOpen,
      }
    }
    if (!currentState.firstOpen) {
      return {
        modalOpen: true,
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
        />
        <Divider />
        <DispatchRequestButton
          onSubmit={this.submit}
          onSuccess={this.closeModal}
          confirmDialog="Are you sure want to generate a report using selected file?"
        >
          <Button content="Submit" primary />
        </DispatchRequestButton>
      </ModalComponent>
    )
  }
}

const mapDispatchToProps = { setModalConfirm, closeModal }
export const UploadExcelFileModal = reduxForm({
  form: 'reportUploadFormModal',
})(connect(null, mapDispatchToProps)(ReportUploadModal))
