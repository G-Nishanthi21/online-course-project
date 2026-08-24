from rest_framework import serializers
from .models import Payment
from courses.models import Course
from enrollments.models import Enrollment
from accounts.models import User
import uuid


class PaymentSerializer(serializers.ModelSerializer):
    course_title = serializers.ReadOnlyField(source="course.title")

    class Meta:
        model = Payment
        fields = "__all__"


class CheckoutSerializer(serializers.Serializer):
    course_id = serializers.IntegerField()
    payment_method = serializers.CharField(default="card")
    student_name = serializers.CharField(required=False, allow_blank=True)
    student_email = serializers.EmailField(required=False, allow_blank=True)

    def create(self, validated_data):
        req_user = self.context["request"].user
        if req_user and req_user.is_authenticated:
            user = req_user
        else:
            student_email = validated_data.get("student_email") or "student@learnhub.com"
            username = validated_data.get("student_name", "").replace(" ", "_").lower() or "guest_student"
            user, _ = User.objects.get_or_create(
                username=username,
                defaults={"email": student_email, "role": "student"},
            )

        course = Course.objects.get(id=validated_data["course_id"])
        transaction_id = f"TXN-{uuid.uuid4().hex[:10].upper()}"

        payment = Payment.objects.create(
            user=user,
            course=course,
            amount=course.price,
            payment_method=validated_data.get("payment_method", "card"),
            status="completed",
            transaction_id=transaction_id,
        )

        enrollment, _ = Enrollment.objects.get_or_create(
            student=user,
            course=course,
            defaults={"status": "active", "progress": 0},
        )
        if enrollment.status != "active":
            enrollment.status = "active"
            enrollment.save()

        return payment
