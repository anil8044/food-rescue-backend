import { Route, Routes } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PermissionNotice from './components/PermissionNotice'
import BrowseDonationsPage from './pages/BrowseDonationsPage'
import RoleBoundary from './auth/RoleBoundary'

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="donations" element={<BrowseDonationsPage />} />
<Route element={<RoleBoundary role="RECIPIENT_ORG" />}><Route path="recipient/*" element={<NotFoundPage />} /></Route>
<Route element={<RoleBoundary role="DONOR" />}><Route path="donor/*" element={<NotFoundPage />} /></Route>
<Route element={<RoleBoundary role="ADMIN" />}><Route path="admin/*" element={<NotFoundPage />} /></Route>
<Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      <PermissionNotice />
    </>
  )
}


