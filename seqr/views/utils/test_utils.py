# Utilities used for unit and integration tests.
from django.contrib.auth.models import User, Group
from django.test import TestCase
from guardian.shortcuts import assign_perm
import json
from urllib3_mock import Responses

from seqr.models import Project, CAN_VIEW, CAN_EDIT


class AuthenticationTestCase(TestCase):

    STAFF = 'staff'
    MANAGER = 'manager'
    COLLABORATOR = 'collaborator'
    AUTHENTICATED_USER = 'authenticated'

    @classmethod
    def setUpTestData(cls):
        cls.staff_user = User.objects.get(username='test_user')
        cls.manager_user = User.objects.get(username='test_user_manager')
        cls.collaborator_user = User.objects.get(username='test_user_non_staff')
        cls.no_access_user = User.objects.get(username='test_user_no_access')

        edit_group = Group.objects.get(pk=2)
        view_group = Group.objects.get(pk=3)
        edit_group.user_set.add(cls.manager_user)
        view_group.user_set.add(cls.manager_user, cls.collaborator_user)
        assign_perm(user_or_group=edit_group, perm=CAN_EDIT, obj=Project.objects.all())
        assign_perm(user_or_group=view_group, perm=CAN_VIEW, obj=Project.objects.all())

    def check_require_login(self, url):
        self._check_login(url, self.AUTHENTICATED_USER)

    def check_collaborator_login(self, url, **request_kwargs):
        self._check_login(url, self.COLLABORATOR, **request_kwargs)

    def check_manager_login(self, url):
        self._check_login(url, self.MANAGER)

    def check_staff_login(self, url):
        self._check_login(url, self.STAFF)

    def login_base_user(self):
        self.client.force_login(self.no_access_user)

    def login_collaborator(self):
        self.client.force_login(self.collaborator_user)

    def login_staff_user(self):
        self.client.force_login(self.staff_user)

    def _check_login(self, url, permission_level, request_data=None):
        """For integration tests of django views that can only be accessed by a logged-in user,
        the 1st step is to authenticate. This function checks that the given url redirects requests
        if the user isn't logged-in, and then authenticates a test user.

        Args:
            test_case (object): the django.TestCase or unittest.TestCase object
            url (string): The url of the django view being tested.
            permission_level (string): what level of permission this url requires
         """
        response = self.client.get(url)
        self.assertEqual(response.status_code, 302)  # check that it redirects if you don't login

        self.client.force_login(self.no_access_user)
        if permission_level == self.AUTHENTICATED_USER:
            return

        # check that users without view permission users can't access collaborator URLs
        if permission_level == self.COLLABORATOR:
            if request_data:
                response = self.client.post(url, content_type='application/json', data=json.dumps(request_data))
            else:
                response = self.client.get(url)
            self.assertEqual(response.status_code, 403)

        self.login_collaborator()
        if permission_level == self.COLLABORATOR:
            return

        response = self.client.get(url)
        self.assertEqual(response.status_code, 403 if permission_level == self.MANAGER else 302)

        self.client.force_login(self.manager_user)
        if permission_level == self.MANAGER:
            return

        response = self.client.get(url)
        self.assertEqual(response.status_code, 302)

        self.login_staff_user()

# The responses library for mocking requests does not work with urllib3 (which is used by elasticsearch)
# The urllib3_mock library works for those requests, but it has limited functionality, so this extension adds helper
# methods for easier usage
class Urllib3Responses(Responses):
    def add_json(self, url, json_response, method=None, match_querystring=True, **kwargs):
        if not method:
            method = self.GET
        body = json.dumps(json_response)
        self.add(method, url, match_querystring=match_querystring, content_type='application/json', body=body, **kwargs)

    def replace_json(self, url, *args, **kwargs):
        existing_index = next(i for i, match in enumerate(self._urls) if match['url'] == url)
        self.add_json(url, *args, **kwargs)
        self._urls[existing_index] = self._urls.pop()

    def call_request_json(self, index=-1):
        return json.loads(self.calls[index].request.body)


urllib3_responses = Urllib3Responses()


USER_FIELDS = {'dateJoined', 'email', 'firstName', 'isStaff', 'lastLogin', 'lastName', 'username', 'displayName', 'id', 'isAnvil'}

