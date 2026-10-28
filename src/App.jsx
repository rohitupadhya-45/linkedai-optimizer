import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardOverview from './pages/dashboard/DashboardOverview';
import ProfileAnalyzer from './pages/dashboard/ProfileAnalyzer';
import PostGenerator from './pages/dashboard/PostGenerator';
import PostHistory from './pages/dashboard/PostHistory';
import DashboardProfile from './pages/dashboard/DashboardProfile';
import DashboardAnalytics from './pages/dashboard/DashboardAnalytics';
import DashboardSettings from './pages/dashboard/DashboardSettings';
import DashboardTeam from './pages/dashboard/DashboardTeam';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Dashboard Layout at Root */}
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="profile" element={<DashboardProfile />} />
          <Route path="profile-analyzer" element={<ProfileAnalyzer />} />
          <Route path="post-generator" element={<PostGenerator />} />
          <Route path="post-history" element={<PostHistory />} />
          <Route path="analytics" element={<DashboardAnalytics />} />
          <Route path="templates" element={<DashboardTeam />} />
          <Route path="settings" element={<DashboardSettings />} />
        </Route>

        {/* /dashboard path with identical mappings so all URLs work */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="profile" element={<DashboardProfile />} />
          <Route path="analyzer" element={<ProfileAnalyzer />} />
          <Route path="profile-analyzer" element={<ProfileAnalyzer />} />
          <Route path="generator" element={<PostGenerator />} />
          <Route path="post-generator" element={<PostGenerator />} />
          <Route path="history" element={<PostHistory />} />
          <Route path="post-history" element={<PostHistory />} />
          <Route path="analytics" element={<DashboardAnalytics />} />
          <Route path="templates" element={<DashboardTeam />} />
          <Route path="settings" element={<DashboardSettings />} />
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
