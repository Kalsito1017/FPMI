import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n/config'
import { NotFound } from './NotFound'

describe('NotFound', () => {
  it('renders the 404 message and a home link', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
          <NotFound />
        </MemoryRouter>
      </I18nextProvider>,
    )
    expect(screen.getByText('404')).toBeInTheDocument()
    expect(
      screen.getByText(i18n.t('notFound.title')),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: i18n.t('notFound.home') }),
    ).toHaveAttribute('href', '/')
  })
})
