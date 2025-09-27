from rest_framework import serializers
from .models_user import UserCV
from urllib.parse import unquote
import boto3
from django.conf import settings


class UserCVSerializer(serializers.ModelSerializer):
    presigned_url = serializers.SerializerMethodField()

    class Meta:
        model = UserCV
        fields = ['id', 'file_url', 'file_name', 'presigned_url', 'uploaded_at']

    def get_presigned_url(self, obj):
        if not obj.file_url:
            return None
        try:
            bucket = settings.AWS_STORAGE_BUCKET_NAME
            region = settings.AWS_REGION
            prefix = f"https://{bucket}.s3.{region}.amazonaws.com/"
            if obj.file_url.startswith(prefix):
                key = obj.file_url[len(prefix):]
            else:
                return None
            # Use the raw key as it appears in the file_url (do NOT decode)
            import logging
            logger = logging.getLogger("jobmatch.s3")
            logger.warning(f"[S3 DEBUG] file_url: {obj.file_url}")
            logger.warning(f"[S3 DEBUG] extracted key: {key}")
            s3 = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=region
            )
            url = s3.generate_presigned_url(
                'get_object',
                Params={'Bucket': bucket, 'Key': key},
                ExpiresIn=600  # 10 minutes
            )
            logger.warning(f"[S3 DEBUG] presigned url: {url}")
            return url
        except Exception as e:
            import logging
            logger = logging.getLogger("jobmatch.s3")
            logger.error(f"[S3 ERROR] {e}")
            return None
