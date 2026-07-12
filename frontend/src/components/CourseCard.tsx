import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Course } from '@/types'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface CourseCardProps {
  course: Course
}

function excerpt(text: string | null | undefined, max = 120): string {
  if (!text) return ''
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text
}

export function CourseCard({ course }: CourseCardProps) {
  const { t } = useTranslation()
  return (
    <Link to={`/courses/${course.slug}`} className="block h-full">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
              {course.category}
            </span>
            <span className="text-xs text-muted-foreground">
              {course.credits != null
                ? `${course.credits} ${t('courseCard.credits')}`
                : '—'}
            </span>
          </div>
          <CardTitle className="mt-2 text-base">{course.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            {excerpt(course.description) || t('courseCard.noDescription')}
          </CardDescription>
          <p className="mt-3 text-xs text-muted-foreground">
            {course.semester != null
              ? `${t('courseCard.semester')} ${course.semester}`
              : t('courseCard.semesterLabel')}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
