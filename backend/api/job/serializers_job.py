from rest_framework import serializers
from .models_job import Job, JobApplication
from api.user.models_user import UserCV
from django.conf import settings
import boto3
from urllib.parse import unquote

class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = ['id', 'title', 'company', 'description', 'location', 'tags', 'employment_type', 'created_at']

class JobApplicationSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_first_name = serializers.CharField(source='user.first_name', read_only=True)
    user_last_name = serializers.CharField(source='user.last_name', read_only=True)
    user_contact_number = serializers.CharField(source='user.contact_number', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)
    cv_url = serializers.SerializerMethodField()
    cv_presigned_url = serializers.SerializerMethodField()
    cv_file_name = serializers.SerializerMethodField()
    note = serializers.CharField(required=False, allow_blank=True, max_length=500)

    class Meta:
        model = JobApplication
        fields = [
            'id', 'user', 'user_email', 'user_first_name', 'user_last_name', 'user_contact_number',
            'job', 'job_title', 'cv', 'cv_url', 'cv_presigned_url', 'cv_file_name', 'note', 'applied_at'
        ]

    def get_cv_url(self, obj):
        return obj.cv.file_url if obj.cv else None

    def get_cv_presigned_url(self, obj):
        if not obj.cv or not obj.cv.file_url:
            return None
        try:
            bucket = settings.AWS_STORAGE_BUCKET_NAME
            region = settings.AWS_REGION
            prefix = f"https://{bucket}.s3.{region}.amazonaws.com/"
            if obj.cv.file_url.startswith(prefix):
                key = obj.cv.file_url[len(prefix):]
            else:
                key = obj.cv.file_url.split('.amazonaws.com/', 1)[-1]
            # Use the key as-is (no encoding/decoding)
            s3 = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=region,
                endpoint_url=f'https://s3.{region}.amazonaws.com'
            )
            url = s3.generate_presigned_url(
                'get_object',
                Params={'Bucket': bucket, 'Key': key},
                ExpiresIn=600
            )
            return url
        except Exception:
            return None

    def get_cv_file_name(self, obj):
        if obj.cv and hasattr(obj.cv, 'file_name') and obj.cv.file_name:
            return obj.cv.file_name
        elif obj.cv and obj.cv.file_url:
            return unquote(obj.cv.file_url.split('/')[-1])
        return None
