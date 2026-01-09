import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TreePine, 
  Upload, 
  Camera, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Award,
  Leaf,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { treePlantingAPI } from '../../services/api';

const TreePlantingSubmission = ({ order, onClose, onSuccess }) => {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isEcoFriendly = order.totalCarbonScore <= 3;
  const basePoints = 50;
  const ecoBonus = isEcoFriendly ? 20 : 0;
  const totalPoints = basePoints + ecoBonus;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      setImage(file);
      setError('');
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!image) {
      setError('Please upload an image of you planting a tree');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      
      const formData = new FormData();
      formData.append('orderId', order.id);
      formData.append('image', image);
      formData.append('description', description);

      const response = await treePlantingAPI.submitTreePlanting(formData);
      
      setSuccess('Tree planting submission uploaded successfully! Admin will review it soon.');
      setTimeout(() => {
        onSuccess && onSuccess();
        onClose();
      }, 2000);
      
    } catch (err) {
      console.error('Error submitting tree planting:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      setError(err.response?.data?.error || 'Failed to submit tree planting');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <TreePine className="w-8 h-8 mr-3" />
              <div>
                <h2 className="text-2xl font-bold">Plant a Tree</h2>
                <p className="text-green-100">Earn eco points by planting trees at home</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-green-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Order Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Order Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Order #:</span>
                <span className="ml-2 font-medium">{order.id}</span>
              </div>
              <div>
                <span className="text-gray-600">Total:</span>
                <span className="ml-2 font-medium">₹{order.totalPrice}</span>
              </div>
              <div>
                <span className="text-gray-600">Carbon Score:</span>
                <span className="ml-2 font-medium">{order.totalCarbonScore} kg CO₂</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600">Product Type:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                  isEcoFriendly 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {isEcoFriendly ? 'Eco-Friendly' : 'Regular'}
                </span>
              </div>
            </div>
          </div>

          {/* Eco Points Info */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-3">
              <Award className="w-6 h-6 text-green-600 mr-2" />
              <h3 className="font-semibold text-green-800">Eco Points Reward</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{basePoints}</div>
                <div className="text-xs text-green-600">Base Points</div>
              </div>
              {isEcoFriendly && (
                <div>
                  <div className="text-2xl font-bold text-green-600">+{ecoBonus}</div>
                  <div className="text-xs text-green-600">Eco Bonus</div>
                </div>
              )}
              <div>
                <div className="text-2xl font-bold text-green-600">{totalPoints}</div>
                <div className="text-xs text-green-600">Total Points</div>
              </div>
            </div>
            {isEcoFriendly && (
              <div className="mt-3 flex items-center justify-center text-sm text-green-700">
                <Leaf className="w-4 h-4 mr-1" />
                <span>Eco-friendly product bonus applied!</span>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Submission Guidelines</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Take a clear photo of yourself planting a tree at your home</li>
                  <li>• Ensure the tree and your face are visible in the image</li>
                  <li>• Image should be clear and well-lit</li>
                  <li>• You have 24 hours from delivery to submit</li>
                  <li>• Admin will review your submission within 24-48 hours</li>
                  <li>• Eco points will be credited after approval</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Image Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tree Planting Photo *
              </label>
              
              {!imagePreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="tree-image"
                  />
                  <label htmlFor="tree-image" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-600 mb-2">
                      Click to upload your tree planting photo
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG, JPEG up to 5MB
                    </p>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Tree planting preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Tell us about your tree planting experience..."
              />
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                <span className="text-sm text-red-800">{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                <span className="text-sm text-green-800">{success}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !image}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <TreePine className="w-4 h-4 mr-2" />
                    Submit for Review
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TreePlantingSubmission;
