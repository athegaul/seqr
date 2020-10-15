"""
APIs used by the main seqr dashboard page
"""

import logging

from django.db import models
from django.contrib.auth.decorators import login_required

from seqr.models import ProjectCategory, Sample, Family, Project
from seqr.views.utils.export_utils import export_table
from seqr.views.utils.json_utils import create_json_response
from seqr.views.utils.orm_to_json_utils import get_json_for_projects
from seqr.views.utils.permissions_utils import get_projects_user_can_view
from seqr.views.utils.terra_api_utils import service_account_session
from settings import API_LOGIN_REQUIRED_URL

logger = logging.getLogger(__name__)


@login_required(login_url=API_LOGIN_REQUIRED_URL)
def dashboard_page_data(request):
    """Returns a JSON object containing information used by the dashboard page:
    ::

      json_response = {
         'user': {..},
         'familiesByGuid': {..},
         'individualsByGuid': {..},
       }
    """
    try:
        projects_by_guid = _get_projects_json(request)
    except Exception as ee:
        return create_json_response({}, status=500, reason='Error: getting project list failed for {}'.format(str(ee)))
    project_categories_by_guid = _retrieve_project_categories_by_guid(projects_by_guid.keys())

    json_response = {
        'projectsByGuid': projects_by_guid,
        'projectCategoriesByGuid': project_categories_by_guid,
    }

    return create_json_response(json_response)


def get_anvil_projects_user_can_view(request):
    """
    . Fetch a workspace list with a false “public” attribute
    . If using a service account, filter out those user doesn’t have access
    . Get a corresponding project list of the workspaces
    . General project jsons
    """
    requested_fields = 'public,workspace.name,workspace.namespace,workspace.workspaceId'
    workspace_list = service_account_session.list_workspaces(requested_fields)
    workspaces = []
    for ws in workspace_list:
        if not ws['public']:
            try:
                acl = service_account_session.get_workspace_acl(ws['workspace']['namespace'], ws['workspace']['name'])
            except Exception:
                acl={}
            if request.session['anvil']['idinfo']['email'] in acl.keys():
                workspaces.append(ws['workspace']['name'])
    return Project.objects.filter(name__in = workspaces)


def _get_projects_json(request):
    projects = get_anvil_projects_user_can_view(request) if request.session.has_key('anvil') else\
        get_projects_user_can_view(request.user)
    if not projects:
        return {}

    projects_with_counts = projects.annotate(
        models.Count('family', distinct=True), models.Count('family__individual', distinct=True),
        models.Count('family__savedvariant', distinct=True))

    req = request if request.session.has_key('anvil') else None
    projects_by_guid = {p['projectGuid']: p for p in get_json_for_projects(projects, user=request.user, request=req)}
    for project in projects_with_counts:
        projects_by_guid[project.guid]['numFamilies'] = project.family__count
        projects_by_guid[project.guid]['numIndividuals'] = project.family__individual__count
        projects_by_guid[project.guid]['numVariantTags'] = project.family__savedvariant__count

    analysis_status_counts = Family.objects.filter(project__in=projects).values(
        'project__guid', 'analysis_status').annotate(count=models.Count('*'))
    for agg in analysis_status_counts:
        project_guid = agg['project__guid']
        if 'analysisStatusCounts' not in projects_by_guid[project_guid]:
            projects_by_guid[project_guid]['analysisStatusCounts'] = {}
        projects_by_guid[project_guid]['analysisStatusCounts'][agg['analysis_status']] = agg['count']

    sample_type_status_counts = Sample.objects.filter(individual__family__project__in=projects, dataset_type=Sample.DATASET_TYPE_VARIANT_CALLS
    ).values(
        'individual__family__project__guid', 'sample_type',
    ).annotate(count=models.Count('individual_id', distinct=True))
    for agg in sample_type_status_counts:
        project_guid = agg['individual__family__project__guid']
        if 'sampleTypeCounts' not in projects_by_guid[project_guid]:
            projects_by_guid[project_guid]['sampleTypeCounts'] = {}
        projects_by_guid[project_guid]['sampleTypeCounts'][agg['sample_type']] = agg['count']

    return projects_by_guid


def _retrieve_project_categories_by_guid(project_guids):
    """Retrieves project categories from the database, and returns a 'project_categories_by_guid' dictionary,
    while also adding a 'projectCategoryGuids' attribute to each project dict in 'projects_by_guid'.

    Args:
        projects_by_guid: Dictionary that maps each project's GUID to a dictionary of key-value
            pairs representing attributes of that project.

    Returns:
        Dictionary that maps each category's GUID to a dictionary of key-value pairs representing
        attributes of that category.
    """
    if len(project_guids) == 0:
        return {}

    # retrieve all project categories
    project_categories = ProjectCategory.objects.filter(projects__guid__in=project_guids).distinct()

    project_categories_by_guid = {}
    for project_category in project_categories:
        project_categories_by_guid[project_category.guid] = project_category.json()

    return project_categories_by_guid


@login_required
def export_projects_table_handler(request):
    file_format = request.GET.get('file_format', 'tsv')

    projects_by_guid = _get_projects_json(request)
    project_categories_by_guid = _retrieve_project_categories_by_guid(projects_by_guid.keys())

    header = [
        'Project',
        'Description',
        'Categories',
        'Created Date',
        'Families',
        'Individuals',
        'Tagged Variants',
        'WES Samples',
        'WGS Samples',
        'RNA Samples',
    ]

    header.extend([label for key, label in Family.ANALYSIS_STATUS_CHOICES if key != 'S'])

    rows = []
    for project in sorted(projects_by_guid.values(), key=lambda project: project.get('name') or project.get('deprecatedProjectId')):
        project_categories = ', '.join(
            [project_categories_by_guid[category_guid]['name'] for category_guid in project.get('projectCategoryGuids')]
        )

        row = [
            project.get('name') or project.get('deprecatedProjectId'),
            project.get('description'),
            project_categories,
            project.get('createdDate'),
            project.get('numFamilies'),
            project.get('numIndividuals'),
            project.get('numVariantTags'),
            project.get('sampleTypeCounts', {}).get(Sample.SAMPLE_TYPE_WES, 0),
            project.get('sampleTypeCounts', {}).get(Sample.SAMPLE_TYPE_WGS, 0),
            project.get('sampleTypeCounts', {}).get(Sample.SAMPLE_TYPE_RNA, 0),
        ]

        row.extend([project.get('analysisStatusCounts', {}).get(key, 0) for key, _ in Family.ANALYSIS_STATUS_CHOICES if key != 'S'])

        rows.append(row)

    try:
        response = export_table('projects', header, rows, file_format)
    except ValueError as e:
        response = create_json_response({'error': str(e)}, status=400)
    return response
