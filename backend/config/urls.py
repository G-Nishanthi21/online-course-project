from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def health(request):
    return JsonResponse({
        "status": "ok",
        "message": "LearnHub API is running"
    })


urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/accounts/", include("accounts.urls")),
    path("api/", include("courses.urls")),
    path("api/enrollments/", include("enrollments.urls")),
    path("api/payments/", include("payments.urls")),

    path("health/", health),
]