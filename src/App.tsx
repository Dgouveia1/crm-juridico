import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './store/AppContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProcessList from './pages/ProcessList';
import ProcessDetail from './pages/ProcessDetail';
import CrmParties from './pages/CrmParties';
import CrmPartyDetail from './pages/CrmPartyDetail';
import Alerts from './pages/Alerts';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="processos" element={<ProcessList />} />
            <Route path="processos/:id" element={<ProcessDetail />} />
            <Route path="crm" element={<CrmParties />} />
            <Route path="crm/:id" element={<CrmPartyDetail />} />
            <Route path="alertas" element={<Alerts />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
