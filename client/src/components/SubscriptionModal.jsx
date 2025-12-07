import React, { useState } from 'react';
import { subscriptionAPI } from '../api';

export default function SubscriptionModal({ isOpen, onClose, user }) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const response = await subscriptionAPI.createCheckoutSession();
      if (response.data.sessionId) {
        // Redirect to Stripe checkout
        window.location.href = `https://checkout.stripe.com/pay/${response.data.sessionId}`;
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Unlock Premium Features</h2>
        <p className="text-slate-300 mt-4 mb-6">
          Upgrade to Science Revision Pro for:
        </p>
        <ul className="space-y-3 mb-8 text-slate-300">
          <li className="flex items-center">
            <span className="text-accent mr-3">✓</span>
            Unlimited flashcard generation
          </li>
          <li className="flex items-center">
            <span className="text-accent mr-3">✓</span>
            Quiz generator
          </li>
          <li className="flex items-center">
            <span className="text-accent mr-3">✓</span>
            Mock exam creator
          </li>
          <li className="flex items-center">
            <span className="text-accent mr-3">✓</span>
            Detailed progress analytics
          </li>
        </ul>
        <div className="text-center">
          <p className="text-2xl font-bold text-accent mb-4">£4.99/month</p>
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="btn-primary w-full mb-3"
          >
            {loading ? 'Processing...' : 'Upgrade Now'}
          </button>
          <button
            onClick={onClose}
            className="btn-secondary w-full"
          >
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
}
