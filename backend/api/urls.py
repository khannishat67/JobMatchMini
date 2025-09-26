from django.urls import path
from .views import (
    UserLoginView, UserRegisterView, CurrentUserView, UpdateCurrentUserView, DeleteCurrentUserView,
    JobListCreateView, JobRetrieveUpdateDestroyView, ApplyJobView, JobApplicantsListView
)
from api.user.views_cv import UserCVUploadView
from django.contrib import admin
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('login/', UserLoginView.as_view(), name='login'),
    path('register/', UserRegisterView.as_view(), name='register'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('me/update/', UpdateCurrentUserView.as_view(), name='update-current-user'),
    path('me/delete/', DeleteCurrentUserView.as_view(), name='delete-current-user'),
        path('me/upload-cv/', UserCVUploadView.as_view(), name='upload-cv'),
    # Job APIs
    path('jobs/', JobListCreateView.as_view(), name='job-list-create'),
    path('jobs/<int:pk>/', JobRetrieveUpdateDestroyView.as_view(), name='job-detail'),
    path('jobs/<int:job_id>/apply/', ApplyJobView.as_view(), name='job-apply'),
    path('jobs/<int:job_id>/applicants/', JobApplicantsListView.as_view(), name='job-applicants'),
]