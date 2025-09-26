import boto3
from django.conf import settings
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models_user import UserCV
from .serializers_cv import UserCVSerializer
from urllib.parse import quote
import time

class UserCVUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'detail': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)
        if file.size > 2 * 1024 * 1024:
            return Response({'detail': 'File size exceeds 2MB limit.'}, status=status.HTTP_400_BAD_REQUEST)
        # Upload to S3
        s3 = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )
        bucket = settings.AWS_STORAGE_BUCKET_NAME
        timestamp = int(time.time())
        key = f"user_cvs/{request.user.id}/{timestamp}_{quote(file.name)}"
        s3.upload_fileobj(file, bucket, key, ExtraArgs={'ACL': 'private', 'ContentType': file.content_type})
        file_url = f"https://{bucket}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"
        user_cv = UserCV.objects.create(user=request.user, file_url=file_url)
        return Response(UserCVSerializer(user_cv).data, status=status.HTTP_201_CREATED)
