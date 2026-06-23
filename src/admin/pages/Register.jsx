import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../../config";
import LocationIcon from "../components/Fonts/LocationIcon";
import { UilEye, UilEyeSlash } from "@iconscout/react-unicons";

export default function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        business_name: "",
        owner_name: "",
        email: "",
        business_phone: "",
        contact_number: "",
        password: "",
        business_type: "",
        location_name: "",
        latitude: "",
        longitude: "",
    });
    
    const [existingTypes, setExistingTypes] = useState([]);
    const [businessTypeSelect, setBusinessTypeSelect] = useState("");
    const [newTypeVal, setNewTypeVal] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Fetch existing types on mount
    useEffect(() => {
        fetch(`${API_BASE}/public/business/types`)
            .then(res => res.json())
            .then(data => {
                setExistingTypes(data);
            })
            .catch(err => {
                console.error("Failed to fetch types:", err);
                setExistingTypes(["Tiffins", "Restaurant", "Cafe", "Fast Food", "Grocery", "Bakery"]);
            });
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleTypeSelectChange = (e) => {
        const val = e.target.value;
        setBusinessTypeSelect(val);
        if (val !== "ADD_NEW") {
            setForm((prev) => ({
                ...prev,
                business_type: val,
            }));
        } else {
            setForm((prev) => ({
                ...prev,
                business_type: "",
            }));
        }
    };

    const handleAddCustomType = () => {
        const cleaned = newTypeVal.trim();
        if (cleaned) {
            if (!existingTypes.includes(cleaned)) {
                setExistingTypes(prev => [...prev, cleaned]);
            }
            setForm(prev => ({ ...prev, business_type: cleaned }));
            setBusinessTypeSelect(cleaned);
            setNewTypeVal("");
        }
    };

    const handleGetCoordinates = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                setForm(prev => ({
                    ...prev,
                    latitude: lat.toFixed(6),
                    longitude: lng.toFixed(6),
                }));
            },
            (error) => {
                console.error("Geolocation error:", error);
                alert("Failed to retrieve location: " + error.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const handleRegister = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const payload = {
                ...form,
                latitude: form.latitude ? parseFloat(form.latitude) : null,
                longitude: form.longitude ? parseFloat(form.longitude) : null,
            };

            const response = await fetch(`${API_BASE}/api/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                setSubmitted(true);
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

    if (submitted) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    background: "#242424",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "45px 20px",
                    fontFamily: "Inter, sans-serif",
                }}
            >
                <div
                    style={{
                        width: "420px",
                        background: "#1e1e1e",
                        padding: "40px",
                        borderRadius: "20px",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
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
                    <h1 style={{ color: "white", fontSize: "22px", fontWeight: "bold", marginBottom: "15px" }}>
                        Application Submitted
                    </h1>
                    <p style={{ color: "#aaa", fontSize: "14px", lineHeight: "1.6", marginBottom: "30px" }}>
                        Your application has been submitted for review.
                        <br />
                        You will receive access once your business is approved.
                    </p>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            width: "100%",
                            padding: "14px",
                            borderRadius: "12px",
                            border: "none",
                            background: "#2563eb",
                            color: "white",
                            fontWeight: "bold",
                            cursor: "pointer",
                            fontSize: "15px",
                        }}
                    >
                        Go Back
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
                padding: "40px 20px",
            }}
        >
            <div
                style={{
                    width: "420px",
                    background: "#1e1e1e",
                    padding: "40px",
                    borderRadius: "20px",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
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
                    value={form.business_name}
                    onChange={handleChange}
                    style={inputStyle}
                />

                <input
                    name="owner_name"
                    placeholder="Owner Name"
                    value={form.owner_name}
                    onChange={handleChange}
                    style={inputStyle}
                />

                <input
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    style={inputStyle}
                />

                <input
                    name="business_phone"
                    placeholder="Business Phone"
                    value={form.business_phone}
                    onChange={handleChange}
                    style={inputStyle}
                />

                <input
                    name="contact_number"
                    placeholder="Contact Number (Founder only)"
                    value={form.contact_number}
                    onChange={handleChange}
                    style={inputStyle}
                />

                {/* Dropdown for Business Type with Add New Type option */}
                <select
                    value={businessTypeSelect}
                    onChange={handleTypeSelectChange}
                    style={selectStyle}
                >
                    <option value="" disabled hidden>Select Business Type</option>
                    {existingTypes.map((type) => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                    <option value="ADD_NEW">Add new type +</option>
                </select>

                {businessTypeSelect === "ADD_NEW" && (
                    <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                        <input
                            placeholder="New type"
                            value={newTypeVal}
                            onChange={(e) => setNewTypeVal(e.target.value)}
                            style={{
                                flex: 1,
                                padding: "14px",
                                borderRadius: "12px",
                                border: "none",
                                outline: "none",
                                background: "#2d2d2d",
                                color: "white",
                                fontSize: "15px",
                                boxSizing: "border-box"
                            }}
                        />
                        <button
                            type="button"
                            onClick={handleAddCustomType}
                            style={{
                                padding: "14px 20px",
                                borderRadius: "12px",
                                border: "none",
                                background: "#2563eb",
                                color: "white",
                                fontWeight: "bold",
                                cursor: "pointer",
                                fontSize: "15px"
                            }}
                        >
                            Add
                        </button>
                    </div>
                )}

                <input
                    name="location_name"
                    placeholder="Location Name / Address"
                    value={form.location_name}
                    onChange={handleChange}
                    style={inputStyle}
                />

                {/* Side by side Coordinates with get position button matching Image 2 */}
                <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "16px" }}>
                    <div style={{ flex: 1 }}>
                        <input
                            name="latitude"
                            placeholder="Latitude"
                            value={form.latitude}
                            onChange={handleChange}
                            style={{ ...inputStyle, marginBottom: 0 }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <input
                            name="longitude"
                            placeholder="Longitude"
                            value={form.longitude}
                            onChange={handleChange}
                            style={{ ...inputStyle, marginBottom: 0 }}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleGetCoordinates}
                        title="Get current coordinates"
                        style={{
                            width: "50px",
                            height: "50px",
                            borderRadius: "12px",
                            border: "none",
                            background: "#2563eb",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            flexShrink: 0
                        }}
                    >
                        <LocationIcon size={24} color="#ffffff" />
                    </button>
                </div>

                <div
                    style={{
                        position: "relative",
                        width: "100%",
                        marginBottom: "16px",
                    }}
                >
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        style={{
                            ...inputStyle,
                            marginBottom: 0,
                            paddingRight: "50px",
                        }}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
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
                        {showPassword ? (
                            <UilEyeSlash size="20" />
                        ) : (
                            <UilEye size="20" />
                        )}
                    </button>
                </div>

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
                            Submitting...
                        </span>
                    ) : (
                        "Submit for Review"
                    )}
                </button>

                <button
                    onClick={() => navigate(-1)}
                    style={backButtonStyle}
                >
                    Go Back
                </button>
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

const selectStyle = {
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
    cursor: "pointer",
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

const backButtonStyle = {
    width: "100%",
    padding: "14px",
    marginTop: "16px",
    borderRadius: "12px",
    border: "1px solid #333333",
    background: "transparent",
    color: "#aaaaaa",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "15px",
};