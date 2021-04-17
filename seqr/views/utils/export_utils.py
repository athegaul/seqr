from collections import OrderedDict
import json
import openpyxl as xl
from tempfile import NamedTemporaryFile
import zipfile
from io import BytesIO
from docxtpl import DocxTemplate
import calendar
from datetime import date
from seqr.utils.gene_utils import get_genes

from django.http.response import HttpResponse

from seqr.views.utils.json_utils import _to_title_case

from reference_data.models import GeneInfo

DELIMITERS = {
    'csv': ',',
    'tsv': '\t',
}

def get_date():
    todays_date = date.today()
    return f"{calendar.month_name[todays_date.month]}, {todays_date.day}, {todays_date.year}"

def get_doc_template():
    template = DocxTemplate("")
    return template

def get_hgvspc(row):
    header_indices = {
        "hgvsc": 19,
        "hgvsp": 20,
    }

    hgvsc = row[header_indices["hgvsc"]]
    hgvsp = row[header_indices["hgvsp"]]

    result = ""
    if hgvsc != "":
        result += hgvsc
    if hgvsp != "":
        result += f"({hgvsp})"
    return result

def get_gene_type(row):
    gene_symbol = row[4]
    query = f"SELECT id, gencode_gene_type FROM reference_data_geneinfo rdg WHERe gene_symbol = '{gene_symbol}'"
    result = GeneInfo.objects.raw(query)[0]
    return result.gencode_gene_type

def get_doc_response(rows, header, families, doc_values, transcript_keys):
    document_template = get_doc_template()

    generated_file = BytesIO()

    notes_indices = []
    for idx in range(len(header)):
        if "notes" in header[idx]:
            notes_indices.append(idx)

    records = []
    row_idx = 0
    for row in rows:
        for idx in notes_indices:
            if row[idx] != "":
                disease_name, disease_description = _parse_disease_information(transcript_keys[row_idx][0])
                records.append({
                    "message": row[idx],
                    "acmg_criteria": row[len(row) - 2],
                    "variant": get_hgvspc(row),
                    "disease_name": disease_name,
                    "disease_description": disease_description
                })
        row_idx += 1

    filtered_records = []
    for record in records:
        split_note_message = record["message"].rsplit("  ", 1)
        filtered_records.append({
            "message": split_note_message[0],
            "reference": split_note_message[1].split("(")[0],
            "classification": record["acmg_criteria"],
            "variant": record["variant"],
            "disease_name": record["disease_name"],
            "disease_description": record["disease_description"]
        })

    families = [str(family) for family in families]

    data = {
        "date": get_date(),
        "family_id": ",".join(families),
        "records": {
            "based_analysis": filtered_records
        }
    }

    document_template.render({**data, **doc_values})
    document_template.save(generated_file)
    content_length = generated_file.tell()
    generated_file.seek(0)

    response = HttpResponse(
        generated_file.getvalue(),
        content_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
    response["Content-Disposition"] = "attachment; filename=" + "diagnostic_report.docx"
    response["Content-Length"] = content_length
    return response

def _parse_disease_information(gene_id):
    response = get_genes([gene_id], add_dbnsfp=True, add_omim=True, add_constraints=True)
    disease = response[gene_id]["diseaseDesc"]

    if disease == "":
        return "No disease associations", "No disease associations"

    disease_split = disease.split("]:")
  
    disease_name = disease_split[0].replace("DISEASE:", "").replace("[MIM:", "OMIM #").strip()
    disease_description = disease_split[1].replace(";", "").strip()
  
    return disease_name, disease_description

def export_table(filename_prefix, header, rows, file_format='tsv', titlecase_header=True, families=[], doc_values={}, transcript_keys=[]):
    """Generates an HTTP response for a table with the given header and rows, exported into the given file_format.

    Args:
        filename_prefix (string): Filename without the extension.
        header (list): List of column names
        rows (list): List of rows, where each row is a list of column values
        file_format (string): "tsv", "xls", or "json"
    Returns:
        Django HttpResponse object with the table data as an attachment.
    """

    for i, row in enumerate(rows):
        if len(header) != len(row):
            raise ValueError('len(header) != len(row): %s != %s\n%s\n%s' % (
                len(header), len(row), ','.join(header), ','.join(row)))
        rows[i] = ['' if value is None else value for value in row]

    if file_format == "tsv":
        response = HttpResponse(content_type='text/tsv')
        response['Content-Disposition'] = 'attachment; filename="{}.tsv"'.format(filename_prefix).encode('ascii', 'ignore')
        response.writelines(['\t'.join(header)+'\n'])
        response.writelines(('\t'.join(map(str, row))+'\n' for row in rows))
        return response
    elif file_format == "json":
        response = HttpResponse(content_type='application/json')
        response['Content-Disposition'] = 'attachment; filename="{}.json"'.format(filename_prefix).encode('ascii', 'ignore')
        for row in rows:
            json_keys = [s.replace(" ", "_").lower() for s in header]
            json_values = list(map(str, row))
            response.write(json.dumps(OrderedDict(zip(json_keys, json_values)))+'\n')
        return response
    elif file_format == "xls":
        wb = xl.Workbook(write_only=True)
        ws = wb.create_sheet()
        if titlecase_header:
            header = list(map(_to_title_case, header))
        ws.append(header)
        for row in rows:
            ws.append(row)
        with NamedTemporaryFile() as temporary_file:
            wb.save(temporary_file.name)
            temporary_file.seek(0)
            response = HttpResponse(temporary_file.read(), content_type="application/ms-excel")
            response['Content-Disposition'] = 'attachment; filename="{}.xlsx"'.format(filename_prefix).encode('ascii', 'ignore')
            return response
    elif file_format == "doc":
        return get_doc_response(rows, header, families, doc_values, transcript_keys)
    else:
        raise ValueError("Invalid file_format: %s" % file_format)


def export_multiple_files(files, zip_filename, file_format='csv', add_header_prefix=False, blank_value=''):
    if file_format not in DELIMITERS:
        raise ValueError('Invalid file_format: {}'.format(file_format))
    with NamedTemporaryFile() as temp_file:
        with zipfile.ZipFile(temp_file, 'w') as zip_file:
            for filename, header, rows in files:
                header_display = header
                if add_header_prefix:
                    header_display = ['{}-{}'.format(str(header_tuple[0]).zfill(2), header_tuple[1]) for header_tuple in enumerate(header)]
                    header_display[0] = header[0]
                content = DELIMITERS[file_format].join(header_display) + '\n'
                content += '\n'.join([
                    DELIMITERS[file_format].join([row.get(key) or blank_value for key in header]) for row in rows
                ])
                content = str(content.encode('utf-8'), 'ascii', errors='ignore') # Strip unicode chars in the content
                zip_file.writestr('{}.{}'.format(filename, file_format), content)
        temp_file.seek(0)
        response = HttpResponse(temp_file, content_type='application/zip')
        response['Content-Disposition'] = 'attachment; filename="{}.zip"'.format(zip_filename).encode('ascii', 'ignore')
        return response
