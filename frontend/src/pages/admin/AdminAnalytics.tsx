import { useTranslation } from 'react-i18next'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useAnalyticsOverview } from '@/hooks/use-analytics'
import { useUsersByRole } from '@/hooks/use-analytics'
import { useCoursesByCategory } from '@/hooks/use-analytics'
import { useCoursesBySemester } from '@/hooks/use-analytics'
import { useUserGrowth } from '@/hooks/use-analytics'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--primary)',
  'var(--muted-foreground)',
]

function StatCard({
  label,
  value,
  loading,
}: {
  label: string
  value: number | undefined
  loading: boolean
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl">
          {loading ? '—' : value}
        </CardTitle>
      </CardHeader>
    </Card>
  )
}

export function AdminAnalytics() {
  const { t } = useTranslation()
  const overview = useAnalyticsOverview()
  const usersByRole = useUsersByRole()
  const coursesByCategory = useCoursesByCategory()
  const coursesBySemester = useCoursesBySemester()
  const userGrowth = useUserGrowth()

  const anyLoading =
    overview.isLoading ||
    usersByRole.isLoading ||
    coursesByCategory.isLoading ||
    coursesBySemester.isLoading ||
    userGrowth.isLoading

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">
        {t('admin.analytics.title')}
      </h1>

      {anyLoading ? (
        <p className="text-muted-foreground">{t('admin.analytics.loading')}</p>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label={t('admin.analytics.totalUsers')}
              value={overview.data?.users}
              loading={overview.isLoading}
            />
            <StatCard
              label={t('admin.analytics.totalCourses')}
              value={overview.data?.courses}
              loading={overview.isLoading}
            />
            <StatCard
              label={t('admin.analytics.totalProfessors')}
              value={overview.data?.professors}
              loading={overview.isLoading}
            />
            <StatCard
              label={t('admin.analytics.totalAdmins')}
              value={overview.data?.admins}
              loading={overview.isLoading}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t('admin.analytics.usersByRole')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={usersByRole.data ?? []}
                      dataKey="count"
                      nameKey="role"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry: { name?: string; value?: number }) =>
                        `${entry.name}: ${entry.value}`
                      }
                    >
                      {(usersByRole.data ?? []).map((_, i) => (
                        <Cell
                          key={i}
                          fill={CHART_COLORS[i % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t('admin.analytics.coursesByCategory')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={coursesByCategory.data ?? []}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      type="category"
                      dataKey="category"
                      width={100}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip />
                    <Bar dataKey="count" fill="var(--chart-1)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t('admin.analytics.coursesBySemester')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={coursesBySemester.data ?? []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="semester" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="var(--chart-2)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t('admin.analytics.userGrowth')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={userGrowth.data ?? []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="cumulative"
                      name={t('admin.analytics.users')}
                      stroke="var(--chart-3)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
