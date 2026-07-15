import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config";
import logoImg from "../assets/logo.png";

export default function Header({
    toggleSidebar,
    search,
    setSearch
}) {

    const navigate = useNavigate();

    const [business, setBusiness] =
        useState({
            name: "Restaurant",
            logo_url: null,
        });

    const [showProfileMenu, setShowProfileMenu] =
        useState(false);

    const [scrolled, setScrolled] =
        useState(false);

    const [searchFocused, setSearchFocused] =
        useState(false);

    const [hideSearch, setHideSearch] =
        useState(false);

    const [showNotificationMenu, setShowNotificationMenu] = useState(false);
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: "Welcome to GoSkipDQ",
            message: "Manage your menu, orders, and business settings easily.",
            time: "Just now",
            read: false,
            type: "info"
        },
        {
            id: 2,
            title: "Setup Complete",
            message: "Your WhatsApp Business API configuration is active.",
            time: "1 hour ago",
            read: false,
            type: "success"
        }
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleMarkAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const handleNotificationClick = (n) => {
        setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
        if (n.link) {
            navigate(n.link);
        }
        setShowNotificationMenu(false);
    };

    // Close notification menu on click outside
    useEffect(() => {
        const handleClick = () => {
            setShowNotificationMenu(false);
        };
        if (showNotificationMenu) {
            window.addEventListener("click", handleClick);
        }
        return () => {
            window.removeEventListener("click", handleClick);
        };
    }, [showNotificationMenu]);

    // Dynamic orders loader for real-time notifications
    useEffect(() => {
        const fetchRecentOrders = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;
                const response = await fetch(`${API_BASE}/api/admin/orders?range=today`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    const orderNotifications = data
                        .filter(o => o.status === "pending" || o.payment_status === "paid")
                        .map(o => ({
                            id: `order-${o.id}`,
                            title: `New Order #${String(o.id).padStart(4, "0")}`,
                            message: `${o.customer_name || 'Customer'} placed an order (Total: ₹${o.total_price})`,
                            time: new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            read: false,
                            type: "order",
                            link: "/admin/dashboard/orders"
                        }));
                    
                    setNotifications(prev => {
                        const filtered = prev.filter(n => !String(n.id).startsWith("order-"));
                        return [...orderNotifications, ...filtered];
                    });
                }
            } catch (err) {
                console.error("Error fetching orders for notifications:", err);
            }
        };

        fetchRecentOrders();
        const interval = setInterval(fetchRecentOrders, 20000);
        return () => clearInterval(interval);
    }, []);


    //searchbar settings
    useEffect(() => {

        let lastScroll = 0;

        const handleScroll = () => {

            if (
                window.scrollY > lastScroll &&
                window.scrollY > 100
            ) {

                setHideSearch(true);

            } else {

                setHideSearch(false);
            }

            lastScroll = window.scrollY;
        };

        window.addEventListener(
            "scroll",
            handleScroll
        );

        return () =>
            window.removeEventListener(
                "scroll",
                handleScroll
            );

    }, []);


    // FETCH BUSINESS
    useEffect(() => {

        fetch(`${API_BASE}/api/business`, {
            headers: {
                Authorization:
                    `Bearer ${
                        localStorage.getItem(
                            "token"
                        )
                    }`
            }
        })
            .then((res) => {

                if (res.status === 401) {

                    localStorage.removeItem(
                        "token"
                    );

                    navigate("/admin");

                    return null;
                }

                return res.json();
            })

            .then((data) => {

                if (!data) return;

                setBusiness(data);
            })

            .catch((err) => {
                console.log(err);
            });

    }, []);



    // SCROLL EFFECT
    useEffect(() => {

        const handleScroll = () => {

            setScrolled(
                window.scrollY > 20
            );
        };

        window.addEventListener(
            "scroll",
            handleScroll
        );

        return () => {

            window.removeEventListener(
                "scroll",
                handleScroll
            );
        };

    }, []);



    // CLOSE PROFILE MENU
    useEffect(() => {

        const handleClick = () => {

            setShowProfileMenu(false);
        };

        if (showProfileMenu) {

            window.addEventListener(
                "click",
                handleClick
            );
        }

        return () => {

            window.removeEventListener(
                "click",
                handleClick
            );
        };

    }, [showProfileMenu]);



    return (
        <>
            {/* HEADER */}
            <header
                className="
                    sticky
                    top-0

                    z-[5000]

                    bg-black/80
                    backdrop-blur-2xl

                    border-b
                    border-zinc-900
                "
            >

                {/* DESKTOP */}
                <div
                    className="
                        hidden
                        md:flex

                        h-24

                        items-center
                        justify-between

                        gap-6

                        px-6
                    "
                >

                    {/* LEFT */}
                    <div className="flex items-center gap-4">

                        {/* MENU */}
                        <button
                            onClick={toggleSidebar}

                            className="
                                w-14
                                h-14

                                rounded-2xl

                                bg-zinc-900
                                border
                                border-zinc-800

                                flex
                                items-center
                                justify-center

                                cursor-pointer
                            "
                        >
                            ☰
                        </button>

                        {/* Brand Logo & Name */}
                        <div 
                          className="flex items-center gap-2 sm:gap-2.5 cursor group"
                        >
                          <div className="w-10 h-10 flex items-center justify-center shrink-0">
                            <img
                              src={logoImg}
                              alt="GoSkipDQ Logo"
                              className="w-9 h-9 object-contain" 
                            />
                          </div>
                          <div>
                            <span className="text-lg sm:text-xl font-black italic tracking-tighter py-1 leading-none block">
                              <span className="text-emerald-500">Go</span>
                              <span className="text-white">Skip</span>
                              <span className="text-emerald-500">DQ</span>
                            </span>
                            <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest leading-none block mt-0.5">
                              Partner
                            </span>
                          </div>
                        </div>

                    </div>


                    {/* SEARCH */}
                    <div className="flex-1 max-w-3xl">

                        <div
                            className="
                                h-16

                                rounded-2xl

                                bg-zinc-900

                                border
                                border-zinc-800

                                flex
                                items-center

                                px-5
                            "
                        >

                            <input
                                type="text"

                                value={search}

                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }

                                placeholder="Search menu, orders, analytics..."

                                className="
                                    bg-transparent
                                    outline-none
                                    w-full
                                    text-sm
                                    text-white
                                    placeholder:text-zinc-500
                                "
                            />

                        </div>

                    </div>


                    {/* RIGHT */}
                    <div className="flex items-center gap-4">

                        {/* NOTIFICATION */}
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowNotificationMenu(!showNotificationMenu);
                                    setShowProfileMenu(false);
                                }}
                                className="
                                    relative
                                    w-14
                                    h-14
                                    rounded-2xl
                                    bg-zinc-900
                                    border
                                    border-zinc-800
                                    cursor-pointer
                                    flex
                                    items-center
                                    justify-center
                                "
                            >
                                🔔
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-zinc-950 animate-pulse">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {showNotificationMenu && (
                                <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="
                                        absolute
                                        top-16
                                        right-0
                                        w-80
                                        max-h-96
                                        overflow-y-auto
                                        rounded-3xl
                                        border
                                        border-zinc-800
                                        bg-zinc-900/95
                                        backdrop-blur-2xl
                                        p-4
                                        shadow-2xl
                                        z-[6000]
                                    "
                                >
                                    <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
                                        <h3 className="font-semibold text-white">Notifications</h3>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={handleMarkAllRead}
                                                className="text-xs text-blue-500 hover:text-blue-400 font-medium transition"
                                            >
                                                Mark all as read
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-3 flex flex-col gap-3">
                                        {notifications.length === 0 ? (
                                            <div className="text-center py-6 text-zinc-500 text-sm">
                                                <span className="text-2xl block mb-2">🎉</span>
                                                All caught up! No notifications.
                                            </div>
                                        ) : (
                                            notifications.map((n) => (
                                                <div
                                                    key={n.id}
                                                    onClick={() => handleNotificationClick(n)}
                                                    className={`
                                                        p-3
                                                        rounded-2xl
                                                        cursor-pointer
                                                        transition-all
                                                        border
                                                        text-left
                                                        ${n.read 
                                                            ? 'bg-transparent border-transparent opacity-60' 
                                                            : 'bg-zinc-800/40 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700'
                                                        }
                                                    `}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="mt-1">
                                                            {n.type === "success" && <span className="text-green-500 text-sm">🟢</span>}
                                                            {n.type === "info" && <span className="text-blue-500 text-sm">🔵</span>}
                                                            {n.type === "order" && <span className="text-yellow-500 text-sm">🟡</span>}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="text-sm font-semibold text-white leading-tight">
                                                                {n.title}
                                                            </h4>
                                                            <p className="text-xs text-zinc-400 mt-1 leading-normal">
                                                                {n.message}
                                                            </p>
                                                            <span className="text-[10px] text-zinc-500 mt-2 block">
                                                                {n.time}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* AVATAR */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowProfileMenu(!showProfileMenu);
                            }}
                            className="
                                w-12
                                h-12
                                rounded-2xl
                                overflow-hidden
                                border
                                border-zinc-800
                                hover:border-[#1ea753]
                                transition-all
                                duration-300
                                hover:scale-105
                                cursor-pointer
                                bg-[#1ea753]/10
                                flex
                                items-center
                                justify-center
                            "
                        >
                            {business?.logo_url ? (
                                <img
                                    src={business.logo_url}
                                    alt="logo"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="font-bold text-lg text-[#1ea753]">
                                    {business?.name?.[0]}
                                </span>
                            )}
                        </button>

                        {showProfileMenu && (
                            <div
                                onClick={(e) =>
                                    e.stopPropagation()
                                }

                                className="
                                    absolute
                                    top-16
                                    right-0

                                    w-64

                                    rounded-3xl

                                    border
                                    border-zinc-800

                                    bg-zinc-900/95
                                    backdrop-blur-2xl

                                    p-3

                                    shadow-2xl
                                "
                            >

                                <div
                                    className="
                                        p-3

                                        border-b
                                        border-zinc-800
                                    "
                                >

                                    <p
                                        className="
                                            text-sm
                                            text-zinc-500
                                        "
                                    >
                                        Signed in as
                                    </p>

                                    <h3
                                        className="
                                            font-semibold
                                            mt-1
                                        "
                                    >
                                        {business?.name}
                                    </h3>

                                </div>


                                <button
                                    className="
                                        w-full

                                        mt-2

                                        h-12

                                        rounded-2xl

                                        hover:bg-zinc-800

                                        text-left

                                        px-4

                                        transition-all
                                    "
                                >
                                    Settings
                                </button>


                                <button
                                    onClick={() => {

                                        localStorage.removeItem(
                                            "token"
                                        );

                                        navigate("/admin");
                                    }}

                                    className="
                                        w-full

                                        h-12

                                        rounded-2xl

                                        hover:bg-red-500/10

                                        text-red-400

                                        text-left

                                        px-4

                                        transition-all
                                    "
                                >
                                    Logout
                                </button>

                            </div>
                        )}

                    </div>

                </div>


                {/* MOBILE */}
                <div className="md:hidden">

                    {/* TOP ROW */}
                    <div
                        className="
                            h-20

                            px-4

                            flex
                            items-center
                            justify-between

                            gap-3
                        "
                    >

                        {/* LEFT */}
                        <div className="relative flex items-center gap-3">

                            <button
                                onClick={toggleSidebar}

                                className="
                                    w-12
                                    h-12

                                    rounded-2xl

                                    bg-zinc-900
                                    border
                                    border-zinc-800

                                    cursor-pointer
                                "
                            >
                                ☰
                            </button>

                            {/* Brand Logo & Name */}
                            <div 
                              className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group"
                            >
                              <div className="w-10 h-10 flex items-center justify-center shrink-0">
                                <img
                                  src={logoImg}
                                  alt="GoSkipDQ Logo"
                                  className="w-9 h-9 object-contain" 
                                />
                              </div>
                              <div>
                                <span className="text-lg sm:text-xl font-black italic tracking-tighter py-1 leading-none block">
                                  <span className="text-emerald-500">Go</span>
                                  <span className="text-white">Skip</span>
                                  <span className="text-emerald-500">DQ</span>
                                </span>
                                <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest leading-none block mt-0.5">
                                  Partner
                                </span>
                              </div>
                            </div>

                        </div>


                        {/* RIGHT */}
                        <div className="flex items-center gap-2">

                            {/* NOTIFICATION */}
                            <div className="relative">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowNotificationMenu(!showNotificationMenu);
                                        setShowProfileMenu(false);
                                    }}
                                    className="
                                        relative
                                        w-11
                                        h-11
                                        rounded-2xl
                                        bg-zinc-900
                                        border
                                        border-zinc-800
                                        flex
                                        items-center
                                        justify-center
                                    "
                                >
                                    🔔
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white ring-2 ring-zinc-950 animate-pulse">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {showNotificationMenu && (
                                    <div
                                        onClick={(e) => e.stopPropagation()}
                                        className="
                                            absolute
                                            top-14
                                            right-0
                                            w-72
                                            max-h-80
                                            overflow-y-auto
                                            rounded-3xl
                                            border
                                            border-zinc-800
                                            bg-zinc-900/95
                                            backdrop-blur-2xl
                                            p-4
                                            shadow-2xl
                                            z-[6000]
                                        "
                                    >
                                        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
                                            <h3 className="font-semibold text-white text-sm">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={handleMarkAllRead}
                                                    className="text-xs text-blue-500 hover:text-blue-400 font-medium transition"
                                                >
                                                    Clear
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-3 flex flex-col gap-3">
                                            {notifications.length === 0 ? (
                                                <div className="text-center py-6 text-zinc-500 text-xs">
                                                    All caught up!
                                                </div>
                                            ) : (
                                                notifications.map((n) => (
                                                    <div
                                                        key={n.id}
                                                        onClick={() => handleNotificationClick(n)}
                                                        className={`
                                                            p-2.5
                                                            rounded-2xl
                                                            cursor-pointer
                                                            transition-all
                                                            border
                                                            text-left
                                                            ${n.read 
                                                                ? 'bg-transparent border-transparent opacity-60' 
                                                                : 'bg-zinc-800/40 border-zinc-800 hover:bg-zinc-800'
                                                            }
                                                        `}
                                                    >
                                                        <div className="flex items-start gap-2">
                                                            <div className="mt-0.5">
                                                                {n.type === "success" && <span className="text-green-500 text-xs">🟢</span>}
                                                                {n.type === "info" && <span className="text-blue-500 text-xs">🔵</span>}
                                                                {n.type === "order" && <span className="text-yellow-500 text-xs">🟡</span>}
                                                            </div>
                                                            <div className="flex-1">
                                                                <h4 className="text-xs font-semibold text-white leading-tight">
                                                                    {n.title}
                                                                </h4>
                                                                <p className="text-[11px] text-zinc-400 mt-0.5 leading-normal">
                                                                    {n.message}
                                                                </p>
                                                                <span className="text-[9px] text-zinc-500 mt-1 block">
                                                                    {n.time}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* AVATAR */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowProfileMenu(!showProfileMenu);
                                }}
                                className="
                                    w-12
                                    h-12
                                    rounded-2xl
                                    overflow-hidden
                                    border
                                    border-zinc-800
                                    hover:border-[#1ea753]
                                    transition-all
                                    duration-300
                                    hover:scale-105
                                    cursor-pointer
                                    bg-[#1ea753]/10
                                    flex
                                    items-center
                                    justify-center
                                "
                            >
                                {business?.logo_url ? (
                                    <img
                                        src={business.logo_url}
                                        alt="logo"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="font-bold text-lg text-[#1ea753]">
                                        {business?.name?.[0]}
                                    </span>
                                )}
                            </button>

                            {showProfileMenu && (
                            <div
                                onClick={(e) =>
                                    e.stopPropagation()
                                }

                                className="
                                    absolute
                                    top-16
                                    right-0

                                    w-64

                                    rounded-3xl

                                    border
                                    border-zinc-800

                                    bg-zinc-900/95
                                    backdrop-blur-2xl

                                    p-3

                                    shadow-2xl
                                "
                            >

                                <div
                                    className="
                                        p-3

                                        border-b
                                        border-zinc-800
                                    "
                                >

                                    <p
                                        className="
                                            text-sm
                                            text-zinc-500
                                        "
                                    >
                                        Signed in as
                                    </p>

                                    <h3
                                        className="
                                            font-semibold
                                            mt-1
                                        "
                                    >
                                        {business?.name}
                                    </h3>

                                </div>


                                <button
                                    className="
                                        w-full

                                        mt-2

                                        h-12

                                        rounded-2xl

                                        hover:bg-zinc-800

                                        text-left

                                        px-4

                                        transition-all
                                    "
                                >
                                    Settings
                                </button>


                                <button
                                    onClick={() => {

                                        localStorage.removeItem(
                                            "token"
                                        );

                                        navigate("/admin");
                                    }}

                                    className="
                                        w-full

                                        h-12

                                        rounded-2xl

                                        hover:bg-red-500/10

                                        text-red-400

                                        text-left

                                        px-4

                                        transition-all
                                    "
                                >
                                    Logout
                                </button>

                            </div>
                        )}

                        </div>

                    </div>


                    {/* SEARCH */}
                    <div
                        className={`
                            px-4

                            transition-all
                            duration-300

                            overflow-hidden

                            ${
                                hideSearch
                                    ? "max-h-0 opacity-0 pb-0"
                                    : "max-h-24 opacity-100 pb-4"
                            }
                        `}
                    >

                        <div
                            className="
                                h-14

                                rounded-2xl

                                bg-zinc-900

                                border
                                border-zinc-800

                                flex
                                items-center

                                px-4
                            "
                        >

                            <input
                                type="text"

                                value={search}

                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }

                                placeholder="Search menu, orders, analytics..."

                                className="
                                    bg-transparent
                                    outline-none
                                    w-full
                                    text-sm
                                    text-white
                                    placeholder:text-zinc-500
                                "
                            />
                        </div>

                    </div>

                </div>

            </header>
        </>
    );
}

