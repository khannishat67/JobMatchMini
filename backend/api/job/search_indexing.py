from .models_job import Job
from .opensearch_client import get_opensearch_client

INDEX_NAME = 'job-index'

# Index or update a job document in OpenSearch

def index_job(job: Job):
    client = get_opensearch_client()
    doc = {
        'id': job.id,
        'title': job.title,
        'company': job.company,
        'description': job.description,
        'location': job.location,
        'tags': job.tags,
        'employment_type': job.employment_type,
        'created_at': job.created_at.isoformat(),
    }
    client.index(index=INDEX_NAME, id=job.id, body=doc)

# Remove a job from the index

def delete_job_from_index(job_id):
    client = get_opensearch_client()
    client.delete(index=INDEX_NAME, id=job_id, ignore=[404])

# Bulk reindex all jobs (for initial setup or reindexing)
def reindex_all_jobs():
    import logging
    logger = logging.getLogger(__name__)
    client = get_opensearch_client()
    jobs = Job.objects.all()
    logger.info(f"Reindexing {jobs.count()} jobs to OpenSearch...")
    actions = [
        {
            '_op_type': 'index',
            '_index': INDEX_NAME,
            '_id': job.id,
            '_source': {
                'id': job.id,
                'title': job.title,
                'company': job.company,
                'description': job.description,
                'location': job.location,
                'tags': job.tags,
                'employment_type': job.employment_type,
                'created_at': job.created_at.isoformat(),
            }
        }
        for job in jobs
    ]
    from opensearchpy.helpers import bulk
    try:
        success, errors = bulk(client, actions, stats_only=True)
        logger.info(f"Bulk index result: {success} successes, {errors} errors")
    except Exception as e:
        logger.error(f"Bulk indexing failed: {e}")
