import React from "react"
import Home from "../pages/HomePage/HomePage"
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute'
import RoleBasedRoute from "../components/RoleBasedRoute/RoleBasedRoute"

export const routes = [
    {
        path: '/',
        page: Home,
        isShowHeader: true,
        isPublic: true
    },
    {
        path: '/login',
        page: React.lazy(() => import("../pages/LoginPage/LoginPage")),
        isShowHeader: false,
        isPublic: true
    },
    {
        path: '/register',
        page: React.lazy(() => import("../pages/LoginPage/RegisterPage")),
        isShowHeader: false,
        isPublic: true
    },
    {
        path: '/dashboard',
        page: React.lazy(() => import("../pages/UserDashboard/UserDashboard")),
        isShowHeader: false,
        isPublic: false,
        requiredRole: 'admin'
    },
     {
        path: '/unauthorized',
        page: React.lazy(() => import("../pages/UnauthorizedPage/UnauthorizedPage")),
        isShowHeader: false,
        isPublic: true
    }
]