import {
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react'

export interface FileUploadProps {
  readonly accept?: string
  readonly disabled?: boolean
  readonly error?: string
  readonly files: readonly File[]
  readonly hint?: string
  readonly label: string
  readonly maxSizeBytes?: number
  readonly multiple?: boolean
  readonly onChange: (files: readonly File[]) => void
  readonly required?: boolean
}

export function FileUpload({
  accept = '.pdf,.png,.jpg,.jpeg',
  disabled = false,
  error,
  files,
  hint = 'Los archivos se conservan solo en memoria durante esta demostración.',
  label,
  maxSizeBytes = 10 * 1024 * 1024,
  multiple = true,
  onChange,
  required = false,
}: FileUploadProps) {
  const generatedId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [sizeError, setSizeError] = useState('')
  const hintId = `${generatedId}-hint`
  const errorId = `${generatedId}-error`
  const displayError = error || sizeError
  const describedBy = [hintId, displayError ? errorId : ''].filter(Boolean).join(' ')

  const addFiles = (incoming: FileList | readonly File[]) => {
    const incomingFiles = Array.from(incoming)
    const acceptedFiles = incomingFiles.filter(
      (file) => file.size <= maxSizeBytes,
    )
    setSizeError(
      acceptedFiles.length !== incomingFiles.length
        ? 'Se omitieron archivos que superan el tamaño máximo permitido.'
        : '',
    )
    const next = multiple ? [...files, ...acceptedFiles] : acceptedFiles.slice(0, 1)
    const unique = next.filter(
      (file, index, all) =>
        all.findIndex(
          (candidate) =>
            candidate.name === file.name &&
            candidate.size === file.size &&
            candidate.lastModified === file.lastModified,
        ) === index,
    )
    onChange(unique)
  }

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.files) addFiles(event.currentTarget.files)
    event.currentTarget.value = ''
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (!disabled) addFiles(event.dataTransfer.files)
  }

  const preview = (file: File) => {
    if (typeof URL.createObjectURL !== 'function') return
    const url = URL.createObjectURL(file)
    window.open(url, '_blank', 'noopener,noreferrer')
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000)
  }

  return (
    <div className="ui-file-upload">
      <label className="ui-file-upload__label" htmlFor={generatedId}>
        {label}{required && <span aria-hidden="true"> *</span>}
      </label>
      <div
        className="ui-file-upload__dropzone"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <span aria-hidden="true">⇧</span>
        <p>Arrastra archivos aquí o selecciónalos desde tu dispositivo.</p>
        <button
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          Examinar archivos
        </button>
        <input
          ref={inputRef}
          accept={accept}
          aria-describedby={describedBy}
          aria-invalid={Boolean(displayError) || undefined}
          className="sr-only"
          disabled={disabled}
          id={generatedId}
          multiple={multiple}
          onChange={handleInput}
          required={required && files.length === 0}
          type="file"
        />
      </div>
      <small id={hintId}>{hint}</small>
      {displayError && (
        <small className="ui-field__error" id={errorId} role="alert">
          {displayError}
        </small>
      )}
      {files.length > 0 && (
        <ul aria-label="Documentos seleccionados" className="ui-file-upload__list">
          {files.map((file, index) => (
            <li key={`${file.name}-${file.size}-${file.lastModified}`}>
              <div>
                <strong>{file.name}</strong>
                <small>{formatFileSize(file.size)}</small>
              </div>
              <div className="ui-file-upload__actions">
                <button onClick={() => preview(file)} type="button">
                  Previsualizar
                </button>
                <button
                  aria-label={`Retirar ${file.name}`}
                  onClick={() => onChange(files.filter((_, itemIndex) => itemIndex !== index))}
                  type="button"
                >
                  Retirar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function formatFileSize(bytes: number) {
  if (bytes < 1_024) return `${bytes} B`
  if (bytes < 1_048_576) return `${Math.ceil(bytes / 1_024)} KB`
  return `${(bytes / 1_048_576).toFixed(1)} MB`
}
