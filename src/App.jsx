import { useEffect, useState } from "react";
import AdminLayout from "./admin/layouts/AdminLayout";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./admin/pages/Login";
import Register from "./admin/pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import FounderProtectedRoute from "./components/FounderProtectedRoute";
import FounderDashboard from "./founder/pages/FounderDashboard";
import CustomerMenu from "./customer/pages/CustomerMenu";
import MenuPage from "./admin/pages/MenuPage";
import OrdersPage from "./admin/pages/OrdersPage";
import AnalyticsPage from "./admin/pages/AnalyticsPage";
import SettingsPage from "./admin/pages/SettingsPage";
import { Navigate } from "react-router-dom";
import OrderSuccess from "./customer/pages/OrderSuccess";
import Discover from "./Pages/Discover";
import PrivacyPolicy from "./Pages/PrivacyPolicy";

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

        {/* LOGIN */}
        <Route
            path="/admin"
            element={<Login />}
        />

        {/* REGISTER */}
        <Route
            path="/secretregister"
            element={<Register />}
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

        </Route>
    </Routes>
    </Router>
  );
}
