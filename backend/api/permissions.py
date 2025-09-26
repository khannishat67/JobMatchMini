
from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAdminUserType(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and getattr(request.user, 'user_type', None) == 'ADMIN'

class IsUserUserType(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and getattr(request.user, 'user_type', None) == 'USER'

class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_authenticated and getattr(request.user, 'user_type', None) == 'ADMIN'
from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'ADMIN'

class IsUser(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['USER', 'ADMIN']

class IsPublic(BasePermission):
    def has_permission(self, request, view):
        return True  # Public access for all users, including unauthenticated users.