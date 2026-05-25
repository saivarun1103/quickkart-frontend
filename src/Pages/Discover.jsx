import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../config";

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
    <div className="min-h-screen bg-[#fafafa] px-5 py-10">

        <div className="max-w-2xl mx-auto">

        {/* HEADER */}
        <div className="mb-8">

            <h1 className="
            text-4xl
            font-bold
            text-gray-900
            ">
            Discover
            </h1>

            <p className="
            text-gray-500
            mt-2
            ">
            Find businesses and order instantly
            </p>

        </div>

        {/* SEARCH INPUT */}
        <div className="relative">

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
                px-5
                py-4
                text-lg
                outline-none
                shadow-sm
                transition
                focus:ring-2
                focus:ring-black
            "
            />

        </div>

        {/* LOADING */}
        {loading && (
            <p className="
            mt-4
            text-gray-500
            ">
            Searching...
            </p>
        )}

        {/* NO RESULTS */}
        {!loading &&
            businesses.length === 0 &&
            query && (
            <p className="
                mt-4
                text-gray-500
            ">
                No businesses found
            </p>
            )}

        {/* RESULTS */}
        <div className="mt-8 space-y-4">

            {businesses.map((business) => (

            <div
                key={business.id}
                onClick={() =>
                navigate(
                    `/${business.slug}`
                )
                }
                className="
                group
                bg-white
                rounded-3xl
                border
                border-gray-100
                shadow-sm
                hover:shadow-xl
                hover:-translate-y-1
                transition-all
                duration-300
                cursor-pointer
                overflow-hidden
                "
            >

                <div className="
                p-5
                flex
                items-center
                gap-5
                ">

                {/* LOGO */}
                <div className="
                    w-20
                    h-20
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
                        className="
                        w-full
                        h-full
                        object-cover
                        "
                    />

                    ) : (

                    <div className="
                        text-gray-400
                        text-xs
                    ">
                        No Logo
                    </div>

                    )}

                </div>

                {/* CONTENT */}
                <div className="flex-1">

                    <div className="
                    flex
                    justify-between
                    items-start
                    ">

                    <div>

                        <h2 className="
                        text-xl
                        font-semibold
                        text-gray-900
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

                    </div>

                    <span className="
                        bg-gray-100
                        text-gray-700
                        text-xs
                        font-medium
                        px-3
                        py-1.5
                        rounded-full
                    ">
                        {business.business_type || "Business"}
                    </span>

                    </div>

                </div>

                </div>

            </div>

            ))}

        </div>

        </div>

    </div>
    );
}