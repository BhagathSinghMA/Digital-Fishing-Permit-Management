import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';
import { HarbourOfficerLayout } from '../components/layout/HarbourOfficerLayout';
import { MainOfficerLayout } from '../components/layout/MainOfficerLayout';

// Auth
import { Login } from '../pages/auth/Login';

// Portal 1: Permit Office Pages
import { OfficerDashboard } from '../pages/dashboard/OfficerDashboard';
import { PendingPermits } from '../pages/permits/PendingPermits';
import { ApprovedPermits } from '../pages/permits/ApprovedPermits';
import { RejectedPermits } from '../pages/permits/RejectedPermits';
import { PermitHistory } from '../pages/permits/PermitHistory';
import { BoatOwnersList } from '../pages/boatOwners/BoatOwnersList';
import { FishermanSearch } from '../pages/fishermen/FishermanSearch';
import { BlockedFishermen } from '../pages/blocked/BlockedFishermen';

// Portal 2: Main Officer Pages
import { MainOfficerDashboard } from '../pages/dashboard/MainOfficerDashboard';
import { MainBoatOwners } from '../pages/boatOwners/MainBoatOwners';
import { MainFishermen } from '../pages/fishermen/MainFishermen';

export const AppRoutes: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  const getHomeRedirect = () => {
    if (!isAuthenticated || !user) return '/login';
    return user.role === 'OFFICER' ? '/office/dashboard' : '/admin/dashboard';
  };

  return (
    <Routes>
      {/* Public Auth */}
      <Route path="/login" element={<Login />} />

      {/* Root redirect based on role */}
      <Route path="/" element={<Navigate to={getHomeRedirect()} replace />} />

      {/* Portal 1: Permit Office Portal (Role: OFFICER) */}
      <Route element={<ProtectedRoute allowedRoles={['OFFICER']} />}>
        <Route path="/office" element={<HarbourOfficerLayout />}>
          <Route index element={<Navigate to="/office/dashboard" replace />} />
          <Route path="dashboard" element={<OfficerDashboard />} />
          <Route path="permits/pending" element={<PendingPermits />} />
          <Route path="permits/approved" element={<ApprovedPermits />} />
          <Route path="permits/rejected" element={<RejectedPermits />} />
          <Route path="permits/history" element={<PermitHistory />} />
          <Route path="boat-owners" element={<BoatOwnersList />} />
          <Route path="fishermen/search" element={<FishermanSearch />} />
          <Route path="blocked" element={<BlockedFishermen />} />
        </Route>
      </Route>

      {/* Portal 2: Main Officer Portal (Role: MAIN_OFFICER / SUPER_ADMIN) */}
      <Route element={<ProtectedRoute allowedRoles={['MAIN_OFFICER', 'SUPER_ADMIN']} />}>
        <Route path="/admin" element={<MainOfficerLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<MainOfficerDashboard />} />
          <Route path="boat-owners" element={<MainBoatOwners />} />
          <Route path="fishermen" element={<MainFishermen />} />
        </Route>
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to={getHomeRedirect()} replace />} />
    </Routes>
  );
};
