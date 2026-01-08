import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Loader2, Shield, Clock, AlertCircle } from "lucide-react";
import CommonNavbar from "@/components/shared/common/CommonNavbar/CommonNavbar";
import { BASE_URL } from "@/config";

function formatPrice(n) {
    return "₦" + Number(n || 0).toLocaleString("en-NG");
}

export default function PaymentPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedGateway, setSelectedGateway] = useState(null);
    const [error, setError] = useState(null);

    // Get payment details from navigation state
    const {
        paymentLink,
        bookingReference,
        amountDue,
        bookingId
    } = location.state || {};

    useEffect(() => {
        // Redirect if no payment data
        if (!paymentLink || !bookingReference) {
            navigate("/", { replace: true });
        }
    }, [paymentLink, bookingReference, navigate]);

    // Extract token from paymentLink
    const getPaymentToken = () => {
        if (!paymentLink) return null;
        // paymentLink format: https://domain/payments/pay/TOKEN
        const parts = paymentLink.split("/payments/pay/");
        return parts.length > 1 ? parts[1] : null;
    };

    const handlePayment = async (gateway) => {
        setIsProcessing(true);
        setSelectedGateway(gateway);
        setError(null);

        const token = getPaymentToken();
        if (!token) {
            setError("Invalid payment link. Please try booking again.");
            setIsProcessing(false);
            return;
        }

        try {
            // Create a form and submit to the payment endpoint
            // This allows proper redirects to payment gateways
            const form = document.createElement("form");
            form.method = "POST";
            form.action = `${BASE_URL}/payments/pay/${token}`;

            // Add gateway field
            const gatewayInput = document.createElement("input");
            gatewayInput.type = "hidden";
            gatewayInput.name = "gateway";
            gatewayInput.value = gateway;
            form.appendChild(gatewayInput);

            // Submit form - this will redirect to payment gateway
            document.body.appendChild(form);
            form.submit();
        } catch (err) {
            console.error("Payment initiation failed:", err);
            setError("Failed to initiate payment. Please try again.");
            setIsProcessing(false);
            setSelectedGateway(null);
        }
    };

    if (!paymentLink || !bookingReference) {
        return null; // Redirect will happen in useEffect
    }

    return (
        <div className="min-h-screen bg-[#F7F5EF]">
            <CommonNavbar />
            <div className="flex items-center justify-center px-4 py-10">
                <Card className="w-full max-w-2xl rounded-3xl shadow-md border-none">
                    <CardContent className="p-6 md:p-10">
                        {/* Header */}
                        <div className="flex justify-center">
                            <div className="bg-[#EFEBDD] w-20 h-20 rounded-full flex items-center justify-center">
                                <CreditCard className="w-10 h-10 text-[#0A4C30]" />
                            </div>
                        </div>
                        <h1 className="text-2xl md:text-4xl font-extrabold text-center text-[#0A4C30] mt-6">
                            Complete Your Payment
                        </h1>
                        <p className="text-center text-gray-600 mt-2 max-w-lg mx-auto text-sm md:text-base">
                            Select your preferred payment method to secure your booking
                        </p>

                        {/* Booking Summary */}
                        <div className="bg-[#F0EDDD] rounded-xl p-4 md:p-6 mt-6">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-sm md:text-base">Booking Reference</span>
                                <span className="font-bold text-[#0A4C30] text-sm md:text-base">{bookingReference}</span>
                            </div>
                            <Separator className="my-3" />
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-sm md:text-base">Amount Due</span>
                                <span className="font-bold text-[#0A4C30] text-xl md:text-2xl">
                                    {formatPrice(amountDue)}
                                </span>
                            </div>
                        </div>

                        {/* Timer Warning */}
                        <div className="bg-[#FFF3CD] rounded-xl p-4 mt-4 flex items-start gap-3">
                            <Clock className="w-5 h-5 text-[#856404] flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm text-[#856404] font-medium">
                                    Complete payment within 30 minutes
                                </p>
                                <p className="text-xs text-[#856404] mt-1">
                                    Your booking will expire if payment is not completed in time.
                                </p>
                            </div>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="bg-[#F8D7DA] rounded-xl p-4 mt-4 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-[#721C24] flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-[#721C24]">{error}</p>
                            </div>
                        )}

                        {/* Payment Gateway Selection */}
                        <div className="mt-8 space-y-4">
                            <p className="text-center text-gray-600 text-sm font-medium">
                                Choose Payment Method
                            </p>

                            {/* Paystack Button */}
                            <Button
                                className="w-full h-14 bg-[#0A4C30] hover:bg-[#083d26] text-white rounded-xl text-base font-semibold flex items-center justify-center gap-3"
                                onClick={() => handlePayment("paystack")}
                                disabled={isProcessing}
                            >
                                {isProcessing && selectedGateway === "paystack" ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="w-5 h-5" />
                                        Pay with Paystack
                                    </>
                                )}
                            </Button>

                            {/* Squadco Button */}
                            <Button
                                className="w-full h-14 bg-[#1a1a2e] hover:bg-[#16162a] text-white rounded-xl text-base font-semibold flex items-center justify-center gap-3"
                                onClick={() => handlePayment("squadco")}
                                disabled={isProcessing}
                            >
                                {isProcessing && selectedGateway === "squadco" ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="w-5 h-5" />
                                        Pay with Squad
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Security Notice */}
                        <div className="mt-6 flex items-center justify-center gap-2 text-gray-500">
                            <Shield className="w-4 h-4" />
                            <span className="text-xs">Secure payment powered by trusted providers</span>
                        </div>

                        {/* Back Button */}
                        <div className="mt-6">
                            <Button
                                variant="outline"
                                className="w-full h-12 rounded-xl text-sm md:text-base border-gray-300"
                                onClick={() => navigate("/review-your-booking")}
                                disabled={isProcessing}
                            >
                                Back to Review
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