PROJECT_FIELDS = {
    'projectGuid', 'projectCategoryGuids', 'canEdit', 'name', 'description', 'createdDate', 'lastModifiedDate',
    'lastAccessedDate',  'mmeContactUrl', 'genomeVersion', 'mmePrimaryDataOwner', 'mmeContactInstitution',
    'isMmeEnabled', 'workspaceName', 'workspaceNamespace'
}

FAMILY_FIELDS = {
    'projectGuid', 'familyGuid', 'analysedBy', 'pedigreeImage', 'familyId', 'displayName', 'description',
    'analysisNotes', 'analysisSummary', 'analysisStatus', 'pedigreeImage', 'createdDate', 'assignedAnalyst',
    'codedPhenotype', 'postDiscoveryOmimNumber', 'pubmedIds', 'mmeNotes',
}

INTERNAL_FAMILY_FIELDS = {
    'internalAnalysisStatus', 'internalCaseReviewNotes', 'internalCaseReviewSummary', 'individualGuids', 'successStory',
    'successStoryTypes',
}
INTERNAL_FAMILY_FIELDS.update(FAMILY_FIELDS)

INDIVIDUAL_FIELDS_NO_FEATURES = {
    'projectGuid', 'familyGuid', 'individualGuid', 'caseReviewStatusLastModifiedBy', 'individualId',
    'paternalId', 'maternalId', 'sex', 'affected', 'displayName', 'notes', 'createdDate', 'lastModifiedDate',
    'paternalGuid', 'maternalGuid', 'popPlatformFilters', 'filterFlags', 'population', 'birthYear', 'deathYear',
    'onsetAge', 'maternalEthnicity', 'paternalEthnicity', 'consanguinity', 'affectedRelatives', 'expectedInheritance',
    'disorders', 'candidateGenes', 'rejectedGenes', 'arFertilityMeds', 'arIui', 'arIvf', 'arIcsi', 'arSurrogacy',
    'arDonoregg', 'arDonorsperm', 'svFlags',
}

INDIVIDUAL_FIELDS = {'features', 'absentFeatures', 'nonstandardFeatures', 'absentNonstandardFeatures'}
INDIVIDUAL_FIELDS.update(INDIVIDUAL_FIELDS_NO_FEATURES)

INTERNAL_INDIVIDUAL_FIELDS = {
    'caseReviewStatus', 'caseReviewDiscussion', 'caseReviewStatusLastModifiedDate', 'caseReviewStatusLastModifiedBy',
    'probandRelationship',
}
INTERNAL_INDIVIDUAL_FIELDS.update(INDIVIDUAL_FIELDS)

SAMPLE_FIELDS = {
    'projectGuid', 'individualGuid', 'sampleGuid', 'createdDate', 'sampleType', 'sampleId', 'isActive',
    'loadedDate', 'datasetType',
}

IGV_SAMPLE_FIELDS = {
    'projectGuid', 'individualGuid', 'sampleGuid', 'filePath',
}

SAVED_VARIANT_FIELDS = {'variantGuid', 'variantId', 'familyGuids', 'xpos', 'ref', 'alt', 'selectedMainTranscriptId'}

TAG_FIELDS = {'tagGuid', 'name', 'category', 'color', 'searchHash', 'lastModifiedDate', 'createdBy', 'variantGuids'}

VARIANT_NOTE_FIELDS = {'noteGuid', 'note', 'submitToClinvar', 'lastModifiedDate', 'createdBy', 'variantGuids'}

FUNCTIONAL_FIELDS = {
    'tagGuid', 'name', 'color', 'metadata', 'metadataTitle', 'lastModifiedDate', 'createdBy', 'variantGuids',
}

SAVED_SEARCH_FIELDS = {'savedSearchGuid', 'name', 'search', 'createdById'}

LOCUS_LIST_FIELDS = {
    'locusListGuid', 'description', 'lastModifiedDate', 'numEntries', 'isPublic', 'createdBy', 'createdDate', 'canEdit',
    'name',
}
LOCUS_LIST_DETAIL_FIELDS = {'items', 'intervalGenomeVersion'}
LOCUS_LIST_DETAIL_FIELDS.update(LOCUS_LIST_FIELDS)

GENE_FIELDS = {
    'chromGrch37', 'chromGrch38', 'codingRegionSizeGrch37', 'codingRegionSizeGrch38',  'endGrch37', 'endGrch38',
    'gencodeGeneType', 'geneId', 'geneSymbol', 'startGrch37', 'startGrch38',
}

