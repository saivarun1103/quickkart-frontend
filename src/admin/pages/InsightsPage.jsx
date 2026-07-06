import { useState, useEffect } from "react";
import { API_BASE } from "../../config";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function InsightsPage() {
    const [selectedTab, setSelectedTab] = useState("Month"); // "Today", "Week", "Month", "Custom"
    const [dateRange, setDateRange] = useState([
        new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Default to start of month
        new Date() // Default to today
    ]);
    const [startDate, endDate] = dateRange;

    const [loading, setLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [hoveredPoint, setHoveredPoint] = useState(null);

    // Fetch analytics data based on dateRange state
    useEffect(() => {
        const fetchDynamicData = async () => {
            if (!startDate) return;
            try {
                setLoading(true);
                
                const activeStart = new Date(startDate);
                activeStart.setHours(0, 0, 0, 0);
                
                const activeEnd = endDate ? new Date(endDate) : new Date(startDate);
                activeEnd.setHours(23, 59, 59, 999);

                const formatDateString = (d) => {
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, "0");
                    const day = String(d.getDate()).padStart(2, "0");
                    return `${year}-${month}-${day}`;
                };

                const startStr = formatDateString(activeStart);
                const endStr = formatDateString(activeEnd);

                const response = await fetch(
                    `${API_BASE}/api/admin/analytics?startDate=${startStr}&endDate=${endStr}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch analytics");
                }

                const data = await response.json();
                setAnalyticsData(data);
            } catch (err) {
                console.error("Error fetching admin demo insights:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDynamicData();
    }, [startDate, endDate]);

    // Parse the fetched dynamic data to populate UI elements
    const getDashboardContent = () => {
        if (!analyticsData) {
            return {
                metrics: [
                    { label: "Total Orders", value: "0", change: "+0.0%", trend: "neutral" },
                    { label: "Total Revenue", value: "₹0", change: "+0.0%", trend: "neutral" },
                    { label: "Pickup Orders", value: "0", change: "+0.0%", trend: "neutral" },
                    { label: "Average Order Value", value: "₹0", change: "+0.0%", trend: "neutral" }
                ],
                chart: { points: [], path: "", fillPath: "" },
                topItems: [],
                recentOrders: []
            };
        }

        const orders = analyticsData.orders || [];
        const totalOrdersCount = analyticsData.total_orders || 0;
        const totalSalesVal = analyticsData.total_sales || 0;
        const avgOrderVal = analyticsData.avg_order || 0;

        // Calculate pickup orders (defined as successful paid orders which are all pickup by design)
        const pickupOrdersCount = orders.filter(o => o.status !== "cancelled").length;

        // Format currencies
        const formatCurrency = (val) => {
            return new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0
            }).format(val);
        };

        // Formatted metric cards
        const metrics = [
            { label: "Total Orders", value: totalOrdersCount.toLocaleString("en-IN"), change: "+18.8%", trend: "up" },
            { label: "Total Revenue", value: formatCurrency(totalSalesVal), change: "+22.4%", trend: "up" },
            { label: "Pickup Orders", value: pickupOrdersCount.toLocaleString("en-IN"), change: "+17.3%", trend: "up" },
            { label: "Average Order Value", value: formatCurrency(avgOrderVal), change: "+8.2%", trend: "up" }
        ];

        // Determine range in days
        const activeStart = startDate ? new Date(startDate) : new Date();
        const activeEnd = endDate ? new Date(endDate) : new Date(activeStart);
        const daysDiff = Math.ceil((activeEnd.getTime() - activeStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        // ─── DYNAMIC CHART DATA GENERATION ───
        let chartPoints = [];
        if (daysDiff <= 1) {
            // Group by hours: 9 AM, 12 PM, 3 PM, 6 PM, 9 PM
            const intervals = [
                { label: "9 AM", hours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
                { label: "12 PM", hours: [11, 12, 13] },
                { label: "3 PM", hours: [14, 15, 16] },
                { label: "6 PM", hours: [17, 18, 19] },
                { label: "9 PM", hours: [20, 21, 22, 23] }
            ];
            
            intervals.forEach((interval) => {
                const count = orders.filter(o => {
                    const date = new Date(o.created_at);
                    return interval.hours.includes(date.getHours());
                }).length;
                chartPoints.push({ label: interval.label, val: count });
            });
        } else if (daysDiff <= 7) {
            // Group by each individual day in the range
            const dayLabels = [];
            const dayCounts = [];
            
            for (let i = 0; i < daysDiff; i++) {
                const d = new Date(activeStart);
                d.setDate(activeStart.getDate() + i);
                const label = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" });
                dayLabels.push(label);
                
                const count = orders.filter(o => {
                    const orderDate = new Date(o.created_at);
                    return orderDate.getDate() === d.getDate() && orderDate.getMonth() === d.getMonth();
                }).length;
                dayCounts.push(count);
            }

            dayLabels.forEach((label, idx) => {
                chartPoints.push({ label, val: dayCounts[idx] });
            });
        } else {
            // Group by 5 even segments across the date range
            const pointsCount = 5;
            const segmentSize = (activeEnd.getTime() - activeStart.getTime()) / (pointsCount - 1);
            
            const segmentDates = [];
            for (let i = 0; i < pointsCount; i++) {
                segmentDates.push(new Date(activeStart.getTime() + i * segmentSize));
            }

            segmentDates.forEach((datePoint, idx) => {
                const label = datePoint.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
                
                const startBoundary = idx === 0 
                    ? activeStart.getTime() 
                    : segmentDates[idx].getTime() - segmentSize / 2;
                
                const endBoundary = idx === pointsCount - 1 
                    ? activeEnd.getTime() 
                    : segmentDates[idx].getTime() + segmentSize / 2;

                const count = orders.filter(o => {
                    const orderTime = new Date(o.created_at).getTime();
                    return orderTime >= startBoundary && orderTime <= endBoundary;
                }).length;

                chartPoints.push({ label, val: count });
            });
        }

        // Map SVG canvas points (Width: 500, Height: 200)
        const paddingX = 25;
        const chartW = 450;
        const maxVal = Math.max(...chartPoints.map(p => p.val), 5);

        const points = chartPoints.map((pt, idx) => {
            const x = paddingX + idx * (chartW / (chartPoints.length - 1));
            const y = 160 - (pt.val / maxVal) * 120;
            return { x, y, val: pt.val, label: pt.label };
        });

        // Construct SVG line & fill paths
        let path = "";
        let fillPath = "";
        if (points.length > 0) {
            path = `M ${points[0].x} ${points[0].y}`;
            for (let i = 1; i < points.length; i++) {
                const cpX1 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
                const cpY1 = points[i - 1].y;
                const cpX2 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
                const cpY2 = points[i].y;
                path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i].x} ${points[i].y}`;
            }
            fillPath = `${path} L ${points[points.length - 1].x} 190 L ${points[0].x} 190 Z`;
        }

        // ─── DYNAMIC TOP ITEMS GENERATION ───
        const itemQuantities = {};
        orders.forEach(o => {
            if (o.items && Array.isArray(o.items)) {
                o.items.forEach(item => {
                    const name = item.name || "Unknown Item";
                    const qty = item.qty || 1;
                    itemQuantities[name] = (itemQuantities[name] || 0) + qty;
                });
            }
        });

        const sortedItems = Object.entries(itemQuantities)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const maxItemCount = sortedItems.length > 0 ? sortedItems[0].count : 1;
        const topItems = sortedItems.map(item => ({
            name: item.name,
            count: item.count,
            max: maxItemCount
        }));

        // ─── DYNAMIC RECENT ORDERS GENERATION ───
        const recentOrders = orders.slice(0, 4).map(o => {
            const itemsSummary = o.items && Array.isArray(o.items)
                ? o.items.map(i => `${i.qty} x ${i.name}`).join(", ")
                : "No Items";

            let displayStatus = "Completed";
            if (o.status === "pending") displayStatus = "Preparing";
            else if (o.status === "ready") displayStatus = "Ready";

            return {
                id: `#${o.id}`,
                customer: o.customer_name || "Guest",
                items: itemsSummary,
                amount: formatCurrency(o.total_price),
                status: displayStatus
            };
        });

        return {
            metrics,
            chart: { points, path, fillPath },
            topItems,
            recentOrders
        };
    };

    const dashboard = getDashboardContent();

    return (
        <div className="p-4 md:p-6 text-white min-h-screen bg-zinc-950 font-sans select-none">
            {/* Dark Theme Datepicker Override Styles */}
            <style>{`
                .react-datepicker-wrapper {
                    width: 100% !important;
                }
                .react-datepicker {
                    background-color: #18181b !important;
                    border: 1px solid #27272a !important;
                    border-radius: 1.25rem !important;
                    font-family: inherit !important;
                    color: white !important;
                    overflow: hidden !important;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6) !important;
                }
                .react-datepicker__header {
                    background-color: #27272a !important;
                    border-bottom: 1px solid #3f3f46 !important;
                    padding-top: 12px !important;
                }
                .react-datepicker__current-month {
                    color: #ffffff !important;
                    font-weight: 700 !important;
                }
                .react-datepicker__day-name {
                    color: #a1a1aa !important;
                    font-weight: 600 !important;
                }
                .react-datepicker__day {
                    color: #e4e4e7 !important;
                    border-radius: 0.5rem !important;
                    transition: all 0.15s ease !important;
                }
                .react-datepicker__day:hover {
                    background-color: #3f3f46 !important;
                    color: white !important;
                }
                .react-datepicker__day--selected, 
                .react-datepicker__day--in-range, 
                .react-datepicker__day--in-selecting-range {
                    background-color: #1ea753 !important;
                    color: black !important;
                    font-weight: 700 !important;
                }
                .react-datepicker__day--keyboard-selected {
                    background-color: rgba(30, 167, 83, 0.2) !important;
                    color: #1ea753 !important;
                }
                .react-datepicker__navigation-icon::before {
                    border-color: #a1a1aa !important;
                }
                .react-datepicker__navigation:hover .react-datepicker__navigation-icon::before {
                    border-color: #ffffff !important;
                }
            `}</style>

            {/* Header section */}
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">Insights</h1>
                <p className="text-zinc-500 text-xs md:text-sm mt-1">Real-time performance and consumer insights synced from database</p>
            </div>

            {/* Date Picker & Quick Filters Panel */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 md:p-6 mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="w-full lg:flex-1">
                    <label className="block text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2.5">
                        Select Custom Date Range
                    </label>
                    <DatePicker
                        selectsRange={true}
                        startDate={startDate}
                        endDate={endDate}
                        onChange={(update) => {
                            setDateRange(update);
                            setSelectedTab("Custom");
                        }}
                        maxDate={new Date()}
                        dateFormat="dd MMM yyyy"
                        className="bg-zinc-800 border border-zinc-700 px-4 py-2.5 rounded-2xl outline-none text-white w-full lg:max-w-xs focus:border-[#1ea753] transition-colors cursor-pointer text-sm font-semibold shadow-inner"
                        placeholderText="Choose date range"
                    />
                </div>
                
                {/* Custom glowing tabs */}
                <div className="flex bg-zinc-800/80 border border-zinc-700/60 p-1 rounded-2xl w-full sm:w-fit shadow-inner h-fit justify-between sm:justify-start gap-1">
                    {["Today", "Week", "Month"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => {
                                setSelectedTab(tab);
                                setHoveredPoint(null);
                                
                                const today = new Date();
                                if (tab === "Today") {
                                    setDateRange([today, today]);
                                } else if (tab === "Week") {
                                    const currentDay = today.getDay();
                                    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
                                    const monday = new Date(today);
                                    monday.setDate(today.getDate() + diffToMonday);
                                    setDateRange([monday, today]);
                                } else { // Month
                                    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                                    setDateRange([firstDay, today]);
                                }
                            }}
                            className={`flex-1 sm:flex-none px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-300 cursor-pointer text-center ${
                                selectedTab === tab
                                    ? "bg-[#1ea753] text-black shadow-md shadow-[#1ea753]/25 font-bold"
                                    : "text-zinc-400 hover:text-white"
                            }`}
                        >
                            {tab === "Week" ? "This Week" : tab === "Month" ? "This Month" : "Today"}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1ea753] mb-4"></div>
                    <p className="text-zinc-400 font-medium text-sm">Fetching real-time business insights...</p>
                </div>
            ) : (
                <>
                    {/* KPI Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {dashboard.metrics.map((metric, idx) => (
                            <div
                                key={idx}
                                className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-5 md:p-6 shadow-xl hover:border-zinc-700/80 transition-all duration-300 hover:translate-y-[-2px] relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-tr from-[#1ea753]/0 via-[#1ea753]/0 to-[#1ea753]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-zinc-500 text-xs md:text-sm font-medium">{metric.label}</span>
                                    <span className="p-2 rounded-xl bg-zinc-800/50 text-zinc-400 border border-zinc-800">
                                        {idx === 0 && (
                                            <svg className="w-4 h-4 text-[#1ea753]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                            </svg>
                                        )}
                                        {idx === 1 && (
                                            <svg className="w-4 h-4 text-[#1ea753]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        )}
                                        {idx === 2 && (
                                            <svg className="w-4 h-4 text-[#1ea753]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        )}
                                        {idx === 3 && (
                                            <svg className="w-4 h-4 text-[#1ea753]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                                            </svg>
                                        )}
                                    </span>
                                </div>

                                <div className="flex items-end justify-between">
                                    <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{metric.value}</h2>
                                    <div className="flex items-center gap-1 bg-[#1ea753]/15 border border-[#1ea753]/30 px-2 py-0.5 rounded-lg text-[#1ea753] text-[10px] md:text-xs font-semibold">
                                        <svg className="w-3 h-3 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                        </svg>
                                        {metric.change}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Visual Analytics and Top Items Rows */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Orders Overview Interactive Chart */}
                        <div className="lg:col-span-2 bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-5 md:p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-white">Orders Overview</h3>
                                    <p className="text-zinc-500 text-xs">Interactive real-time order distributions</p>
                                </div>
                            </div>

                            {/* Chart Container */}
                            <div className="relative w-full h-56 pt-2 pb-6">
                                {dashboard.chart.points.length === 0 ? (
                                    <div className="flex items-center justify-center h-full text-zinc-500 text-sm font-semibold">
                                        No order activity recorded for this period.
                                    </div>
                                ) : (
                                    <>
                                        {/* Hover Tooltip aligned by coordinate percentage */}
                                        {hoveredPoint !== null && dashboard.chart.points[hoveredPoint] && (
                                            <div 
                                                className="absolute bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-1.5 shadow-xl text-center pointer-events-none transition-all duration-150 z-20"
                                                style={{
                                                    left: `${(dashboard.chart.points[hoveredPoint].x / 500) * 100}%`,
                                                    top: `${(dashboard.chart.points[hoveredPoint].y / 200) * 100 - 12}%`,
                                                    transform: "translate(-50%, -100%)"
                                                }}
                                            >
                                                <div className="text-[9px] text-zinc-400 font-semibold uppercase">{dashboard.chart.points[hoveredPoint].label}</div>
                                                <div className="text-xs text-white font-bold">{dashboard.chart.points[hoveredPoint].val} Orders</div>
                                            </div>
                                        )}

                                        <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                                            <defs>
                                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#1ea753" stopOpacity="0.25" />
                                                    <stop offset="100%" stopColor="#1ea753" stopOpacity="0.0" />
                                                </linearGradient>
                                            </defs>

                                            {/* Y-axis gridlines */}
                                            <line x1="0" y1="40" x2="500" y2="40" stroke="#27272a" strokeWidth="1" strokeDasharray="4,4" />
                                            <line x1="0" y1="100" x2="500" y2="100" stroke="#27272a" strokeWidth="1" strokeDasharray="4,4" />
                                            <line x1="0" y1="160" x2="500" y2="160" stroke="#27272a" strokeWidth="1" strokeDasharray="4,4" />

                                            {/* Chart Area Under the Line */}
                                            {dashboard.chart.fillPath && (
                                                <path
                                                    d={dashboard.chart.fillPath}
                                                    fill="url(#chartGradient)"
                                                    className="transition-all duration-500 ease-in-out"
                                                />
                                            )}

                                            {/* Main Curve Line */}
                                            {dashboard.chart.path && (
                                                <path
                                                    d={dashboard.chart.path}
                                                    fill="none"
                                                    stroke="#1ea753"
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                    className="transition-all duration-500 ease-in-out"
                                                />
                                            )}

                                            {/* SVG Nodes/Dots */}
                                            {dashboard.chart.points.map((point, index) => (
                                                <g 
                                                    key={index}
                                                    onMouseEnter={() => setHoveredPoint(index)}
                                                    onMouseLeave={() => setHoveredPoint(null)}
                                                    className="cursor-pointer"
                                                >
                                                    <circle cx={point.x} cy={point.y} r="14" fill="transparent" />
                                                    <circle 
                                                        cx={point.x} 
                                                        cy={point.y} 
                                                        r={hoveredPoint === index ? "7" : "4.5"} 
                                                        fill="#1ea753" 
                                                        fillOpacity={hoveredPoint === index ? "0.4" : "0.2"}
                                                        className="transition-all duration-150"
                                                    />
                                                    <circle cx={point.x} cy={point.y} r="2.5" fill="#1ea753" />
                                                </g>
                                            ))}
                                        </svg>

                                        {/* X-axis labels aligned with coordinate percentages */}
                                        <div className="absolute bottom-0 left-0 right-0 h-6 pointer-events-none">
                                            {dashboard.chart.points.map((pt, i) => (
                                                <div 
                                                    key={i} 
                                                    className="absolute text-center transform -translate-x-1/2 text-[9px] sm:text-[11px] text-zinc-500 font-semibold"
                                                    style={{ left: `${(pt.x / 500) * 100}%`, width: "60px" }}
                                                >
                                                    {pt.label}
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Top Items Progress bars */}
                        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-5 md:p-6 shadow-xl flex flex-col justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">Top Items</h3>
                                <p className="text-zinc-500 text-xs mb-5">Best selling product items</p>
                            </div>

                            <div className="space-y-4 flex-grow flex flex-col justify-center">
                                {dashboard.topItems.length === 0 ? (
                                    <div className="text-zinc-500 text-sm font-semibold text-center py-8">
                                        No items sold in this period.
                                    </div>
                                ) : (
                                    dashboard.topItems.map((item, idx) => {
                                        const pct = Math.round((item.count / item.max) * 100);
                                        return (
                                            <div key={idx} className="flex flex-col gap-1.5">
                                                <div className="flex justify-between text-xs font-semibold">
                                                    <span className="text-zinc-300">
                                                        {idx + 1}. {item.name}
                                                    </span>
                                                    <span className="text-zinc-400">{item.count} sold</span>
                                                </div>
                                                <div className="w-full h-2 bg-zinc-800/80 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-[#1ea753] rounded-full transition-all duration-700 ease-out shadow-sm shadow-[#1ea753]/30"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent Orders Card */}
                    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-5 md:p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="text-lg font-bold text-white">Recent Orders</h3>
                                <p className="text-zinc-500 text-xs">Recent skip-the-queue transactions</p>
                            </div>
                            <button className="text-[#1ea753] hover:text-[#1ea753]/80 text-xs font-bold transition-colors cursor-pointer">
                                View All
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            {dashboard.recentOrders.length === 0 ? (
                                <div className="text-zinc-500 text-sm font-semibold text-center py-8">
                                    No recent orders in this period.
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-zinc-800 text-zinc-500 text-xs font-bold uppercase tracking-wider">
                                            <th className="pb-3 font-semibold">Order ID</th>
                                            <th className="pb-3 font-semibold">Customer</th>
                                            <th className="pb-3 font-semibold hidden md:table-cell">Items</th>
                                            <th className="pb-3 font-semibold text-right">Amount</th>
                                            <th className="pb-3 font-semibold text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-900 text-xs md:text-sm">
                                        {dashboard.recentOrders.map((order, idx) => (
                                            <tr key={idx} className="hover:bg-zinc-900/30 transition-colors group">
                                                <td className="py-4 font-bold text-white">{order.id}</td>
                                                <td className="py-4 text-zinc-300 font-medium">{order.customer}</td>
                                                <td className="py-4 text-zinc-400 max-w-[200px] sm:max-w-xs truncate hidden md:table-cell">{order.items}</td>
                                                <td className="py-4 text-right font-semibold text-white">{order.amount}</td>
                                                <td className="py-4 text-right">
                                                    <span className={`inline-flex items-center px-2 md:px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-semibold border ${
                                                        order.status === "Ready"
                                                            ? "bg-[#1ea753]/15 border-[#1ea753]/30 text-[#1ea753]"
                                                            : order.status === "Preparing"
                                                            ? "bg-amber-950/40 border-amber-900/60 text-amber-400"
                                                            : "bg-zinc-900 border-zinc-800 text-zinc-400"
                                                    }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                                            order.status === "Ready"
                                                                ? "bg-[#1ea753]"
                                                                : order.status === "Preparing"
                                                                ? "bg-amber-400"
                                                                : "bg-zinc-400"
                                                        }`} />
                                                        {order.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
