import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getOverview() {
    const [users, courses, admins] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.course.count(),
      this.prisma.user.count({ where: { role: 'ADMIN' } }),
    ]);
    return { users, courses, admins };
  }

  async getUsersByRole() {
    const result = await this.prisma.user.groupBy({
      by: ['role'],
      _count: { _all: true },
    });
    return result.map((r) => ({ role: r.role, count: r._count._all }));
  }

  async getCoursesByCategory() {
    const result = await this.prisma.course.groupBy({
      by: ['category'],
      _count: { _all: true },
    });
    return result.map((r) => ({ category: r.category, count: r._count._all }));
  }

  async getCoursesBySemester() {
    const result = await this.prisma.course.groupBy({
      by: ['semester'],
      _count: { _all: true },
    });
    return result
      .filter((r) => r.semester !== null)
      .map((r) => ({ semester: r.semester as number, count: r._count._all }))
      .sort((a, b) => a.semester - b.semester);
  }

  async getUserGrowth() {
    const users = await this.prisma.user.findMany({
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const monthMap = new Map<string, number>();
    for (const u of users) {
      const key = `${u.createdAt.getFullYear()}-${String(u.createdAt.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(key, (monthMap.get(key) ?? 0) + 1);
    }

    const sorted = Array.from(monthMap.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );

    let cumulative = 0;
    return sorted.map(([month, count]) => {
      cumulative += count;
      return { month, count, cumulative };
    });
  }
}
