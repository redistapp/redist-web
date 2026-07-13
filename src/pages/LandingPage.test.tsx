import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LandingPage from './LandingPage'

describe('LandingPage', () => {
  it('renderiza a navbar e o CTA de cadastro', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    )
    expect(screen.getAllByText(/Criar conta/i).length).toBeGreaterThan(0)
    expect(screen.getByLabelText(/Redist — página inicial/i)).toBeInTheDocument()
  })
})
