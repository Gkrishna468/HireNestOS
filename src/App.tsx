/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { Sidebar } from './components/Sidebar';
import { Toaster } from 'sonner';

// Lazy load pages eventually, but for now placeholders or direct imports
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import Candidates from './pages/Candidates';
import Clients from './pages/Clients';
import Vendors from './pages/Vendors';
import Resumes from './pages/Resumes';
import Agents from './pages/Agents';
import AIMatching from './pages/AIMatching';
import FollowUps from './pages/FollowUps';
import DealRoom from './pages/DealRoom';
import AgentChat from './pages/AgentChat';
import Settings from './pages/Settings';
import Login from './pages/Login';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex items-center justify-center h-screen bg-slate-100 text-slate-500 font-medium">Loading HireNest...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/jobs" element={<PrivateRoute><Jobs /></PrivateRoute>} />
            <Route path="/candidates" element={<PrivateRoute><Candidates /></PrivateRoute>} />
            <Route path="/clients" element={<PrivateRoute><Clients /></PrivateRoute>} />
            <Route path="/vendors" element={<PrivateRoute><Vendors /></PrivateRoute>} />
            <Route path="/resumes" element={<PrivateRoute><Resumes /></PrivateRoute>} />
            <Route path="/agents" element={<PrivateRoute><Agents /></PrivateRoute>} />
            <Route path="/ai-matching" element={<PrivateRoute><AIMatching /></PrivateRoute>} />
            <Route path="/follow-ups" element={<PrivateRoute><FollowUps /></PrivateRoute>} />
            <Route path="/deal-room" element={<PrivateRoute><DealRoom /></PrivateRoute>} />
            <Route path="/agent-chat" element={<PrivateRoute><AgentChat /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}
