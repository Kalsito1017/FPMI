import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Markdown } from './Markdown'

describe('Markdown', () => {
  it('renders headings, links and bold text from markdown', () => {
    render(
      <Markdown
        content={'# Heading\n\nSome **bold** text and [a link](https://example.com).'}
      />,
    )
    expect(
      screen.getByRole('heading', { level: 1, name: 'Heading' }),
    ).toBeInTheDocument()
    expect(screen.getByText('bold').tagName).toBe('STRONG')
    const link = screen.getByRole('link', { name: 'a link' })
    expect(link).toHaveAttribute('href', 'https://example.com')
  })

  it('does not render raw HTML or script tags', () => {
    const { container } = render(
      <Markdown
        content={'# Safe\n\n<script>alert("xss")</script><div>raw html</div>'}
      />,
    )
    expect(container.querySelector('script')).toBeNull()
    expect(container.querySelector('div.prose div')).toBeNull()
    expect(
      screen.getByRole('heading', { level: 1, name: 'Safe' }),
    ).toBeInTheDocument()
  })
})
