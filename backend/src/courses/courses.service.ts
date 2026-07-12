import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { parse } from 'csv-parse/sync';
import { COURSE_CATEGORIES } from './dto/create-course.dto';

export interface TUSofiaSpecialty {
  name: string;
  form: string;
  direction: string;
  pdfUrl: string;
}

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  findAll(category?: string) {
    if (category) {
      return this.prisma.course.findMany({ where: { category } });
    }
    return this.prisma.course.findMany();
  }

  async findOne(slug: string) {
    const course = await this.prisma.course.findUnique({ where: { slug } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    return course;
  }

  async create(dto: CreateCourseDto) {
    try {
      return await this.prisma.course.create({ data: dto });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException('Slug already exists');
      }
      throw e;
    }
  }

  async update(id: number, dto: UpdateCourseDto) {
    try {
      return await this.prisma.course.update({ where: { id }, data: dto });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new ConflictException('Slug already exists');
        }
        if (e.code === 'P2025') {
          throw new NotFoundException('Course not found');
        }
      }
      throw e;
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.course.delete({ where: { id } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new NotFoundException('Course not found');
        }
      }
      throw e;
    }
  }

  async exportCsv(): Promise<string> {
    const courses = await this.prisma.course.findMany({
      orderBy: { id: 'asc' },
    });
    const headers = [
      'title',
      'slug',
      'description',
      'semester',
      'credits',
      'category',
    ];
    const escapeField = (val: string | number | null): string => {
      const s = val == null ? '' : typeof val === 'number' ? String(val) : val;
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };
    const rows = courses.map((c) =>
      [c.title, c.slug, c.description, c.semester, c.credits, c.category]
        .map(escapeField)
        .join(','),
    );
    return [headers.join(','), ...rows].join('\n');
  }

  async importCsv(csvContent: string): Promise<{
    created: number;
    skipped: number;
    errors: { row: number; message: string }[];
  }> {
    const records: string[][] = parse(csvContent, {
      delimiter: ',',
      skip_empty_lines: true,
      trim: true,
    });

    if (records.length === 0) {
      throw new HttpException('CSV is empty', HttpStatus.BAD_REQUEST);
    }

    const header = records[0].map((h) => h.toLowerCase().trim());
    const required = ['title', 'slug', 'category'];
    for (const col of required) {
      if (!header.includes(col)) {
        throw new HttpException(
          `Missing required column: ${col}`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const idx = {
      title: header.indexOf('title'),
      slug: header.indexOf('slug'),
      description: header.includes('description')
        ? header.indexOf('description')
        : -1,
      semester: header.includes('semester') ? header.indexOf('semester') : -1,
      credits: header.includes('credits') ? header.indexOf('credits') : -1,
      category: header.indexOf('category'),
    };

    const existingSlugs = new Set(
      (await this.prisma.course.findMany({ select: { slug: true } })).map(
        (c) => c.slug,
      ),
    );

    let created = 0;
    let skipped = 0;
    const errors: { row: number; message: string }[] = [];

    for (let i = 1; i < records.length; i++) {
      const row = records[i];
      const rowNum = i + 1;

      const title = row[idx.title]?.trim();
      const slug = row[idx.slug]?.trim();
      const category = row[idx.category]?.trim();
      const description =
        idx.description >= 0 ? row[idx.description]?.trim() || null : null;
      const semesterStr = idx.semester >= 0 ? row[idx.semester]?.trim() : '';
      const creditsStr = idx.credits >= 0 ? row[idx.credits]?.trim() : '';

      if (!title) {
        errors.push({ row: rowNum, message: 'Title is required' });
        continue;
      }
      if (!slug) {
        errors.push({ row: rowNum, message: 'Slug is required' });
        continue;
      }
      if (!/^[a-z0-9-]+$/.test(slug)) {
        errors.push({
          row: rowNum,
          message: 'Slug must be lowercase letters, digits, and hyphens',
        });
        continue;
      }
      if (
        !COURSE_CATEGORIES.includes(
          category as (typeof COURSE_CATEGORIES)[number],
        )
      ) {
        errors.push({
          row: rowNum,
          message: `Invalid category: ${category}. Must be one of: ${COURSE_CATEGORIES.join(', ')}`,
        });
        continue;
      }

      let semester: number | null = null;
      if (semesterStr) {
        const s = Number(semesterStr);
        if (!Number.isInteger(s) || s < 1 || s > 8) {
          errors.push({
            row: rowNum,
            message: 'Semester must be an integer 1-8',
          });
          continue;
        }
        semester = s;
      }

      let credits: number | null = null;
      if (creditsStr) {
        const c = Number(creditsStr);
        if (!Number.isInteger(c) || c < 0) {
          errors.push({
            row: rowNum,
            message: 'Credits must be a non-negative integer',
          });
          continue;
        }
        credits = c;
      }

      if (existingSlugs.has(slug)) {
        skipped++;
        continue;
      }

      try {
        await this.prisma.course.create({
          data: {
            title,
            slug,
            category: category,
            description,
            semester,
            credits,
          },
        });
        existingSlugs.add(slug);
        created++;
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === 'P2002'
        ) {
          skipped++;
        } else {
          errors.push({
            row: rowNum,
            message: 'Database error',
          });
        }
      }
    }

    return { created, skipped, errors };
  }

  async fetchTUSofiaSpecialties(): Promise<{
    bachelor: TUSofiaSpecialty[];
    master: TUSofiaSpecialty[];
  }> {
    try {
      const response = await fetch('https://www.tu-sofia.bg/uplan/uplan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'Faculty%5Bid%5D=30',
        signal: AbortSignal.timeout(10000),
      });

      const html = await response.text();

      const bachelor = this.parseSpecialties(html, 'management');
      const master = this.parseSpecialties(html, 'courses');

      return { bachelor, master };
    } catch {
      throw new HttpException(
        'Failed to fetch data from TU-Sofia',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  private parseSpecialties(html: string, tabName: string): TUSofiaSpecialty[] {
    const result: TUSofiaSpecialty[] = [];

    const tabRegex = new RegExp(
      `<div[^>]*id="${tabName}"[^>]*>.*?<tbody>(.*?)</tbody>`,
      'is',
    );
    const tabMatch = html.match(tabRegex);
    if (!tabMatch) return result;

    const tbody = tabMatch[1];
    const rowRegex = /<tr>.*?<\/tr>/gis;
    const rows = tbody.match(rowRegex) || [];

    for (const row of rows) {
      const cells = row.match(/<td[^>]*>(.*?)<\/td>/gis) || [];
      if (cells.length < 4) continue;

      const name = (cells[0]?.replace(/<[^>]+>/g, '') ?? '').trim();
      const form = (cells[1]?.replace(/<[^>]+>/g, '') ?? '').trim();
      const direction = (cells[2]?.replace(/<[^>]+>/g, '') ?? '').trim();
      const pdfMatch = cells[3]?.match(/href="([^"]+)"/i);
      const pdfUrl = pdfMatch
        ? `https://www.tu-sofia.bg${pdfMatch[1].replace(/^\.\.\.\/\//, '/')}`
        : '';

      if (name) {
        result.push({ name, form, direction, pdfUrl });
      }
    }

    return result;
  }
}
