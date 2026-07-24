import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RootLayout } from '@/layouts/RootLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { AdminRoute, ProtectedRoute } from '@/routes/ProtectedRoute'
import { Home } from '@/pages/Home'
import { Courses } from '@/pages/Courses'
import { CoursePage } from '@/pages/CoursePage'
import { WikiList } from '@/pages/wiki/WikiList'
import { WikiPage } from '@/pages/wiki/WikiPage'
import { WikiForm } from '@/pages/wiki/WikiForm'
import { Resources } from '@/pages/Resources'
import { Exams } from '@/pages/Exams'
import { Search } from '@/pages/Search'
import { Announcements } from '@/pages/Announcements'
import { Contact } from '@/pages/Contact'
import { Communities } from '@/pages/community/Communities'
import { CommunityPost } from '@/pages/community/CommunityPost'
import { CreatePost } from '@/pages/community/CreatePost'
import { FAQ } from '@/pages/FAQ'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { Terms } from '@/pages/Terms'
import { Privacy } from '@/pages/Privacy'
import { ForgotPassword } from '@/pages/ForgotPassword'
import { ResetPassword } from '@/pages/ResetPassword'
import { Profile } from '@/pages/Profile'
import { AdminCourses } from '@/pages/admin/AdminCourses'
import { AdminUsers } from '@/pages/admin/AdminUsers'
import { AdminImportExport } from '@/pages/admin/AdminImportExport'
import { AdminAnalytics } from '@/pages/admin/AdminAnalytics'
import { AdminAnnouncements } from '@/pages/admin/AdminAnnouncements'
import { AdminContact } from '@/pages/admin/AdminContact'
import { NotFound } from '@/pages/NotFound'

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:slug" element={<CoursePage />} />
          <Route path="/courses/:slug/wiki" element={<WikiList />} />
          <Route path="/courses/:slug/wiki/new" element={<ProtectedRoute><WikiForm /></ProtectedRoute>} />
          <Route path="/courses/:slug/wiki/:pageSlug" element={<WikiPage />} />
          <Route path="/courses/:slug/wiki/:pageSlug/edit" element={<ProtectedRoute><WikiForm /></ProtectedRoute>} />
          <Route path="/courses/:slug/resources" element={<Resources />} />
          <Route path="/courses/:slug/exams" element={<Exams />} />
          <Route path="/search" element={<Search />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/community" element={<Communities />} />
          <Route path="/community/new" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
          <Route path="/community/:id" element={<CommunityPost />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Navigate to="/admin/courses" replace />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="import-export" element={<AdminImportExport />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="contact" element={<AdminContact />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