GENE_DETAIL_FIELDS = {
    'constraints', 'diseaseDesc', 'functionDesc', 'notes', 'omimPhenotypes', 'mimNumber', 'mgiMarkerId', 'geneNames',
}
GENE_DETAIL_FIELDS.update(GENE_FIELDS)

VARIANTS = [
    {
        'alt': 'G',
        'ref': 'GAGA',
        'chrom': '21',
        'pos': 3343400,
        'xpos': 21003343400,
        'genomeVersion': '38',
        'liftedOverChrom': '21',
        'liftedOverPos': 3343353,
        'liftedOverGenomeVersion': '37',
        'variantId': '21-3343400-GAGA-G',
        'mainTranscriptId': 'ENST00000623083',
        'transcripts': {
            'ENSG00000227232': [
                {
                    'aminoAcids': 'G/S',
                    'geneSymbol': 'WASH7P',
                    'biotype': 'protein_coding',
                    'category': 'missense',
                    'cdnaEnd': 1075,
                    'cdnaStart': 1075,
                    'codons': 'Ggt/Agt',
                    'consequenceTerms': ['missense_variant'],
                    'hgvs': 'ENSP00000485442.1:p.Gly359Ser',
                    'hgvsc': 'ENST00000623083.3:c.1075G>A',
                    'hgvsp': 'ENSP00000485442.1:p.Gly359Ser',
                    'majorConsequence': 'missense_variant',
                    'majorConsequenceRank': 11,
                    'proteinId': 'ENSP00000485442',
                    'transcriptId': 'ENST00000623083',
                    'transcriptRank': 0
                }
            ],
            'ENSG00000268903': [
                {
                    'aminoAcids': 'G/S',
                    'biotype': 'protein_coding',
                    'category': 'missense',
                    'cdnaEnd': 1338,
                    'cdnaStart': 1338,
                    'codons': 'Ggt/Agt',
                    'consequenceTerms': ['missense_variant'],
                    'geneId': 'ENSG00000268903',
                    'hgvs': 'ENSP00000485351.1:p.Gly368Ser',
                    'hgvsc': 'ENST00000624735.1:c.1102G>A',
                    'hgvsp': 'ENSP00000485351.1:p.Gly368Ser',
                    'majorConsequence': 'missense_variant',
                    'majorConsequenceRank': 11,
                    'proteinId': 'ENSP00000485351',
                    'transcriptId': 'ENST00000624735',
                    'transcriptRank': 1
                }
            ]
        },
        'familyGuids': ['F000001_1', 'F000002_2'],
        'genotypes': {
            'NA19675': {
                'sampleId': 'NA19675',
                'ab': 0.702127659574,
                'gq': 46.0,
                'numAlt': 1,
                'dp': '50',
                'ad': '14,33'
            },
            'NA19679': {
                'sampleId': 'NA19679',
                'ab': 0.0,
                'gq': 99.0,
                'numAlt': 0,
                'dp': '45',
                'ad': '45,0'
            }
        }
    },
    {
        'alt': 'A',
        'ref': 'AAAG',
        'chrom': '3',
        'pos': 835,
        'xpos': 3000000835,
        'genomeVersion': '37',
        'liftedOverGenomeVersion': '',
        'variantId': '3-835-AAAG-A',
        'transcripts': {},
        'familyGuids': ['F000001_1'],
        'genotypes': {
            'NA19679': {
                'sampleId': 'NA19679',
                'ab': 0.0,
                'gq': 99.0,
                'numAlt': 0,
                'dp': '45',
                'ad': '45,0'
            }
        }
    },
    {
        'alt': 'T',
        'ref': 'TC',
        'chrom': '12',
        'pos': 48367227,
        'xpos': 1248367227,
        'genomeVersion': '37',
        'liftedOverGenomeVersion': '',
        'variantId': '12-48367227-TC-T',
        'transcripts': {'ENSG00000233653': {}},
        'familyGuids': ['F000002_2'],
        'genotypes': {}
    }
]

SINGLE_VARIANT = {
    'alt': 'A',
    'ref': 'G',
    'chrom': '1',
    'pos': 46394160,
    'xpos': 1046394160,
    'genomeVersion': '38',
    'liftedOverGenomeVersion': '37',
    'variantId': '1-46394160-G-A',
    'transcripts': {'ENSG00000233653': {}},
    'familyGuids': ['F000002_2'],
    'genotypes': {}
}

