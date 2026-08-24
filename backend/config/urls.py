from django.contrib import admin
from django.urls import path, include, re_path
from django.shortcuts import render
from django.http import JsonResponse


def health(request):
    return JsonResponse({
        "status": "ok",
        "message": "LearnHub API is running"
    })


def render_react(request, path=""):
    return render(request, "index.html")


urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/accounts/", include("accounts.urls")),
    path("api/", include("courses.urls")),
    path("api/enrollments/", include("enrollments.urls")),
    path("api/payments/", include("payments.urls")),

    path("health/", health),

    re_path(r"^.*$", render_react),
]