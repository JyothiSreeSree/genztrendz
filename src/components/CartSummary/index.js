import Popup from 'reactjs-popup'
import CartContext from '../../context/CartContext'
import Payment from '../Payment'
import './index.css'

const CartSummary = () => (
  <CartContext.Consumer>
    {value => {
      const {cartList} = value

      const total = cartList.reduce(
        (acc, item) => acc + item.quantity * item.price,
        0,
      )  
      return (
        <div>
          <h2 className='order-total'>Order Total: Rs.{total}</h2>
          <p className='cart-list-length-p'><span className='cart-list-length'>{cartList.length}</span> items in cart</p>
          <Popup modal trigger={<button type="button" className='check-out-btn'>Checkout</button>}>
            {close => <Payment close={close} />}
          </Popup>
        </div>
      )
    }}
  </CartContext.Consumer>
)

export default CartSummary