import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { NavLink } from 'react-router-dom'
import { Icon, Popup } from 'semantic-ui-react'
import styled from 'styled-components'
import intersection from 'lodash/intersection'

import { updateVariantNote, updateVariantTags } from 'redux/rootReducer'
import {
  getProjectsByGuid,
  getFamiliesByGuid,
  getSavedVariantsGroupedByFamilyVariants,
  getVariantId,
  getNotesGroupedByFamilyVariants,
} from 'redux/selectors'
import {
  DISCOVERY_CATEGORY_NAME,
  NOTE_TAG_NAME,
  FAMILY_FIELD_DESCRIPTION,
  FAMILY_FIELD_ANALYSIS_STATUS,
  FAMILY_FIELD_ANALYSIS_NOTES,
  FAMILY_FIELD_ANALYSIS_SUMMARY,
  FAMILY_FIELD_INTERNAL_NOTES,
  FAMILY_FIELD_INTERNAL_SUMMARY,
  FAMILY_ANALYSIS_STATUS_LOOKUP,
} from 'shared/utils/constants'
import PopupWithModal from '../../PopupWithModal'
import { HorizontalSpacer, VerticalSpacer } from '../../Spacers'
import { InlineHeader, ColoredComponent } from '../../StyledComponents'
import ReduxFormWrapper from '../../form/ReduxFormWrapper'
import { InlineToggle, BooleanCheckbox } from '../../form/Inputs'
import TagFieldView from '../view-fields/TagFieldView'
import TextFieldView from '../view-fields/TextFieldView'
import Family from '../family'

const TagTitle = styled.span`
  font-weight: bolder;
  margin-right: 5px;
  vertical-align: top;
`

const InlineContainer = styled.div`
  display: inline-block;
  vertical-align: top;
  
  .form {
    display: inline-block;
  }
`

const NoteContainer = styled.div`
  color: black;
  white-space: normal;
  display: inline-block;
  max-width: calc(100% - 50px);
  
  > span {
    display: flex;
  }
`

const VariantLinkContainer = styled(InlineContainer)`
  float: right;
`

const ColoredLink = ColoredComponent(NavLink)

const FAMILY_FIELDS = [
  { id: FAMILY_FIELD_DESCRIPTION, canEdit: true },
  { id: FAMILY_FIELD_ANALYSIS_STATUS, canEdit: true },
  { id: FAMILY_FIELD_ANALYSIS_NOTES, canEdit: true },
  { id: FAMILY_FIELD_ANALYSIS_SUMMARY, canEdit: true },
  { id: FAMILY_FIELD_INTERNAL_NOTES },
  { id: FAMILY_FIELD_INTERNAL_SUMMARY },
]

const FAMILY_POPUP_STYLE = { maxWidth: '1200px' }

const NO_DISPLAY = { display: 'none' }

const SHORTCUT_TAGS = ['Review', 'Excluded']

const VARIANT_NOTE_FIELDS = [{
  name: 'submitToClinvar',
  label: <label>Add to <i style={{ color: 'red' }}>ClinVar</i> submission</label>, //eslint-disable-line jsx-a11y/label-has-for
  component: BooleanCheckbox,
  style: { paddingTop: '2em' },
},
{
  name: 'saveAsGeneNote',
  label: 'Add to public gene notes',
  component: BooleanCheckbox,
}]

const taggedByPopup = (tag, title) => trigger =>
  <Popup
    position="top right"
    size="tiny"
    trigger={trigger}
    header={title || 'Tagged by'}
    hoverable
    flowing
    content={
      <div>
        {tag.createdBy || 'unknown user'}
        {tag.lastModifiedDate && <span>&nbsp; on {new Date(tag.lastModifiedDate).toLocaleDateString()}</span>}
        {tag.metadata && <div>{tag.metadataTitle ? <span><b>{tag.metadataTitle}:</b> {tag.metadata}</span> : <i>{tag.metadata}</i>}</div>}
        {tag.searchHash && <div><NavLink to={`/variant_search/results/${tag.searchHash}`}>Re-run search</NavLink></div>}
        {/* TODO deprecate and migrate searchParameters to searchHash */}
        {tag.searchParameters && <div><a href={tag.searchParameters} target="_blank">Re-run search</a></div>}
      </div>
    }
  />


const ShortcutTagToggle = ({ tag, ...props }) => {
  const toggle = <InlineToggle color={tag && tag.color} divided {...props} value={tag} />
  return tag ? taggedByPopup(tag)(toggle) : toggle
}

ShortcutTagToggle.propTypes = {
  tag: PropTypes.object,
}

