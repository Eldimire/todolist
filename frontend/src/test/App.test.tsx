import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App', () => {
  it('TodoList 텍스트가 렌더링된다', () => {
    render(<App />)
    expect(screen.getByText('TodoList')).toBeInTheDocument()
  })
})
