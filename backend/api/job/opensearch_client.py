from opensearchpy import OpenSearch
from django.conf import settings

# You should set these in your Django settings or .env
OPENSEARCH_HOST = str(getattr(settings, 'OPENSEARCH_HOST', 'localhost'))
OPENSEARCH_PORT = int(getattr(settings, 'OPENSEARCH_PORT', 9200))  # Ensure port is int
OPENSEARCH_USER = str(getattr(settings, 'OPENSEARCH_USER', '') or '')
OPENSEARCH_PASS = str(getattr(settings, 'OPENSEARCH_PASS', '') or '')

client = OpenSearch(
    hosts=[{'host': OPENSEARCH_HOST, 'port': OPENSEARCH_PORT}],
    http_auth=(OPENSEARCH_USER, OPENSEARCH_PASS) if OPENSEARCH_USER and OPENSEARCH_PASS else None,  # For master user
    use_ssl=True,
    verify_certs=True,
    ssl_assert_hostname=False,
    ssl_show_warn=True,
)

def get_opensearch_client():
    return client
