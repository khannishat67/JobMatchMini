from django.apps import AppConfig

class JobConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api.job'

    def ready(self):
        import api.job.signals
        try:
            from api.job.search_indexing import reindex_all_jobs
            reindex_all_jobs()
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"Failed to reindex jobs on startup: {e}")
