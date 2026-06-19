import { useState, useEffect } from "react";
import Header from "../../components/Headers";
import {
    Link,
    Outlet,
    useLocation
} from "react-router-dom";
// const BASE_URL = "https://quickkart-3f8h.onrender.com";

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [business, setBusiness] =
    useState(null);
    const [search, setSearch] =
    useState("");

    useEffect(() => {

    fetch(`/admin/me`, {  //${BASE_URL}/admin/me

            headers: {
                Authorization:
                    `Bearer ${
                        localStorage.getItem(
                            "token"
                        )
                    }`
            }

        })
            .then((res) => res.json())

            .then((data) => {

                setBusiness(data);

            })

            .catch((err) => {

                console.error(err);

            });

    }, []);

    return (
        <div
            className="
                flex
                min-h-screen

                bg-zinc-950
                text-white

                overflow-x-hidden
            "
        >
            {/* 🔥 DRAWER SIDEBAR */}
            <div
                className={`
                    fixed
                    top-0
                    left-0

                    h-screen
                    w-[280px]

                    bg-zinc-900/95
                    backdrop-blur-2xl

                    border-r
                    border-zinc-800

                    p-6

                    z-[6000]

                    transition-all
                    duration-300

                    ${
                        sidebarOpen
                            ? "translate-x-0"
                            : "-translate-x-full"
                    }
                `}
            >
                <div className="mb-10">

                    <p className="text-zinc-500 text-sm">
                        {business?.business_name} Admin
                    </p>

                    <h1
                        className="
                            text-3xl
                            font-bold
                            mt-2
                        "
                    >
                        Dashboard
                    </h1>

                </div>

                <SidebarButton
                    title="🍽️ Menu"
                    to="/admin/dashboard/menu"
                    setSidebarOpen={setSidebarOpen}
                />

                <div className="space-y-2"></div>

                <SidebarButton
                    title="📦 Orders"
                    to="/admin/dashboard/orders"
                    setSidebarOpen={setSidebarOpen}
                />

                <div className="space-y-2"></div>

                <SidebarButton
                    title="📊 Analytics"
                    to="/admin/dashboard/analytics"
                    setSidebarOpen={setSidebarOpen}
                />

                <div className="space-y-2"></div>

                <SidebarButton
                    title="⚙️ Settings"
                    to="/admin/dashboard/settings"
                    setSidebarOpen={setSidebarOpen}
                />
            </div>

            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="
                        fixed
                        inset-0

                        bg-black/50
                        backdrop-blur-sm

                        z-[1900]
                    "
                />
            )}

            {/* 🔥 MAIN CONTENT */}
            <div
                className="
                    flex-1
                    relative

                    bg-zinc-950

                    min-h-screen
                "
            >
                {/* HEADER */}
                <Header 
                    toggleSidebar={() =>
                        setSidebarOpen(!sidebarOpen)
                    }
                    search={search}
                    setSearch={setSearch}
                />

                {/* PAGE CONTENT */}
                <div
                    className="
                        pt-5
                        px-5
                        pb-32

                        md:px-8
                    "
                >
                    <Outlet 
                        context={{
                            search
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

/* 🔥 SIDEBAR BUTTON */
function SidebarButton({
    title,
    to,
    setSidebarOpen,
}) {

    const location = useLocation();

    const active =
        location.pathname === to;

    return (

        <Link
            to={to}

            onClick={() =>
                setSidebarOpen(false)
            }

            className={`
                w-full

                flex
                items-center
                gap-3

                px-5
                py-4

                rounded-2xl

                transition-all
                duration-300

                text-lg

                z-[3000]

                ${
                    active
                        ? `
                            bg-blue-600
                            text-white
                            shadow-lg
                            shadow-blue-600/20
                        `
                        : `
                            text-zinc-400
                            hover:bg-zinc-800
                            hover:text-white
                        `
                }
            `}
        >
            {title}
        </Link>
    );
}
