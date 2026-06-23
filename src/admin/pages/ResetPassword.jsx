import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { API_BASE } from "../../config";
import { UilEye, UilEyeSlash } from "@iconscout/react-unicons";

export default function ResetPassword() {
    const location = useLocation();
    const navigate = useNavigate();

    const resetToken = location.state?.reset_token || "";
    const phone = location.state?.phone || "";

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleReset = async (e) => {
        e.preventDefault();
        if (loading) return;
        setError("");

        if (!resetToken) {
            setError("Reset token is missing. Please restart the forgot password process.");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/auth/reset-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    reset_token: resetToken,
                    new_password: password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
            } else {
                setError(data.detail || "Failed to reset password. The link may have expired.");
            }
        } catch (err) {
            console.error("Password reset request failed:", err);
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
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
                        textAlign: "center",
                    }}
                >
                    <div
                        style={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "50%",
                            background: "rgba(16, 185, 129, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 20px auto",
                            color: "#10b981",
                        }}
                    >
                        <svg
                            width="30"
                            height="30"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>

                    <h1
                        style={{
                            color: "white",
                            marginBottom: "10px",
                            fontSize: "24px",
                            fontWeight: "bold",
                        }}
                    >
                        Password Reset
                    </h1>
                    <p
                        style={{
                            color: "#aaa",
                            fontSize: "14px",
                            lineHeight: "1.5",
                            marginBottom: "30px",
                        }}
                    >
                        Your password has been successfully updated. You can now log in with your new password.
                    </p>

                    <button
                        onClick={() => navigate("/admin")}
                        style={buttonStyle}
                    >
                        Proceed to Login
                    </button>
                </div>
            </div>
        );
    }

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
                    Reset Password
                </h1>
                <p
                    style={{
                        color: "#aaa",
                        fontSize: "14px",
                        lineHeight: "1.5",
                        marginBottom: "30px",
                    }}
                >
                    Set a secure new password for your account (min 8 characters).
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

                {!resetToken && (
                    <div
                        style={{
                            background: "rgba(245, 158, 11, 0.1)",
                            border: "1px solid rgba(245, 158, 11, 0.3)",
                            color: "#f59e0b",
                            padding: "12px",
                            borderRadius: "10px",
                            fontSize: "14px",
                            marginBottom: "20px",
                            textAlign: "center",
                        }}
                    >
                        Warning: No active reset session detected. Please request a reset from the login page first.
                    </div>
                )}

                <form onSubmit={handleReset}>
                    <div style={{ marginBottom: "16px", position: "relative" }}>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="New Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                ...inputStyle,
                                paddingRight: "50px",
                                marginBottom: 0
                            }}
                            disabled={loading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={eyeButtonStyle}
                        >
                            {showPassword ? (
                                <UilEyeSlash size="20" />
                            ) : (
                                <UilEye size="20" />
                            )}
                        </button>
                    </div>

                    <div style={{ marginBottom: "20px", position: "relative" }}>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={{
                                ...inputStyle,
                                paddingRight: "50px",
                                marginBottom: 0
                            }}
                            disabled={loading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={eyeButtonStyle}
                        >
                            {showConfirmPassword ? (
                                <UilEyeSlash size="20" />
                            ) : (
                                <UilEye size="20" />
                            )}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !resetToken}
                        style={{
                            ...buttonStyle,
                            opacity: (loading || !resetToken) ? 0.7 : 1,
                            cursor: (loading || !resetToken) ? "not-allowed" : "pointer",
                        }}
                    >
                        {loading ? (
                            <span className="btn-loading-content">
                                <span className="spinner"></span>
                                Updating Password...
                            </span>
                        ) : (
                            "Reset Password"
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
                            color: "#888",
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

const eyeButtonStyle = {
    position: "absolute",
    right: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#aaa",
    padding: 0,
};
