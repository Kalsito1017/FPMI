import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RootLayout } from '@/layouts/RootLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { AdminRoute, ProtectedRoute } from '@/routes/ProtectedRoute'
import { Home } from '@/pages/Home'
import { Courses } from '@/pages/Courses'
import { CoursePage } from '@/pages/CoursePage'
import { Professors } from '@/pages/Professors'
import { Announcements } from '@/pages/Announcements'
import { Contact } from '@/pages/Contact'
import { Communities } from '@/pages/community/Communities'
import { CommunityPost } from '@/pages/community/CommunityPost'
import { CreatePost } from '@/pages/community/CreatePost'
import { FAQ } from '@/pages/FAQ'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { AdminCourses } from '@/pages/admin/AdminCourses'
import { AdminProfessors } from '@/pages/admin/AdminProfessors'
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
          <Route path="/professors" element={<Professors />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/community" element={<Communities />} />
          <Route path="/community/new" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
          <Route path="/community/:id" element={<CommunityPost />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
            <Route path="professors" element={<AdminProfessors />} />
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
