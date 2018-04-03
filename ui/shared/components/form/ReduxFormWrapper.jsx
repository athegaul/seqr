import React, { createElement } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form'
import { Form, Message } from 'semantic-ui-react'

import { closeModal, setModalConfirm } from 'redux/utils/modalReducer'
import ButtonPanel from './ButtonPanel'
import RequestStatus from './RequestStatus'

export const validators = {
  required: value => (value ? undefined : 'Required'),
}

const renderField = (props) => {
  const { fieldComponent = Form.Input, meta: { touched, invalid }, input, ...additionalProps } = props
  return createElement(fieldComponent, { error: touched && invalid, ...input, ...additionalProps })
}

renderField.propTypes = {
  fieldComponent: PropTypes.func,
  meta: PropTypes.object,
  input: PropTypes.object,
}

class ReduxFormWrapper extends React.Component {

  static propTypes = {
    /* eslint-disable react/no-unused-prop-types */
    form: PropTypes.string.isRequired,
    modalName: PropTypes.string,
    /* eslint-disable react/no-unused-prop-types */
    onSubmit: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired,
    setModalConfirm: PropTypes.func,
    closeOnSuccess: PropTypes.bool,
    showErrorPanel: PropTypes.bool,
    confirmCloseIfNotSaved: PropTypes.bool,
    cancelButtonText: PropTypes.string,
    submitButtonText: PropTypes.string,
    size: PropTypes.string, // form size (see https://react.semantic-ui.com/collections/form#form-example-size)
    fields: PropTypes.arrayOf(PropTypes.object),
    children: PropTypes.node,
    secondarySubmitButton: PropTypes.node,
    onSecondarySubmit: PropTypes.func,
    // props provided by reduxForm, do not pass explicitly
    submitting: PropTypes.bool,
    submitFailed: PropTypes.bool,
    submitSucceeded: PropTypes.bool,
    invalid: PropTypes.bool,
    dirty: PropTypes.bool,
    error: PropTypes.array,
    warning: PropTypes.string,
    handleSubmit: PropTypes.func,
  }

  static defaultProps = {
    closeOnSuccess: true,
    cancelButtonText: 'Cancel',
    submitButtonText: 'Submit',
  }

  render() {
    let saveStatus = RequestStatus.NONE
    if (this.props.submitSucceeded) {
      saveStatus = RequestStatus.SUCCEEDED
    } else if (this.props.submitFailed) {
      saveStatus = RequestStatus.ERROR
    }
    const saveErrorMessage = (this.props.error && this.props.error.join('; ')) || (this.props.invalid ? 'Invalid input' : 'Unknown')

    const fieldComponents = this.props.children || this.props.fields.map(({ component, name, ...fieldProps }) =>
      <Field key={name} name={name} component={renderField} fieldComponent={component} {...fieldProps} />,
    )

    return (
      <Form onSubmit={this.props.handleSubmit} size={this.props.size} loading={this.props.submitting}>
        {fieldComponents}
        {this.props.showErrorPanel && this.props.warning && <Message warning visible content={this.props.warning} style={{ margin: '0px 20px' }} />}
        {this.props.showErrorPanel && this.props.error && <Message error visible list={this.props.error} style={{ margin: '0px 20px' }} />}
        {
          this.props.secondarySubmitButton && this.props.onSecondarySubmit &&
          React.cloneElement(this.props.secondarySubmitButton, { onClick: this.props.handleSubmit(values => this.props.onSecondarySubmit(values)) })
        }
        <ButtonPanel
          cancelButtonText={this.props.cancelButtonText}
          submitButtonText={this.props.submitButtonText}
          saveStatus={saveStatus}
          saveErrorMessage={saveErrorMessage}
          handleClose={() => this.props.handleClose()}
        />
      </Form>
    )
  }

  componentWillUpdate(nextProps) {
    if (nextProps.submitSucceeded && nextProps.closeOnSuccess) {
      this.props.handleClose(true)
    }
    else if (this.props.confirmCloseIfNotSaved) {
      if (nextProps.dirty && !this.props.dirty) {
        this.props.setModalConfirm('The form contains unsaved changes. Are you sure you want to close it?')
      } else if (!nextProps.dirty && this.props.dirty) {
        this.props.setModalConfirm(null)
      }
    }
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    handleClose: (confirmed) => {
      dispatch(closeModal(ownProps.modalName || ownProps.form, confirmed))
    },
    setModalConfirm: (confirm) => {
      dispatch(setModalConfirm(ownProps.modalName || ownProps.form, confirm))
    },
  }
}


export default reduxForm()(connect(null, mapDispatchToProps)(ReduxFormWrapper))
