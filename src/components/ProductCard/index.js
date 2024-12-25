import { Link } from "react-router-dom";
import { BsCurrencyDollar } from "react-icons/bs";

import "./index.css";

const ProductCard = (props) => {
  const { productData } = props;
  const { title, brand, imageUrl, rating, price, id } = productData;
//  console.log(title,"xxxxxxxxxxxxxxx",imageUrl[0])
  return (
    <li className="product-item">
      <Link to={`/products/${id}`} className="link-item">
        <img src={imageUrl[0]} alt="product" className="product-image" />
        <h1 className="title">{title}</h1>
        <p className="brand">by {brand}</p>
        <div className="product-details">
          <p className="price"><BsCurrencyDollar/> {price}/-</p>
          <div className="rating-container">
            <p className="rating">{rating}</p>
            <img
              src="https://assets.ccbp.in/frontend/react-js/star-img.png"
              alt="star"
              className="star"
            />
          </div>
        </div>
      </Link>
    </li>
  );
};
export default ProductCard;
