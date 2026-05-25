import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config";

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

                        {/* BUSINESS */}
                        <div className="flex items-center gap-4">

                            <img
                                src={business?.logo_url}
                                alt="logo"

                                className="
                                    w-14
                                    h-14

                                    rounded-2xl

                                    object-cover
                                "
                            />

                            <div>

                                <p
                                    className="
                                        text-xs
                                        uppercase
                                        tracking-widest

                                        text-zinc-500
                                    "
                                >
                                    Business Admin
                                </p>

                                <h2
                                    className="
                                        text-2xl
                                        font-bold
                                    "
                                >
                                    {business?.name}
                                </h2>

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
                        <button
                            className="
                                relative

                                w-14
                                h-14

                                rounded-2xl

                                bg-zinc-900
                                border
                                border-zinc-800

                                cursor-pointer
                            "
                        >
                            🔔
                        </button>

                        {/* AVATAR */}
                        <button
                            onClick={(e) => {

                                e.stopPropagation();

                                setShowProfileMenu(
                                    !showProfileMenu
                                );
                            }}

                            className="
                                w-12
                                h-12

                                rounded-2xl

                                bg-blue-600

                                font-bold
                                text-lg

                                transition-all
                                duration-300

                                hover:scale-105

                                cursor-pointer
                            "
                        >
                            {business?.name?.[0]}
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

                            <div className="rlative flex items-center gap-3">

                                <img
                                    src={business?.logo_url}
                                    alt="logo"

                                    className="
                                        w-11
                                        h-11

                                        rounded-2xl
                                        object-cover
                                    "
                                />

                                <div>

                                    <p
                                        className="
                                            text-[10px]
                                            uppercase
                                            tracking-widest

                                            text-zinc-500
                                        "
                                    >
                                        Business Admin
                                    </p>

                                    <h2
                                        className="
                                            text-lg
                                            font-bold

                                            leading-none
                                        "
                                    >
                                        {business?.name}
                                    </h2>

                                </div>

                            </div>

                        </div>


                        {/* RIGHT */}
                        <div className="flex items-center gap-2">

                            <button
                                className="
                                    w-11
                                    h-11

                                    rounded-2xl

                                    bg-zinc-900
                                    border
                                    border-zinc-800
                                "
                            >
                                🔔
                            </button>

                            <button
                                onClick={(e) => {

                                    e.stopPropagation();

                                    setShowProfileMenu(
                                        !showProfileMenu
                                    );
                                }}

                                className="
                                    w-12
                                    h-12

                                    rounded-2xl

                                    bg-blue-600

                                    font-bold
                                    text-lg

                                    transition-all
                                    duration-300

                                    hover:scale-105
                                "
                            >
                                {business?.name?.[0]}
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

