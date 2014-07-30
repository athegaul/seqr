from optparse import make_option
from xbrowse_server import xbrowse_controls
from django.core.management.base import BaseCommand


class Command(BaseCommand):

    def handle(self, *args, **options):
        for project_id in args:
            xbrowse_controls.clean_project(project_id)
