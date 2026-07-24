import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QuerySearchDto } from './dto/query-search.dto';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(query: QuerySearchDto) {
    const q = (query.q ?? '').trim();
    const limit = query.limit ?? 5;

    if (!q) {
      return {
        query: '',
        results: { courses: [], wikiPages: [], resources: [], exams: [] },
      };
    }

    const insensitive = { contains: q, mode: 'insensitive' as const };

    const [courses, wikiPages, resources, exams] = await Promise.all([
      this.prisma.course.findMany({
        where: {
          OR: [
            { title: insensitive },
            { description: insensitive },
            { category: insensitive },
          ],
        },
        take: limit,
        orderBy: { title: 'asc' },
        select: {
          id: true,
          title: true,
          slug: true,
          category: true,
          description: true,
        },
      }),
      this.prisma.wikiPage.findMany({
        where: { status: 'PUBLISHED', title: insensitive },
        take: limit,
        orderBy: { title: 'asc' },
        select: {
          id: true,
          title: true,
          slug: true,
          course: { select: { slug: true, title: true } },
        },
      }),
      this.prisma.resource.findMany({
        where: { title: insensitive },
        take: limit,
        orderBy: { title: 'asc' },
        select: {
          id: true,
          title: true,
          type: true,
          url: true,
          course: { select: { slug: true, title: true } },
        },
      }),
      this.prisma.exam.findMany({
        where: { title: insensitive },
        take: limit,
        orderBy: { year: 'desc' },
        select: {
          id: true,
          title: true,
          year: true,
          pdfUrl: true,
          course: { select: { slug: true, title: true } },
        },
      }),
    ]);

    return {
      query: q,
      results: { courses, wikiPages, resources, exams },
    };
  }
}
