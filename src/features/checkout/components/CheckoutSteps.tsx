export function CheckoutSteps() {
  return (
    <ol aria-label="Progreso de compra" className="checkout-steps">
      <li className="checkout-steps__complete">
        <span>1</span>
        <div><small>Completado</small><strong>Carrito</strong></div>
      </li>
      <li aria-current="step" className="checkout-steps__current">
        <span>2</span>
        <div><small>En curso</small><strong>Revisión</strong></div>
      </li>
      <li>
        <span>3</span>
        <div><small>Siguiente</small><strong>Pago</strong></div>
      </li>
    </ol>
  )
}
