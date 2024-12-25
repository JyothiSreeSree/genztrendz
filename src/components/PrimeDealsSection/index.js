import {useState, useEffect} from 'react';
import Cookies from 'js-cookie';
import { ThreeDots } from 'react-loader-spinner';


import ProductCard from '../ProductCard';

import './index.css';

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
};

const PrimeDealsSection = () => {
  const [primeDeals, setPrimeDeals] = useState([]);
  const [apiStatus, setApiStatus] = useState(apiStatusConstants.initial);

  useEffect(() => {
    getPrimeDeals();
  }, []);

  const getPrimeDeals = async () => {
    setApiStatus(apiStatusConstants.inProgress);

    const jwtToken = Cookies.get('jwt_token');
    const apiUrl = 'https://apis.ccbp.in/prime-deals';
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    };

    const response = await fetch(apiUrl, options);
    if (response.ok) {
      const fetchedData = await response.json();
      const updatedData = fetchedData.prime_deals.map(product => ({
        title: product.title,
        brand: product.brand,
        price: product.price,
        id: product.id,
        imageUrl: product.image_url,
        rating: product.rating,
      }));
      setPrimeDeals(updatedData);
      setApiStatus(apiStatusConstants.success);
    } else if (response.status === 401) {
      setApiStatus(apiStatusConstants.failure);
    }
  };

  const renderPrimeDealsListView = () => (
    <div>
      <h1 className="primedeals-list-heading">Exclusive Prime Deals</h1>
      <ul className="products-list">
        {primeDeals.map(product => (
          <ProductCard productData={product} key={product.id} />
        ))}
      </ul>
    </div>
  );

  const renderPrimeDealsFailureView = () => (
    <img
      src="https://assets.ccbp.in/frontend/react-js/exclusive-deals-banner-img.png"
      alt="register prime"
      className="register-prime-img"
    />
  );

  const renderLoadingView = () => (
    <div className="primedeals-loader-container">
      <ThreeDots type="ThreeDots" color="#0b69ff" height="50" width="50" />
    </div>
  );

  const renderContent = () => {
    switch (apiStatus) {
      case apiStatusConstants.success:
        return renderPrimeDealsListView();
      case apiStatusConstants.failure:
        return renderPrimeDealsFailureView();
      case apiStatusConstants.inProgress:
        return renderLoadingView();
      default:
        return null;
    }
  };

  return renderContent();
};

export default PrimeDealsSection;
