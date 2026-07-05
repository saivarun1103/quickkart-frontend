import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../config";
import logoImg from "../assets/logo.png";
import skipImgLight from "../assets/queue_skip_transparent_black.png";
import skipImgDark from "../assets/queue_skip_transparent_white.png";
import ThemeToggle from "../customer/components/ui/ThemeToggle";

export default function Discover() {

  const [query, setQuery] = useState("");
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [countryCode, setCountryCode] = useState("+91");
  const [phoneInput, setPhoneInput] = useState("");
  const [showOrdersModal, setShowOrdersModal] = useState(false);

  const handleFindOrders = (e) => {
    e.preventDefault();
    const cleanNum = phoneInput.trim();
    if (!cleanNum) {
      alert("Please enter your mobile number");
      return;
    }
    
    if (countryCode === "+91" && !/^[6-9]\d{9}$/.test(cleanNum)) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }
    
    if (cleanNum.length < 7 || cleanNum.length > 15) {
      alert("Please enter a valid mobile number");
      return;
    }
    
    let fullPhone = cleanNum;
    if (countryCode === "+91" && cleanNum.length === 10) {
      fullPhone = cleanNum;
    } else {
      const codeClean = countryCode.replace("+", "");
      if (cleanNum.startsWith(codeClean)) {
        fullPhone = cleanNum;
      } else {
        fullPhone = codeClean + cleanNum;
      }
    }
    navigate(`/orders?phone=${fullPhone}`);
  };

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

  useEffect(() => {

    const fetchBusinesses = async () => {

        try {

        setLoading(true);

        // SEARCH
        if (query.trim()) {

            const response =
            await axios.get(
                `${API_BASE}/public/business/search?q=${query}`
            );

            setBusinesses(
            response.data
            );
        }

        // POPULAR
        else {

            const response =
            await axios.get(
                `${API_BASE}/public/business/popular`
            );

            setBusinesses(
            response.data
            );
        }

        } catch (error) {

        console.error(
            "Failed:",
            error
        );

        } finally {

        setLoading(false);

        }
    };

    const timeout = setTimeout(
        fetchBusinesses,
        400
    );

    return () =>
        clearTimeout(timeout);

    }, [query]);

  return (
    <div className="min-h-screen bg-[#f3f4f6] dark:bg-black font-sans pb-20 selection:bg-emerald-100 selection:text-emerald-900 transition-colors duration-500">

      {/* PREMIUM STICKY NAVBAR */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-zinc-950/70 border-b border-emerald-500/5 dark:border-emerald-500/10 px-5 py-2 transition-all duration-500">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          
          {/* Brand Logo & Name */}
          <div 
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group" 
            onClick={() => {
              setQuery("");
              navigate("/");
            }}
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
              <button
                onClick={() => setShowOrdersModal(true)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850/80 flex items-center justify-center shadow-sm hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-300 cursor-pointer"
                title="View My Orders"
              >
                <span className="text-sm sm:text-base">📦</span>
              </button>
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
      <div className="max-w-2xl mx-auto px-5 pt-1.5">

        {/* HERO TITLE HEADER */}
        <div className="mb-6">

            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/65 dark:bg-emerald-900/30 rounded-full uppercase tracking-wider mb-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Skip the waiting lines
            </span>

            <h1 className="
            text-2.5xl sm:text-3.5xl
            font-extrabold
            text-gray-900 dark:text-white
            tracking-tight
            leading-tight
            ">
            Discover & Order from <br />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Favorite Local Spots</span>
            </h1>

        </div>

        {/* SEARCH INPUT */}
        <div className="relative flex items-center w-full">

            <input
            type="text"
            placeholder="Search business or business phone number"
            value={query}
            onChange={(e) =>
                setQuery(e.target.value)
            }
            className="
                w-full
                rounded-2xl
                border
                border-gray-200
                dark:border-zinc-800
                bg-white
                dark:bg-zinc-900
                pl-5
                pr-12
                py-4
                text-lg
                outline-none
                shadow-sm
                transition
                focus:ring-2
                focus:ring-emerald-500/50
                focus:border-emerald-400
                text-gray-900
                dark:text-white
            "
            />

            {query && (
                <button
                    onClick={() => setQuery("")}
                    className="absolute right-4 text-gray-400 hover:text-emerald-600 transition-colors cursor-pointer"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}

        </div>

        {/* Find my orders card removed to reduce layout space */}

        {/* LOADING SKELETONS */}
        {loading ? (
            <div className="mt-8 space-y-4">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="animate-pulse bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-4 sm:p-5 flex items-center gap-4 sm:gap-5 shadow-sm"
                    >
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-200 dark:bg-zinc-800 shrink-0" />
                        <div className="flex-1 py-1 space-y-3">
                            <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-1/4" />
                            <div className="h-5.5 bg-gray-200 dark:bg-zinc-800 rounded w-3/4" />
                            <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <>
                {/* NO RESULTS EMPTY STATE */}
                {businesses.length === 0 && query && (
                    <div className="mt-8 text-center py-16 px-6 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl shadow-sm max-w-md mx-auto">
                        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/20 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400 border border-emerald-100/30 dark:border-emerald-900/30">
                            <svg
                                className="w-8 h-8"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2.5"
                                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                            No businesses found
                        </h3>
                        <p className="text-gray-500 dark:text-zinc-400 mt-2 text-sm max-w-xs mx-auto">
                            We couldn&apos;t find any business matching &quot;{query}&quot;. Try checking your spelling or searching for another keyword.
                        </p>
                    </div>
                )}

                {/* RESULTS */}
                <div className="mt-8 space-y-4">
                    {businesses.map((business) => (
                        <div
                            key={business.id}
                            onClick={() => navigate(`/${business.slug}`)}
                            className="
                            group
                            bg-white
                            dark:bg-zinc-900
                            rounded-3xl
                            border
                            border-gray-100
                            dark:border-zinc-800/80
                            hover:border-emerald-200
                            dark:hover:border-emerald-800
                            shadow-sm
                            hover:shadow-md
                            hover:shadow-emerald-600/5
                            hover:-translate-y-0.5
                            transition-all
                            duration-300
                            cursor-pointer
                            overflow-hidden
                            "
                        >
                            <div className="
                            p-4 sm:p-5
                            flex
                            items-center
                            gap-4 sm:gap-5
                            ">
                                {/* LOGO */}
                                <div className="
                                    w-16 h-16 sm:w-20 sm:h-20
                                    rounded-2xl
                                    overflow-hidden
                                    bg-gray-100
                                    dark:bg-zinc-800
                                    flex
                                    items-center
                                    justify-center
                                    shrink-0
                                ">
                                    {business.logo_url ? (
                                        <img
                                            src={business.logo_url}
                                            alt={business.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-gray-400 dark:text-zinc-500 text-xs">
                                            No Logo
                                        </div>
                                    )}
                                </div>

                                {/* CONTENT */}
                                <div className="flex-1 min-w-0">
                                    <div className="
                                    w-full
                                    flex
                                    flex-col sm:flex-row
                                    sm:justify-between
                                    sm:items-start
                                    gap-2 sm:gap-4
                                    ">
                                        <div className="min-w-0">
                                            <h2 className="
                                            text-lg sm:text-xl
                                            font-semibold
                                            text-gray-900
                                            dark:text-white
                                            truncate
                                            ">
                                                {business.name}
                                            </h2>
                                            <p className="
                                            text-gray-500
                                            dark:text-zinc-400
                                            text-sm
                                            mt-1
                                            ">
                                                {business.business_phone}
                                            </p>
                                            {business.address_name && (
                                                <p className="
                                                text-gray-400
                                                dark:text-zinc-500
                                                text-xs
                                                mt-1
                                                truncate
                                                ">
                                                    {business.address_name}
                                                </p>
                                            )}
                                        </div>

                                        <span className="
                                            bg-emerald-50
                                            dark:bg-emerald-950/20
                                            text-emerald-700
                                            dark:text-emerald-400
                                            border
                                            border-emerald-100/50
                                            dark:border-emerald-900/30
                                            text-[10px] sm:text-xs
                                            font-semibold
                                            px-2.5
                                            py-1 sm:px-3 sm:py-1.5
                                            rounded-full
                                            self-start
                                            shrink-0
                                        ">
                                            {business.business_type || "Business"}
                                        </span>
                                    </div>
                                </div>

                                {/* MICRO-INTERACTION HOVER ARROW BUTTON */}
                                <div className="hidden sm:flex w-10 h-10 rounded-full bg-gray-50 dark:bg-zinc-800 group-hover:bg-emerald-600 items-center justify-center shrink-0 border border-gray-100 dark:border-zinc-700 group-hover:border-emerald-600 dark:group-hover:border-emerald-600 transition-all duration-300 shadow-sm group-hover:shadow-lg group-hover:shadow-emerald-600/25">
                                    <svg
                                        className="w-5 h-5 text-gray-400 group-hover:text-white transform group-hover:translate-x-0.5 transition-all duration-300"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2.5"
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </>
        )}
        {/* Footer with Privacy Policy link */}
        <footer className="mt-16 border-t border-gray-100 dark:border-zinc-800 pt-8 pb-4 text-center">
          <p className="text-xs text-gray-400 dark:text-zinc-500">
            © {new Date().getFullYear()} GoSkipDQ. All rights reserved.
          </p>
          <div className="mt-2 flex justify-center gap-4">
            <Link 
              to="/privacy-policy" 
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 hover:underline transition-all"
            >
              Privacy Policy
            </Link>
          </div>
        </footer>

        </div>

      {/* FIND MY ORDERS MODAL */}
      {showOrdersModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            onClick={() => setShowOrdersModal(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-left">
            <button 
              onClick={() => setShowOrdersModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-start gap-3.5 mb-4">
              <span className="text-2xl shrink-0">📦</span>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Find My Orders</h2>
                <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1 leading-normal">
                  Enter the mobile number you used while placing your orders to view your order history.
                </p>
              </div>
            </div>

            <form 
              onSubmit={(e) => {
                handleFindOrders(e);
                setShowOrdersModal(false);
              }} 
              className="space-y-4"
            >
              <div className="flex gap-2">
                {/* Country code selector */}
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white border border-gray-200 dark:border-zinc-700 px-3 py-3 rounded-2xl text-sm font-semibold outline-none focus:border-emerald-500 transition-colors cursor-pointer select-none"
                >
                  <option value="+91">+91 (IN)</option>
                  <option value="+1">+1 (US)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+61">+61 (AU)</option>
                </select>
                
                {/* Phone input */}
                <input
                  type="tel"
                  placeholder="Enter mobile number"
                  value={phoneInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setPhoneInput(val);
                  }}
                  className="flex-1 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white border border-gray-200 dark:border-zinc-700 px-4 py-3 rounded-2xl text-sm font-semibold outline-none focus:border-emerald-500 transition-colors shadow-inner"
                  autoFocus
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-[#1ea753] hover:bg-[#1ea753]/90 text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-sm transition-all duration-300 active:scale-95 cursor-pointer text-center"
              >
                View Orders
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
    );
}