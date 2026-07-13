import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import RecoverPasswordPage from '@/pages/RecoverPasswordPage'
import DashboardPage from '@/pages/app/DashboardPage'
import IntentionsPage from '@/pages/app/IntentionsPage'
import MatchesPage from '@/pages/app/MatchesPage'
import ProfilePage from '@/pages/app/ProfilePage'
import PremiumPage from '@/pages/app/PremiumPage'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route path="/recuperar-senha" element={<RecoverPasswordPage />} />

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

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
