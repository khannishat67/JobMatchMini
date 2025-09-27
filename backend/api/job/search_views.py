from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .opensearch_client import get_opensearch_client
from .serializers_job import JobSerializer
from .models_job import Job

class JobSearchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '')
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        client = get_opensearch_client()
        # Use wildcard and fuzziness for partial and typo-tolerant matches
        body = {
            "query": {
                "bool": {
                    "should": [
                        {
                            "multi_match": {
                                "query": query,
                                "fields": ["title^3", "company^2", "description", "location", "tags", "employment_type"],
                                "fuzziness": "AUTO"
                            }
                        },
                        {
                            "query_string": {
                                "query": f"*{query}*",
                                "fields": ["title", "company", "description", "location", "tags", "employment_type"],
                                "analyze_wildcard": True
                            }
                        }
                    ]
                }
            },
            "from": (page - 1) * page_size,
            "size": page_size
        }
        resp = client.search(index='job-index', body=body)
        job_ids = [int(hit['_id']) for hit in resp['hits']['hits']]
        jobs = Job.objects.filter(id__in=job_ids)
        # preserve order
        jobs_dict = {job.id: job for job in jobs}
        jobs_ordered = [jobs_dict[jid] for jid in job_ids if jid in jobs_dict]
        serializer = JobSerializer(jobs_ordered, many=True)
        return Response({
            'results': serializer.data,
            'total': resp['hits']['total']['value'],
            'page': page,
            'page_size': page_size
        })
