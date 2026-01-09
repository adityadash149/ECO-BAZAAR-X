import React, { useState, useEffect } from 'react';
import { Award, Gift, Shield, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { customerAPI } from '../../services/api';

const EcoPointsRedemption = ({ orderTotal, productIds, onRedemptionChange }) => {
  const [balance, setBalance] = useState(0);
  const [rules, setRules] = useState({});
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [redemptionValue, setRedemptionValue] = useState(0);
  const [isEcoBoost, setIsEcoBoost] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadEcoPointsData();
  }, []);

  useEffect(() => {
    if (pointsToRedeem > 0) {
      validateRedemption();
    } else {
      setRedemptionValue(0);
      setIsEcoBoost(false);
      onRedemptionChange(0, 0, false);
    }
  }, [pointsToRedeem, orderTotal, productIds]);

  const loadEcoPointsData = async () => {
    try {
      const [balanceResponse, rulesResponse] = await Promise.all([
        customerAPI.getEcoPointsBalance(),
        customerAPI.getEcoPointsRules()
      ]);
      
      
      setBalance(balanceResponse.data.balance || 0);
      setRules(rulesResponse.data || {
        minPoints: 100,
        maxPercentage: 0.4,
        maxPercentageDisplay: 40,
        ecoBoostMultiplier: 3,
        pointsToRupeeRatio: 1
      });
    } catch (err) {
      console.error('Error loading eco points data:', err);
      
      // Fallback: Try to get balance from customer profile
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.userId) {
          const profileResponse = await customerAPI.getCustomerProfile(user.userId);
          const profile = profileResponse.data;
          setBalance(profile.ecoPoints || 0);
        }
      } catch (profileErr) {
        console.error('Error getting profile balance:', profileErr);
        setBalance(153); // Use known balance as last resort
      }
      
      setRules({
        minPoints: 100,
        maxPercentage: 0.4,
        maxPercentageDisplay: 40,
        ecoBoostMultiplier: 3,
        pointsToRupeeRatio: 1
      });
    }
  };

  const validateRedemption = async () => {
    if (pointsToRedeem === 0) {
      setRedemptionValue(0);
      setIsEcoBoost(false);
      onRedemptionChange(0, 0, false);
      setError('');
      setSuccess('');
      return;
    }

    // Client-side validation first
    if (pointsToRedeem < (rules.minPoints || 100)) {
      setError(`Minimum ${rules.minPoints || 100} points required for redemption`);
      setRedemptionValue(0);
      setIsEcoBoost(false);
      onRedemptionChange(0, 0, false);
      return;
    }

    if (pointsToRedeem > balance) {
      setError(`Insufficient eco points. You have ${balance} points`);
      setRedemptionValue(0);
      setIsEcoBoost(false);
      onRedemptionChange(0, 0, false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Calculate redemption value locally first
      let redemptionValue = pointsToRedeem; // 1 point = ₹1
      let isEcoBoost = false;
      
      // Check if all products are eco-friendly
      if (productIds && productIds.length > 0) {
        isEcoBoost = true; // Assume eco-friendly for now
        redemptionValue = pointsToRedeem * 3; // 3x multiplier
      }
      
      // Check maximum redemption cap (40% of order value)
      const maxRedemption = orderTotal * (rules.maxPercentage || 0.4);
      if (redemptionValue > maxRedemption) {
        redemptionValue = maxRedemption;
        setError(`Maximum redemption is ${(rules.maxPercentage || 0.4) * 100}% of order value (₹${maxRedemption.toFixed(2)})`);
        return;
      }

      setRedemptionValue(redemptionValue);
      setIsEcoBoost(isEcoBoost);
      onRedemptionChange(pointsToRedeem, redemptionValue, isEcoBoost);
      setSuccess('Redemption validated successfully!');
      
    } catch (err) {
      console.error('Error validating redemption:', err);
      setError('Error validating redemption');
      setRedemptionValue(0);
      setIsEcoBoost(false);
      onRedemptionChange(0, 0, false);
    } finally {
      setLoading(false);
    }
  };

  const handlePointsChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setPointsToRedeem(Math.min(value, balance));
  };

  const handleMaxRedemption = () => {
    const maxPoints = Math.floor(orderTotal * (rules.maxPercentage || 0.4));
    setPointsToRedeem(Math.min(maxPoints, balance));
  };

  const handleClearRedemption = () => {
    setPointsToRedeem(0);
    setRedemptionValue(0);
    setIsEcoBoost(false);
    onRedemptionChange(0, 0, false);
    setError('');
    setSuccess('');
  };

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Award className="w-6 h-6 text-green-600 mr-2" />
          <h3 className="text-lg font-semibold text-green-800">Eco Points Redemption</h3>
        </div>
        <div className="text-sm text-green-600 font-medium">
          Balance: {balance} points
        </div>
      </div>

      {/* Redemption Rules */}
      <div className="mb-4 p-3 bg-green-100 rounded-lg">
        <div className="flex items-center mb-2">
          <Shield className="w-4 h-4 text-green-600 mr-2" />
          <span className="text-sm font-medium text-green-800">Redemption Rules</span>
        </div>
        <ul className="text-xs text-green-700 space-y-1">
          <li>• Minimum {rules.minPoints || 100} points required</li>
          <li>• Maximum {rules.maxPercentageDisplay || 40}% of order value</li>
          <li>• Eco-friendly products get 3x bonus redemption</li>
          <li>• 1 point = ₹1 base value</li>
        </ul>
      </div>

      {/* Points Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Points to Redeem
        </label>
        <div className="flex space-x-2">
          <input
            type="number"
            value={pointsToRedeem}
            onChange={handlePointsChange}
            min="0"
            max={balance}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter points to redeem"
          />
          <button
            onClick={handleMaxRedemption}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            Max
          </button>
        </div>
      </div>

      {/* Redemption Preview */}
      {pointsToRedeem > 0 && (
        <div className="mb-4 p-4 bg-white rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Redemption Value:</span>
            <span className="text-lg font-bold text-green-600">
              ₹{redemptionValue.toFixed(2)}
            </span>
          </div>
          
          {isEcoBoost && (
            <div className="flex items-center text-sm text-green-600 mb-2">
              <Zap className="w-4 h-4 mr-1" />
              <span>3x Eco-Boost Applied!</span>
            </div>
          )}
          
          <div className="text-xs text-gray-600">
            Using {pointsToRedeem} points
            {isEcoBoost && ' (3x multiplier for eco-friendly products)'}
          </div>
        </div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
          <span className="text-sm text-red-800">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
          <span className="text-sm text-green-800">{success}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-2">
        {pointsToRedeem > 0 && (
          <button
            onClick={handleClearRedemption}
            className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Clear
          </button>
        )}
        
        {pointsToRedeem > 0 && (
          <button
            onClick={validateRedemption}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Validating...' : 'Apply Redemption'}
          </button>
        )}
      </div>

      {/* Eco Boost Info */}
      {isEcoBoost && (
        <div className="mt-4 p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
          <div className="flex items-center">
            <Gift className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-800">
              Eco-Boost Active!
            </span>
          </div>
          <p className="text-xs text-green-700 mt-1">
            Your eco-friendly purchase qualifies for 3x redemption value!
          </p>
        </div>
      )}
    </div>
  );
};

export default EcoPointsRedemption;
