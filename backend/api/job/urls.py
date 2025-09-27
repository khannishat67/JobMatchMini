from django.urls import path
from .views_job import JobListCreateView, JobRetrieveUpdateDestroyView, ApplyJobView, JobApplicantsListView
from .search_views import JobSearchView

urlpatterns = [
    path('jobs/', JobListCreateView.as_view(), name='job-list-create'),
    path('jobs/<int:pk>/', JobRetrieveUpdateDestroyView.as_view(), name='job-detail'),
    path('jobs/<int:job_id>/apply/', ApplyJobView.as_view(), name='job-apply'),
    path('jobs/<int:job_id>/applicants/', JobApplicantsListView.as_view(), name='job-applicants'),
    path('jobs/search/', JobSearchView.as_view(), name='job-search'),
]
