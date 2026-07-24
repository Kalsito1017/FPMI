import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n/config'
import { CoursePage } from './CoursePage'

vi.mock('@/hooks/use-courses', () => ({
  useCourse: () => ({
    data: {
      id: 1,
      title: 'Увод в програмирането',
      slug: 'intro-prog',
      description: 'Intro description',
      semester: 1,
      credits: 6,
      category: 'Programming',
    },
    isLoading: false,
    isError: false,
  }),
}))

vi.mock('@/hooks/use-wiki', () => ({
  useWikiPages: () => ({
    data: [
      {
        id: 1,
        slug: 'page-one',
        title: 'Page One',
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
        createdBy: { id: 1, name: 'Author' },
      },
      {
        id: 2,
        slug: 'page-two',
        title: 'Page Two',
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
        createdBy: { id: 1, name: 'Author' },
      },
    ],
  }),
}))

vi.mock('@/hooks/use-resources', () => ({
  useResources: () => ({
    data: [
      {
        id: 1,
        courseId: 1,
        title: 'Resource One',
        type: 'LINK',
        url: 'https://example.com',
        createdById: 1,
        createdBy: { id: 1, name: 'Author' },
        createdAt: '2025-01-01',
      },
    ],
  }),
}))

vi.mock('@/hooks/use-exams', () => ({
  useExams: () => ({
    data: [
      {
        id: 1,
        courseId: 1,
        title: 'Exam 2024',
        year: 2024,
        semester: 1,
        pdfUrl: 'https://example.com/2024.pdf',
        createdById: 1,
        createdBy: { id: 1, name: 'Author' },
        createdAt: '2025-01-01',
      },
      {
        id: 2,
        courseId: 1,
        title: 'Exam 2023',
        year: 2023,
        semester: 2,
        pdfUrl: 'https://example.com/2023.pdf',
        createdById: 1,
        createdBy: { id: 1, name: 'Author' },
        createdAt: '2025-01-01',
      },
      {
        id: 3,
        courseId: 1,
        title: 'Exam 2022',
        year: 2022,
        semester: null,
        pdfUrl: 'https://example.com/2022.pdf',
        createdById: 1,
        createdBy: { id: 1, name: 'Author' },
        createdAt: '2025-01-01',
      },
    ],
  }),
}))

function renderPage() {
  return render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter initialEntries={['/courses/intro-prog']}>
        <Routes>
          <Route path="/courses/:slug" element={<CoursePage />} />
        </Routes>
      </MemoryRouter>
    </I18nextProvider>,
  )
}

describe('CoursePage', () => {
  it('renders the course title', () => {
    renderPage()
    expect(
      screen.getByRole('heading', { name: 'Увод в програмирането' }),
    ).toBeInTheDocument()
  })

  it('renders 4 link cards with correct hrefs and counts', () => {
    renderPage()

    const wikiCard = screen.getByRole('link', {
      name: new RegExp(i18n.t('course.wikiPages')),
    })
    expect(wikiCard).toHaveAttribute('href', '/courses/intro-prog/wiki')
    expect(within(wikiCard).getByText('2')).toBeInTheDocument()

    const resourcesCard = screen.getByRole('link', {
      name: new RegExp(i18n.t('course.resources')),
    })
    expect(resourcesCard).toHaveAttribute('href', '/courses/intro-prog/resources')
    expect(within(resourcesCard).getByText('1')).toBeInTheDocument()

    const examsCard = screen.getByRole('link', {
      name: new RegExp(i18n.t('course.oldExams')),
    })
    expect(examsCard).toHaveAttribute('href', '/courses/intro-prog/exams')
    expect(within(examsCard).getByText('3')).toBeInTheDocument()

    const forumCard = screen.getByRole('link', {
      name: new RegExp(i18n.t('course.forum')),
    })
    expect(forumCard).toHaveAttribute('href', '/community')
    expect(within(forumCard).queryByText(/^\d+$/)).not.toBeInTheDocument()
  })

  it('has no coming soon text and no assignments card', () => {
    renderPage()
    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument()
    expect(screen.queryByText('Очаквайте скоро.')).not.toBeInTheDocument()
    expect(screen.queryByText('Assignments')).not.toBeInTheDocument()
    expect(screen.queryByText('Задачи')).not.toBeInTheDocument()
  })
})
