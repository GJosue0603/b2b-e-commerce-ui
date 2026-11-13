import {
  isAccreditationValid,
  type AcreditacionPyme,
  type MontoColones,
} from '../../../domain'
import { formatCRC } from '../../../shared/utils/pricing'

export interface PriceDisplayProps {
  readonly accreditation?: AcreditacionPyme | null
  readonly pymePrice: MontoColones
  readonly referenceDate?: Date
  readonly regularPrice: MontoColones
}

export function PriceDisplay({
  accreditation,
  pymePrice,
  referenceDate,
  regularPrice,
}: PriceDisplayProps) {
  const showPymePrice = isAccreditationValid(accreditation, referenceDate)

  if (!showPymePrice) {
    return (
      <div className="price-display">
        <span>Precio</span>
        <strong>{formatCRC(regularPrice)}</strong>
      </div>
    )
  }

  return (
    <div className="price-display price-display--pyme">
      <div className="price-display__regular">
        <span>Precio regular</span>
        <s>{formatCRC(regularPrice)}</s>
      </div>
      <div className="price-display__pyme">
        <span>Precio PYME</span>
        <strong>{formatCRC(pymePrice)}</strong>
      </div>
    </div>
  )
}
