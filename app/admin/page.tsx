"use client";

import { useEffect, useState } from "react";

type Feedback = {
  id: string;
  rating: number;
  review: string;
  aiSummary: string;
  aiAction: string;
};

export default function AdminDashboard() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | null>(null);

  // Fetch feedback from backend
  const fetchFeedback = async () => {
    try {
      const res = await fetch("/api/admin/feedback");
      const data = await res.json();
      setFeedback(data);
    } catch (err) {
      console.error("Failed to fetch feedback", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load + auto-refresh every 5 seconds
  useEffect(() => {
    fetchFeedback();
    const interval = setInterval(fetchFeedback, 5000); // 🔥 auto-refresh
    return () => clearInterval(interval);
  }, []);

  // Analytics: count feedback by rating
  const ratingCounts = feedback.reduce((acc, f) => {
    acc[f.rating] = (acc[f.rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  // Apply rating filter
  const visibleFeedback = filterRating
    ? feedback.filter((f) => f.rating === filterRating)
    : feedback;

  return (
    <main style={{ padding: 32 }}>
      <h1>Admin Dashboard</h1>

      {/* Analytics Section */}
      <section style={{ marginBottom: 32 }}>
        <h2>Feedback Analytics</h2>

        {[1, 2, 3, 4, 5].map((r) => (
          <p key={r}>
            ⭐ {r}: {ratingCounts[r] || 0}
          </p>
        ))}

        <div style={{ marginTop: 16 }}>
          <label>
            Filter by rating:&nbsp;
            <select
              onChange={(e) =>
                setFilterRating(
                  e.target.value ? Number(e.target.value) : null
                )
              }
            >
              <option value="">All</option>
              {[1, 2, 3, 4, 5].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {/* Feedback List */}
      <section>
        <h2>All Feedback</h2>

        {loading && <p>Loading feedback...</p>}

        {!loading && visibleFeedback.length === 0 && (
          <p>No feedback found.</p>
        )}

        {visibleFeedback.map((f) => (
          <div
            key={f.id}
            style={{
              border: "1px solid #ccc",
              padding: 16,
              marginBottom: 12,
              borderRadius: 4,
            }}
          >
            <strong>⭐ {f.rating}</strong>
            <p>
              <strong>Review:</strong> {f.review}
            </p>
            <p>
              <strong>Summary:</strong> {f.aiSummary}
            </p>
            <p>
              <strong>Action:</strong> {f.aiAction}
            </p>
          </div>
        ))}
      </section>
    </main>
  );
}
