import { useEffect, useState, useRef } from "react";
import { API_BASE } from "../../config";
import { useNavigate } from "react-router-dom";

export default function FounderDashboard() {
    const navigate = useNavigate();
    const [overview, setOverview] = useState(null);
    const [trends, setTrends] = useState(null);
    const [topBusinesses, setTopBusinesses] = useState([]);
    const [activity, setActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Tab state for trends chart: "daily" | "weekly" | "monthly"
    const [trendTab, setTrendTab] = useState("daily");
    
    // Table sorting state: "revenue" | "orders" | "name"
    const [sortField, setSortField] = useState("revenue");
    const [sortDirection, setSortDirection] = useState("desc");

    // Onboarding review flow states
    const [activeDashboardTab, setActiveDashboardTab] = useState("performance");
    const [reviews, setReviews] = useState([]);
    const [reviewFilterTab, setReviewFilterTab] = useState("pending");
    const [reviewSearchQuery, setReviewSearchQuery] = useState("");
    const [selectedReview, setSelectedReview] = useState(null);
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [rejectionNotes, setRejectionNotes] = useState("");
    const [reviewToReject, setReviewToReject] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(null);

    // Fetch dashboard data
    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        
        try {
            const headers = { Authorization: `Bearer ${token}` };
            
            const [overviewRes, trendsRes, businessesRes, activityRes, reviewsRes] = await Promise.all([
                fetch(`${API_BASE}/api/founder/overview`, { headers }),
                fetch(`${API_BASE}/api/founder/revenue-trends`, { headers }),
                fetch(`${API_BASE}/api/founder/top-businesses`, { headers }),
                fetch(`${API_BASE}/api/founder/activity`, { headers }),
                fetch(`${API_BASE}/api/founder/reviews`, { headers })
            ]);
            
            if (!overviewRes.ok || !trendsRes.ok || !businessesRes.ok || !activityRes.ok || !reviewsRes.ok) {
                if (overviewRes.status === 403) {
                    throw new Error("Access denied: You must be a founder to view this dashboard.");
                }
                throw new Error("Failed to load dashboard data. Please try again.");
            }
            
            const overviewData = await overviewRes.json();
            const trendsData = await trendsRes.json();
            const businessesData = await businessesRes.json();
            const activityData = await activityRes.json();
            const reviewsData = await reviewsRes.json();
            
            setOverview(overviewData);
            setTrends(trendsData);
            setTopBusinesses(businessesData);
            setActivity(activityData);
            setReviews(reviewsData);
        } catch (err) {
            console.error(err);
            setError(err.message || "An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Logout handler
    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/admin");
    };

    const handleApproveMerchant = async (businessId) => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_BASE}/api/founder/reviews/${businessId}/approve`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                fetchDashboardData();
                setShowConfirmModal(null);
            } else {
                const data = await response.json();
                alert(data.detail || "Approval failed");
            }
        } catch (err) {
            console.error(err);
            alert("Network error.");
        }
    };

    const handleRejectMerchant = async () => {
        if (!reviewToReject) return;
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_BASE}/api/founder/reviews/${reviewToReject.id}/reject`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({ review_notes: rejectionNotes })
            });
            if (response.ok) {
                fetchDashboardData();
                setShowRejectionModal(false);
                setRejectionNotes("");
                setReviewToReject(null);
            } else {
                const data = await response.json();
                alert(data.detail || "Rejection failed");
            }
        } catch (err) {
            console.error(err);
            alert("Network error.");
        }
    };

    // Filter reviews based on tab and query
    const filteredReviews = reviews.filter((rev) => {
        if (rev.approval_status !== reviewFilterTab) return false;
        
        const query = reviewSearchQuery.toLowerCase().trim();
        if (!query) return true;
        
        return (
            rev.name?.toLowerCase().includes(query) ||
            rev.owner_name?.toLowerCase().includes(query) ||
            rev.email?.toLowerCase().includes(query) ||
            rev.business_phone?.includes(query)
        );
    });

    // Submissions velocity logic for KPIs
    const nowTime = new Date();
    const todayStartTime = new Date(nowTime.getFullYear(), nowTime.getMonth(), nowTime.getDate());
    const submittedToday = reviews.filter(r => new Date(r.created_at) >= todayStartTime).length;

    const oneWeekAgo = new Date(nowTime.getTime() - 7 * 24 * 60 * 60 * 1000);
    const submittedThisWeek = reviews.filter(r => new Date(r.created_at) >= oneWeekAgo).length;

    const oneMonthAgo = new Date(nowTime.getTime() - 30 * 24 * 60 * 60 * 1000);
    const submittedThisMonth = reviews.filter(r => new Date(r.created_at) >= oneMonthAgo).length;

    const pendingCount = reviews.filter(r => r.approval_status === "pending").length;
    const approvedCount = reviews.filter(r => r.approval_status === "approved").length;
    const rejectedCount = reviews.filter(r => r.approval_status === "rejected").length;

    // Table sorting logic
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("desc");
        }
    };

    const sortedBusinesses = [...topBusinesses].sort((a, b) => {
        let valueA = a[sortField];
        let valueB = b[sortField];
        
        if (typeof valueA === "string") {
            valueA = valueA.toLowerCase();
            valueB = valueB.toLowerCase();
        }
        
        if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
        if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
        return 0;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white p-4">
                <div className="w-10 h-10 border-4 border-t-blue-500 border-zinc-800 rounded-full animate-spin"></div>
                <p className="mt-4 text-zinc-400 text-sm">Aggregating platform metrics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white p-4 text-center">
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl p-6 max-w-md">
                    <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
                    <p className="text-sm text-zinc-400 mb-6">{error}</p>
                    <div className="flex justify-center gap-4">
                        <button 
                            onClick={fetchDashboardData}
                            className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"
                        >
                            Retry
                        </button>
                        <button 
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-md shadow-red-600/10"
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const { metrics, analytics } = overview || {};

    return (
        <div className="min-h-screen bg-[#09090b] text-[#fafafa] font-sans antialiased overflow-x-hidden">
            {/* Top Navigation */}
            <header className="sticky top-0 z-50 flex items-center justify-between border-b border-zinc-800 bg-[#09090b]/80 backdrop-blur-md px-6 py-4">
                <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-lg shadow-md shadow-blue-600/30">
                        Q
                    </span>
                    <div>
                        <h1 className="text-lg font-semibold leading-none text-white">GoSkipDQ</h1>
                        <span className="text-[10px] text-blue-400 font-medium uppercase tracking-wider">Founder Administration</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate("/admin/dashboard")} 
                        className="hidden md:inline-flex text-zinc-400 hover:text-white text-xs font-medium px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all"
                    >
                        Merchant Portal
                    </button>
                    <button 
                        onClick={handleLogout}
                        className="text-xs bg-red-600 hover:bg-red-500 text-white font-medium px-3 py-1.5 rounded-lg transition-all shadow-md shadow-red-600/10"
                    >
                        Log Out
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
                {/* Secondary navigation tab bar */}
                <div className="flex border-b border-zinc-850 pb-px mb-6 gap-6">
                    <button
                        onClick={() => setActiveDashboardTab("performance")}
                        className={`pb-4 text-sm font-semibold tracking-wide border-b-2 transition-all relative ${
                            activeDashboardTab === "performance"
                                ? "border-blue-500 text-white"
                                : "border-transparent text-zinc-400 hover:text-zinc-200"
                        }`}
                    >
                        📊 Performance & Analytics
                    </button>
                    <button
                        onClick={() => setActiveDashboardTab("reviews")}
                        className={`pb-4 text-sm font-semibold tracking-wide border-b-2 transition-all relative ${
                            activeDashboardTab === "reviews"
                                ? "border-blue-500 text-white"
                                : "border-transparent text-zinc-400 hover:text-zinc-200"
                        }`}
                    >
                        🤝 Merchant Reviews
                        {pendingCount > 0 && (
                            <span className="absolute top-0 -right-6 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white scale-90">
                                {pendingCount}
                            </span>
                        )}
                    </button>
                </div>

                {activeDashboardTab === "performance" ? (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        {/* Dashboard Heading */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Platform Performance</h2>
                                <p className="text-sm text-zinc-400 mt-1">Real-time unified insights across all registered businesses and orders.</p>
                            </div>
                            <button 
                                onClick={fetchDashboardData}
                                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all border border-blue-500/20 self-start md:self-auto"
                            >
                                🔄 Refresh Data
                            </button>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <MetricCard 
                                title="Today's Sales" 
                                value={`₹${metrics?.today_sales?.value || 0}`}
                                change={metrics?.today_sales?.change} 
                                trend={metrics?.today_sales?.trend}
                                label="vs yesterday"
                            />
                            <MetricCard 
                                title="Today's Orders" 
                                value={metrics?.today_orders?.value || 0}
                                change={metrics?.today_orders?.change} 
                                trend={metrics?.today_orders?.trend}
                                label="vs yesterday"
                            />
                            <MetricCard 
                                title="This Week Sales" 
                                value={`₹${metrics?.week_sales?.value || 0}`}
                                change={metrics?.week_sales?.change} 
                                trend={metrics?.week_sales?.trend}
                                label="vs last week"
                            />
                            <MetricCard 
                                title="This Month Sales" 
                                value={`₹${metrics?.month_sales?.value || 0}`}
                                change={metrics?.month_sales?.change} 
                                trend={metrics?.month_sales?.trend}
                                label="vs last month"
                            />
                        </div>

                        {/* Platform Analytics Cards Grid */}
                        <section className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 md:p-8">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-6">Platform Aggregates</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 gap-y-8">
                                <AnalyticStatItem label="Total Businesses" value={analytics?.total_businesses || 0} />
                                <AnalyticStatItem label="Active Today" value={analytics?.active_businesses_today || 0} />
                                <AnalyticStatItem label="Orders Today" value={analytics?.total_orders_today || 0} />
                                <AnalyticStatItem label="Orders This Week" value={analytics?.total_orders_this_week || 0} />
                                <AnalyticStatItem label="Orders This Month" value={analytics?.total_orders_this_month || 0} />
                                <AnalyticStatItem label="Average Order Value" value={`₹${analytics?.average_order_value || 0}`} />
                                <AnalyticStatItem label="Revenue / Business" value={`₹${analytics?.revenue_per_business || 0}`} />
                                <AnalyticStatItem label="Global Conversion Rate" value="98.4%" highlight={true} />
                            </div>
                        </section>

                        {/* Main Content Split: Revenue Chart & Top Businesses */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Revenue Trends Chart */}
                            <div className="lg:col-span-2 bg-[#0d0d11]/80 border border-zinc-800/80 rounded-3xl p-6 flex flex-col min-h-[420px]">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                                    <div>
                                        <h3 className="text-base font-semibold text-white">Revenue Trends</h3>
                                        <p className="text-xs text-zinc-400">Aggregated revenue analytics stream</p>
                                    </div>
                                    <div className="flex bg-zinc-900/90 border border-zinc-800 p-1 rounded-xl self-start sm:self-auto">
                                        <TabButton label="Daily (7d)" active={trendTab === "daily"} onClick={() => setTrendTab("daily")} />
                                        <TabButton label="Weekly (12w)" active={trendTab === "weekly"} onClick={() => setTrendTab("weekly")} />
                                        <TabButton label="Monthly (12m)" active={trendTab === "monthly"} onClick={() => setTrendTab("monthly")} />
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col justify-end">
                                    {trends && (
                                        <CustomSVGChart 
                                            data={trends[trendTab] || []} 
                                            type={trendTab === "monthly" ? "bar" : "line"} 
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-[#0d0d11]/80 border border-zinc-800/80 rounded-3xl p-6 flex flex-col max-h-[420px] overflow-hidden">
                                <div className="mb-4">
                                    <h3 className="text-base font-semibold text-white">Platform Activity</h3>
                                    <p className="text-xs text-zinc-400">Real-time onboarding, sales, & milestones</p>
                                </div>
                                <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
                                    {activity.length === 0 ? (
                                        <p className="text-zinc-500 text-xs text-center py-10">No recent activity detected.</p>
                                    ) : (
                                        activity.map((act, index) => (
                                            <ActivityItem key={index} item={act} />
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Top Performing Businesses */}
                        <div className="bg-[#0d0d11]/80 border border-zinc-800/80 rounded-3xl overflow-hidden">
                            <div className="p-6 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <h3 className="text-base font-semibold text-white">Top Performing Businesses</h3>
                                    <p className="text-xs text-zinc-400">Compare metrics across all registered merchants</p>
                                </div>
                                <div className="text-xs text-zinc-400">
                                    Click table headers to sort database records
                                </div>
                            </div>
                            <div className="overflow-x-auto w-full">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-zinc-800 text-zinc-400 text-xs font-semibold uppercase tracking-wider bg-zinc-900/10">
                                            <th 
                                                className="py-4 px-6 cursor-pointer hover:text-white transition-colors"
                                                onClick={() => handleSort("name")}
                                            >
                                                Business Name {sortField === "name" && (sortDirection === "asc" ? "▲" : "▼")}
                                            </th>
                                            <th 
                                                className="py-4 px-6 text-right cursor-pointer hover:text-white transition-colors"
                                                onClick={() => handleSort("orders")}
                                            >
                                                Total Orders {sortField === "orders" && (sortDirection === "asc" ? "▲" : "▼")}
                                            </th>
                                            <th 
                                                className="py-4 px-6 text-right cursor-pointer hover:text-white transition-colors"
                                                onClick={() => handleSort("revenue")}
                                            >
                                                Revenue {sortField === "revenue" && (sortDirection === "asc" ? "▲" : "▼")}
                                            </th>
                                            <th 
                                                className="py-4 px-6 text-right cursor-pointer hover:text-white transition-colors"
                                                onClick={() => handleSort("aov")}
                                            >
                                                Avg Order Value {sortField === "aov" && (sortDirection === "asc" ? "▲" : "▼")}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-850 text-sm text-zinc-300">
                                        {sortedBusinesses.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="text-center py-10 text-zinc-500">
                                                    No onboarded businesses found.
                                                </td>
                                            </tr>
                                        ) : (
                                            sortedBusinesses.map((biz) => (
                                                <tr key={biz.id} className="hover:bg-zinc-900/30 transition-colors">
                                                    <td className="py-4 px-6 font-medium text-white">{biz.name}</td>
                                                    <td className="py-4 px-6 text-right">{biz.orders.toLocaleString()}</td>
                                                    <td className="py-4 px-6 text-right font-semibold text-emerald-400 font-mono">₹{biz.revenue.toLocaleString()}</td>
                                                    <td className="py-4 px-6 text-right font-mono">₹{biz.aov.toLocaleString()}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        {/* Heading */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-sans">Merchant Reviews</h2>
                                <p className="text-sm text-zinc-400 mt-1">Review, approve, or reject incoming business onboarding requests.</p>
                            </div>
                            <button 
                                onClick={fetchDashboardData}
                                className="inline-flex items-center justify-center gap-2 bg-[#18181b] hover:bg-[#27272a] text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-zinc-800 transition-all self-start md:self-auto"
                            >
                                🔄 Refresh List
                            </button>
                        </div>

                        {/* KPI Metrics Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 md:gap-6">
                            <div className="bg-[#0d0d11] border border-zinc-800/80 rounded-2xl p-5">
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Pending Reviews</span>
                                <span className="text-2xl md:text-3xl font-bold tracking-tight text-blue-400 mt-2 block font-mono">{pendingCount}</span>
                            </div>
                            <div className="bg-[#0d0d11] border border-zinc-800/80 rounded-2xl p-5">
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Approved</span>
                                <span className="text-2xl md:text-3xl font-bold tracking-tight text-emerald-400 mt-2 block font-mono">{approvedCount}</span>
                            </div>
                            <div className="bg-[#0d0d11] border border-zinc-800/80 rounded-2xl p-5">
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Rejected</span>
                                <span className="text-2xl md:text-3xl font-bold tracking-tight text-red-400 mt-2 block font-mono">{rejectedCount}</span>
                            </div>
                            <div className="bg-[#0d0d11] border border-zinc-800/80 rounded-2xl p-5">
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Submitted Today</span>
                                <span className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-2 block font-mono">{submittedToday}</span>
                            </div>
                            <div className="bg-[#0d0d11] border border-zinc-800/80 rounded-2xl p-5">
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Submitted Week</span>
                                <span className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-2 block font-mono">{submittedThisWeek}</span>
                            </div>
                            <div className="bg-[#0d0d11] border border-zinc-800/80 rounded-2xl p-5">
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Submitted Month</span>
                                <span className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-2 block font-mono">{submittedThisMonth}</span>
                            </div>
                        </div>

                        {/* Search & Sub-Tabs Row */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-900/10 border border-zinc-850 p-4 rounded-2xl">
                            {/* Tabs: Pending, Approved, Rejected */}
                            <div className="flex bg-zinc-950 border border-zinc-800/80 p-1 rounded-xl w-full sm:w-auto">
                                <button
                                    onClick={() => setReviewFilterTab("pending")}
                                    className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                        reviewFilterTab === "pending"
                                            ? "bg-zinc-800 text-white shadow-sm"
                                            : "text-zinc-400 hover:text-white"
                                    }`}
                                >
                                    Pending ({pendingCount})
                                </button>
                                <button
                                    onClick={() => setReviewFilterTab("approved")}
                                    className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                        reviewFilterTab === "approved"
                                            ? "bg-zinc-800 text-white shadow-sm"
                                            : "text-zinc-400 hover:text-white"
                                    }`}
                                >
                                    Approved ({approvedCount})
                                </button>
                                <button
                                    onClick={() => setReviewFilterTab("rejected")}
                                    className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                        reviewFilterTab === "rejected"
                                            ? "bg-zinc-800 text-white shadow-sm"
                                            : "text-zinc-400 hover:text-white"
                                    }`}
                                >
                                    Rejected ({rejectedCount})
                                </button>
                            </div>

                            {/* Search Field */}
                            <div className="relative w-full sm:w-72">
                                <input
                                    type="text"
                                    placeholder="Search by store, owner, email, phone..."
                                    value={reviewSearchQuery}
                                    onChange={(e) => setReviewSearchQuery(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Review Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredReviews.length === 0 ? (
                                <div className="col-span-full bg-[#0d0d11]/80 border border-zinc-800/80 rounded-3xl p-16 text-center text-zinc-500">
                                    <span className="text-4xl block mb-3">🤝</span>
                                    <h4 className="text-zinc-400 text-sm font-semibold mb-1">No Applications Found</h4>
                                    <p className="text-zinc-500 text-xs">There are no onboarding requests matching the current status.</p>
                                </div>
                            ) : (
                                filteredReviews.map((rev) => (
                                    <div key={rev.id} className="bg-[#0d0d11] border border-zinc-800/80 hover:border-zinc-700/60 rounded-3xl p-6 flex flex-col justify-between transition-all shadow-sm">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-start gap-2">
                                                <div>
                                                    <h4 className="text-base font-bold text-white truncate max-w-[180px]">{rev.name}</h4>
                                                    <span className="text-[10px] bg-zinc-850 text-zinc-400 px-2 py-0.5 rounded mt-1.5 inline-block uppercase font-bold tracking-wider">{rev.business_type || 'Shop'}</span>
                                                </div>
                                                <span className={`text-[9px] px-2.5 py-1 rounded-full font-bold uppercase ${
                                                    rev.approval_status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                    rev.approval_status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                                                    'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                }`}>
                                                    {rev.approval_status}
                                                </span>
                                            </div>

                                            <div className="space-y-2 text-xs text-zinc-400">
                                                <div className="flex justify-between">
                                                    <span>Owner:</span>
                                                    <span className="text-zinc-200 font-semibold">{rev.owner_name}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Email:</span>
                                                    <span className="text-zinc-200 font-semibold truncate max-w-[170px]">{rev.email}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Phone:</span>
                                                    <span className="text-zinc-200 font-semibold">{rev.business_phone}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Submitted:</span>
                                                    <span className="text-zinc-200 font-semibold">{new Date(rev.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex flex-col gap-2">
                                            <button
                                                onClick={() => setSelectedReview(rev)}
                                                className="w-full bg-zinc-900 hover:bg-zinc-850 text-zinc-300 font-semibold text-xs py-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer"
                                            >
                                                View Application Details
                                            </button>

                                            {rev.approval_status === 'pending' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setShowConfirmModal({
                                                                type: 'approve',
                                                                businessId: rev.id,
                                                                title: 'Approve Merchant',
                                                                message: `Are you sure you want to approve '${rev.name}'? This will allow them to login and access the merchant dashboard immediately.`,
                                                                action: () => handleApproveMerchant(rev.id)
                                                            });
                                                        }}
                                                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/10 cursor-pointer"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setReviewToReject(rev);
                                                            setShowRejectionModal(true);
                                                        }}
                                                        className="flex-1 bg-[#1a0a0a] hover:bg-[#2e1212] text-red-400 font-semibold text-xs py-2.5 rounded-xl border border-red-500/15 hover:border-red-500/30 transition-all cursor-pointer"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* 📋 Application Drawer Detail View */}
            {selectedReview && (
                <div className="fixed inset-0 z-[7000] flex justify-end">
                    {/* Backdrop */}
                    <div 
                        onClick={() => setSelectedReview(null)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
                    />
                    
                    {/* Drawer panel */}
                    <div className="relative w-full max-w-lg bg-[#0d0d11] border-l border-zinc-850 h-full p-8 shadow-2xl flex flex-col justify-between overflow-y-auto z-10 animate-in slide-in-from-right duration-300">
                        <div className="space-y-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-white">{selectedReview.name}</h3>
                                    <span className="text-xs bg-zinc-850 text-zinc-400 px-2 py-0.5 rounded mt-1.5 inline-block uppercase font-bold tracking-wider">
                                        {selectedReview.business_type || 'Shop'}
                                    </span>
                                </div>
                                <button 
                                    onClick={() => setSelectedReview(null)}
                                    className="text-zinc-500 hover:text-white text-lg font-bold p-1 hover:bg-zinc-900 rounded-lg transition-all"
                                >
                                    ✕
                                </button>
                            </div>
                            
                            <hr className="border-zinc-850" />
                            
                            <div className="space-y-4">
                                <h4 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Business Information</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-zinc-500 text-xs">Owner Name</p>
                                        <p className="text-white font-semibold mt-0.5">{selectedReview.owner_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-zinc-500 text-xs">Email Address</p>
                                        <p className="text-white font-semibold mt-0.5">{selectedReview.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-zinc-500 text-xs">Business Phone</p>
                                        <p className="text-white font-semibold mt-0.5">{selectedReview.business_phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-zinc-500 text-xs">URL Slug</p>
                                        <p className="text-blue-400 font-semibold mt-0.5">/{selectedReview.slug}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <hr className="border-zinc-850" />
                            
                            <div className="space-y-4">
                                <h4 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Contact & Location</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-zinc-500 text-xs">Private Contact Phone</p>
                                        <p className="text-white font-semibold mt-0.5">{selectedReview.contact_number || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-zinc-500 text-xs">Address / Location</p>
                                        <p className="text-white font-semibold mt-0.5 truncate max-w-[200px]" title={selectedReview.location_name}>{selectedReview.location_name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-zinc-500 text-xs">Latitude</p>
                                        <p className="text-white font-mono mt-0.5">{selectedReview.latitude || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-zinc-500 text-xs">Longitude</p>
                                        <p className="text-white font-mono mt-0.5">{selectedReview.longitude || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {selectedReview.approval_status !== 'pending' && (
                                <>
                                    <hr className="border-zinc-850" />
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Review Status History</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-zinc-500 text-xs">Reviewed On</p>
                                                <p className="text-white font-semibold mt-0.5">
                                                    {selectedReview.reviewed_at ? new Date(selectedReview.reviewed_at).toLocaleString() : 'N/A'}
                                                </p>
                                            </div>
                                            {selectedReview.review_notes && (
                                                <div className="col-span-2">
                                                    <p className="text-zinc-500 text-xs">Review Details / Notes</p>
                                                    <p className="text-red-400 bg-red-950/20 border border-red-950/30 rounded-xl p-3.5 mt-1.5 text-xs font-semibold leading-relaxed">
                                                        {selectedReview.review_notes}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {selectedReview.approval_status === 'pending' && (
                            <div className="mt-8 pt-4 border-t border-zinc-850 flex gap-4">
                                <button
                                    onClick={() => {
                                        setShowConfirmModal({
                                            type: 'approve',
                                            businessId: selectedReview.id,
                                            title: 'Approve Merchant',
                                            message: `Are you sure you want to approve '${selectedReview.name}'? This will allow them to login and access the merchant dashboard immediately.`,
                                            action: () => {
                                                handleApproveMerchant(selectedReview.id);
                                                setSelectedReview(null);
                                            }
                                        });
                                    }}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-3 rounded-xl transition-all shadow-md shadow-emerald-600/10 cursor-pointer"
                                >
                                    Approve Merchant
                                </button>
                                <button
                                    onClick={() => {
                                        setReviewToReject(selectedReview);
                                        setShowRejectionModal(true);
                                        setSelectedReview(null);
                                    }}
                                    className="flex-1 bg-[#1a0a0a] hover:bg-[#2e1212] text-red-400 font-semibold text-xs py-3 rounded-xl border border-red-500/15 hover:border-red-500/30 transition-all cursor-pointer"
                                >
                                    Reject Application
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 🔴 Custom Rejection Modal */}
            {showRejectionModal && (
                <div className="fixed inset-0 z-[8000] flex items-center justify-center p-4">
                    <div 
                        onClick={() => {
                            setShowRejectionModal(false);
                            setReviewToReject(null);
                            setRejectionNotes("");
                        }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
                    />
                    <div className="relative bg-[#0d0d11] border border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-bold text-white mb-2">Reject Merchant Application</h3>
                        <p className="text-xs text-zinc-400 mb-4">
                            Provide comments or reason notes. This information will help the applicant understand why their application was rejected.
                        </p>
                        
                        <textarea
                            placeholder="Type review rejection comments here (optional)..."
                            value={rejectionNotes}
                            onChange={(e) => setRejectionNotes(e.target.value)}
                            rows="4"
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-xs text-white placeholder-zinc-500 outline-none focus:border-red-500 transition-all resize-none"
                        />
                        
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={() => {
                                    setShowRejectionModal(false);
                                    setReviewToReject(null);
                                    setRejectionNotes("");
                                }}
                                className="flex-1 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 font-semibold text-xs py-2.5 rounded-xl border border-zinc-800 transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRejectMerchant}
                                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs py-2.5 rounded-xl transition-all shadow-md shadow-red-600/10 cursor-pointer"
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🛡️ Custom Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-[8000] flex items-center justify-center p-4">
                    <div 
                        onClick={() => setShowConfirmModal(null)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
                    />
                    <div className="relative bg-[#0d0d11] border border-zinc-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 text-center">
                        <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto mb-4 text-xl">
                            💡
                        </div>
                        <h3 className="text-base font-bold text-white mb-2">{showConfirmModal.title}</h3>
                        <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                            {showConfirmModal.message}
                        </p>
                        
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowConfirmModal(null)}
                                className="flex-1 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 font-semibold text-xs py-2.5 rounded-xl border border-zinc-800 transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={showConfirmModal.action}
                                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/10 cursor-pointer"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// 🏷️ Mini Metric Card
function MetricCard({ title, value, change, trend, label }) {
    const isUp = trend === "up";
    return (
        <div className="bg-[#0d0d11] border border-zinc-800/80 rounded-2xl p-5 shadow-sm hover:border-zinc-700/60 transition-all">
            <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{title}</span>
            <div className="flex items-baseline justify-between mt-3">
                <span className="text-3xl font-bold tracking-tight text-white">{value}</span>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${
                    isUp ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                }`}>
                    {isUp ? "↗" : "↘"} {Math.abs(change)}%
                </span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-2">{label}</p>
        </div>
    );
}

// 🏷️ Mini Stat Item (For Grid)
function AnalyticStatItem({ label, value, highlight }) {
    return (
        <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block">{label}</span>
            <span className={`text-xl font-bold ${highlight ? "text-blue-400" : "text-zinc-200"}`}>{value}</span>
        </div>
    );
}

// 🏷️ Tab Switch Button
function TabButton({ label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                active 
                    ? "bg-zinc-800 text-white shadow-sm" 
                    : "text-zinc-400 hover:text-white"
            }`}
        >
            {label}
        </button>
    );
}

// 🏷️ Custom Responsive SVG Chart with interactive Tooltips
function CustomSVGChart({ data, type }) {
    const [hoverIndex, setHoverIndex] = useState(null);
    const containerRef = useRef(null);
    const [width, setWidth] = useState(500);
    const height = 180;
    const padding = { top: 15, right: 15, bottom: 25, left: 45 };

    // Update width on resize
    useEffect(() => {
        if (!containerRef.current) return;
        const updateWidth = () => {
            setWidth(containerRef.current.clientWidth);
        };
        updateWidth();
        window.addEventListener("resize", updateWidth);
        return () => window.removeEventListener("resize", updateWidth);
    }, []);

    if (!data || data.length === 0) {
        return (
            <div className="h-full w-full flex items-center justify-center text-zinc-600 text-xs">
                No trend data available.
            </div>
        );
    }

    const maxVal = Math.max(...data.map(d => d.revenue), 100);
    const pointsCount = data.length;

    // Helper coordinates mapper
    const getCoordinates = (index, value) => {
        const x = padding.left + (index / (pointsCount - 1 || 1)) * (width - padding.left - padding.right);
        const y = height - padding.bottom - (value / maxVal) * (height - padding.top - padding.bottom);
        return { x, y };
    };

    // Construct Line Path
    let pathD = "";
    if (type === "line" && pointsCount > 0) {
        pathD = data.map((d, index) => {
            const { x, y } = getCoordinates(index, d.revenue);
            return `${index === 0 ? "M" : "L"} ${x} ${y}`;
        }).join(" ");
    }

    // Construct Area Path for gradient fill
    let areaD = "";
    if (type === "line" && pointsCount > 0) {
        const firstPt = getCoordinates(0, data[0].revenue);
        const lastPt = getCoordinates(pointsCount - 1, data[pointsCount - 1].revenue);
        areaD = `${pathD} L ${lastPt.x} ${height - padding.bottom} L ${firstPt.x} ${height - padding.bottom} Z`;
    }

    // Handle mouse movement for interactive tooltips
    const handleMouseMove = (e) => {
        if (!containerRef.current || pointsCount === 0) return;
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        
        // Find closest point based on x-coordinate
        const chartWidth = width - padding.left - padding.right;
        const relativeX = mouseX - padding.left;
        const rawIndex = (relativeX / chartWidth) * (pointsCount - 1);
        const index = Math.max(0, Math.min(pointsCount - 1, Math.round(rawIndex)));
        setHoverIndex(index);
    };

    const handleMouseLeave = () => {
        setHoverIndex(null);
    };

    // Calculate details for tooltip
    const hoveredPoint = hoverIndex !== null ? data[hoverIndex] : null;
    const tooltipCoords = hoveredPoint ? getCoordinates(hoverIndex, hoveredPoint.revenue) : null;

    return (
        <div 
            ref={containerRef} 
            className="w-full relative select-none"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <svg width={width} height={height} className="overflow-visible">
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                    </linearGradient>
                </defs>

                {/* Gridlines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                    const y = padding.top + ratio * (height - padding.top - padding.bottom);
                    return (
                        <line 
                            key={i}
                            x1={padding.left}
                            y1={y}
                            x2={width - padding.right}
                            y2={y}
                            stroke="#27272a"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                        />
                    );
                })}

                {/* Y Axis Labels */}
                {[0, 0.5, 1].map((ratio, i) => {
                    const val = maxVal * (1 - ratio);
                    const y = padding.top + ratio * (height - padding.top - padding.bottom);
                    return (
                        <text
                            key={i}
                            x={padding.left - 8}
                            y={y + 4}
                            fill="#71717a"
                            fontSize="9"
                            fontFamily="monospace"
                            textAnchor="end"
                        >
                            ₹{val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val.toFixed(0)}
                        </text>
                    );
                })}

                {/* X Axis Labels */}
                {data.map((d, index) => {
                    // Show labels selectively to avoid overcrowding
                    const shouldShowLabel = pointsCount <= 7 
                        || (pointsCount <= 12 && index % 2 === 0)
                        || (pointsCount > 12 && index % 3 === 0)
                        || index === pointsCount - 1;
                    
                    if (!shouldShowLabel) return null;
                    
                    const { x } = getCoordinates(index, 0);
                    return (
                        <text
                            key={index}
                            x={x}
                            y={height - 8}
                            fill="#71717a"
                            fontSize="9"
                            fontFamily="sans-serif"
                            textAnchor="middle"
                        >
                            {d.date || d.week || d.month}
                        </text>
                    );
                })}

                {/* Render Bars (If bar chart) */}
                {type === "bar" && data.map((d, index) => {
                    const { x, y } = getCoordinates(index, d.revenue);
                    const barWidth = Math.max(8, (width - padding.left - padding.right) / pointsCount * 0.6);
                    const barHeight = height - padding.bottom - y;
                    const isHovered = hoverIndex === index;
                    
                    return (
                        <rect
                            key={index}
                            x={x - barWidth / 2}
                            y={y}
                            width={barWidth}
                            height={barHeight}
                            fill={isHovered ? "#3b82f6" : "#2563eb"}
                            opacity={isHovered ? 1.0 : 0.8}
                            rx="3"
                            ry="3"
                            className="transition-all duration-200"
                        />
                    );
                })}

                {/* Render Line Paths & Gradient Fills (If line chart) */}
                {type === "line" && (
                    <>
                        <path 
                            d={areaD} 
                            fill="url(#chartGradient)"
                        />
                        <path 
                            d={pathD} 
                            fill="none" 
                            stroke="#2563eb" 
                            strokeWidth="2.5" 
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </>
                )}

                {/* Hover interactions marker */}
                {hoverIndex !== null && tooltipCoords && (
                    <>
                        {/* Hover vertical alignment line */}
                        <line
                            x1={tooltipCoords.x}
                            y1={padding.top}
                            x2={tooltipCoords.x}
                            y2={height - padding.bottom}
                            stroke="#3b82f6"
                            strokeWidth="1.5"
                            strokeDasharray="2 2"
                        />
                        
                        {/* Bullet point indicator */}
                        <circle
                            cx={tooltipCoords.x}
                            cy={tooltipCoords.y}
                            r="5"
                            fill="#3b82f6"
                            stroke="#09090b"
                            strokeWidth="2"
                        />
                    </>
                )}
            </svg>

            {/* Custom Styled HTML Tooltip on Hover */}
            {hoverIndex !== null && hoveredPoint && tooltipCoords && (
                <div 
                    className="absolute bg-zinc-950 border border-zinc-800 text-white rounded-lg p-2.5 shadow-xl text-xs z-30 transition-all pointer-events-none"
                    style={{
                        left: `${tooltipCoords.x + 10}px`,
                        top: `${tooltipCoords.y - 45}px`,
                        transform: tooltipCoords.x > width * 0.7 ? "translateX(-110%)" : "none"
                    }}
                >
                    <div className="font-semibold text-zinc-400">{hoveredPoint.full_date || hoveredPoint.month}</div>
                    <div className="mt-0.5 text-blue-400 font-bold text-sm">₹{hoveredPoint.revenue.toLocaleString()}</div>
                </div>
            )}
        </div>
    );
}

// 🏷️ Activity Log Row Item
function ActivityItem({ item }) {
    const { timestamp, type, message } = item;
    
    // Format ISO string into a nice user time
    const formatTime = (isoString) => {
        try {
            const dateObj = new Date(isoString);
            return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " - " + dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
        } catch {
            return "Just now";
        }
    };

    let iconBg = "bg-zinc-800 text-zinc-300";
    let iconLabel = "🔔";

    if (type === "business_onboarded") {
        iconBg = "bg-blue-500/10 text-blue-400 border border-blue-500/20";
        iconLabel = "🏢";
    } else if (type === "large_order") {
        iconBg = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
        iconLabel = "🛍️";
    } else if (type === "milestone") {
        iconBg = "bg-purple-500/10 text-purple-400 border border-purple-500/20";
        iconLabel = "🏆";
    }

    return (
        <div className="flex gap-3 text-xs leading-normal items-start group">
            <span className={`flex items-center justify-center w-8 h-8 rounded-xl shrink-0 ${iconBg}`}>
                {iconLabel}
            </span>
            <div className="flex-1 min-w-0">
                <p className="text-zinc-300 group-hover:text-white transition-colors">{message}</p>
                <span className="text-[10px] text-zinc-500 mt-1 block">{formatTime(timestamp)}</span>
            </div>
        </div>
    );
}
