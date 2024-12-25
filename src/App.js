import {useState,useEffect} from 'react'
import {Routes, Route, Navigate} from 'react-router-dom'

import LoginPage from './components/LoginPage'
import Home from './components/Home'
import Products from './components/Products'
import ProductItemDetails from './components/ProductItemDetails'
import Cart from './components/Cart'
import NotFound from './components/NotFound'
import ProtectedRoute from './components/ProtectedRoute'
import CartContext from './context/CartContext'
import Cookies from "js-cookie";

import './App.css'

const App = () => {
  const [cartList, setCartList] = useState([])

  const updateCartInCookies = (cartList) => {
    Cookies.set('cart', JSON.stringify(cartList));
  };

  useEffect(() => {
    const savedCart = Cookies.get('cart');
    if (savedCart) {
      setCartList(JSON.parse(savedCart));
    }
  }, []);

  const addCartItem = product => {
    const productExists = cartList.find(item => item.id === product.id)
    if (productExists) {
      setCartList((prevCartList) =>{
        const updatedCart=prevCartList.map((item) =>{
          const res=item.id === product.id
            ? {...item, quantity: item.quantity + product.quantity}
            : item

            return res
        }
        )
        updateCartInCookies(updatedCart)
        return updatedCart
      }
      )
      alert(`${product.title} is already in the cart and we have increased in the quantity.`);
    } else {
      setCartList((prevCartList) => {
        const updatedCart = [...prevCartList, product]
        updateCartInCookies(updatedCart)
        return updatedCart
      })
    }
  }

  const removeCartItem = (id) => {
    setCartList((prevCartList) => {
      const updatedCart = prevCartList.filter((item) => item.id !== id)
      updateCartInCookies(updatedCart)
      return updatedCart
    })
  }

  const incrementCartItemQuantity = (id) => {
    setCartList((prevCartList) => {
      const updatedCart = prevCartList.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
      updateCartInCookies(updatedCart)
      return updatedCart
    })
  }

  const decrementCartItemQuantity = (id) => {
    const product = cartList.find((item) => item.id === id);
    if (product.quantity > 1) {
      setCartList((prevCartList) => {
        const updatedCart = prevCartList.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        );
        updateCartInCookies(updatedCart);
        return updatedCart
      });
    } else {
      removeCartItem(id)
    }
  }

  const removeAllCartItems = () => {
    setCartList([]);
    Cookies.remove('cart');
  }

  return (
    <CartContext.Provider
      value={{
        cartList,
        addCartItem,
        removeCartItem,
        incrementCartItemQuantity,
        decrementCartItemQuantity,
        removeAllCartItems,
      }}
    >
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute element={<Home/>} />}/>
        <Route path="/products" element={<ProtectedRoute element={<Products/>} />} />
        <Route
          path="/products/:id"
          element={<ProtectedRoute element={<ProductItemDetails/>} />}
        />
        <Route path="/cart" element={<ProtectedRoute element={<Cart/>} />} />
        <Route path="/not-found" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Routes>
    </CartContext.Provider>
  )
}

export default App

