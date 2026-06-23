import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { API_BASE } from "../../config";

export default function VerifyResetOTP() {
    const location = useLocation();
    const navigate = useNavigate();

    const initialPhone = location.state?.phone || "";
    const [phone, setPhone] = useState(initialPhone);
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Resend countdown timer: starts at 60 seconds
    const [countdown, setCountdown] = useState(60);
    const timerRef = useRef(null);

    useEffect(() => {
        // Start the countdown on mount
        startTimer();

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const startTimer = () => {
        setCountdown(60);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        if (loading) return;
        setError("");
        setSuccessMsg("");

        if (!phone.trim()) {
            setError("Phone number is required");
            return;
        }

        if (otp.length !== 6 || isNaN(otp)) {
            setError("OTP must be a 6-digit number");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/auth/verify-reset-otp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    phone: phone.trim(),
                    otp: otp.trim(),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // If verified, navigate to Reset Password with reset_token
                navigate("/reset-password", {
                    state: {
                        reset_token: data.reset_token,
                        phone: phone.trim()
                    }
                });
            } else {
                setError(data.detail || "Invalid or expired OTP.");
            }
        } catch (err) {
            console.error("OTP verification failed:", err);
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (countdown > 0 || resending) return;
        setError("");
        setSuccessMsg("");
        setResending(true);

        try {
            const response = await fetch(`${API_BASE}/auth/forgot-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ phone: phone.trim() }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMsg("A new OTP has been sent to your WhatsApp.");
                startTimer();
            } else {
                setError(data.detail || "Failed to resend OTP.");
            }
        } catch (err) {
            console.error("Resend OTP failed:", err);
            setError("Network error while resending OTP.");
        } finally {
            setResending(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#242424",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontFamily: "Inter, sans-serif",
                padding: "20px",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "380px",
                    background: "#1e1e1e",
                    padding: "40px 30px",
                    borderRadius: "20px",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
                    boxSizing: "border-box",
                }}
            >
                <h1
                    style={{
                        color: "white",
                        marginBottom: "10px",
                        fontSize: "24px",
                        fontWeight: "bold",
                    }}
                >
                    Verify OTP
                </h1>
                <p
                    style={{
                        color: "#aaa",
                        fontSize: "14px",
                        lineHeight: "1.5",
                        marginBottom: "30px",
                    }}
                >
                    Please verify the 6-digit verification code sent to your WhatsApp.
                </p>

                {error && (
                    <div
                        style={{
                            background: "rgba(239, 68, 68, 0.1)",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            color: "#ef4444",
                            padding: "12px",
                            borderRadius: "10px",
                            fontSize: "14px",
                            marginBottom: "20px",
                            textAlign: "center",
                        }}
                    >
                        {error}
                    </div>
                )}

                {successMsg && (
                    <div
                        style={{
                            background: "rgba(16, 185, 129, 0.1)",
                            border: "1px solid rgba(16, 185, 129, 0.3)",
                            color: "#10b981",
                            padding: "12px",
                            borderRadius: "10px",
                            fontSize: "14px",
                            marginBottom: "20px",
                            textAlign: "center",
                        }}
                    >
                        {successMsg}
                    </div>
                )}

                <form onSubmit={handleVerify}>
                    <div style={{ marginBottom: "16px" }}>
                        <label
                            style={{
                                display: "block",
                                color: "#888",
                                fontSize: "12px",
                                fontWeight: "600",
                                marginBottom: "6px",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px"
                            }}
                        >
                            Phone Number
                        </label>
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            readOnly={!!initialPhone}
                            style={{
                                ...inputStyle,
                                background: initialPhone ? "#1a1a1a" : "#2d2d2d",
                                color: initialPhone ? "#888" : "white",
                                cursor: initialPhone ? "not-allowed" : "text",
                                marginBottom: 0,
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                        <label
                            style={{
                                display: "block",
                                color: "#888",
                                fontSize: "12px",
                                fontWeight: "600",
                                marginBottom: "6px",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px"
                            }}
                        >
                            6-Digit OTP
                        </label>
                        <input
                            type="text"
                            placeholder="Enter 6-digit code"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength={6}
                            style={{
                                ...inputStyle,
                                letterSpacing: otp ? "4px" : "normal",
                                textAlign: otp ? "center" : "left",
                                fontSize: otp ? "18px" : "15px",
                                fontWeight: otp ? "bold" : "normal",
                                marginBottom: 0,
                            }}
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...buttonStyle,
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? "not-allowed" : "pointer",
                        }}
                    >
                        {loading ? (
                            <span className="btn-loading-content">
                                <span className="spinner"></span>
                                Verifying...
                            </span>
                        ) : (
                            "Verify OTP"
                        )}
                    </button>
                </form>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "24px",
                    }}
                >
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={countdown > 0 || resending}
                        style={{
                            background: "transparent",
                            border: "none",
                            color: countdown > 0 || resending ? "#666" : "#2563eb",
                            fontSize: "14px",
                            cursor: countdown > 0 || resending ? "not-allowed" : "pointer",
                            fontWeight: "500",
                            padding: 0,
                        }}
                    >
                        {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
                    </button>

                    <Link
                        to="/admin"
                        style={{
                            color: "#888",
                            fontSize: "14px",
                            textDecoration: "none",
                            fontWeight: "500",
                        }}
                    >
                        Cancel
                    </Link>
                </div>
            </div>
        </div>
    );
}

const inputStyle = {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    outline: "none",
    background: "#2d2d2d",
    color: "white",
    fontSize: "15px",
    boxSizing: "border-box",
};

const buttonStyle = {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: "#2563eb",
    color: "white",
    fontWeight: "bold",
    fontSize: "15px",
    transition: "background 0.2s",
};
