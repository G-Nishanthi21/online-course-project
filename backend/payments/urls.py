from django.urls import path
from .views import CheckoutView, PaymentHistoryView

urlpatterns = [
    path("checkout/", CheckoutView.as_view(), name="checkout"),
    path("history/", PaymentHistoryView.as_view(), name="payment-history"),
]
