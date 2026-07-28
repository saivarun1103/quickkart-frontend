import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UilEye, UilEyeSlash } from "@iconscout/react-unicons";
import { API_BASE } from "../../config";
import logoImg from "../../assets/logo.png";

export default function Login() {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      fetch(`${API_BASE}/api/admin/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Invalid token");
        })
        .then(() => {
          navigate("/admin/dashboard");
        })
        .catch(() => {
          localStorage.removeItem("token");
        });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (loading) return;
    setError("");

    if (!identifier.trim() || !password) {
      setError("Please fill in both Email/Phone and Password.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.access_token);
        navigate("/admin/dashboard");
      } else {
        setError(data.detail || "Invalid credentials.");
      }
    } catch (err) {
      console.error("Login request failed:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 font-sans select-none">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-7 sm:p-8 shadow-xl">
        {/* Brand Logo & Title */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-center mb-3">
            <img
              src={logoImg}
              alt="GoSkipDQ Logo"
              className="w-7 h-7 object-contain"
            />
          </div>
          <h1 className="text-xl font-extrabold italic tracking-tight">
            <span className="text-emerald-500">Go</span>
            <span className="text-white">Skip</span>
            <span className="text-emerald-500">DQ</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-medium tracking-wide">
            Partner
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              Email or Phone
            </label>
            <input
              type="text"
              placeholder="Enter email or phone"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700/80 focus:border-emerald-500 text-white placeholder-zinc-500 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-zinc-400">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-emerald-500 hover:underline font-medium"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700/80 focus:border-emerald-500 text-white placeholder-zinc-500 rounded-xl pl-4 pr-11 py-3 text-sm font-medium outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
              >
                {showPassword ? (
                  <UilEyeSlash size="18" />
                ) : (
                  <UilEye size="18" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#1ea753] hover:bg-emerald-600 text-white font-bold text-sm py-3.5 rounded-xl transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}