TRANSCRIPT_1 = {
  'aminoAcids': 'LL/L',
  'biotype': 'protein_coding',
  'lof': None,
  'lofFlags': None,
  'majorConsequenceRank': 10,
  'codons': 'ctTCTc/ctc',
  'geneSymbol': 'MFSD9',
  'domains': [
    'Transmembrane_helices:TMhelix',
    'PROSITE_profiles:PS50850',
  ],
  'canonical': 1,
  'transcriptRank': 0,
  'cdnaEnd': 421,
  'lofFilter': None,
  'hgvs': 'ENSP00000258436.5:p.Leu126del',
  'hgvsc': 'ENST00000258436.5:c.375_377delTCT',
  'cdnaStart': 419,
  'transcriptId': 'ENST00000258436',
  'proteinId': 'ENSP00000258436',
  'category': 'missense',
  'geneId': 'ENSG00000135953',
  'hgvsp': 'ENSP00000258436.5:p.Leu126del',
  'majorConsequence': 'inframe_deletion',
  'consequenceTerms': [
    'inframe_deletion'
  ]
}
TRANSCRIPT_2 = {
  'aminoAcids': 'P/X',
  'biotype': 'protein_coding',
  'lof': None,
  'lofFlags': None,
  'majorConsequenceRank': 4,
  'codons': 'Ccc/cc',
  'geneSymbol': 'OR2M3',
  'domains': [
    'Transmembrane_helices:TMhelix',
    'Prints_domain:PR00237',
  ],
  'canonical': 1,
  'transcriptRank': 0,
  'cdnaEnd': 897,
  'lofFilter': None,
  'hgvs': 'ENSP00000389625.1:p.Leu288SerfsTer10',
  'hgvsc': 'ENST00000456743.1:c.862delC',
  'cdnaStart': 897,
  'transcriptId': 'ENST00000456743',
  'proteinId': 'ENSP00000389625',
  'category': 'lof',
  'geneId': 'ENSG00000228198',
  'hgvsp': 'ENSP00000389625.1:p.Leu288SerfsTer10',
  'majorConsequence': 'frameshift_variant',
  'consequenceTerms': [
    'frameshift_variant'
  ]
}
TRANSCRIPT_3 = {
  'aminoAcids': 'LL/L',
  'biotype': 'nonsense_mediated_decay',
  'lof': None,
  'lofFlags': None,
  'majorConsequenceRank': 10,
  'codons': 'ctTCTc/ctc',
  'geneSymbol': 'MFSD9',
  'domains': [
    'Transmembrane_helices:TMhelix',
    'Gene3D:1',
  ],
  'canonical': None,
  'transcriptRank': 1,
  'cdnaEnd': 143,
  'lofFilter': None,
  'hgvs': 'ENSP00000413641.1:p.Leu48del',
  'hgvsc': 'ENST00000428085.1:c.141_143delTCT',
  'cdnaStart': 141,
  'transcriptId': 'ENST00000428085',
  'proteinId': 'ENSP00000413641',
  'category': 'missense',
  'geneId': 'ENSG00000135953',
  'hgvsp': 'ENSP00000413641.1:p.Leu48del',
  'majorConsequence': 'frameshift_variant',
  'consequenceTerms': [
    'frameshift_variant',
    'inframe_deletion',
    'NMD_transcript_variant'
  ]
}

