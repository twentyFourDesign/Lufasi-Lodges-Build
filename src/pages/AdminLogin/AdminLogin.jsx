import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "@/store/useAuthStore";
import { isAdminSubdomain } from "@/utils/subdomain";

export default function AdminLogin() {
    const navigate = useNavigate();
    const { login, isLoading, error, clearError } = useAuthStore();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [validationErrors, setValidationErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear validation error when user starts typing
        if (validationErrors[name]) {
            setValidationErrors((prev) => ({ ...prev, [name]: "" }));
        }
        if (error) {
            clearError();
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.email.trim()) {
            errors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = "Please enter a valid email";
        }

        if (!formData.password) {
            errors.password = "Password is required";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const result = await login(formData.email, formData.password);

        if (result.success) {
            // Navigate to dashboard - use clean URL on admin subdomain
            const dashboardPath = isAdminSubdomain() ? "/dashboard" : "/admin/dashboard";
            navigate(dashboardPath);
        }
    };

    return (
        <div
            className="fixed inset-0 flex items-center justify-center"
            style={{
                backgroundImage: "url('/default-pod.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            {/* Overlay for better readability */}
            <div className="absolute inset-0 bg-black/20" />

            {/* Login Card */}
            <div
                className="relative z-10 w-full max-w-[420px] mx-4 px-10 py-12 rounded-2xl shadow-2xl"
                style={{ backgroundColor: "#FFF9F2" }}
            >
                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <img
                        src="/logo.png"
                        alt="Lufasi Lodges"
                        className="h-16 object-contain"
                        onError={(e) => {
                            // Fallback if logo.png is not in public folder
                            e.target.src = "/assets/logo.png";
                        }}
                    />
                </div>

                {/* Heading */}
                <h1
                    className="text-3xl font-bold text-center mb-2"
                    style={{ color: "#333333" }}
                >
                    Welcome back
                </h1>
                <p className="text-center text-gray-500 mb-8">
                    Sign in to your account to continue
                </p>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
                        {error}
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email Field */}
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium mb-2"
                            style={{ color: "#333333" }}
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter Email"
                            className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent transition-all ${validationErrors.email ? "border-red-400" : "border-gray-300"
                                }`}
                        />
                        {validationErrors.email && (
                            <p className="mt-1 text-sm text-red-500">{validationErrors.email}</p>
                        )}
                    </div>

                    {/* Password Field */}
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium mb-2"
                            style={{ color: "#333333" }}
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter Password"
                            className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent transition-all ${validationErrors.password ? "border-red-400" : "border-gray-300"
                                }`}
                        />
                        {validationErrors.password && (
                            <p className="mt-1 text-sm text-red-500">{validationErrors.password}</p>
                        )}
                    </div>

                    {/* Forgot Password Link */}
                    <div className="text-right">
                        <a
                            href="#"
                            className="text-sm hover:underline transition-colors"
                            style={{ color: "#008080" }}
                        >
                            Forgot password?
                        </a>
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{
                            backgroundColor: "#008080",
                        }}
                        onMouseEnter={(e) => {
                            if (!isLoading) e.target.style.backgroundColor = "#006666";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "#008080";
                        }}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                Signing in...
                            </span>
                        ) : (
                            "Login"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
