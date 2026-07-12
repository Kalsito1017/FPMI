import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card'

export function CourseCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-5 w-20 rounded-md" />
          <Skeleton className="h-4 w-12 rounded-md" />
        </div>
        <Skeleton className="mt-2 h-5 w-3/4 rounded-md" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="mt-2 h-4 w-2/3 rounded-md" />
        <Skeleton className="mt-3 h-3 w-24 rounded-md" />
      </CardContent>
    </Card>
  )
}

export function CourseCardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function ProfessorCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <Skeleton className="h-5 w-2/3 rounded-md" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-1/2 rounded-md" />
        <Skeleton className="h-4 w-2/3 rounded-md" />
        <Skeleton className="h-4 w-full rounded-md" />
      </CardContent>
    </Card>
  )
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-4 py-3 text-left">
                <Skeleton className="h-4 w-20 rounded-md" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} className="border-b last:border-0">
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c} className="px-4 py-3">
                  <Skeleton className={cn('h-4 rounded-md', c === 0 ? 'w-3/4' : 'w-1/2')} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function PageHeaderSkeleton() {
  return (
    <div className="mb-6 space-y-2">
      <Skeleton className="h-8 w-64 rounded-md" />
      <Skeleton className="h-4 w-96 rounded-md" />
    </div>
  )
}

export function CoursePageSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Skeleton className="mb-3 h-4 w-24 rounded-md" />
      <Skeleton className="mb-3 h-10 w-3/4 rounded-md" />
      <Skeleton className="mb-4 h-6 w-32 rounded-md" />
      <Skeleton className="mb-6 h-4 w-full rounded-md" />
      <Skeleton className="mb-6 h-4 w-2/3 rounded-md" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-md" />
                <Skeleton className="h-5 w-32 rounded-md" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-24 rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}


