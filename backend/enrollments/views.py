from rest_framework import viewsets
from .models import Enrollment
from .serializers import EnrollmentSerializer, EnrollmentDetailSerializer


class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer

    def get_serializer_class(self):
        if self.action in ["list", "retrieve"]:
            return EnrollmentDetailSerializer
        return EnrollmentSerializer

    def get_queryset(self):
        queryset = Enrollment.objects.all()
        student_id = self.request.query_params.get("student")
        course_id = self.request.query_params.get("course")

        if student_id is not None:
            queryset = queryset.filter(student_id=student_id)
        if course_id is not None:
            queryset = queryset.filter(course_id=course_id)

        return queryset
