from rest_framework import views, status, permissions
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .serializers import CheckoutSerializer, PaymentSerializer
from .models import Payment


@method_decorator(csrf_exempt, name="dispatch")
class CheckoutView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = CheckoutSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            payment = serializer.save()
            return Response(
                {
                    "message": "Payment successful and course enrolled!",
                    "payment": PaymentSerializer(payment).data,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name="dispatch")
class PaymentHistoryView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if request.user.is_authenticated:
            payments = Payment.objects.filter(user=request.user).order_by("-created_at")
            serializer = PaymentSerializer(payments, many=True)
            return Response(serializer.data)
        return Response([], status=status.HTTP_200_OK)
