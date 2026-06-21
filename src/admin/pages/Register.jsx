import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE } from "../../config";

export default function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        business_name: "",
        owner_name: "",
        email: "",
        business_phone: "",
        password: "",
        business_type: "",
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleRegister = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/api/register`, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify(form),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Business Registered!");

                navigate("/admin");
            } else {
                alert(data.detail || "Registration failed");
            }
        } catch (err) {
            console.error("Registration request failed:", err);
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

                padding: "20px",
            }}
        >
            <div
                style={{
                    width: "400px",

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
                    Register Business
                </h1>

                <input
                    name="business_name"
                    placeholder="Business Name"
                    onChange={handleChange}
                    style={inputStyle}
                />

                <input
                    name="owner_name"
                    placeholder="Owner Name"
                    onChange={handleChange}
                    style={inputStyle}
                />

                <input
                    name="email"
                    placeholder="Email"
                    onChange={handleChange}
                    style={inputStyle}
                />

                <input
                    name="business_phone"
                    placeholder="Business Phone"
                    onChange={handleChange}
                    style={inputStyle}
                />

                <input
                    name="business_type"
                    placeholder="Business Type"
                    onChange={handleChange}
                    style={inputStyle}
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    onChange={handleChange}
                    style={inputStyle}
                />

                <button
                    onClick={handleRegister}
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
                            Registering...
                        </span>
                    ) : (
                        "Register"
                    )}
                </button>

                <p
                    style={{
                        color: "#aaa",
                        marginTop: "20px",
                    }}
                >
                    Already have an account?{" "}
                    <Link
                        to="/admin"
                        style={{
                            color: "#2563eb",
                        }}
                    >
                        Login
                    </Link>
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