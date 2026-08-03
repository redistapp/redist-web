import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import RecoverPasswordPage from '@/pages/RecoverPasswordPage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'
import DashboardPage from '@/pages/app/DashboardPage'
import IntentionsPage from '@/pages/app/IntentionsPage'
import MatchesPage from '@/pages/app/MatchesPage'
import ProfilePage from '@/pages/app/ProfilePage'
import PremiumPage from '@/pages/app/PremiumPage'
import AdminLoginPage from '@/pages/admin/AdminLoginPage'
import AdminDashboardPage from '@/pages/admin/DashboardPage'
import ReferenceDataPage from '@/pages/admin/ReferenceDataPage'
import InstitutionsPage from '@/pages/admin/InstitutionsPage'
import ReportsPage from '@/pages/admin/ReportsPage'
import UsersPage from '@/pages/admin/UsersPage'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AdminProtectedRoute } from '@/components/AdminProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'
import { AdminShell } from '@/components/layout/AdminShell'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route path="/recuperar-senha" element={<RecoverPasswordPage />} />
      {/* Destino do link enviado por e-mail: /redefinir-senha?token=… */}
      <Route path="/redefinir-senha" element={<ResetPasswordPage />} />

      {/* Área logada — layout compartilhado protegido */}
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/painel" element={<DashboardPage />} />
        <Route path="/painel/intencoes" element={<IntentionsPage />} />
        <Route path="/painel/matches" element={<MatchesPage />} />
        <Route path="/painel/perfil" element={<ProfilePage />} />
        <Route path="/painel/premium" element={<PremiumPage />} />
      </Route>

      {/* Painel administrativo — login próprio (/loginadm), separado da área de membros */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        element={
          <AdminProtectedRoute>
            <AdminShell />
          </AdminProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/instituicoes" element={<InstitutionsPage />} />
        <Route path="/admin/dados" element={<ReferenceDataPage />} />
        <Route path="/admin/denuncias" element={<ReportsPage />} />
        <Route path="/admin/usuarios" element={<UsersPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
