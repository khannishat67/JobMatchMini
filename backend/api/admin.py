
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
	ordering = ['email']
	list_display = ['email', 'user_type', 'is_staff', 'is_active']
	fieldsets = (
		(None, {'fields': ('email', 'password')}),
		(_('Personal info'), {'fields': ('first_name', 'last_name', 'user_type')}),
		(_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
		(_('Important dates'), {'fields': ('last_login', 'date_joined')}),
	)
	add_fieldsets = (
		(None, {
			'classes': ('wide',),
			'fields': ('email', 'password1', 'password2', 'user_type', 'is_staff', 'is_active'),
		}),
	)
	search_fields = ('email',)
	filter_horizontal = ('groups', 'user_permissions',)
	readonly_fields = ('last_login', 'date_joined')