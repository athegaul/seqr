# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-06-12 15:13
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('seqr', '0039_merge_20180531_1604'),
    ]

    operations = [
        migrations.AlterField(
            model_name='savedvariant',
            name='project',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='seqr.Project'),
        ),
        migrations.RemoveField(
            model_name='savedvariant',
            name='genome_version',
        ),
        migrations.RemoveField(
            model_name='savedvariant',
            name='lifted_over_genome_version',
        ),
        migrations.RemoveField(
            model_name='savedvariant',
            name='lifted_over_xpos_start',
        ),
    ]
