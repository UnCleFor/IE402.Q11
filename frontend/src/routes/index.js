import React from "react"
import Home from "../pages/HomePage/HomePage"
export const routes = [
    {
        path: '/',
        page: Home,
        isShowHeader: true
    },
    {
        path: '/login',
        page: React.lazy(() => import("../pages/LoginPage/LoginPage")),
        isShowHeader: false
    },
    {
        path: '/dashboard',
        page: React.lazy(() => import("../pages/UserDashboard/UserDashboard")),
        isShowHeader: false
    },
    {
        path: '/map',
        page: React.lazy(() => import("../pages/PublicMapPage/PublicMapPage")),
        isShowHeader: true
    },
    {
        path: '/pharmacy',
        page: React.lazy(() => import("../pages/PharmacyPage/PharmacyPage")),
        isShowHeader: true
    }
]