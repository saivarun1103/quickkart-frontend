import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { API_BASE } from "../../config";
import ThemeToggle from "../components/ui/ThemeToggle";
import logoImg from "../../assets/logo.png";
import skipImgLight from "../../assets/queue_skip_transparent_black.png";
import skipImgDark from "../../assets/queue_skip_transparent_white.png";

export default function Orders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const phone = searchParams.get("phone") || "";
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const handleThemeChange = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };
    window.addEventListener("theme-changed", handleThemeChange);
    handleThemeChange();
    return () => window.removeEventListener("theme-changed", handleThemeChange);
  }, []);

  const skipImg = isDarkMode ? skipImgDark : skipImgLight;

  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  // Sync state if URL param updates
  useEffect(() => {
    setSearchInput("");
    setSearchQuery("");
    setCurrentPage(1);
  }, [phone]);

  useEffect(() => {
    if (searchInput.trim() === "" && searchQuery !== "") {
      setSearchQuery("");
      setCurrentPage(1);
    }
  }, [searchInput, searchQuery]);

  const fetchOrders = async () => {
    if (!phone) {
      setOrders([]);
      setTotalOrders(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(false);
      const url = `${API_BASE}/public/orders?phone=${phone}&page=${currentPage}&limit=10${searchQuery ? `&query=${encodeURIComponent(searchQuery)}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
        setTotalOrders(data.total || 0);
        setCustomerName(data.customer_name || "Customer");
      } else {
        setError(true);
      }
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [phone, currentPage, searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const totalPages = Math.ceil(totalOrders / 10);
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    if (currentPage <= 3) {
      return [1, 2, 3, "...", totalPages];
    }
    
    if (currentPage >= totalPages - 2) {
      return [1, "...", totalPages - 2, totalPages - 1, totalPages];
    }
    
    return [1, "...", currentPage, "...", totalPages];
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] dark:bg-black font-sans pb-20 transition-colors duration-500 text-gray-900 dark:text-white">
      {/* PREMIUM STICKY NAVBAR */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-zinc-950/70 border-b border-emerald-500/5 dark:border-emerald-500/10 px-5 py-2 transition-all duration-500">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {/* Brand Logo & Name */}
          <div 
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group" 
            onClick={() => navigate("/discover")}
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white dark:bg-zinc-900 border border-emerald-100/60 dark:border-emerald-900/40 flex items-center justify-center shadow-sm group-hover:border-emerald-300 dark:group-hover:border-emerald-800 transition-all duration-300">
              <img
                src={logoImg}
                alt="GoSkipDQ Logo"
                className="w-5.5 h-5.5 object-contain" 
              />
            </div>
            <span className="text-lg sm:text-xl font-black italic tracking-tighter py-1 leading-normal">
              <span className="text-emerald-500">Go</span>
              <span className="text-black dark:text-white">Skip</span>
              <span className="text-emerald-500">DQ</span>
            </span>
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <ThemeToggle />
              <img
                src={skipImg}
                alt="GoSkipDQ Illustration"
                className="h-8 sm:h-9.5 w-auto object-contain"
              />
          </div>
        </div>
      </header>

      {/* BODY CONTENT */}
      <div className="max-w-2xl mx-auto px-5 pt-6">
        {/* Title */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Order History of {customerName}</h1>
            <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1 font-semibold">
              {phone.length === 10 ? `+91 ${phone}` : phone.startsWith("91") && phone.length === 12 ? `+91 ${phone.slice(2)}` : phone.startsWith("+") ? phone : `+${phone}`}
            </p>
          </div>
          <Link to="/discover" className="text-xs font-bold text-[#1ea753] dark:text-[#1ea753] hover:underline">
            ← Explore spots
          </Link>
        </div>

        {/* SEARCH INPUT BAR FOR FILTERING BY ID OR BUSINESS */}
        <form onSubmit={handleSearchSubmit} className="flex items-stretch w-full mb-8 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/50 focus-within:border-emerald-400 transition-all duration-300">
          <input
            type="text"
            placeholder="Search by Order ID or Business Name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="
              flex-1
              bg-transparent
              pl-5
              pr-4
              py-3.5
              text-base
              outline-none
              text-gray-900
              dark:text-white
            "
          />
          <button
            type="submit"
            className="bg-[#1ea753] hover:bg-[#1ea753]/90 text-white px-6 transition-colors cursor-pointer flex items-center justify-center shrink-0 self-stretch m-0 border-none outline-none"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>

        {/* LOADING SKELETONS */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4 animate-pulse"
              >
                <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-gray-200 dark:bg-zinc-800" />
                    <div className="h-3 w-16 bg-gray-200 dark:bg-zinc-800 rounded" />
                  </div>
                  <div className="h-4 w-12 bg-gray-200 dark:bg-zinc-800 rounded" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-zinc-800 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded w-1/4" />
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-zinc-800/80">
                  <div className="h-3.5 w-10 bg-gray-200 dark:bg-zinc-800 rounded" />
                  <div className="h-5 w-16 bg-gray-200 dark:bg-zinc-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          /* ERROR STATE */
          <div className="text-center py-16 px-6 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl shadow-sm max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400 border border-red-100/30 dark:border-red-900/30">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Something went wrong.</h3>
            <p className="text-gray-500 dark:text-zinc-400 mt-2 text-sm max-w-xs mx-auto">
              We couldn't load your order details. Please check your network and try again.
            </p>
            <button
              onClick={fetchOrders}
              className="mt-6 px-6 py-2.5 bg-[#1ea753] hover:bg-[#1ea753]/90 text-white font-extrabold text-xs rounded-xl shadow transition duration-300 cursor-pointer active:scale-95"
            >
              Retry
            </button>
          </div>
        ) : orders.length === 0 ? (
          /* EMPTY STATE */
          <div className="text-center py-16 px-6 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl shadow-sm max-w-md mx-auto transition-colors duration-500">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/20 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400 border border-emerald-100/30 dark:border-emerald-900/30">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">No Orders Found</h3>
            <p className="text-gray-500 dark:text-zinc-400 mt-2 text-sm max-w-xs mx-auto">
              We couldn't find any orders associated with this mobile number.
            </p>
            <button
              onClick={() => navigate("/discover")}
              className="mt-6 px-6 py-2.5 bg-[#1ea753] hover:bg-[#1ea753]/90 text-white font-extrabold text-xs rounded-xl shadow transition duration-300 cursor-pointer active:scale-95"
            >
              Explore Businesses
            </button>
          </div>
        ) : (
          /* SUCCESS STATE: PREVIEW CARDS LIST */
          <>
            <div className="space-y-4">
              {orders.map((order) => (
                <div 
                  key={order.id}
                  onClick={() => navigate(`/order-success?${order.access_token}`)}
                  className="bg-white dark:bg-zinc-900 border border-[#1ea753]/35 dark:border-[#1ea753]/30 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-[#1ea753] dark:hover:border-[#1ea753] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col gap-3.5 relative group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#1ea753]/0 via-[#1ea753]/0 to-[#1ea753]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  
                  {/* Card Header (GoSkipDQ branding & Order status) */}
                  <div className="flex justify-between items-center pb-3 border-b border-gray-150 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <div className="w-5.5 h-5.5 rounded-lg bg-white border border-emerald-100/60 dark:border-zinc-800/60 flex items-center justify-center shadow-xs">
                        <img src={logoImg} alt="Logo" className="w-3.5 h-3.5 object-contain" />
                      </div>
                      <span className="text-xs font-bold text-gray-400 dark:text-zinc-500">Order #{order.id}</span>
                    </div>
                    
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider border ${
                      order.status === "completed"
                        ? "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-850 dark:text-black-100 dark:border-zinc-700"
                        : order.status === "ready"
                        ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-850"
                        : "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-850"
                    }`}>
                      {order.status === "completed" ? "Completed" : order.status === "ready" ? "Ready" : "Preparing"}
                    </span>
                  </div>

                  {/* Business Details Row */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 dark:bg-zinc-800 shrink-0 border border-gray-100 dark:border-zinc-800 shadow-inner flex items-center justify-center">
                      {order.business_logo_url ? (
                        <img src={order.business_logo_url} alt={order.business_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-[10px] text-gray-400 dark:text-zinc-500">No Logo</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold text-[15px] sm:text-base text-gray-900 dark:text-white truncate">
                        {order.business_name}
                      </h3>
                      <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Footer details row */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-150 dark:border-zinc-800">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider border ${
                        order.payment_status === "paid"
                          ? "bg-green-100 text-green-800 border-green-250 dark:bg-green-950 dark:text-green-300 dark:border-green-850"
                          : "bg-amber-100 text-amber-800 border-amber-250 dark:bg-amber-950 dark:text-amber-350 dark:border-amber-850"
                      }`}>
                        {order.payment_status === "paid" ? "Paid" : "Pending"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-semibold block">Total Amount</span>
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                        ₹{order.total_price}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINATION CONTROLS */}
            {Math.ceil(totalOrders / 10) > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-zinc-800 transition shadow-xs cursor-pointer text-gray-900 dark:text-white"
                >
                  ← Previous
                </button>
                
                <div className="flex items-center gap-1.5">
                  {getPageNumbers().map((page, idx) => {
                    if (page === "...") {
                      return (
                        <span key={`dots-${idx}`} className="px-2 text-xs font-bold text-gray-400 dark:text-zinc-650 select-none">
                          ...
                        </span>
                      );
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 text-xs font-extrabold rounded-xl transition cursor-pointer flex items-center justify-center ${
                          currentPage === page
                            ? "bg-[#1ea753] text-white shadow-xs"
                            : "bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(totalOrders / 10)))}
                  disabled={currentPage === Math.ceil(totalOrders / 10)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-zinc-800 transition shadow-xs cursor-pointer text-gray-900 dark:text-white"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