const ShortcutTags = ({ variant, dispatchUpdateFamilyVariantTags, familyGuid }) => {
  const singleVariant = Array.isArray(variant) ? variant[0] : variant
  const tags = Array.isArray(variant) ? intersection(variant[0].tags, variant[1].tags) : variant.tags
  const appliedShortcutTags = SHORTCUT_TAGS.reduce((acc, tagName) => {
    const appliedTag = (singleVariant.tags || []).find(tag => tag.name === tagName)
    return appliedTag ? { ...acc, [tagName]: appliedTag } : acc
  }, {})
  const shortcutTagFields = SHORTCUT_TAGS.map(tagName => ({
    name: tagName,
    label: tagName,
    component: ShortcutTagToggle,
    tag: appliedShortcutTags[tagName],
  }))

  const onSubmit = (values) => {
    const updatedTags = Object.keys(values).reduce((allTags, tagName) => {
      const applied = values[tagName]
      if (applied) {
        return [...allTags, { name: tagName }]
      }
      return allTags.filter(tag => tag.name !== tagName)
    }, tags || [])
    // TODO improve this to take in both variants <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    return dispatchUpdateFamilyVariantTags({
      ...singleVariant,
      tags: updatedTags,
      compoundHetGuids: Array.isArray(variant) ? variant.map(compoundHet => compoundHet.variantGuid) : null,
    })
  }

  return (
    <InlineContainer>
      <ReduxFormWrapper
        onSubmit={onSubmit}
        form={`editShorcutTags-${variant.variantId}-${familyGuid}`}
        initialValues={appliedShortcutTags}
        closeOnSuccess={false}
        submitOnChange
        fields={shortcutTagFields}
      />
    </InlineContainer>
  )
}

ShortcutTags.propTypes = {
  variant: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  dispatchUpdateFamilyVariantTags: PropTypes.func,
  familyGuid: PropTypes.string.isRequired,
}


const VariantTagField = ({ variant, fieldName, family, ...props }) => {
  const variantNames = (Array.isArray(variant) ? variant : [variant]).map(eachVariant => `chr${eachVariant.chrom}:${eachVariant.pos} ${eachVariant.ref} > ${eachVariant.alt}`)
  return (
    <TagFieldView
      idField="variantId"
      modalId={family.familyGuid}
      modalTitle={`Edit Variant ${fieldName} for Family ${family.displayName} for ${variantNames.join(', ')}`}
      modalSize="large"
      editLabel={`Edit ${fieldName}`}
      initialValues={variant}
      compact
      isEditable
      popup={taggedByPopup}
      {...props}
    />
  )
}


VariantTagField.propTypes = {
  variant: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  fieldName: PropTypes.string,
  family: PropTypes.object.isRequired,
}

const VariantNoteField = ({ action, note, variant, family, ...props }) => {
  const values = { ...variant, ...note }
  return <TextFieldView
    noModal
    showInLine
    isEditable
    field="note"
    modalId={family.familyGuid}
    modalTitle={`${action} Variant Note for Family ${family.displayName}`}
    additionalEditFields={VARIANT_NOTE_FIELDS}
    initialValues={values}
    idField={note ? 'noteGuid' : 'variantId'}
    deleteConfirm="Are you sure you want to delete this note?"
    textPopup={note && taggedByPopup(note, 'Note By')}
    {...props}
  />
}

VariantNoteField.propTypes = {
  note: PropTypes.object,
  variant: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  action: PropTypes.string,
  family: PropTypes.object.isRequired,
}

const VariantLink = (
  { variant, savedVariant, family },
) =>
  <VariantLinkContainer>
    <NavLink
      to={savedVariant ?
        `/project/${family.projectGuid}/saved_variants/variant/${savedVariant.variantGuid}` :
        `/variant_search/variant/${variant.variantId}/family/${family.familyGuid}`
      }
      activeStyle={NO_DISPLAY}
    >
      <Popup
        trigger={<Icon name="linkify" link />}
        content={`Go to the page for this individual variant ${variant.variantId} from family ${family.familyId}. Note: There is no additional information on this page, it is intended for sharing specific variants.`}
        position="right center"
        wide
      />
    </NavLink>
  </VariantLinkContainer>

VariantLink.propTypes = {
  variant: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  savedVariant: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  family: PropTypes.object,
}

