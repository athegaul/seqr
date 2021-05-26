import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Grid, Divider, Popup, Label, Button, Header } from 'semantic-ui-react'

import { CLINSIG_SEVERITY, getVariantMainGeneId } from 'shared/utils/constants'
import { TagFieldDisplay } from '../view-fields/TagFieldView'
import FamilyReads from '../FamilyReads'
import FamilyVariantTags, { LoadedFamilyLabel, taggedByPopup } from './FamilyVariantTags'
import Annotations from './Annotations'
import Pathogenicity from './Pathogenicity'
import Predictions from './Predictions'
import Frequencies from './Frequencies'
import VariantGenes, { VariantGene } from './VariantGene'
import VariantIndividuals from './VariantIndividuals'
import { VerticalSpacer } from '../../Spacers'
import Acmg from '../acmg/Acmg'

const StyledVariantRow = styled(({ isCompoundHet, isSV, severity, ...props }) => <Grid.Row {...props} />)`  
  .column {
   ${(props => props.isCompoundHet) ? // eslint-disable-line  no-constant-condition
    '{ margin-top: 0em !important; margin-left: 1em !important; }' :
    '{ margin-top: 1em !important; margin-bottom: 0 !important; margin-left: 1em !important; }'}
  }
  
  padding: 0;
  color: #999;
  background-color: ${({ severity, isSV }) => {
    if (severity > 0) {
      return '#eaa8a857'
    } else if (severity === 0) {
      return '#f5d55c57'
    } else if (severity < 0) {
      return '#21a92624'
    } else if (isSV) {
      return '#f3f8fa'
    }
    return 'inherit'
  }}
`

const StyledCompoundHetRows = styled(Grid)`
  margin-left: 0em !important;
  margin-right: 1em !important;
  margin-top: 0em !important;
  margin-bottom: 0 !important;
`

const InlinePopup = styled(Popup).attrs({ basic: true, flowing: true })`
  padding: 0.2em !important;
  box-shadow: none !important;
  z-index: 10 !important;
`

const tagFamily = tag =>
  <LoadedFamilyLabel
    familyGuid={tag.savedVariant.familyGuid}
    path={`saved_variants/variant/${tag.savedVariant.variantGuid}`}
    disableEdit
    target="_blank"
  />

const Variant = React.memo(({ variant, isCompoundHet, mainGeneId, affectedIndividuals, linkToSavedVariants, reads, showReads, rowIndividualIdx }) => {
  if (!mainGeneId) {
    mainGeneId = getVariantMainGeneId(variant)
  }

  const severity = CLINSIG_SEVERITY[((variant.clinvar || {}).clinicalSignificance || '').toLowerCase()]
  return (
    <StyledVariantRow key={variant.variant} severity={severity} isSV={!!variant.svType} isCompoundHet >
      <Grid.Column width={16}>
        <Pathogenicity variant={variant} />
        {variant.discoveryTags && variant.discoveryTags.length > 0 &&
          <InlinePopup
            on="click"
            position="right center"
            trigger={<Button as={Label} basic color="grey">Other Project Discovery Tags</Button>}
            content={<TagFieldDisplay
              displayFieldValues={variant.discoveryTags}
              popup={taggedByPopup}
              tagAnnotation={tagFamily}
              displayAnnotationFirst
            />}
          />
        }
      </Grid.Column>
      {variant.familyGuids.map(familyGuid =>
        <Grid.Column key={familyGuid} width={16}>
          <FamilyVariantTags familyGuid={familyGuid} variant={variant} key={variant.variantId} isCompoundHet={isCompoundHet} linkToSavedVariants={linkToSavedVariants} />
        </Grid.Column>,
      )}
      <Grid.Column>
        {variant.svName && <Header size="medium" content={variant.svName} />}
        {!isCompoundHet && mainGeneId && <VariantGene geneId={mainGeneId} variant={variant} />}
        {!isCompoundHet && mainGeneId && Object.keys(variant.transcripts || {}).length > 1 && <Divider />}
        <VariantGenes mainGeneId={mainGeneId} variant={variant} />
        <Acmg variantId={variant.variantId} />
        {isCompoundHet && Object.keys(variant.transcripts || {}).length > 1 && <VerticalSpacer height={20} />}
        {isCompoundHet && <VariantIndividuals variant={variant} affectedIndividuals={affectedIndividuals} isCompoundHet />}
        {isCompoundHet && showReads}
      </Grid.Column>
      <Grid.Column><Annotations variant={variant} /></Grid.Column>
      <Grid.Column><Predictions variant={variant} /></Grid.Column>
      <Grid.Column><Frequencies variant={variant} /></Grid.Column>
      {!isCompoundHet &&
        <Grid.Column width={16}>
          <VariantIndividuals variant={variant} affectedIndividuals={affectedIndividuals} rowIndividualIdx={rowIndividualIdx} />
          {showReads}
        </Grid.Column>}
      <Grid.Column width={16}>
        {reads}
      </Grid.Column>
    </StyledVariantRow>
  )
})

