import { Select } from '../../../shared/ui'
import {
  mockPaymentOutcomes,
  type MockPaymentOutcome,
} from '../../../services'

export interface PaymentScenarioControlProps {
  readonly onChange: (outcome: MockPaymentOutcome) => void
  readonly value: MockPaymentOutcome
}

export function PaymentScenarioControl({
  onChange,
  value,
}: PaymentScenarioControlProps) {
  if (!import.meta.env.DEV) return null

  return (
    <aside className="payment-scenario-control">
      <strong>Simulador local</strong>
      <Select
        hint="Solo desarrollo; no procesa dinero real."
        label="Resultado de la transacción"
        onChange={(event) =>
          onChange(event.currentTarget.value as MockPaymentOutcome)
        }
        value={value}
      >
        {mockPaymentOutcomes.map((outcome) => (
          <option key={outcome.id} value={outcome.id}>
            {outcome.label}
          </option>
        ))}
      </Select>
    </aside>
  )
}
