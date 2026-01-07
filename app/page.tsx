"use client";

import { useState } from "react";

export default function Home() {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [aiMessage, setAiMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submitFeedback = async () => {
    if (!review.trim()) {
      setAiMessage("Please enter a review.");
      return;
    }

    setLoading(true);
    setAiMessage("");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, review }),
      });

      const data = await res.json();

      // ✅ ONLY show backend AI response
      setAiMessage(data.message);
      setReview(""); // clear textarea AFTER response
    } catch (err) {
      setAiMessage("Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 32 }}>
      <h1>User Feedback</h1>

      <label>
        Rating:
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
        >
          {[1, 2, 3, 4, 5].map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>

      <br /><br />

      <textarea
        rows={4}
        cols={50}
        placeholder="Write your review..."
        value={review}
        onChange={(e) => setReview(e.target.value)}
      />

      <br /><br />

      <button
        type="button"
        onClick={submitFeedback}
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit"}
      </button>

      {aiMessage && (
        <div style={{ marginTop: 16 }}>
          <strong>AI Response:</strong>
          <p>{aiMessage}</p>
        </div>
      )}
    </main>
  );
}
