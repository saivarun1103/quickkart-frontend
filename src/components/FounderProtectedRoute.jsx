import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { API_BASE } from "../config";

export default function FounderProtectedRoute({ children }) {
    const [loading, setLoading] = useState(true);
    const [isFounder, setIsFounder] = useState(false);
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }

        fetch(`${API_BASE}/api/admin/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then((res) => {
            if (!res.ok) {
                throw new Error("Unauthorized");
            }
            return res.json();
        })
        .then((data) => {
            if (data && data.role === "FOUNDER") {
                setIsFounder(true);
            } else {
                setIsFounder(false);
            }
        })
        .catch((err) => {
            console.error("Founder access verification error:", err);
            setIsFounder(false);
        })
        .finally(() => {
            setLoading(false);
        });
    }, [token]);

    if (!token) {
        return <Navigate to="/admin" replace />;
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white">
                <div className="w-12 h-12 border-4 border-t-zinc-100 border-zinc-800 rounded-full animate-spin"></div>
                <p className="mt-4 text-zinc-400 text-sm font-medium tracking-wide">Validating founder credentials...</p>
            </div>
        );
    }

    if (!isFounder) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return children;
}
