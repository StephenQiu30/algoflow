'use client'
import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from '@/components/ui/input-group'
import type { InputProps } from '@/components/ui/input'

/** Business composition of the existing shadcn InputGroup, not a second input primitive. */
export const PasswordInput = forwardRef<HTMLInputElement, InputProps & { label?: string }>(
  function PasswordInput({ label = '密码', ...props }, ref) {
    const input = useRef<HTMLInputElement>(null)
    const [visible, setVisible] = useState(false)
    useImperativeHandle(ref, () => input.current as HTMLInputElement)
    function toggle() {
      const start = input.current?.selectionStart,
        end = input.current?.selectionEnd
      setVisible(value => !value)
      requestAnimationFrame(() => {
        input.current?.focus({ preventScroll: true })
        if (start != null && end != null) input.current?.setSelectionRange(start, end)
      })
    }
    return (
      <InputGroup data-disabled={props.disabled}>
        <InputGroupInput
          ref={input}
          variant="auth"
          {...props}
          type={visible ? 'text' : 'password'}
        />
        <InputGroupAddon align="inline-end" className="py-0 pr-1">
          <InputGroupButton
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-11"
            disabled={props.disabled}
            aria-label={`${visible ? '隐藏' : '显示'}${label}`}
            aria-pressed={visible}
            onMouseDown={event => event.preventDefault()}
            onClick={toggle}
          >
            {visible ? <EyeOff /> : <Eye />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    )
  }
)
