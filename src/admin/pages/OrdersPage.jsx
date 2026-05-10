import {
    useEffect,
    useRef,
    useState
} from "react";
import newOrderSound from "../../assets/new_order.ogg";
import { API_BASE } from "../../config";

export default function OrdersPage() {

    const [orders, setOrders] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [pickupPin, setPickupPin] =
        useState("");

    const [verifying, setVerifying] =
        useState(false);

    const [verifiedOrder, setVerifiedOrder] =
        useState(null);

    const [activeFilter, setActiveFilter] =
        useState("pending");

    const [dateFilter, setDateFilter] =
        useState("today");

    const [selectedOrder, setSelectedOrder] =
        useState(null);

    const [confirmModal, setConfirmModal] =
        useState(null);

    const audioRef = useRef(
        new Audio(newOrderSound)
    )

    const previousOrderIds = useRef([])

    const fetchOrders = () => {

        fetch(
            `${API_BASE}/admin/orders?range=${dateFilter}`,
            {

            headers: {
                Authorization:
                    `Bearer ${
                        localStorage.getItem(
                            "token"
                        )
                    }`
            }
        })
            .then(async (res) => {
                if (!res.ok) {
                    const text = await res.text();
                    console.error(text);
                    return [];
                }
                return res.json();
            })

            .then((data) => {

                const currentIds = data.map(
                    (o) => o.id
                )

                const hasNewOrder = currentIds.some(
                    (id) =>
                        !previousOrderIds.current.includes(id)
                )

                if (
                    previousOrderIds.current.length > 0 &&
                    hasNewOrder
                ) {
                    console.log("NEW ORDER DETECTED")

                    audioRef.current.currentTime = 0

                    audioRef.current.play()

                    if (navigator.vibrate) {

                        navigator.vibrate([300, 100, 300])
                    }

                    const audio = new Audio(
                        newOrderSound
                    )

                    audio.play()
                        .then(() => {

                            console.log(
                                "SOUND PLAYED"
                            )

                        })
                        .catch((err) => {

                            console.log(
                                "AUDIO ERROR:",
                                err
                            )

                        })
                }

                previousOrderIds.current = currentIds


                setOrders(data);

                setLoading(false);
            })

            .catch((err) => {

                console.error(err);

                setLoading(false);
            });
    };

    useEffect(() => {

        previousOrderIds.current = []

        fetchOrders();

        const interval =
            setInterval(
                fetchOrders,
                5000
            );

        return () =>
            clearInterval(interval);

    }, [dateFilter]);

    const updateStatus = async (
        orderId,
        status
    ) => {

        const formData =
            new FormData();

        formData.append(
            "status",
            status
        );

        await fetch(
            `${API_BASE}/admin/orders/${orderId}`,
            {
                method: "PATCH",

                headers: {
                    Authorization:
                        `Bearer ${
                            localStorage.getItem(
                                "token"
                            )
                        }`
                },

                body: formData
            }
        );

        fetchOrders();
    };

    useEffect(() => {

        const unlock = async () => {

            try {

                audioRef.current.volume = 0

                await audioRef.current.play()

                audioRef.current.pause()

                audioRef.current.currentTime = 0

                audioRef.current.volume = 1

                console.log("AUDIO UNLOCKED")

            } catch (err) {

                console.log(err)
            }

            window.removeEventListener(
                "click",
                unlock
            )
        }

        window.addEventListener(
            "click",
            unlock
        )

    }, [])

    const verifyPickup = async () => {

        if (!pickupPin) {

            alert("Enter pickup PIN");

            return;
        }

        try {

            setVerifying(true);

            const response = await fetch(
                `${API_BASE}/admin/verify-pickup`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${
                                localStorage.getItem(
                                    "token"
                                )
                            }`
                    },

                    body: JSON.stringify({
                        pickup_pin: pickupPin
                    })
                }
            );

            const data =
                await response.json();

            if (!response.ok) {

                alert(
                    data.detail ||
                    "Verification failed"
                );

                return;
            }

            setVerifiedOrder(data);

            setPickupPin("");

            fetchOrders();

        } catch (err) {

            console.error(err);

            alert("Something went wrong");

        } finally {

            setVerifying(false);
        }
    };

    const getBadge = (status) => {

        switch (status) {

            case "pending":

                return (
                    <div className="
                        bg-red-500/20
                        text-red-400

                        text-xs

                        px-3
                        py-1

                        rounded-full

                        border
                        border-red-500/30
                    ">
                        NEW ORDER
                    </div>
                );

            case "ready":

                return (
                    <div className="
                        bg-yellow-500/20
                        text-yellow-300

                        text-xs

                        px-3
                        py-1

                        rounded-full

                        border
                        border-yellow-500/30
                    ">
                        READY TO PICK
                    </div>
                );

            case "completed":

                return (
                    <div className="
                        bg-green-500/20
                        text-green-400

                        text-xs

                        px-3
                        py-1

                        rounded-full

                        border
                        border-green-500/30
                    ">
                        COMPLETED
                    </div>
                );

            default:
                return null;
        }
    };

    if (loading) {

        return (
            <div className="
                text-white
                text-xl
            ">
                Loading orders...
            </div>
        );
    }

    const filteredOrders =

        activeFilter === "all"

            ? orders

            : orders.filter(
                (order) =>
                    order.status === activeFilter
            );

    return (

        <div>

            {/* HEADER */}

            <div className="mb-8">

                <p className="
                    text-zinc-500
                    uppercase
                    tracking-widest
                    text-sm
                ">
                    Order Management
                </p>

                <h1 className="
                    text-4xl
                    font-bold
                    mt-2
                ">
                    Live Orders
                </h1>

            </div>

            {/* PICKUP VERIFICATION */}

            <div className="
                bg-zinc-900

                border
                border-zinc-800

                rounded-3xl

                p-5

                mb-8
            ">

                <h2 className="
                    text-xl
                    font-semibold

                    mb-4
                ">
                    Pickup Verification
                </h2>

                <div className="
                    flex
                    flex-col
                    md:flex-row

                    gap-4
                ">

                    <input
                        type="text"

                        placeholder="Enter Pickup PIN"

                        value={pickupPin}

                        onChange={(e) =>
                            setPickupPin(
                                e.target.value
                            )
                        }

                        className="
                            flex-1

                            bg-zinc-800

                            border
                            border-zinc-700

                            rounded-2xl

                            px-4
                            py-3

                            outline-none

                            focus:border-blue-500
                        "
                    />

                    <button
                        onClick={verifyPickup}

                        disabled={verifying}

                        className="
                            bg-blue-600
                            hover:bg-blue-700

                            disabled:opacity-50

                            px-6
                            py-3

                            rounded-2xl

                            font-medium

                            transition

                            cursor-pointer
                        "
                    >
                        {
                            verifying
                                ? "Verifying..."
                                : "Verify Pickup"
                        }
                    </button>

                </div>

                {verifiedOrder && (

                    <div className="
                        mt-5

                        bg-green-500/10

                        border
                        border-green-500/20

                        rounded-2xl

                        p-4
                    ">

                        <div className="
                            flex
                            items-start
                            justify-between
                        ">

                            <p className="
                                text-green-400
                                font-semibold
                            ">
                                Order Completed Successfully
                            </p>

                            <button
                                onClick={() =>
                                    setVerifiedOrder(null)
                                }

                                className="
                                    text-zinc-500
                                    hover:text-white

                                    text-sm

                                    transition

                                    cursor-pointer
                                "
                            >
                                Dismiss
                            </button>

                        </div>

                        <p className="
                            text-zinc-300
                            mt-2
                        ">
                            Order #
                            {
                                String(
                                    verifiedOrder.id
                                ).padStart(
                                    4,
                                    "0"
                                )
                            }
                        </p>

                        <p className="
                            text-zinc-400
                        ">
                            {
                                verifiedOrder.customer_name
                            }
                        </p>
                        <div className="
                            mt-4
                            space-y-1
                        ">

                            {Object.entries(
                                verifiedOrder.items || {}
                            )
                                .slice(0,3)
                                .map(
                                    ([name, qty], index) => (

                                        <p
                                            key={index}

                                            className="
                                                text-zinc-300
                                                text-sm
                                            "
                                        >
                                            {qty} × {name}
                                        </p>
                                    )
                            )}
                            {Object.keys(
                                verifiedOrder.items || {}
                            ).length > 3 && (

                                <p className="
                                    text-zinc-500
                                    text-sm
                                ">
                                    ...
                                </p>
                            )}

                        </div>

                    </div>
                )}

            </div>

            {/* FILTER HEADER */}

            <div
                className="
                    flex
                    justify-between
                    items-center
                    mb-6
                    gap-4
                    flex-wrap
                "
            >

                {/* STATUS FILTERS */}

                <div
                    className="
                        flex
                        flex-wrap
                        gap-3
                    "
                >

                    {[
                        {
                            label: "NEW",
                            value: "pending"
                        },

                        {
                            label: "PREPARING",
                            value: "preparing"
                        },

                        {
                            label: "READY",
                            value: "ready"
                        },

                        {
                            label: "COMPLETED",
                            value: "completed"
                        },

                        {
                            label: "ALL",
                            value: "all"
                        }

                    ].map((filter) => (

                        <button
                            key={filter.value}

                            onClick={() =>
                                setActiveFilter(
                                    filter.value
                                )
                            }

                            className={`
                                px-5
                                py-2

                                rounded-2xl

                                text-sm
                                font-medium

                                transition

                                ${
                                    activeFilter === filter.value

                                        ? `
                                            bg-blue-600
                                            text-white
                                        `

                                        : `
                                            bg-zinc-800
                                            text-zinc-400

                                            hover:bg-zinc-700
                                        `
                                }
                            `}
                        >
                            {filter.label}
                        </button>
                    ))}

                </div>

                {/* DATE FILTER */}

                <select
                    value={dateFilter}
                    onChange={(e) =>
                        setDateFilter(e.target.value)
                    }

                    className="
                        bg-zinc-900
                        border
                        border-zinc-700
                        text-white

                        px-4
                        py-2

                        rounded-xl
                        outline-none

                        min-w-[180px]
                    "
                >
                    <option value="today">
                        Today
                    </option>

                    <option value="yesterday">
                        Yesterday
                    </option>

                    <option value="week">
                        Last 7 Days
                    </option>

                    <option value="month">
                        Last 30 Days
                    </option>
                </select>

            </div>

            {/* ORDERS */}

            <div className="
                grid

                grid-cols-1
                md:grid-cols-2
                xl:grid-cols-3

                gap-5
            ">

                {filteredOrders.map((order) => (

                    <div
                        key={order.id}

                        onClick={() =>
                            setSelectedOrder(order)
                        }

                        className="
                            relative

                            bg-zinc-900

                            border
                            border-zinc-800

                            rounded-3xl

                            p-6

                            cursor-pointer

                            hover:border-blue-500/40
                            hover:bg-zinc-900/80

                            transition-all
                        "
                    >
                        

                        {/* TOP */}

                        <div className="
                            flex
                            justify-between
                            items-start
                            gap-4
                        ">

                            <div>

                                <h2 className="
                                    text-2xl
                                    font-bold
                                ">
                                    {
                                        order.customer_name ||
                                        "Customer"
                                    }
                                </h2>

                                <p className="
                                    text-zinc-500
                                    mt-1
                                ">
                                    {order.phone}
                                </p>

                                <p className="
                                    text-zinc-600
                                    text-sm
                                    mt-1
                                ">
                                    {
                                        new Date(
                                            order.created_at
                                        ).toLocaleString(
                                            "en-IN",
                                            {
                                                day: "numeric",
                                                month: "short",
                                                hour: "2-digit",
                                                minute: "2-digit"
                                            }
                                        )
                                    }
                                </p>
                            </div>

                            <div className="
                                text-right
                                flex
                                flex-col
                                items-end
                                gap-2
                            ">

                                <p className="
                                    text-blue-400
                                    font-bold
                                    text-2xl
                                ">
                                    ₹
                                    {order.total_price}
                                </p>

                                <p className="
                                    text-zinc-500
                                    text-sm
                                ">
                                    #
                                    {
                                        String(
                                            order.id
                                        ).padStart(
                                            4,
                                            "0"
                                        )
                                    }
                                </p>

                                {getBadge(order.status)}

                            </div>

                        </div>

                        {/* ITEMS PREVIEW */}

                        <div className="
                            mt-6
                            space-y-2
                        ">

                            {Object.entries(
                                order.items || {}
                            )
                                .slice(0, 3)
                                .map(
                                    (
                                        [name, qty],
                                        index
                                    ) => (

                                        <div
                                            key={index}

                                            className="
                                                text-zinc-300
                                            "
                                        >
                                            {name} x{qty}
                                        </div>
                                    )
                                )}

                            {Object.keys(
                                order.items || {}
                            ).length > 3 && (

                                <div className="
                                    text-zinc-500
                                ">
                                    ...
                                </div>
                            )}

                        </div>

                        {/* STATUS ACTIONS */}

                        <div className="
                            mt-6
                            flex
                            items-center
                            gap-3
                        ">

                            {order.status === "pending" && (

                                <button
                                    onClick={(e) => {

                                        e.stopPropagation();

                                        setConfirmModal({
                                            orderId: order.id,
                                            status: "preparing"
                                        });
                                    }}

                                    className="
                                        bg-orange-500
                                        hover:bg-orange-600

                                        text-white

                                        px-4
                                        py-2

                                        rounded-xl

                                        text-sm
                                        font-medium

                                        transition

                                        cursor-pointer
                                    "
                                >
                                    Start Preparing
                                </button>
                            )}

                            {order.status === "preparing" && (

                                <button
                                    onClick={(e) => {

                                        e.stopPropagation();

                                        setConfirmModal({
                                            orderId: order.id,
                                            status: "ready"
                                        });
                                    }}

                                    className="
                                        bg-yellow-500
                                        hover:bg-yellow-600

                                        text-black

                                        px-4
                                        py-2

                                        rounded-xl

                                        text-sm
                                        font-medium

                                        transition

                                        cursor-pointer
                                    "
                                >
                                    Ready To Pick
                                </button>
                            )}

                            {(order.status === "ready" ||
                                order.status === "completed") && (

                                <div className="
                                    text-sm
                                    text-zinc-500
                                ">
                                    Status Locked
                                </div>
                            )}

                        </div>

                    </div>

                ))}

                {!filteredOrders.length && (

                    <div className="
                        text-zinc-500
                        text-lg
                    ">
                        No orders yet.
                    </div>
                )}

                </div>

                {/* ORDER DETAILS MODAL */}

                {selectedOrder && (

                    <div className="
                        fixed
                        inset-0

                        bg-black/70

                        flex
                        items-center
                        justify-center

                        z-50

                        p-4
                    ">

                        <div className="
                            bg-zinc-900

                            border
                            border-zinc-800

                            rounded-3xl

                            w-full
                            max-w-lg

                            p-6
                        ">

                            {/* TOP */}

                            <div className="
                                flex
                                justify-between
                                items-start
                            ">

                                <div>

                                    <h2 className="
                                        text-2xl
                                        font-bold
                                    ">
                                        {
                                            selectedOrder.customer_name
                                        }
                                    </h2>

                                    <p className="
                                        text-zinc-500
                                        mt-1
                                    ">
                                        {
                                            selectedOrder.phone
                                        }
                                    </p>

                                </div>

                                <button
                                    onClick={() =>
                                        setSelectedOrder(null)
                                    }

                                    className="
                                        text-zinc-500
                                        hover:text-white
                                        cursor-pointer
                                        text-sm
                                    "
                                >
                                    Close
                                </button>

                            </div>

                            {/* ITEMS */}

                            <div className="
                                mt-6
                                space-y-3
                            ">

                                {Object.entries(
                                    selectedOrder.items || {}
                                ).map(
                                    (
                                        [name, qty],
                                        index
                                    ) => (

                                        <div
                                            key={index}

                                            className="
                                                flex
                                                justify-between

                                                text-zinc-300
                                            "
                                        >

                                            <span>
                                                {name}
                                            </span>

                                            <span>
                                                x{qty}
                                            </span>

                                        </div>
                                    )
                                )}

                            </div>

                            {/* TOTAL */}

                            <div className="
                                mt-6

                                pt-4

                                border-t
                                border-zinc-800

                                flex
                                justify-between
                                items-center
                            ">

                                <span className="
                                    text-zinc-400
                                ">
                                    Total
                                </span>

                                <span className="
                                    text-2xl
                                    font-bold
                                    text-blue-400
                                ">
                                    ₹
                                    {
                                        selectedOrder.total_price
                                    }
                                </span>

                            </div>

                        </div>

                    </div>
                )}

                {/* CONFIRM STATUS MODAL */}

                {confirmModal && (

                    <div className="
                        fixed
                        inset-0

                        bg-black/70

                        flex
                        items-center
                        justify-center

                        z-50

                        p-4
                    ">

                        <div className="
                            bg-zinc-900

                            border
                            border-zinc-800

                            rounded-3xl

                            w-full
                            max-w-md

                            p-6
                        ">

                            <h2 className="
                                text-2xl
                                font-bold
                            ">
                                Confirm Action
                            </h2>

                            <p className="
                                text-zinc-400

                                mt-3
                            ">

                                {confirmModal.status === "ready"

                                    ? "Mark this order as READY TO PICK? This action cannot be changed."

                                    : "Start preparing this order?"
                                }

                            </p>

                            <div className="
                                flex
                                justify-end

                                gap-3

                                mt-6
                            ">

                                <button
                                    onClick={() =>
                                        setConfirmModal(null)
                                    }

                                    className="
                                        bg-zinc-800
                                        hover:bg-zinc-700

                                        px-5
                                        py-2

                                        rounded-xl

                                        transition
                                    "
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={async () => {

                                        await updateStatus(
                                            confirmModal.orderId,
                                            confirmModal.status
                                        );

                                        setConfirmModal(null);
                                    }}

                                    className="
                                        bg-blue-600
                                        hover:bg-blue-700

                                        px-5
                                        py-2

                                        rounded-xl

                                        transition
                                    "
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
