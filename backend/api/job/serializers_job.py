from rest_framework import serializers
from .models_job import Job, JobApplication
from api.user.models_user import UserCV

class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = ['id', 'title', 'company', 'description', 'location', 'tags', 'employment_type', 'created_at']

class JobApplicationSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)
    cv_url = serializers.SerializerMethodField()

    class Meta:
        model = JobApplication
        fields = ['id', 'user', 'user_email', 'job', 'job_title', 'cv', 'cv_url', 'applied_at']

    def get_cv_url(self, obj):
        return obj.cv.file_url if obj.cv else None
