from rest_framework import serializers
from .models_user import UserCV

class UserCVSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserCV
        fields = ['id', 'file_url', 'uploaded_at']
