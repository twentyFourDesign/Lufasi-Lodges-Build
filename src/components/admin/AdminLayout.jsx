import { useState } from "react";
import useAuthStore from "@/store/useAuthStore";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ children }) {
    const { user } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#FFF9F2]">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content */}
            <div className="lg:ml-[200px] transition-all duration-300">
                {/* Top Header */}
                <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 md:px-6 py-3">
                    <div className="flex items-center justify-between gap-4">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {/* Search Bar */}
                        <div className="relative flex-1 max-w-xs md:max-w-sm lg:max-w-md">
                            <input
                                type="text"
                                placeholder="Search anything"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                style={{
                                    backgroundColor: '#F5F4F2',
                                    border: '1px solid #DBDDDF'
                                }}
                            />
                            <svg
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>

                        {/* Right Side - Notifications & User */}
                        <div className="flex items-center gap-2 md:gap-4">
                            {/* Notification Bell */}
                            <button className="p-2 text-gray-500 hover:text-gray-700 relative">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                    />
                                </svg>
                            </button>

                            {/* User Profile */}
                            <div className="flex items-center gap-2 md:gap-3">
                                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#008080] flex items-center justify-center text-white font-medium text-sm">
                                    {user?.fullName?.charAt(0)?.toUpperCase() || "A"}
                                </div>
                                <div className="hidden sm:block text-right">
                                    <p className="text-sm font-medium text-[#333333] truncate max-w-[120px]">
                                        {user?.fullName || "Admin User"}
                                    </p>
                                    <p className="text-xs text-gray-500 capitalize">
                                        {user?.role || "Admin"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
