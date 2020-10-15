import json
import logging

from django.contrib.auth.decorators import login_required
from django.core.exceptions import PermissionDenied
from django.views.decorators.csrf import csrf_exempt

from seqr.models import GeneNote
from seqr.utils.gene_utils import get_gene, get_genes
from seqr.views.utils.json_to_orm_utils import update_model_from_json
from seqr.views.utils.json_utils import create_json_response
from seqr.views.utils.orm_to_json_utils import get_json_for_gene_notes_by_gene_id
from seqr.views.utils.permissions_utils import is_staff
from settings import API_LOGIN_REQUIRED_URL


logger = logging.getLogger(__name__)


@login_required(login_url=API_LOGIN_REQUIRED_URL)
@csrf_exempt
def genes_info(request):
    gene_ids = request.GET.get('geneIds', '').split(',')
    return create_json_response({'genesById': get_genes(
        gene_ids, add_dbnsfp=True, add_omim=True, add_constraints=True, add_notes=True, add_mgi=True)})


@login_required(login_url=API_LOGIN_REQUIRED_URL)
@csrf_exempt
def gene_info(request, gene_id):
    gene = get_gene(gene_id, request.user)

    return create_json_response({'genesById': {gene_id: gene}})


@login_required(login_url=API_LOGIN_REQUIRED_URL)
@csrf_exempt
def create_gene_note_handler(request, gene_id):
    request_json = json.loads(request.body)
    GeneNote.objects.create(
        note=request_json.get('note'),
        gene_id=gene_id,
        created_by=request.user,
    )

    return create_json_response({'genesById': {gene_id: {
        'notes': _get_gene_notes(gene_id, request.user)
    }}})


@login_required(login_url=API_LOGIN_REQUIRED_URL)
@csrf_exempt
def update_gene_note_handler(request, gene_id, note_guid):
    note = GeneNote.objects.get(guid=note_guid)
    if not _can_edit_note(note, request.user):
        raise PermissionDenied("User does not have permission to edit this note")

    request_json = json.loads(request.body)
    update_model_from_json(note, request_json, allow_unknown_keys=True)

    return create_json_response({'genesById': {gene_id: {
        'notes': _get_gene_notes(gene_id, request.user)
    }}})


@login_required(login_url=API_LOGIN_REQUIRED_URL)
@csrf_exempt
def delete_gene_note_handler(request, gene_id, note_guid):
    note = GeneNote.objects.get(guid=note_guid)
    if not _can_edit_note(note, request.user):
        raise PermissionDenied("User does not have permission to delete this note")

    note.delete()
    return create_json_response({'genesById': {gene_id: {
        'notes': _get_gene_notes(gene_id, request.user)
    }}})


def _get_gene_notes(gene_id, user):
    return get_json_for_gene_notes_by_gene_id([gene_id], user).get(gene_id, [])


def _can_edit_note(note, user):
    return is_staff(user) or user == note.created_by
