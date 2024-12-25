import {useContext, useState} from 'react'
import CartContext from '../../context/CartContext'
import './index.css'

const paymentOptionsList = [
  {
    id: 'CARD',
    displayText: 'Credit card/Debit card',
    isDisabled: true,
    url: 'https://cdn-icons-png.flaticon.com/128/8983/8983163.png',
  },
  {
    id: 'NET_BANKING',
    displayText: 'Net Banking',
    isDisabled: true,
    url: 'https://cdn-icons-png.flaticon.com/128/4488/4488426.png',
  },
  {
    id: 'UPI',
    displayText: 'UPI',
    isDisabled: true,
    url: 'https://cdn-icons-png.flaticon.com/128/4108/4108042.png',
  },
  {
    id: 'WALLET',
    displayText: 'Wallet',
    isDisabled: true,
    url: 'https://cdn-icons-png.flaticon.com/128/855/855279.png',
  },
  {
    id: 'CASH_ON_DELIVERY',
    displayText: 'Cash on Delivery',
    isDisabled: false,
    url: 'https://cdn-icons-png.flaticon.com/128/6491/6491623.png',
  },
]

const Payment = () => {
  const {cartList} = useContext(CartContext)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [isOrderPlaced, setIsOrderPlaced] = useState(false)

  const updatePaymentMethod = event => {
    const {id} = event.target
    setPaymentMethod(id)
  }

  const onPlaceOrder = () => setIsOrderPlaced(true)

  const getTotalPrice = () =>
    cartList.reduce((acc, item) => acc + item.quantity * item.price, 0)

  const renderPaymentMethodsInput = () => (
    <ul className="payment-method-inputs">
      {paymentOptionsList.map(eachMethod => (
        <li key={eachMethod.id} className="payment-method-input-container">
          <input
            className="payment-method-input"
            id={eachMethod.id}
            type="radio"
            name="paymentMethod"
            disabled={eachMethod.isDisabled}
            onChange={updatePaymentMethod}
          />
          <label
            className={`payment-method-label ${
              eachMethod.isDisabled ? 'disabled-label' : ''
            }`}
            htmlFor={eachMethod.id}
          >
            {eachMethod.displayText}
          </label>
          <img
            className="payment-method-image"
            src={eachMethod.url}
            alt={eachMethod.displayText}
          />
        </li>
      ))}
    </ul>
  )

  return (
    <div className="payments-container">
      {isOrderPlaced ? (
        <p className="success-message">
          Your order has been placed successfully!
        </p>
      ) : (
        <>
          <h1 className="payments-heading">Payments Details</h1>
          <p className="payments-sub-heading">Payment Method</p>
          {renderPaymentMethodsInput()}
          <div className="order-details">
            <p className="payments-sub-heading">Order details:</p>
            <p>Quantity: {cartList.length}</p>
            <p>Total Price: ₹{getTotalPrice()}/-</p>
          </div>
          <button
            disabled={!paymentMethod}
            type="button"
            className="confirm-order-button"
            onClick={onPlaceOrder}
          >
            Confirm Order
          </button>
        </>
      )}
    </div>
  )
}

export default Payment