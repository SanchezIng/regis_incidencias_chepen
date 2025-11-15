import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthLayout } from './components/layout/AuthLayout';
import { Header } from './components/layout/Header';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { ForgotPasswordForm } from './components/auth/ForgotPasswordForm';
import { ResetPasswordForm } from './components/auth/ResetPasswordForm';
import { IncidentForm } from './components/incidents/IncidentForm';
import { IncidentList } from './components/incidents/IncidentList';
import { AuthorityDashboard } from './components/dashboard/AuthorityDashboard';
import { Statistics } from './components/dashboard/Statistics';
import { Database } from './lib/database.types';

type Incident = Database['public']['Tables']['incidents']['Row'] & {
  incident_categories: Database['public']['Tables']['incident_categories']['Row'];
  profiles: Database['public']['Tables']['profiles']['Row'];
};

function AuthPages() {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setAuthMode('reset');
    }
  }, []);

  const handleResetSuccess = () => {
    setAuthMode('login');
    window.location.hash = '';
  };

  return (
    <AuthLayout>
      {authMode === 'login' && (
        <LoginForm
          onToggleForm={() => setAuthMode('register')}
          onForgotPassword={() => setAuthMode('forgot')}
        />
      )}
      {authMode === 'register' && (
        <RegisterForm onToggleForm={() => setAuthMode('login')} />
      )}
      {authMode === 'forgot' && (
        <ForgotPasswordForm onBack={() => setAuthMode('login')} />
      )}
      {authMode === 'reset' && (
        <ResetPasswordForm onSuccess={handleResetSuccess} />
      )}
    </AuthLayout>
  );
}

function MainApp() {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('incidents');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleIncidentSelect = (incident: Incident) => {
    if (profile?.role === 'authority') {
      setSelectedIncident(incident);
    }
  };

  const handleDashboardClose = () => {
    setSelectedIncident(null);
  };

  const handleIncidentUpdate = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return <AuthPages />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {profile.role === 'citizen' ? (
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <IncidentForm onSuccess={handleIncidentUpdate} />
            </div>
            <div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Mis Reportes</h2>
                <IncidentList key={refreshKey} />
              </div>
            </div>
          </div>
        ) : (
          <div>
            {activeTab === 'incidents' ? (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Gestión de Incidencias
                </h2>
                <IncidentList
                  key={refreshKey}
                  onSelectIncident={handleIncidentSelect}
                />
              </div>
            ) : (
              <Statistics key={refreshKey} />
            )}
          </div>
        )}
      </main>

      {selectedIncident && (
        <AuthorityDashboard
          incident={selectedIncident}
          onClose={handleDashboardClose}
          onUpdate={handleIncidentUpdate}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
