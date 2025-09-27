from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models_job import Job
from .search_indexing import index_job, delete_job_from_index

@receiver(post_save, sender=Job)
def index_job_on_save(sender, instance, **kwargs):
    index_job(instance)

@receiver(post_delete, sender=Job)
def delete_job_on_delete(sender, instance, **kwargs):
    delete_job_from_index(instance.id)