Variant.propTypes = {
  variant: PropTypes.object,
  isCompoundHet: PropTypes.bool,
  mainGeneId: PropTypes.string,
  affectedIndividuals: PropTypes.array,
  linkToSavedVariants: PropTypes.bool,
  reads: PropTypes.object,
  showReads: PropTypes.object,
  rowIndividualIdx: PropTypes.number,
}

const VariantWithReads = props => <FamilyReads layout={Variant} {...props} />

const CompoundHets = React.memo(({ variants, affectedIndividuals, rowIndividualIdx, ...props }) => {
  const sharedGeneIds = Object.keys(variants[0].transcripts).filter(geneId => geneId in variants[1].transcripts)
  let mainGeneId = sharedGeneIds[0]
  if (sharedGeneIds.length > 1) {
    const mainGene1 = getVariantMainGeneId(variants[0])
    if (sharedGeneIds.includes(mainGene1)) {
      mainGeneId = mainGene1
    } else {
      const mainGene2 = getVariantMainGeneId(variants[1])
      if (sharedGeneIds.includes(mainGene2)) {
        mainGeneId = mainGene2
      }
    }
  }

  return (
    <StyledVariantRow>
      <VerticalSpacer height={16} />
      {variants[0].familyGuids.map(familyGuid =>
        <Grid.Column key={familyGuid} width={16}>
          <FamilyVariantTags familyGuid={familyGuid} variant={variants} />
        </Grid.Column>,
      )}
      <Grid.Column width={16}>
        {mainGeneId && <VariantGene geneId={mainGeneId} variant={variants[0]} areCompoundHets />}
      </Grid.Column>
      <StyledCompoundHetRows stackable columns="equal">
        {variants.map(compoundHet =>
          <VariantWithReads variant={compoundHet} key={compoundHet.variantId} affectedIndividuals={affectedIndividuals} rowIndividualIdx={rowIndividualIdx} mainGeneId={mainGeneId} isCompoundHet {...props} />,
        )}
      </StyledCompoundHetRows>
    </StyledVariantRow>
  )
})


CompoundHets.propTypes = {
  variants: PropTypes.array,
  affectedIndividuals: PropTypes.array,
  rowIndividualIdx: PropTypes.number,
}

const Variants = React.memo(({ variants, affectedIndividuals, ...props }) => (
  <Grid stackable divided="vertically" columns="equal">
    {variants.map((variant, rowIndividualIdx) => (Array.isArray(variant) ?
      <CompoundHets variants={variant} key={`${variant.map(v => v.variantId).join()}-${variant[0].familyGuids.join('-')}`} affectedIndividuals={affectedIndividuals} rowIndividualIdx={rowIndividualIdx} {...props} /> :
      <VariantWithReads variant={variant} key={`${variant.variantId}-${variant.familyGuids.join('-')}`} affectedIndividuals={affectedIndividuals} rowIndividualIdx={rowIndividualIdx} {...props} />
    ))}
  </Grid>
))

Variants.propTypes = {
  variants: PropTypes.array,
  affectedIndividuals: PropTypes.array,
}

export default Variants
