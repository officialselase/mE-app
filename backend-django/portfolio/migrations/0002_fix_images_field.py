# Generated migration to fix images field constraint

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('portfolio', '0001_initial'),
    ]

    operations = [
        # First, add a temporary field with proper defaults
        migrations.AddField(
            model_name='project',
            name='images_temp',
            field=models.JSONField(default=list, blank=True),
        ),
        # Copy any existing data (though there shouldn't be any)
        migrations.RunSQL(
            "UPDATE projects SET images_temp = COALESCE(images, '[]') WHERE images IS NOT NULL;",
            reverse_sql="UPDATE projects SET images = images_temp;"
        ),
        # Remove the old field
        migrations.RemoveField(
            model_name='project',
            name='images',
        ),
        # Rename the temp field to the correct name
        migrations.RenameField(
            model_name='project',
            old_name='images_temp',
            new_name='images',
        ),
        
        # Do the same for technologies field to be safe
        migrations.AddField(
            model_name='project',
            name='technologies_temp',
            field=models.JSONField(default=list, blank=True),
        ),
        migrations.RunSQL(
            "UPDATE projects SET technologies_temp = COALESCE(technologies, '[]') WHERE technologies IS NOT NULL;",
            reverse_sql="UPDATE projects SET technologies = technologies_temp;"
        ),
        migrations.RemoveField(
            model_name='project',
            name='technologies',
        ),
        migrations.RenameField(
            model_name='project',
            old_name='technologies_temp',
            new_name='technologies',
        ),
        
        # Fix WorkExperience technologies field too
        migrations.AddField(
            model_name='workexperience',
            name='technologies_temp',
            field=models.JSONField(default=list, blank=True),
        ),
        migrations.RunSQL(
            "UPDATE work_experience SET technologies_temp = COALESCE(technologies, '[]') WHERE technologies IS NOT NULL;",
            reverse_sql="UPDATE work_experience SET technologies = technologies_temp;"
        ),
        migrations.RemoveField(
            model_name='workexperience',
            name='technologies',
        ),
        migrations.RenameField(
            model_name='workexperience',
            old_name='technologies_temp',
            new_name='technologies',
        ),
        
        # Fix Thought tags field
        migrations.AddField(
            model_name='thought',
            name='tags_temp',
            field=models.JSONField(default=list, blank=True),
        ),
        migrations.RunSQL(
            "UPDATE thoughts SET tags_temp = COALESCE(tags, '[]') WHERE tags IS NOT NULL;",
            reverse_sql="UPDATE thoughts SET tags = tags_temp;"
        ),
        migrations.RemoveField(
            model_name='thought',
            name='tags',
        ),
        migrations.RenameField(
            model_name='thought',
            old_name='tags_temp',
            new_name='tags',
        ),
    ]