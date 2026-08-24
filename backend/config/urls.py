from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView


def health(request):
    return JsonResponse({
        "status": "Backend is running"
    })


urlpatterns = [
    path("", TemplateView.as_view(
        template_name="index.html"
    ), name="frontend"),

    path("admin/", admin.site.urls),

    path("api/accounts/", include("accounts.urls")),
    path("api/courses/", include("courses.urls")),
    path("api/enrollments/", include("enrollments.urls")),
    path("api/payments/", include("payments.urls")),

    path("health/", health),
]

urlpatterns += static(
    settings.MEDIA_URL,
    document_root=settings.MEDIA_ROOT
)