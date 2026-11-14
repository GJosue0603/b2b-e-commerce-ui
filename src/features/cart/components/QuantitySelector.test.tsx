import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { QuantitySelector } from './QuantitySelector'

function QuantityHarness({ max = 3 }: { readonly max?: number }) {
  const [value, setValue] = useState(1)
  return (
    <>
      <QuantitySelector max={max} onChange={setValue} value={value} />
      <output>{value}</output>
    </>
  )
}

describe('QuantitySelector', () => {
  it('respeta mínimo 1 y máximo stock con botones accesibles', async () => {
    const user = userEvent.setup()
    render(<QuantityHarness max={2} />)

    const decrease = screen.getByRole('button', { name: 'Disminuir cantidad' })
    const increase = screen.getByRole('button', { name: 'Aumentar cantidad' })
    expect(decrease).toBeDisabled()

    await user.click(increase)
    expect(screen.getByRole('spinbutton', { name: 'Cantidad' })).toHaveValue(2)
    expect(increase).toBeDisabled()
  })

  it('rechaza cero, negativos y valores mayores al stock', async () => {
    const user = userEvent.setup()
    render(<QuantityHarness max={3} />)
    const input = screen.getByRole('spinbutton', { name: 'Cantidad' })

    await user.clear(input)
    await user.type(input, '0')
    expect(input).toHaveValue(1)

    await user.clear(input)
    await user.type(input, '-2')
    expect(input).toHaveValue(1)

    await user.clear(input)
    await user.type(input, '8')
    expect(input).toHaveValue(1)
  })
})
