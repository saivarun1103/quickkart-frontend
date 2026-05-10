import {
    useEffect,
    useState
} from "react";
import { API_BASE } from "../../config";

export default function AnalyticsPage() {

    const today = new Date()
        .toISOString()
        .split("T")[0]

    const [selectedDate, setSelectedDate] =
        useState(today)

    const [analytics, setAnalytics] =
        useState(null)

    const [loading, setLoading] =
        useState(true)

    const fetchAnalytics = async () => {

        try {

            setLoading(true)

            const response = await fetch(
                `${API_BASE}/admin/analytics?date=${selectedDate}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${
                                localStorage.getItem(
                                    "token"
                                )
                            }`
                    }
                }
            )

            const data =
                await response.json()

            setAnalytics(data)

        } catch (err) {

            console.log(err)

        } finally {

            setLoading(false)
        }
    }

    useEffect(() => {

        fetchAnalytics()

    }, [selectedDate])

    return (

        <div className="
            p-6
            text-white
        ">

            {/* HEADER */}

            <div className="mb-8">

                <p className="
                    text-zinc-500
                    uppercase
                    tracking-widest
                    text-sm
                ">
                    Business Insights
                </p>

                <h1 className="
                    text-4xl
                    font-bold
                    mt-2
                ">
                    Analytics Dashboard
                </h1>

            </div>

            {/* DATE PICKER */}

            <div className="
                bg-zinc-900
                border
                border-zinc-800

                rounded-3xl

                p-6

                mb-8
            ">

                <label className="
                    block
                    text-zinc-400
                    mb-3
                ">
                    Select Date
                </label>

                <input
                    type="date"

                    value={selectedDate}

                    onChange={(e) =>
                        setSelectedDate(
                            e.target.value
                        )
                    }

                    className="
                        bg-zinc-800
                        border
                        border-zinc-700

                        px-4
                        py-3

                        rounded-2xl

                        outline-none

                        focus:border-blue-500
                    "
                />

            </div>

            {/* ANALYTICS CARDS */}

            {loading ? (

                <div className="
                    text-zinc-400
                    text-lg
                ">
                    Loading analytics...
                </div>

            ) : (

                <div className="
                    grid
                    grid-cols-1
                    md:grid-cols-2
                    gap-6
                ">

                    {/* TOTAL SALES */}

                    <div className="
                        bg-zinc-900

                        border
                        border-zinc-800

                        rounded-3xl

                        p-6
                    ">

                        <p className="
                            text-zinc-500
                            text-sm
                        ">
                            Total Sales
                        </p>

                        <h2 className="
                            text-5xl
                            font-bold

                            mt-3

                            text-green-400
                        ">
                            ₹
                            {
                                analytics?.total_sales || 0
                            }
                        </h2>

                    </div>

                    {/* TOTAL ORDERS */}

                    <div className="
                        bg-zinc-900

                        border
                        border-zinc-800

                        rounded-3xl

                        p-6
                    ">

                        <p className="
                            text-zinc-500
                            text-sm
                        ">
                            Total Orders
                        </p>

                        <h2 className="
                            text-5xl
                            font-bold

                            mt-3

                            text-blue-400
                        ">
                            {
                                analytics?.total_orders || 0
                            }
                        </h2>

                    </div>

                </div>
            )}

        </div>
    )
}