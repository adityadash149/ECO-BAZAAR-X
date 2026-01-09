import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, TrendingDown, DollarSign, Sparkles, X, RefreshCw, CheckCircle } from 'lucide-react';
import { suggestionAPI } from '../../services/api';
import { customerAPI } from '../../services/api';

const GreenerAlternative = ({ productId, currentProduct, onReplace }) => {
  const [alternative, setAlternative] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [replacing, setReplacing] = useState(false);

  useEffect(() => {
    if (productId) {
      loadAlternative();
    }
  }, [productId]);

  const loadAlternative = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await suggestionAPI.getGreenerAlternative(productId);
      if (response.data) {
        setAlternative(response.data);
      } else {
        setError('No greener alternative found');
      }
    } catch (err) {
      console.error('Error loading alternative:', err);
      // If smart-cart-backend is not available, try to find alternative from products
      setError('Unable to load suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleReplace = async () => {
    if (!alternative || !onReplace) return;
    
    setReplacing(true);
    try {
      // Prepare alternative product data for cart
      const alternativeCartItem = {
        id: alternative.id,
        productId: alternative.id,
        name: alternative.name || alternative.productName,
        price: alternative.price || alternative.unitPrice,
        image: alternative.imageUrl || alternative.image,
        quantity: currentProduct?.quantity || 1,
        ecoScore: alternative.isGreen ? 95 : 80,
        carbonScore: alternative.emissionPerUnit || 0,
        isEcoFriendly: alternative.isGreen || false,
      };

      // Remove current item and add alternative
      if (currentProduct?.id) {
        await customerAPI.removeFromCart(currentProduct.id);
      }
      
      await customerAPI.addToCart(alternativeCartItem);
      
      // Dispatch event to update cart
      window.dispatchEvent(new Event('cartUpdated'));
      
      // Call onReplace callback
      onReplace(alternativeCartItem);
      
      // Show success message
      alert(`✅ Replaced with greener alternative: ${alternativeCartItem.name}`);
    } catch (err) {
      console.error('Error replacing product:', err);
      alert('❌ Failed to replace product. Please try again.');
    } finally {
      setReplacing(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
        <div className="flex items-center text-green-700">
          <RefreshCw size={14} className="mr-2 animate-spin" />
          <span className="text-sm">Finding greener alternatives...</span>
        </div>
      </div>
    );
  }

  if (error && !alternative) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-600">
            <Leaf size={14} className="mr-2" />
            <span className="text-sm">{error}</span>
          </div>
          <button
            onClick={loadAlternative}
            className="text-xs text-green-600 hover:text-green-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!alternative) return null;

  const currentCarbon = currentProduct?.carbonScore || 0;
  const alternativeCarbon = alternative.emissionPerUnit || 0;
  const carbonReduction = currentCarbon - alternativeCarbon;
  const carbonReductionPercent = currentCarbon > 0 
    ? ((carbonReduction / currentCarbon) * 100).toFixed(0) 
    : 0;

  const currentPrice = currentProduct?.price || 0;
  const alternativePrice = alternative.price || alternative.unitPrice || 0;
  const priceDifference = alternativePrice - currentPrice;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4 mt-3 shadow-sm"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <Sparkles size={18} className="text-green-600 mr-2" />
            <h4 className="font-semibold text-green-800">🌱 Greener Alternative Found!</h4>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-green-600 hover:text-green-700 text-sm"
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </button>
        </div>

        <div className="flex items-center space-x-4 mb-3">
          <img
            src={alternative.imageUrl || alternative.image || 'https://via.placeholder.com/60'}
            alt={alternative.name || alternative.productName}
            className="w-16 h-16 object-cover rounded-lg border-2 border-green-300"
          />
          <div className="flex-1">
            <h5 className="font-semibold text-gray-900 mb-1">
              {alternative.name || alternative.productName}
            </h5>
            <div className="flex items-center space-x-3 text-sm">
              {carbonReduction > 0 && (
                <div className="flex items-center text-green-700">
                  <TrendingDown size={14} className="mr-1" />
                  <span className="font-medium">{carbonReductionPercent}% less CO₂</span>
                </div>
              )}
              <div className="flex items-center text-green-600">
                <Leaf size={14} className="mr-1" />
                <span>Eco-friendly</span>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-lg p-4 mb-3 border border-green-200"
            >
              <h6 className="font-semibold text-gray-800 mb-3 text-sm">Comparison:</h6>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Carbon Emission:</p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 line-through">
                      {currentCarbon.toFixed(2)} kg CO₂
                    </span>
                    <span className="font-semibold text-green-600">
                      {alternativeCarbon.toFixed(2)} kg CO₂
                    </span>
                  </div>
                  {carbonReduction > 0 && (
                    <p className="text-green-600 text-xs mt-1">
                      Saves {carbonReduction.toFixed(2)} kg CO₂
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Price:</p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">
                      ₹{Number(currentPrice).toFixed(2)}
                    </span>
                    <span className={`font-semibold ${priceDifference < 0 ? 'text-green-600' : priceDifference > 0 ? 'text-orange-600' : 'text-gray-700'}`}>
                      ₹{Number(alternativePrice).toFixed(2)}
                    </span>
                  </div>
                  {priceDifference !== 0 && (
                    <p className={`text-xs mt-1 ${priceDifference < 0 ? 'text-green-600' : 'text-orange-600'}`}>
                      {priceDifference < 0 ? 'Saves' : 'Costs'} ₹{Math.abs(priceDifference).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleReplace}
          disabled={replacing}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {replacing ? (
            <>
              <RefreshCw size={16} className="mr-2 animate-spin" />
              Replacing...
            </>
          ) : (
            <>
              <CheckCircle size={16} className="mr-2" />
              Replace with Greener Alternative
            </>
          )}
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default GreenerAlternative;

