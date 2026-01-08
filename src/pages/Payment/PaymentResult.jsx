import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    CheckCircle,
    XCircle,
    Loader2,
    Mail,
    Calendar,
    MapPin,
    RefreshCw
} from "lucide-react";
import CommonNavbar from "@/components/shared/common/CommonNavbar/CommonNavbar";
import { BASE_URL } from "@/config";
import { Link } from "react-router-dom";

function formatPrice(n) {
    return "₦" + Number(n || 0).toLocaleString("en-NG");
}

export default function PaymentResult() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState("loading"); // loading, success, failed, error
    const [paymentData, setPaymentData] = useState(null);
    const [error, setError] = useState(null);

    // Get reference from URL params (Paystack uses 'reference', SquadCo uses 'trxref')
    const reference = searchParams.get("reference") || searchParams.get("trxref");
    const errorParam = searchParams.get("error");

    useEffect(() => {
        // Check for error from redirect
        if (errorParam) {
            setStatus("error");
            const errorMessages = {
                missing_reference: "No payment reference found",
                payment_not_found: "Payment record not found",
                server_error: "A server error occurred. Please try again."
            };
            setError(errorMessages[errorParam] || "An error occurred during payment");
            return;
        }

        if (!reference) {
            setStatus("error");
            setError("No payment reference found");
            return;
        }

        verifyPayment();
    }, [reference, errorParam]);

    const verifyPayment = async () => {
        setStatus("loading");
        setError(null);

        try {
            // Use the verify endpoint which returns JSON
            const response = await fetch(`${BASE_URL}/payments/verify/${reference}`);
            const data = await response.json();

            if (data.success && (data.paymentStatus === "successful" || data.status === "success")) {
                setStatus("success");
                // Map the verify endpoint response to expected format
                setPaymentData({
                    bookingReference: data.booking?.bookingReference,
                    amount: parseFloat(data.booking?.totalPrice || 0),
                    paymentReference: data.payment?.transactionReference,
                    paymentStatus: data.paymentStatus,
                    gateway: data.payment?.gateway,
                    paidAt: data.payment?.paidAt,
                    guest: {
                        name: data.booking?.GuestDirectory?.fullName,
                        email: data.booking?.GuestDirectory?.email,
                    }
                });
            } else if (data.paymentStatus === "failed" || data.status === "failed") {
                setStatus("failed");
                setPaymentData({
                    bookingReference: data.booking?.bookingReference,
                    paymentReference: data.payment?.transactionReference,
                    paymentStatus: data.paymentStatus || data.status,
                });
            } else {
                // Payment still processing or pending
                setStatus("failed");
                setError(data.message || data.error || "Payment verification failed");
            }
        } catch (err) {
            console.error("Payment verification error:", err);
            setStatus("error");
            setError("Failed to verify payment. Please contact support.");
        }
    };

    const handleGoToConfirmation = () => {
        navigate("/booking-confirmation", {
            state: {
                bookingReference: paymentData?.bookingReference,
                paymentStatus: paymentData?.paymentStatus,
                paidAt: paymentData?.paidAt,
                amount: paymentData?.amount,
                guest: paymentData?.guest,
            },
        });
    };

    // Loading State
    if (status === "loading") {
        return (
            <div className="min-h-screen bg-[#F7F5EF]">
                <CommonNavbar />
                <div className="flex items-center justify-center px-4 py-20">
                    <Card className="w-full max-w-md rounded-3xl shadow-md border-none">
                        <CardContent className="p-10 text-center">
                            <Loader2 className="w-16 h-16 text-[#0A4C30] animate-spin mx-auto" />
                            <h2 className="text-xl font-bold text-[#0A4C30] mt-6">
                                Verifying Payment...
                            </h2>
                            <p className="text-gray-600 mt-2">
                                Please wait while we confirm your payment
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Success State
    if (status === "success") {
        return (
            <div className="min-h-screen bg-[#F7F5EF]">
                <CommonNavbar />
                <div className="flex items-center justify-center px-4 py-10">
                    <Card className="w-full max-w-3xl rounded-3xl shadow-md border-none">
                        <CardContent className="p-6 md:p-10">
                            <div className="flex justify-center">
                                <div className="bg-[#D4EDDA] w-20 h-20 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-10 h-10 text-[#155724]" />
                                </div>
                            </div>
                            <h1 className="text-2xl md:text-4xl font-extrabold text-center text-[#0A4C30] mt-6">
                                Payment Successful!
                            </h1>
                            <p className="text-center text-gray-600 mt-2 max-w-lg mx-auto text-sm md:text-base">
                                Your booking has been confirmed. We can't wait to welcome you to Lufasi Lodges.
                            </p>

                            {/* Booking Reference Card */}
                            <div className="bg-[#C8EBEF] rounded-xl py-5 px-4 text-center mt-6">
                                <p className="text-xs md:text-sm text-gray-600">Your Booking Reference</p>
                                <p className="text-xl md:text-2xl font-bold tracking-wide text-[#0A4C30]">
                                    {paymentData?.bookingReference}
                                </p>
                            </div>

                            {/* Payment Details */}
                            <div className="bg-[#F0EDDD] rounded-xl p-4 md:p-6 mt-6 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 text-sm">Amount Paid</span>
                                    <span className="font-bold text-[#0A4C30]">
                                        {formatPrice(paymentData?.amount)}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 text-sm">Payment Reference</span>
                                    <span className="font-mono text-xs text-[#0A4C30]">
                                        {paymentData?.paymentReference}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 text-sm">Payment Method</span>
                                    <span className="font-medium text-[#0A4C30] capitalize">
                                        {paymentData?.gateway}
                                    </span>
                                </div>
                            </div>

                            {/* Info Cards */}
                            <div className="bg-[#F0EDDD] rounded-xl p-4 md:p-6 mt-6 space-y-4">
                                <div className="flex gap-3">
                                    <Mail className="w-5 h-5 text-[#0A4C30]" />
                                    <div>
                                        <p className="font-semibold text-sm md:text-base text-[#0A4C30]">
                                            Confirmation Email Sent
                                        </p>
                                        <p className="text-xs md:text-sm text-gray-600">
                                            Check your inbox for your booking details and pre-arrival information.
                                        </p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex gap-3">
                                    <Calendar className="w-5 h-5 text-[#0A4C30]" />
                                    <div>
                                        <p className="font-semibold text-sm md:text-base text-[#0A4C30]">
                                            Add to Calendar
                                        </p>
                                        <p className="text-xs md:text-sm text-gray-600">
                                            Save your dates and start counting down to your nature retreat.
                                        </p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex gap-3">
                                    <MapPin className="w-5 h-5 text-[#0A4C30]" />
                                    <div>
                                        <p className="font-semibold text-sm md:text-base text-[#0A4C30]">
                                            Location & Directions
                                        </p>
                                        <p className="text-xs md:text-sm text-gray-600">
                                            Detailed directions and what to bring will be in your confirmation email.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="mt-8">
                                <Button className="w-full bg-[#0A4C30] hover:bg-[#0A4C30] text-white h-12 rounded-xl text-sm md:text-base">
                                    <Link to="/">Go Back to Homepage</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Failed State
    if (status === "failed") {
        return (
            <div className="min-h-screen bg-[#F7F5EF]">
                <CommonNavbar />
                <div className="flex items-center justify-center px-4 py-10">
                    <Card className="w-full max-w-md rounded-3xl shadow-md border-none">
                        <CardContent className="p-6 md:p-10 text-center">
                            <div className="flex justify-center">
                                <div className="bg-[#F8D7DA] w-20 h-20 rounded-full flex items-center justify-center">
                                    <XCircle className="w-10 h-10 text-[#721C24]" />
                                </div>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-[#721C24] mt-6">
                                Payment Failed
                            </h1>
                            <p className="text-gray-600 mt-2 text-sm md:text-base">
                                {error || "Your payment could not be processed. Please try again."}
                            </p>

                            {paymentData?.bookingReference && (
                                <div className="bg-[#F8D7DA] rounded-xl py-4 px-4 mt-6">
                                    <p className="text-xs text-[#721C24]">Booking Reference</p>
                                    <p className="text-lg font-bold text-[#721C24]">
                                        {paymentData.bookingReference}
                                    </p>
                                </div>
                            )}

                            <div className="mt-8 space-y-3">
                                <Button
                                    className="w-full bg-[#0A4C30] hover:bg-[#083d26] text-white h-12 rounded-xl"
                                    onClick={() => navigate("/review-your-booking")}
                                >
                                    Try Again
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full h-12 rounded-xl"
                                    onClick={verifyPayment}
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Retry Verification
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Error State
    return (
        <div className="min-h-screen bg-[#F7F5EF]">
            <CommonNavbar />
            <div className="flex items-center justify-center px-4 py-10">
                <Card className="w-full max-w-md rounded-3xl shadow-md border-none">
                    <CardContent className="p-6 md:p-10 text-center">
                        <div className="flex justify-center">
                            <div className="bg-[#FFF3CD] w-20 h-20 rounded-full flex items-center justify-center">
                                <XCircle className="w-10 h-10 text-[#856404]" />
                            </div>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-[#856404] mt-6">
                            Something Went Wrong
                        </h1>
                        <p className="text-gray-600 mt-2 text-sm md:text-base">
                            {error || "We couldn't verify your payment. Please contact support."}
                        </p>

                        <div className="mt-8 space-y-3">
                            <Button
                                className="w-full bg-[#0A4C30] hover:bg-[#083d26] text-white h-12 rounded-xl"
                                onClick={() => navigate("/")}
                            >
                                Go to Homepage
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full h-12 rounded-xl"
                                onClick={verifyPayment}
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Try Again
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
