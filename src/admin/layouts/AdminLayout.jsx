import { useState, useEffect } from "react";
import Header from "../../components/Headers";
import logoImg from "../../assets/logo.png";
import {
    Link,
    Outlet,
    useLocation
} from "react-router-dom";
import { API_BASE } from "../../config";

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [business, setBusiness] =
    useState(null);
    const [search, setSearch] =
    useState("");

    useEffect(() => {

    fetch(`${API_BASE}/api/admin/me`, {

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
                    <div className="flex items-center gap-2 sm:gap-2.5">
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
                    title="📈 Demo Insights"
                    to="/admin/dashboard/demo-insights"
                    setSidebarOpen={setSidebarOpen}
                />

                <div className="space-y-2"></div>

                <SidebarButton
                    title="⚙️ Settings"
                    to="/admin/dashboard/settings"
                    setSidebarOpen={setSidebarOpen}
                />

                {business?.role === "FOUNDER" && (
                    <>
                        <div className="space-y-2"></div>
                        <SidebarButton
                            title="👑 Founder Portal"
                            to="/founder"
                            setSidebarOpen={setSidebarOpen}
                        />
                        <div className="space-y-2"></div>
                        <SidebarButton
                            title="🏢 Register Merchant"
                            to="/founder/register"
                            setSidebarOpen={setSidebarOpen}
                        />
                    </>
                )}
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
                            bg-[#1ea753]
                            text-white
                            shadow-lg
                            shadow-[#1ea753]/20
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

