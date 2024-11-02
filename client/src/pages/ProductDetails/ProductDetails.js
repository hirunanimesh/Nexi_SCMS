import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ProductDetails.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProductDetails = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    const getProducts = async () => {
      try {
        const result = await axios.get("/customer/products/");
        setProducts(result.data);
      } catch (err) {
        setError("Error fetching products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    getProducts();

  }, []);


  const { id } = useParams(); // Get the product ID from the URL
  const product = products.find((p) => p.Product_ID == id); // Find the product by ID

  // Loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // Error handling
  if (error) {
    return <div>{error}</div>;
  }

  // Handle case where product is not found
  if (!product) {
    return <div>Product not found</div>;
  }

  const handleIncrease = () => {
    setQuantity((prevQuantity) => prevQuantity + 1);
  };

  const handleDecrease = () => {
    setQuantity((prevQuantity) => (prevQuantity > 1 ? prevQuantity - 1 : 1));
  };

  // Function to handle adding to cart
  const handleAddToCart = async () => {
    try {
      await axios.post(
        "/customer/cart/add",
        {
          Product_ID: product.Product_ID,
          Quantity: quantity,
        },
        { withCredentials: true }
      );
      toast.success("Product added to cart!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    } catch (err) {
      console.error("Error adding to cart:", err);
      
      // Ensure response exists before accessing the status
      if (!err.response) {
        toast.error("Network error. Please check your internet connection.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      } else if (err.response.status === 401) {
        // Redirect to login if not authenticated
        navigate("/login");
      } else {
        toast.error("Error adding to cart. Please try again!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      }
    }
  };

  return (
    <div className="product-details">
      <div className="img-container">
        <img src={product.Image_Link} alt={product.Product_Name} />
      </div>
      <div className="description-container">
        <h2>{product.Product_Name}</h2>
        <p className="price">LKR {product.Price}</p>

        <p className="product-description">{product.Description}</p>

        <div className="quantity-container">
          <button onClick={handleDecrease} className="increase">
            -
          </button>
          <p className="quantity-display">{quantity}</p>
          <button onClick={handleIncrease} className="decrease">
            +
          </button>
        </div>
        <button className="add-to-cart1" onClick={handleAddToCart}>
          Add To Cart
        </button>
      </div>
      <ToastContainer/>
    </div>
  );
};

export default ProductDetails;
