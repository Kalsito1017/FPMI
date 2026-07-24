import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ScraperService } from './scraper.service';

jest.mock('axios');
jest.mock('cheerio', () => ({
  load: jest.fn(),
}));

import axios from 'axios';
import * as cheerio from 'cheerio';

const axiosGetMock = (axios as unknown as Record<string, jest.Mock>)['get'];
const cheerioLoadMock = (cheerio as unknown as Record<string, jest.Mock>)[
  'load'
];

describe('ScraperService', () => {
  let service: ScraperService;
  let prisma: {
    announcement: {
      findFirst: jest.Mock;
      create: jest.Mock;
    };
  };

  function createMockCheerioAPI() {
    const api: Record<string, jest.Mock> = {};
    const methods = ['find', 'first', 'text', 'trim', 'attr', 'slice'];
    for (const m of methods) {
      api[m] = jest.fn().mockReturnValue(api);
    }
    return api;
  }

  beforeEach(async () => {
    jest.clearAllMocks();

    prisma = {
      announcement: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ScraperService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(ScraperService);
  });

  describe('scrapeAll', () => {
    it('returns empty results when no SCRAPE_UNIVERSITY_URL env var', async () => {
      const originalUrl = process.env.SCRAPE_UNIVERSITY_URL;
      delete process.env.SCRAPE_UNIVERSITY_URL;

      const result = await service.scrapeAll();

      expect(result).toEqual([]);

      if (originalUrl) {
        process.env.SCRAPE_UNIVERSITY_URL = originalUrl;
      }
    });

    it('scrapes university URL, creates new announcements and skips existing', async () => {
      process.env.SCRAPE_UNIVERSITY_URL = 'https://university.bg/news';

      const html = '<html><body><article><h2>Test</h2></article></body></html>';

      axiosGetMock.mockResolvedValue({ data: html });

      const mockElement = {};
      const mockElement2 = {};

      const elAPI = createMockCheerioAPI();
      const elAPI2 = createMockCheerioAPI();

      const mock$ = jest.fn((arg: unknown) => {
        if (arg === mockElement) return elAPI;
        if (arg === mockElement2) return elAPI2;
        if (arg === 'article') return [mockElement, mockElement2];
        return [];
      });

      elAPI.find.mockReturnValue(elAPI);
      elAPI.first.mockReturnValue(elAPI);
      elAPI.text.mockReturnValue('First Title');
      elAPI.trim.mockReturnValue('First Title');
      elAPI.attr.mockReturnValue('/news/1');
      elAPI.slice.mockReturnValue('First content');

      elAPI2.find.mockReturnValue(elAPI2);
      elAPI2.first.mockReturnValue(elAPI2);
      elAPI2.text.mockReturnValue('Second Title');
      elAPI2.trim.mockReturnValue('Second Title');
      elAPI2.attr.mockReturnValue('/news/2');
      elAPI2.slice.mockReturnValue('Second content');

      cheerioLoadMock.mockReturnValue(mock$);

      prisma.announcement.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 99 });

      prisma.announcement.create.mockResolvedValue({});

      const result = await service.scrapeAll();

      expect(axiosGetMock).toHaveBeenCalledWith('https://university.bg/news', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; FPMI-Hub-Bot/1.0)',
        },
        timeout: 15000,
      });
      expect(cheerioLoadMock).toHaveBeenCalledWith(html);

      expect(prisma.announcement.findFirst).toHaveBeenCalledTimes(2);
      expect(prisma.announcement.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual([{ source: 'university', added: 1, skipped: 1 }]);
    });

    it('catches axios errors and returns empty results', async () => {
      process.env.SCRAPE_UNIVERSITY_URL = 'https://broken.url';

      axiosGetMock.mockRejectedValue(new Error('Network error'));

      const result = await service.scrapeAll();

      expect(result).toEqual([]);
    });
  });
});
