import { Routes, Route } from 'react-router-dom';
import { Landing } from './pages/Landing.jsx';
import { LoginPage, RegisterPage } from './pages/AuthPages.jsx';
import { Feed } from './pages/Feed.jsx';
import { Profile } from './pages/Profile.jsx';
import { Discover } from './pages/Discover.jsx';
import { AdminDashboard } from './pages/AdminDashboard.jsx';
import { AdminUsers } from './pages/AdminUsers.jsx';
import { AdminTweets } from './pages/AdminTweets.jsx';
import { NotFound } from './pages/NotFound.jsx';
import { ProtectedRoute, PublicOnly } from './routes/ProtectedRoute.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login"   element={<PublicOnly><LoginPage /></PublicOnly>} />
      <Route path="/registo" element={<PublicOnly><RegisterPage /></PublicOnly>} />

      <Route path="/feed"             element={<ProtectedRoute><Feed /></ProtectedRoute>} />
      <Route path="/perfil"           element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/perfil/:username" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/utilizadores"     element={<ProtectedRoute><Discover /></ProtectedRoute>} />

      <Route path="/admin"               element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/utilizadores"  element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/publicacoes"   element={<ProtectedRoute adminOnly><AdminTweets /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
