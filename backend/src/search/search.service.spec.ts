import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SearchService', () => {
  let service: SearchService;
  let prisma: {
    course: { findMany: jest.Mock };
    wikiPage: { findMany: jest.Mock };
    resource: { findMany: jest.Mock };
    exam: { findMany: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      course: { findMany: jest.fn().mockResolvedValue([]) },
      wikiPage: { findMany: jest.fn().mockResolvedValue([]) },
      resource: { findMany: jest.fn().mockResolvedValue([]) },
      exam: { findMany: jest.fn().mockResolvedValue([]) },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [SearchService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(SearchService);
  });

  it('returns empty results for blank query without hitting the DB', async () => {
    const result = await service.search({ q: '   ' });

    expect(result).toEqual({
      query: '',
      results: { courses: [], wikiPages: [], resources: [], exams: [] },
    });
    expect(prisma.course.findMany).not.toHaveBeenCalled();
    expect(prisma.wikiPage.findMany).not.toHaveBeenCalled();
    expect(prisma.resource.findMany).not.toHaveBeenCalled();
    expect(prisma.exam.findMany).not.toHaveBeenCalled();
  });

  it('queries all four types with case-insensitive contains and limit', async () => {
    prisma.course.findMany.mockResolvedValue([
      { id: 1, title: 'Информатика I', slug: 'informatika-1' },
    ]);
    prisma.wikiPage.findMany.mockResolvedValue([
      { id: 2, title: 'Увод', slug: 'uvod' },
    ]);

    const result = await service.search({ q: 'информатика', limit: 5 });

    const insensitive = { contains: 'информатика', mode: 'insensitive' };
    expect(prisma.course.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 5,
        where: {
          OR: [
            { title: insensitive },
            { description: insensitive },
            { category: insensitive },
          ],
        },
      }),
    );
    expect(prisma.wikiPage.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 5,
        where: { status: 'PUBLISHED', title: insensitive },
      }),
    );
    expect(prisma.resource.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 5, where: { title: insensitive } }),
    );
    expect(prisma.exam.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 5, where: { title: insensitive } }),
    );

    expect(result.query).toBe('информатика');
    expect(result.results.courses).toHaveLength(1);
    expect(result.results.wikiPages).toHaveLength(1);
  });

  it('applies default limit of 5 and trims the query', async () => {
    await service.search({ q: '  програми  ' });

    const insensitive = { contains: 'програми', mode: 'insensitive' };
    expect(prisma.course.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { title: insensitive },
          { description: insensitive },
          { category: insensitive },
        ],
      },
      take: 5,
      orderBy: { title: 'asc' },
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        description: true,
      },
    });
  });
});
