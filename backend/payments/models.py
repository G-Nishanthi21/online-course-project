from django.db import models
from django.conf import settings
from courses.models import Course


class Payment(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ("card", "Credit/Debit Card"),
        ("upi", "UPI / QR"),
        ("netbanking", "Net Banking"),
    ]

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="payments",
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="payments",
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default="card",
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="completed",
    )
    transaction_id = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment #{self.transaction_id} - {self.user} for {self.course.title}"
