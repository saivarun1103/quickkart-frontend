// import { useEffect, useState } from "react";
import AdminLayout from "./admin/layouts/AdminLayout";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./admin/pages/Login";
import Register from "./admin/pages/Register";
import ForgotPassword from "./admin/pages/ForgotPassword";
import VerifyResetOTP from "./admin/pages/VerifyResetOTP";
import ResetPassword from "./admin/pages/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import FounderProtectedRoute from "./components/FounderProtectedRoute";
import FounderDashboard from "./founder/pages/FounderDashboard";
import CustomerMenu from "./customer/pages/CustomerMenu";
import MenuPage from "./admin/pages/MenuPage";
import OrdersPage from "./admin/pages/OrdersPage";
import AnalyticsPage from "./admin/pages/AnalyticsPage";
import SettingsPage from "./admin/pages/SettingsPage";
import DemoInsightsPage from "./admin/pages/DemoInsightsPage";
import { Navigate } from "react-router-dom";
import OrderSuccess from "./customer/pages/OrderSuccess";
import Discover from "./Pages/Discover";
import PrivacyPolicy from "./Pages/PrivacyPolicy";
import Orders from "./customer/pages/Orders";

export default function App() {  
  return (
    <Router>
      <Routes>
        <Route
            path=""
            element={<Discover />}
        />

        <Route
            path="/privacy-policy"
            element={<PrivacyPolicy/>}
        />

        {/* DISCOVER PAGE */}
        <Route
            path="/discover"
            element={<Discover />}
        />

        {/* USER SESSION MENU */}
        <Route
            path="/:businessSlug/m/:sessionToken"
            element={<CustomerMenu />}
        />

        {/* USER MENU */}
        <Route
            path="/:businessSlug"
            element={<CustomerMenu />}
        />

        {/* OrderSucceess Page */}
        <Route
            path="/order-success"
            element={<OrderSuccess />}
        />

        {/* Orders Page */}
        <Route
            path="/orders"
            element={<Orders />}
        />

        {/* LOGIN */}
        <Route
            path="/admin"
            element={<Login />}
        />

        <Route
            path="/forgot-password"
            element={<ForgotPassword />}
        />

        <Route
            path="/verify-reset-otp"
            element={<VerifyResetOTP />}
        />

        <Route
            path="/reset-password"
            element={<ResetPassword />}
        />

        {/* REGISTER */}
        <Route
            path="/founder/register"
            element={
                <FounderProtectedRoute>
                    <Register />
                </FounderProtectedRoute>
            }
        />

        {/* FOUNDER DASHBOARD */}
        <Route
            path="/founder"
            element={
                <FounderProtectedRoute>
                    <FounderDashboard />
                </FounderProtectedRoute>
            }
        />

        {/* ADMIN DASHBOARD */}
        <Route
            path="/admin/dashboard"
            element={
                <ProtectedRoute>
                    <AdminLayout />
                </ProtectedRoute>
            }
        >

            <Route
                index
                element={
                    <Navigate
                        to="menu"
                        replace
                    />
                }
            />

            

            <Route
                path="menu"
                element={<MenuPage />}
            />

            <Route
                path="orders"
                element={<OrdersPage />}
            />

            <Route
                path="analytics"
                element={<AnalyticsPage />}
            />

            <Route
                path="settings"
                element={<SettingsPage />}
            />

            <Route
                path="demo-insights"
                element={<DemoInsightsPage />}
            />

        </Route>
    </Routes>
    </Router>
  );
}