const FamilyVariantTags = (
  { variant, savedVariant, family, project, dispatchUpdateVariantNote, dispatchUpdateFamilyVariantTags, isCompoundHet, areCompoundHets, notes },
) => {
  if (family) {
    const displayVariant = areCompoundHets ? savedVariant.map((eachSavedVariant, index) => eachSavedVariant || variant[index]) : savedVariant || variant

    if (areCompoundHets) {
      notes = notes.sharedNotes
    }
    else if (isCompoundHet) {
      notes = notes.individualNotes
    }
    else {
      notes = (savedVariant && savedVariant.notes) || []
    }

    const tags = (areCompoundHets ? ((savedVariant || [])[0] || {}).tags : (savedVariant && savedVariant.tags)) || []

    return (
      <div>
        {!isCompoundHet &&
        <InlineContainer>
          <InlineHeader size="small">
            Family<HorizontalSpacer width={5} />
            <PopupWithModal
              hoverable
              style={FAMILY_POPUP_STYLE}
              position="right center"
              keepInViewPort
              trigger={
                <ColoredLink
                  to={`/project/${family.projectGuid}/family_page/${family.familyGuid}`}
                  color={FAMILY_ANALYSIS_STATUS_LOOKUP[family[FAMILY_FIELD_ANALYSIS_STATUS]].color}
                >
                  {family.displayName}
                </ColoredLink>
              }
              content={<Family family={family} fields={FAMILY_FIELDS} useFullWidth disablePedigreeZoom />}
            />
          </InlineHeader>
        </InlineContainer>}
        <InlineContainer>
          {isCompoundHet && <VerticalSpacer height={5} />}
          <div>
            <TagTitle>Tags:</TagTitle>
            <HorizontalSpacer width={5} />
            {!isCompoundHet && <ShortcutTags variant={displayVariant} familyGuid={family.familyGuid} dispatchUpdateFamilyVariantTags={dispatchUpdateFamilyVariantTags} />}
            <VariantTagField
              field="tags"
              fieldName="Tags"
              family={family}
              variant={displayVariant}
              tagOptions={project.variantTagTypes.filter(vtt => vtt.name !== NOTE_TAG_NAME)}
              onSubmit={dispatchUpdateFamilyVariantTags}
            />
            <HorizontalSpacer width={5} />
            {tags.some(tag => tag.category === DISCOVERY_CATEGORY_NAME) &&
            <span>
              <TagTitle>Fxnl Data:</TagTitle>
              <VariantTagField
                field="functionalData"
                fieldName="Fxnl Data"
                family={family}
                variant={displayVariant}
                tagOptions={project.variantFunctionalTagTypes}
                editMetadata
                onSubmit={dispatchUpdateFamilyVariantTags}
              />
              <HorizontalSpacer width={5} />
            </span>
            }
          </div>
          {isCompoundHet && <VerticalSpacer height={5} />}
          <div>
            <TagTitle>Notes:</TagTitle>
            <NoteContainer>
              {notes.map(note =>
                <VariantNoteField
                  key={note.noteGuid}
                  note={note}
                  variant={displayVariant}
                  family={family}
                  isDeletable
                  compact
                  action="Edit"
                  onSubmit={dispatchUpdateVariantNote}
                />,
              )}
              <VariantNoteField
                variant={displayVariant}
                family={family}
                editIconName="plus"
                editLabel="Add Note"
                action="Add"
                onSubmit={dispatchUpdateVariantNote}
              />
            </NoteContainer>
          </div>
          {isCompoundHet && <VerticalSpacer height={5} />}
        </InlineContainer>
        {!areCompoundHets && <VariantLink variant={variant} savedVariant={savedVariant} family={family} />}
      </div>)
  }
  return null
}

FamilyVariantTags.propTypes = {
  variant: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  savedVariant: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  project: PropTypes.object,
  family: PropTypes.object,
  isCompoundHet: PropTypes.bool,
  areCompoundHets: PropTypes.bool,
  dispatchUpdateVariantNote: PropTypes.func,
  dispatchUpdateFamilyVariantTags: PropTypes.func,
  notes: PropTypes.object,
}

const mapStateToProps = (state, ownProps) => ({
  family: getFamiliesByGuid(state)[ownProps.familyGuid],
  project: getProjectsByGuid(state)[(getFamiliesByGuid(state)[ownProps.familyGuid] || {}).projectGuid],
  savedVariant: (getSavedVariantsGroupedByFamilyVariants(state)[ownProps.familyGuid] || {})[getVariantId(ownProps.variant)]
  || (ownProps.areCompoundHets ? ownProps.variant.map(eachVariant => (getSavedVariantsGroupedByFamilyVariants(state)[ownProps.familyGuid] || {})[getVariantId(eachVariant)]) : undefined),
  notes: (getNotesGroupedByFamilyVariants(state)[ownProps.familyGuid] || {})[getVariantId(ownProps.areCompoundHets ? ownProps.variant[0] : ownProps.variant)] || { sharedNotes: [], individualNotes: [] },
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  dispatchUpdateVariantNote: (updates) => {
    dispatch(updateVariantNote({ ...updates, familyGuid: ownProps.familyGuid }))
  },
  dispatchUpdateFamilyVariantTags: (updates) => {
    dispatch(updateVariantTags({ ...updates, familyGuid: ownProps.familyGuid }))
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(FamilyVariantTags)