PARSED_VARIANTS = [
    {
        'alt': 'T',
        'chrom': '1',
        'clinvar': {'clinicalSignificance': None, 'alleleId': None, 'variationId': None, 'goldStars': None},
        'familyGuids': ['F000003_3'],
        'genotypes': {
            'I000007_na20870': {
                'ab': 1, 'ad': None, 'gq': 99, 'sampleId': 'NA20870', 'numAlt': 2, 'dp': 74, 'pl': None,
                'cn': 2, 'end': None, 'start': None, 'numExon': None, 'defragged': None, 'qs': None,
            }
        },
        'genomeVersion': '37',
        'genotypeFilters': '',
        'hgmd': {'accession': None, 'class': None},
        'liftedOverChrom': None,
        'liftedOverGenomeVersion': None,
        'liftedOverPos': None,
        'mainTranscriptId': TRANSCRIPT_3['transcriptId'],
        'originalAltAlleles': ['T'],
        'populations': {
            'callset': {'an': 32, 'ac': 2, 'hom': None, 'af': 0.063, 'hemi': None, 'filter_af': None},
            'g1k': {'an': 0, 'ac': 0, 'hom': 0, 'af': 0.0, 'hemi': 0, 'filter_af': None},
            'gnomad_genomes': {'an': 30946, 'ac': 4, 'hom': 0, 'af': 0.00012925741614425127, 'hemi': 0, 'filter_af': 0.000437},
            'exac': {'an': 121308, 'ac': 8, 'hom': 0, 'af': 0.00006589, 'hemi': 0, 'filter_af': 0.0006726888333653661},
            'gnomad_exomes': {'an': 245930, 'ac': 16, 'hom': 0, 'af': 0.00006505916317651364, 'hemi': 0, 'filter_af': 0.0009151523074911753},
            'topmed': {'an': 125568, 'ac': 21, 'hom': 0, 'af': 0.00016724, 'hemi': 0, 'filter_af': None},
            'sv_callset': {'an': None, 'ac': None, 'hom': None, 'af': None, 'hemi': None, 'filter_af': None},
        },
        'pos': 248367227,
        'predictions': {'splice_ai': None, 'eigen': None, 'revel': None, 'mut_taster': None, 'fathmm': None,
                        'polyphen': None, 'dann': None, 'sift': None, 'cadd': '25.9', 'metasvm': None, 'primate_ai': None,
                        'gerp_rs': None, 'mpc': None, 'phastcons_100_vert': None, 'strvctvre': None,
                        'splice_ai_consequence': None},
        'ref': 'TC',
        'rsid': None,
        'transcripts': {
            'ENSG00000135953': [TRANSCRIPT_3],
            'ENSG00000228198': [TRANSCRIPT_2],
        },
        'variantId': '1-248367227-TC-T',
        'xpos': 1248367227,
        'end': None,
        'svType': None,
        'numExon': None,
        '_sort': [1248367227],
    },
    {
        'alt': 'G',
        'chrom': '2',
        'clinvar': {'clinicalSignificance': None, 'alleleId': None, 'variationId': None, 'goldStars': None},
        'familyGuids': ['F000002_2', 'F000003_3'],
        'genotypes': {
            'I000004_hg00731': {
                'ab': 0, 'ad': None, 'gq': 99, 'sampleId': 'HG00731', 'numAlt': 0, 'dp': 67, 'pl': None,
                'cn': 2, 'end': None, 'start': None, 'numExon': None, 'defragged': None, 'qs': None,
            },
            'I000005_hg00732': {
                'ab': 0, 'ad': None, 'gq': 96, 'sampleId': 'HG00732', 'numAlt': 2, 'dp': 42, 'pl': None,
                'cn': 2, 'end': None, 'start': None, 'numExon': None, 'defragged': None, 'qs': None,
            },
            'I000006_hg00733': {
                'ab': 0, 'ad': None, 'gq': 96, 'sampleId': 'HG00733', 'numAlt': 1, 'dp': 42, 'pl': None,
                'cn': 2, 'end': None, 'start': None, 'numExon': None, 'defragged': None, 'qs': None,
            },
            'I000007_na20870': {
                'ab': 0.70212764, 'ad': None, 'gq': 46, 'sampleId': 'NA20870', 'numAlt': 1, 'dp': 50, 'pl': None,
                'cn': 2, 'end': None, 'start': None, 'numExon': None, 'defragged': None, 'qs': None,
            }
        },
        'genotypeFilters': '',
        'genomeVersion': '37',
        'hgmd': {'accession': None, 'class': None},
        'liftedOverGenomeVersion': None,
        'liftedOverChrom': None,
        'liftedOverPos': None,
        'mainTranscriptId': TRANSCRIPT_1['transcriptId'],
        'originalAltAlleles': ['G'],
        'populations': {
            'callset': {'an': 32, 'ac': 1, 'hom': None, 'af': 0.031, 'hemi': None, 'filter_af': None},
            'g1k': {'an': 0, 'ac': 0, 'hom': 0, 'af': 0.0, 'hemi': 0, 'filter_af': None},
            'gnomad_genomes': {'an': 0, 'ac': 0, 'hom': 0, 'af': 0.0, 'hemi': 0, 'filter_af': None},
            'exac': {'an': 121336, 'ac': 6, 'hom': 0, 'af': 0.00004942, 'hemi': 0, 'filter_af': 0.000242306760358614},
            'gnomad_exomes': {'an': 245714, 'ac': 6, 'hom': 0, 'af': 0.000024418633044922146, 'hemi': 0, 'filter_af': 0.00016269686320447742},
            'topmed': {'an': 0, 'ac': 0, 'hom': 0, 'af': 0.0, 'hemi': 0, 'filter_af': None},
            'sv_callset': {'an': None, 'ac': None, 'hom': None, 'af': None, 'hemi': None, 'filter_af': None},
        },
        'pos': 103343353,
        'predictions': {
            'splice_ai': None, 'eigen': None, 'revel': None, 'mut_taster': None, 'fathmm': None, 'polyphen': None,
            'dann': None, 'sift': None, 'cadd': None, 'metasvm': None, 'primate_ai': 1, 'gerp_rs': None,
            'mpc': None, 'phastcons_100_vert': None, 'strvctvre': None, 'splice_ai_consequence': None,
        },
        'ref': 'GAGA',
        'rsid': None,
        'transcripts': {
            'ENSG00000135953': [TRANSCRIPT_1],
            'ENSG00000228198': [TRANSCRIPT_2],
        },
        'variantId': '2-103343353-GAGA-G',
        'xpos': 2103343353,
        'end': None,
        'svType': None,
        'numExon': None,
        '_sort': [2103343353],
    },
]
PARSED_SV_VARIANT = {
    'alt': None,
    'chrom': '1',
    'familyGuids': ['F000002_2'],
    'genotypes': {
        'I000004_hg00731': {
            'ab': None, 'ad': None, 'gq': None, 'sampleId': 'HG00731', 'numAlt': -1, 'dp': None, 'pl': None,
            'cn': 1, 'end': None, 'start': None, 'numExon': 2, 'defragged': False, 'qs': 33,
        },
        'I000005_hg00732': {
            'ab': None, 'ad': None, 'gq': None, 'sampleId': 'HG00732', 'numAlt': -1, 'dp': None, 'pl': None,
            'cn': 2, 'end': None, 'start': None, 'numExon': None, 'defragged': None, 'qs': None, 'isRef': True,
        },
    },
    'clinvar': {'clinicalSignificance': None, 'alleleId': None, 'variationId': None, 'goldStars': None},
    'hgmd': {'accession': None, 'class': None},
    'genomeVersion': '37',
    'genotypeFilters': [],
    'liftedOverChrom': None,
    'liftedOverGenomeVersion': None,
    'liftedOverPos': None,
    'mainTranscriptId': None,
    'originalAltAlleles': [],
    'populations': {
        'callset': {'an': None, 'ac': None, 'hom': None, 'af': None, 'hemi': None, 'filter_af': None},
        'g1k': {'an': None, 'ac': None, 'hom': None, 'af': None, 'hemi': None, 'filter_af': None},
        'gnomad_genomes': {'an': None, 'ac': None, 'hom': None, 'af': None, 'hemi': None, 'filter_af': None},
        'exac': {'an': None, 'ac': None, 'hom': None, 'af': None, 'hemi': None, 'filter_af': None},
        'gnomad_exomes': {'an': None, 'ac': None, 'hom': None, 'af': None, 'hemi': None, 'filter_af': None},
        'topmed': {'an': None, 'ac': None, 'hom': None, 'af': None, 'hemi': None, 'filter_af': None},
        'sv_callset': {'an': 10088, 'ac': 7, 'hom': None, 'af': 0.000693825, 'hemi': None, 'filter_af': None},
    },
    'pos': 49045487,
    'predictions': {'splice_ai': None, 'eigen': None, 'revel': None, 'mut_taster': None, 'fathmm': None,
                    'polyphen': None, 'dann': None, 'sift': None, 'cadd': None, 'metasvm': None, 'primate_ai': None,
                    'gerp_rs': None, 'mpc': None, 'phastcons_100_vert': None, 'strvctvre': 0.374,
                    'splice_ai_consequence': None},
    'ref': None,
    'rsid': None,
    'transcripts': {
        'ENSG00000228198': [
            {
              'transcriptId': 'ENST00000371839',
              'biotype': 'protein_coding',
              'geneId': 'ENSG00000228198'
            },
            {
              'transcriptId': 'ENST00000416121',
              'biotype': 'protein_coding',
              'geneId': 'ENSG00000228198'
            },
        ],
    },
    'variantId': 'prefix_19107_DEL',
    'xpos': 1049045487,
    'end': 49045899,
    'svType': 'DEL',
    'numExon': 2,
    '_sort': [1049045387],
}

GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'