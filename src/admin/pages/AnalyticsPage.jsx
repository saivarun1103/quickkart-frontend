import {
    useEffect,
    useState
} from "react";
import { API_BASE } from "../../config";
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

export default function AnalyticsPage() {

    const today = new Date()
        .toISOString()
        .split("T")[0]

    const [dateRange, setDateRange] =
        useState([
            new Date(),
            new Date()
        ])

    const [
        startDate,
        endDate
    ] = dateRange

    const [analytics, setAnalytics] =
        useState(null)

    const [loading, setLoading] =
        useState(true)

    const setLastWeekRange = () => {

        const now = new Date()

        // get current week's monday
        const currentDay =
            now.getDay()

        const diffToMonday =
            currentDay === 0
                ? -6
                : 1 - currentDay

        const thisMonday =
            new Date(now)

        thisMonday.setDate(
            now.getDate() +
            diffToMonday
        )

        // previous monday
        const lastMonday =
            new Date(thisMonday)

        lastMonday.setDate(
            thisMonday.getDate() - 7
        )

        // previous sunday
        const lastSunday =
            new Date(lastMonday)

        lastSunday.setDate(
            lastMonday.getDate() + 6
        )

        setDateRange([
            lastMonday,
            lastSunday
        ])
    }

    const fetchAnalytics = async () => {

        try {

            setLoading(true)

            const response = await fetch(
                `${API_BASE}/api/admin/analytics?startDate=${
                    startDate
                        .toISOString()
                        .split("T")[0]
                }&endDate=${
                    (endDate || startDate)
                        .toISOString()
                        .split("T")[0]
                }`,
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

    }, [
        startDate,
        endDate
    ])

    return (

        <div className="
            p-4 md:p-6
            text-white
            overflow-x-hidden
            w-full
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
                    text-3xl md:text-4xl
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
                    Select Date Range
                </label>

                <DatePicker
                    selectsRange={true}

                    startDate={startDate}

                    endDate={endDate}

                    onChange={(update) =>
                        setDateRange(update)
                    }

                    maxDate={
                        new Date()
                    }

                    dateFormat="dd MMM yyyy"

                    className="
                        bg-zinc-800
                        border
                        border-zinc-700
                        px-4
                        py-3
                        rounded-2xl
                        outline-none
                        text-white
                        w-full md:w-[280px]
                        focus:border-[#1ea753]
                    "

                    placeholderText="
                        Select date range
                    "
                />

                {/* QUICK FILTERS */}

                <div className="
                    flex
                    flex-col
                    sm:flex-row
                    gap-3
                    mt-5
                    w-full
                ">

                    <button
                        onClick={() => {

                            const today =
                                new Date()

                            setDateRange([
                                today,
                                today
                            ])
                        }}
                        className="
                            bg-zinc-800
                            hover:bg-zinc-700
                            px-4
                            py-2
                            rounded-xl
                            text-sm
                        "
                    >
                        Today
                    </button>

                    <button
                        onClick={() => {

                            const now =
                                new Date()

                            const currentDay =
                                now.getDay()

                            const diffToMonday =
                                currentDay === 0
                                    ? -6
                                    : 1 -
                                    currentDay

                            const thisMonday =
                                new Date(now)

                            thisMonday.setDate(
                                now.getDate()
                                +
                                diffToMonday
                            )

                            const lastMonday =
                                new Date(
                                    thisMonday
                                )

                            lastMonday.setDate(
                                thisMonday
                                .getDate()
                                - 7
                            )

                            const lastSunday =
                                new Date(
                                    lastMonday
                                )

                            lastSunday.setDate(
                                lastMonday
                                .getDate()
                                + 6
                            )

                            setDateRange([
                                lastMonday,
                                lastSunday
                            ])
                        }}
                        className="
                             bg-[#1ea753]
                             hover:bg-[#1ea753]/90
                             px-4
                             py-2
                            rounded-xl
                            text-sm
                            w-full
                            sm:w-auto
                        "
                    >
                        Last Monday → Sunday
                    </button>

                </div>

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

                             text-[#1ea753]
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