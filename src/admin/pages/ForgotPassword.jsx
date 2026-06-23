import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE } from "../../config";

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (loading) return;
        setError("");

        const cleanedPhone = phone.trim();
        if (!cleanedPhone) {
            setError("Phone number is required");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/auth/forgot-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ phone: cleanedPhone }),
            });

            const data = await response.json();

            if (response.ok) {
                // Navigate to verification screen, passing phone number state
                navigate("/verify-reset-otp", { state: { phone: cleanedPhone } });
            } else {
                setError(data.detail || "Failed to send OTP. Please try again.");
            }
        } catch (err) {
            console.error("Forgot password request failed:", err);
            setError("Network error. Please check your connection and try again.");
        } finally {
            setLoading(false);
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
                    Forgot Password
                </h1>
                <p
                    style={{
                        color: "#aaa",
                        fontSize: "14px",
                        lineHeight: "1.5",
                        marginBottom: "30px",
                    }}
                >
                    Enter your registered phone number. We will send a secure 6-digit OTP to your WhatsApp to verify your identity.
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

                <form onSubmit={handleSendOTP}>
                    <input
                        type="tel"
                        placeholder="Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={inputStyle}
                        disabled={loading}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...buttonStyle,
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? "not-allowed" : "pointer",
                            marginTop: "10px",
                        }}
                    >
                        {loading ? (
                            <span className="btn-loading-content">
                                <span className="spinner"></span>
                                Sending OTP...
                            </span>
                        ) : (
                            "Send OTP"
                        )}
                    </button>
                </form>

                <div
                    style={{
                        textAlign: "center",
                        marginTop: "24px",
                    }}
                >
                    <Link
                        to="/admin"
                        style={{
                            color: "#2563eb",
                            fontSize: "14px",
                            textDecoration: "none",
                            fontWeight: "500",
                        }}
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}

const inputStyle = {
    width: "100%",
    padding: "14px",
    marginBottom: "16px",
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
