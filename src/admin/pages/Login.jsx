import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE } from "../../config";
import {
    UilEye,
    UilEyeSlash,
} from "@iconscout/react-unicons";

export default function Login() {
    const navigate = useNavigate();

    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            fetch(`${API_BASE}/api/admin/me`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((res) => {
                if (res.ok) return res.json();
                throw new Error("Invalid token");
            })
            .then((data) => {
                navigate("/admin/dashboard");
            })
            .catch(() => {
                localStorage.removeItem("token");
            });
        }
    }, []);

    const handleLogin = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/api/login`, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({
                    identifier,
                    password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.access_token);
                navigate("/admin/dashboard");
            } else {
                alert(data.detail || "Login failed");
            }
        } catch (err) {
            console.error("Login request failed:", err);
            alert("Network error. Please try again.");
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
            }}
        >
            <div
                style={{
                    width: "350px",

                    background: "#1e1e1e",

                    padding: "40px",

                    borderRadius: "20px",

                    boxShadow:
                        "0 10px 40px rgba(0,0,0,0.3)",
                }}
            >
                <h1
                    style={{
                        color: "white",
                        marginBottom: "30px",
                    }}
                >
                    Admin Login
                </h1>

                <input
                    placeholder="Email or Phone"
                    value={identifier}
                    onChange={(e) =>
                        setIdentifier(e.target.value)
                    }
                    style={inputStyle}
                />

                <div
                    style={{
                        position: "relative",
                        width: "100%",
                        marginBottom: "16px",
                    }}
                >
                    <input
                        type={show ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        style={{
                            ...inputStyle,
                            marginBottom: 0,
                            paddingRight: "50px",
                        }}
                    />

                    <button
                        type="button"
                        onClick={() => setShow(!show)}
                        style={{
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
                        }}
                    >
                        {show ? (
                            <UilEyeSlash size="20" />
                        ) : (
                            <UilEye size="20" />
                        )}
                    </button>
                </div>

                <div
                    style={{
                        textAlign: "right",
                        marginBottom: "20px",
                        marginTop: "-8px",
                    }}
                >
                    <Link
                        to="/forgot-password"
                        style={{
                            color: "#2563eb",
                            fontSize: "14px",
                            textDecoration: "none",
                        }}
                    >
                        Forgot Password?
                    </Link>
                </div>

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    style={{
                        ...buttonStyle,
                        opacity: loading ? 0.7 : 1,
                        cursor: loading ? "not-allowed" : "pointer"
                    }}
                >
                    {loading ? (
                        <span className="btn-loading-content">
                            <span className="spinner"></span>
                            Logging in...
                        </span>
                    ) : (
                        "Login"
                    )}
                </button>

                <p
                    style={{
                        color: "#aaa",
                        marginTop: "20px",
                    }}
                >
                    {/* New Business?{" "} */}
                    {/* <Link
                        to="/register"
                        style={{
                            color: "#2563eb",
                        }}
                    >
                        Register
                    </Link> */}
                </p>
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

    cursor: "pointer",

    fontSize: "15px",
};