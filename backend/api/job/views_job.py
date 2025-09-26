from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from api.job.models_job import Job, JobApplication
from api.user.models_user import User
from api.serializers import JobSerializer, JobApplicationSerializer
from api.permissions import IsAdminUserType, IsUserUserType, IsAdminOrReadOnly

# Job List & Create (Admin can create, all can list)
class JobListCreateView(generics.ListCreateAPIView):
    queryset = Job.objects.all().order_by('-created_at')
    serializer_class = JobSerializer
    permission_classes = [IsAdminOrReadOnly]

# Job Retrieve/Update/Delete (Admin only for update/delete)
class JobRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [IsAdminOrReadOnly]

# Apply to Job (USER only, must be logged in)
class ApplyJobView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, job_id):
        user = request.user
        if getattr(user, 'user_type', None) != 'USER':
            return Response({'detail': 'Only users with USER role can apply.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            job = Job.objects.get(pk=job_id)
        except Job.DoesNotExist:
            return Response({'detail': 'Job not found.'}, status=status.HTTP_404_NOT_FOUND)
        # Prevent duplicate applications
        if JobApplication.objects.filter(user=user, job=job).exists():
            return Response({'detail': 'You have already applied to this job.'}, status=status.HTTP_400_BAD_REQUEST)
        cv_id = request.data.get('cv_id')
        cv = None
        if cv_id:
            from api.user.models_user import UserCV
            try:
                cv = UserCV.objects.get(id=cv_id, user=user)
            except UserCV.DoesNotExist:
                return Response({'detail': 'CV not found or does not belong to user.'}, status=status.HTTP_400_BAD_REQUEST)
        application = JobApplication.objects.create(user=user, job=job, cv=cv)
        return Response(JobApplicationSerializer(application).data, status=status.HTTP_201_CREATED)

# List applicants for a job (Admin only)
class JobApplicantsListView(generics.ListAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [IsAdminUserType]

    def get_queryset(self):
        job_id = self.kwargs['job_id']
        return JobApplication.objects.filter(job_id=job_id)
