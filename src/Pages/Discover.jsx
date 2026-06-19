import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../config";
import logoImg from "../assets/logo.png";

export default function Discover() {

  const [query, setQuery] = useState("");
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-[#f3f4f6] px-5 py-10">

        <div className="max-w-2xl mx-auto">

        {/* HEADER */}
        <div className="mb-8 flex flex-row justify-between items-center gap-4">

            <div>

                <h1 className="
                text-3xl sm:text-4xl
                font-bold
                text-gray-900
                ">
                Discover
                </h1>

                <p className="
                text-gray-500
                text-sm sm:text-base
                mt-1 sm:mt-2
                ">
                Find businesses and order instantly
                </p>

            </div>

            <div className="flex items-center gap-2 sm:gap-3 bg-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl border border-gray-100 shadow-sm shrink-0">

                <img
                    src={logoImg}
                    alt="GoSkipDQ Logo"
                    className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                />

                <span className="font-bold text-gray-800 text-base sm:text-lg tracking-tight whitespace-nowrap">
                    GoSkipDQ
                </span>

            </div>

        </div>

        {/* SEARCH INPUT */}
        <div className="relative flex items-center w-full">

            <input
            type="text"
            placeholder="Search business or phone number"
            value={query}
            onChange={(e) =>
                setQuery(e.target.value)
            }
            className="
                w-full
                rounded-2xl
                border
                border-gray-200
                bg-white
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

        {/* LOADING SKELETONS */}
        {loading ? (
            <div className="mt-8 space-y-4">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="animate-pulse bg-white border border-gray-100 rounded-3xl p-4 sm:p-5 flex items-center gap-4 sm:gap-5 shadow-sm"
                    >
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-200 shrink-0" />
                        <div className="flex-1 py-1 space-y-3">
                            <div className="h-4 bg-gray-200 rounded w-1/4" />
                            <div className="h-5.5 bg-gray-200 rounded w-3/4" />
                            <div className="h-4 bg-gray-200 rounded w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <>
                {/* NO RESULTS EMPTY STATE */}
                {businesses.length === 0 && query && (
                    <div className="mt-8 text-center py-16 px-6 bg-white border border-gray-100 rounded-3xl shadow-sm max-w-md mx-auto">
                        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 border border-emerald-100/30">
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
                        <h3 className="text-lg font-bold text-gray-800">
                            No businesses found
                        </h3>
                        <p className="text-gray-500 mt-2 text-sm max-w-xs mx-auto">
                            We couldn't find any business matching "{query}". Try checking your spelling or searching for another keyword.
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
                            rounded-3xl
                            border
                            border-gray-100
                            hover:border-emerald-200
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
                                        <div className="text-gray-400 text-xs">
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
                                            truncate
                                            ">
                                                {business.name}
                                            </h2>
                                            <p className="
                                            text-gray-500
                                            text-sm
                                            mt-1
                                            ">
                                                {business.business_phone}
                                            </p>
                                            {business.address_name && (
                                                <p className="
                                                text-gray-400
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
                                            text-emerald-700
                                            border
                                            border-emerald-100/50
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
                                <div className="hidden sm:flex w-10 h-10 rounded-full bg-gray-50 group-hover:bg-emerald-600 items-center justify-center shrink-0 border border-gray-100 group-hover:border-emerald-600 transition-all duration-300 shadow-sm group-hover:shadow-lg group-hover:shadow-emerald-600/25">
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

        </div>

    </div>
    );
}