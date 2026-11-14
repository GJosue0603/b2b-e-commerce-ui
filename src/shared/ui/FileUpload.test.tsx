import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { FileUpload } from './FileUpload'

function ControlledUpload() {
  const [files, setFiles] = useState<readonly File[]>([])
  return (
    <FileUpload
      files={files}
      label="Documentos"
      onChange={setFiles}
      required
    />
  )
}

describe('FileUpload', () => {
  it('lista y permite retirar archivos sin enviarlos', async () => {
    const user = userEvent.setup()
    render(<ControlledUpload />)
    const input = screen.getByLabelText(/Documentos/)
    const file = new File(['demo'], 'constancia-demo.pdf', {
      type: 'application/pdf',
    })

    await user.upload(input, file)
    expect(screen.getByText('constancia-demo.pdf')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Previsualizar' })).toBeVisible()

    await user.click(
      screen.getByRole('button', { name: 'Retirar constancia-demo.pdf' }),
    )
    expect(screen.queryByText('constancia-demo.pdf')).toBeNull()
  })
})
