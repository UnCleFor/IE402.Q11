import React from "react"
import Home from "../pages/HomePage/HomePage"
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute'
import RoleBasedRoute from "../components/RoleBasedRoute/RoleBasedRoute"

export const routes = [{
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
        path: '/map',
        page: React.lazy(() => import("../pages/PublicMapPage/PublicMapPage")),
        isShowHeader: true,
        isShowFooter: false,
        isPublic: true
    },
    {
        path: '/pharmacy',
        page: React.lazy(() => import("../pages/PharmacyPage/PharmacyPage")),
        isShowHeader: true,
        isPublic: true
    },
    {
        path: '/unauthorized',
        page: React.lazy(() => import("../pages/UnauthorizedPage/UnauthorizedPage")),
        isShowHeader: false,
        isPublic: true
    },
    {
        path: '/symptom-results',
        page: React.lazy(() => import("../pages/SymptomResultsPage/SymptomResultsPage")),
        isShowHeader: true,
        isPublic: true
    },
    {
        path: '/filtered-results',
        page: React.lazy(() => import("../pages/FilteredResultsPage/FilteredResultsPage")),
        isShowHeader: true,
        isPublic: true
    },
    {
        path: '/my-appointments',
        page: React.lazy(() => import("../pages/MyAppointmentsPage/MyAppointmentsPage")),
        isShowHeader: true,
        isPublic: true
    },
    {
        path: '/symptom-function',
        page: React.lazy(() => import("../pages/SymptomSearchPage/SymptomSearchPage")),
        isShowHeader: true,
        isPublic: true
    },
    {
        path: '/nearbyfacilities-function',
        page: React.lazy(() => import("../pages/NearbyFacilitiesPage/NearbyFacilitiesPage")),
        isShowHeader: true,
        isPublic: true
    },
    {
        path: '/onlinebooking-function',
        page: React.lazy(() => import("../pages/OnlineBookingPage/OnlineBookingPage")),
        isShowHeader: true,
        isPublic: true
    },
    {
        path: '/filtered-function',
        page: React.lazy(() => import("../pages/FiltersPage/FiltersPage")),
        isShowHeader: true,
        isPublic: true
    },
    {
        path: '/outbreaks',
        page: React.lazy(() => import("../pages/OutbreakPage/OutbreakPage")),
        isShowHeader: true,
        isPublic: true
    },
    {
        path: '/profile',
        page: React.lazy(() => import("../pages/ProfilePage/ProfilePage")),
        isShowHeader: true,
        isPublic: false, 
    },
]