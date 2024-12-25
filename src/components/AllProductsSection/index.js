import { useState, useEffect, useCallback } from "react";
import { ThreeDots } from "react-loader-spinner";
import Cookies from "js-cookie";

import FiltersGroup from "../FiltersGroup";
import ProductCard from "../ProductCard";
import ProductsHeader from "../ProductsHeader";
import Pagination from "../Pagination";

import "./index.css";

const categoryOptions = [
  { name: "Beauty", categoryId: "beauty" },
  { name: "Fragrances", categoryId: "fragrances" },
  { name: "Furniture", categoryId: "furniture" },
  { name: "Grocery", categoryId: "groceries" },
];

const sortbyOptions = [
  { optionId: "PRICE_HIGH", displayText: "Price (High-Low)" },
  { optionId: "PRICE_LOW", displayText: "Price (Low-High)" },
];

const ratingsList = [
  {
    ratingId: "4",
    imageUrl:
      "https://assets.ccbp.in/frontend/react-js/rating-four-stars-img.png",
  },
  {
    ratingId: "3",
    imageUrl:
      "https://assets.ccbp.in/frontend/react-js/rating-three-stars-img.png",
  },
  {
    ratingId: "2",
    imageUrl:
      "https://assets.ccbp.in/frontend/react-js/rating-two-stars-img.png",
  },
  {
    ratingId: "1",
    imageUrl:
      "https://assets.ccbp.in/frontend/react-js/rating-one-star-img.png",
  },
];

const apiStatusConstants = {
  initial: "INITIAL",
  success: "SUCCESS",
  failure: "FAILURE",
  inProgress: "IN_PROGRESS",
};

const AllProductsSection = () => {
  const [productsList, setProductsList] = useState([]);
  const [apiStatus, setApiStatus] = useState(apiStatusConstants.initial);
  const [activeOptionId, setActiveOptionId] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [activeRatingId, setActiveRatingId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const productsPerPage = 6;

  const handlePageChange = (page) => {
    setCurrentPage(page);
    getProducts(page);
  };

  const getProducts = useCallback(
    async (page) => {
      setApiStatus(apiStatusConstants.inProgress);
      const jwtToken = Cookies.get("jwt_token");
      const offset = (page - 1) * productsPerPage;
      const queryParams = [`limit=${productsPerPage}`, `offset=${offset}`];
      if (searchInput) queryParams.push(`search=${searchInput}`);
      if (activeCategoryId) queryParams.push(`category=${activeCategoryId}`);
      if (activeRatingId) queryParams.push(`rating=${activeRatingId}`);
      if (activeOptionId) {
        const sortOrder = activeOptionId === "PRICE_HIGH" ? "desc" : "asc";
        queryParams.push(`sortBy=price&order=${sortOrder}`);
      }

      const queryString =
        queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
        const apiDomain = process.env.REACT_APP_API_URL;
      const apiUrl = `${apiDomain}/api/products${queryString}`;
      // const apiUrl = `https://apis.ccbp.in/products?sort_by=${activeOptionId}&category=${activeCategoryId}&title_search=${searchInput}&rating=${activeRatingId}`;
      const options = {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
        method: "GET",
      };

      try {
        const response = await fetch(apiUrl, options);
        if (response.ok) {
          const fetchedData = await response.json();
          const updatedData = fetchedData.products.map((product) => ({
            title: product.title,
            brand: product.brand,
            price: product.price,
            id: product.id,
            imageUrl: product.images,
            rating: product.rating,
          }));
          setProductsList(updatedData);
          setTotalPages(Math.ceil(fetchedData.total / productsPerPage));
          setApiStatus(apiStatusConstants.success);
        } else {
          setApiStatus(apiStatusConstants.failure);
        }
      } catch (error) {
        setApiStatus(apiStatusConstants.failure);
      }
    },
    [searchInput, activeRatingId, activeOptionId, activeCategoryId]
  );

  useEffect(() => {
    getProducts(currentPage);
  }, [currentPage, getProducts]);

  const renderLoadingView = () => (
    <div className="products-loader-container">
      <ThreeDots type="ThreeDots" color="#0b69ff" height="50" width="50" />
    </div>
  );

  const renderFailureView = () => (
    <div className="products-error-view-container">
      <img
        src="https://assets.ccbp.in/frontend/react-js/nxt-trendz/nxt-trendz-products-error-view.png"
        alt="all-products-error"
        className="products-failure-img"
      />
      <h1 className="product-failure-heading-text">
        Oops! Something Went Wrong
      </h1>
      <p className="products-failure-description">
        We are having some trouble processing your request. Please try again.
      </p>
    </div>
  );

  const renderProductsListView = () => {
    const shouldShowProductsList = productsList.length > 0;

    return shouldShowProductsList ? (
      <div className="all-products-container">
        <ProductsHeader
          activeOptionId={activeOptionId}
          sortbyOptions={sortbyOptions}
          changeSortby={setActiveOptionId}
        />
        <ul className="products-list">
          {productsList.map((product) => (
            <ProductCard productData={product} key={product.id} />
          ))}
        </ul>
      </div>
    ) : (
      <div className="no-products-view">
        <img
          src="https://assets.ccbp.in/frontend/react-js/nxt-trendz/nxt-trendz-no-products-view.png"
          className="no-products-img"
          alt="no products"
        />
        <h1 className="no-products-heading">No Products Found</h1>
        <p className="no-products-description">
          We could not find any products. Try other filters.
        </p>
      </div>
    );
  };

  const renderAllProducts = () => {
    switch (apiStatus) {
      case apiStatusConstants.success:
        return renderProductsListView();
      case apiStatusConstants.failure:
        return renderFailureView();
      case apiStatusConstants.inProgress:
        return renderLoadingView();
      default:
        return null;
    }
  };

  const clearFilters = () => {
    setSearchInput("");
    setActiveCategoryId("");
    setActiveRatingId("");
  };

  return (
    <>
    <div className="all-products-section">
      <FiltersGroup
        searchInput={searchInput}
        categoryOptions={categoryOptions}
        ratingsList={ratingsList}
        changeSearchInput={setSearchInput}
        enterSearchInput={getProducts}
        activeCategoryId={activeCategoryId}
        activeRatingId={activeRatingId}
        changeCategory={setActiveCategoryId}
        changeRating={setActiveRatingId}
        clearFilters={clearFilters}
      />
      {renderAllProducts()}
    </div>
    <Pagination className="pagination-container"
    currentPage={currentPage}
    totalPages={totalPages}
    onPageChange={handlePageChange}
  />
  </>
  );
};

export default AllProductsSection;
