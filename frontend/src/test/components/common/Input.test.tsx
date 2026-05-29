import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Input } from '../../../components/common/Input'

describe('Input', () => {
  describe('렌더링', () => {
    it('label 없이 input을 렌더링한다', () => {
      render(<Input />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
      expect(screen.queryByRole('label')).not.toBeInTheDocument()
    })

    it('label이 있으면 렌더링한다', () => {
      render(<Input id="email" label="이메일" />)
      expect(screen.getByText('이메일')).toBeInTheDocument()
    })

    it('label의 htmlFor와 input의 id가 연결된다', () => {
      render(<Input id="test-input" label="테스트" />)
      expect(screen.getByLabelText('테스트')).toBeInTheDocument()
    })

    it('error 메시지가 있으면 표시한다', () => {
      render(<Input error="이메일을 입력해주세요." />)
      expect(screen.getByRole('alert')).toHaveTextContent('이메일을 입력해주세요.')
    })

    it('error가 없으면 alert를 렌더링하지 않는다', () => {
      render(<Input />)
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  describe('type 속성', () => {
    it('기본 type은 text이다', () => {
      render(<Input />)
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text')
    })

    it('type="password"를 렌더링한다', () => {
      const { container } = render(<Input type="password" />)
      expect(container.querySelector('input[type="password"]')).toBeInTheDocument()
    })

    it('type="date"를 렌더링한다', () => {
      const { container } = render(<Input type="date" />)
      expect(container.querySelector('input[type="date"]')).toBeInTheDocument()
    })
  })

  describe('에러 스타일', () => {
    it('error가 있으면 빨간 테두리 클래스를 적용한다', () => {
      render(<Input error="오류 메시지" />)
      expect(screen.getByRole('textbox')).toHaveClass('border-red-400')
    })

    it('error가 없으면 기본 테두리 클래스를 적용한다', () => {
      render(<Input />)
      expect(screen.getByRole('textbox')).toHaveClass('border-[#E5E7EB]')
    })
  })

  describe('추가 props 전달', () => {
    it('placeholder를 전달한다', () => {
      render(<Input placeholder="이메일을 입력하세요" />)
      expect(screen.getByPlaceholderText('이메일을 입력하세요')).toBeInTheDocument()
    })

    it('추가 className을 적용한다', () => {
      render(<Input className="custom-class" />)
      expect(screen.getByRole('textbox')).toHaveClass('custom-class')
    })
  })
})
