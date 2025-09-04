// src/components/UpdateReviewCounts.jsx
import React, { useState } from 'react';
import { updateAllChocolatesWithReviewCount } from '../services/chocolateFirebaseService';

function UpdateReviewCounts() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const updateResult = await updateAllChocolatesWithReviewCount();
      setResult(updateResult);
    } catch (error) {
      setResult({ error: error.message });
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Update Review Counts</h2>
      <button onClick={handleUpdate} disabled={loading}>
        {loading ? 'Updating...' : 'Update All Chocolates'}
      </button>
      {result && (
        <div>
          {result.error ? (
            <p style={{ color: 'red' }}>Error: {result.error}</p>
          ) : (
            <div>
              <p>✅ Success!</p>
              <p>Updated: {result.updated}</p>
              <p>Skipped: {result.skipped}</p>
              <p>Total: {result.total}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default UpdateReviewCounts;