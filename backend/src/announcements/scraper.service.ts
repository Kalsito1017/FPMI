import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_6_HOURS)
  async handleCron() {
    this.logger.log('Running scheduled announcement scrape...');
    await this.scrapeAll();
  }

  async scrapeAll() {
    const results: { source: string; added: number; skipped: number }[] = [];

    const universityUrl = process.env.SCRAPE_UNIVERSITY_URL;
    if (universityUrl) {
      try {
        const result = await this.scrapeUniversity(universityUrl);
        results.push({ source: 'university', ...result });
      } catch (e) {
        this.logger.error(`Failed to scrape university URL: ${(e as Error).message}`);
      }
    }

    return results;
  }

  private async scrapeUniversity(url: string): Promise<{ added: number; skipped: number }> {
    const { data: html } = await axios.get<string>(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FPMI-Hub-Bot/1.0)' },
      timeout: 15000,
    });

    const $ = cheerio.load(html);
    let added = 0;
    let skipped = 0;

    const items = this.extractUniversityItems($);
    for (const item of items) {
      if (!item.title) continue;

      const exists = await this.prisma.announcement.findFirst({
        where: { sourceUrl: item.sourceUrl },
      });

      if (exists) {
        skipped++;
        continue;
      }

      await this.prisma.announcement.create({
        data: {
          title: item.title,
          content: item.content,
          source: 'university',
          sourceUrl: item.sourceUrl,
          publishedAt: item.publishedAt ?? new Date(),
        },
      });
      added++;
    }

    return { added, skipped };
  }

  private extractUniversityItems($: cheerio.CheerioAPI) {
    const items: {
      title: string;
      content: string;
      sourceUrl: string;
      publishedAt: Date;
    }[] = [];

    const selectors = [
      'article',
      '.news-item',
      '.post-item',
      '.entry',
      '.blog-post',
      'li.news',
      '[class*="news"]',
      '[class*="post"]',
      '[class*="article"]',
    ];

    const container = selectors.flatMap((sel) => [...$(sel)]);
    if (container.length === 0) return items;

    for (const el of container) {
      const $el = $(el);
      const titleEl = $el.find('h1, h2, h3, h4, .title, .post-title, .entry-title').first();
      const title = titleEl.text().trim();

      const linkEl = titleEl.find('a').first();
      const href = linkEl.attr('href') ?? $el.find('a').first().attr('href');
      const sourceUrl = href
        ? href.startsWith('http')
          ? href
          : new URL(href, process.env.SCRAPE_UNIVERSITY_URL).href
        : '';

      const content = $el.find('p, .description, .excerpt, .post-excerpt, .summary')
        .first()
        .text()
        .trim()
        .slice(0, 500);

      const dateText =
        $el.find('time, .date, .post-date, .published, .meta-date').first().attr('datetime') ??
        $el.find('time, .date, .post-date, .published, .meta-date').first().text().trim();
      const publishedAt = dateText ? new Date(dateText) : new Date();

      if (title) {
        items.push({ title, content, sourceUrl, publishedAt: isNaN(publishedAt.getTime()) ? new Date() : publishedAt });
      }
    }

    return items;
  }
}
