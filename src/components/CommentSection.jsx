// src/components/CommentSection.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getComments, addComment, deleteComment } from '../services/commentService';
import './CommentSection.css';

function CommentSection({ reviewId, commentCount = 0 }) {
  const { currentUser } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [displayCount, setDisplayCount] = useState(commentCount);

  useEffect(() => {
    if (isExpanded && comments.length === 0 && displayCount > 0) {
      loadComments();
    }
  }, [isExpanded]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const fetched = await getComments(reviewId);
      setComments(fetched);
      setDisplayCount(fetched.length);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser || submitting) return;

    setSubmitting(true);
    try {
      const comment = await addComment(
        reviewId,
        currentUser.uid,
        currentUser.displayName || 'Anonymous',
        currentUser.photoURL || null,
        newComment.trim()
      );
      setComments(prev => [...prev, comment]);
      setDisplayCount(prev => prev + 1);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteComment(commentId, reviewId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      setDisplayCount(prev => prev - 1);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
      const now = new Date();
      const diff = now - d;
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      if (days < 7) return `${days}d ago`;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="comment-section">
      <button
        className="comment-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span>
          {displayCount > 0
            ? `${displayCount} comment${displayCount !== 1 ? 's' : ''}`
            : 'Comment'}
        </span>
      </button>

      {isExpanded && (
        <div className="comment-body">
          {loading ? (
            <div className="comment-loading">Loading comments...</div>
          ) : (
            <>
              {comments.length > 0 && (
                <div className="comment-list">
                  {comments.map(comment => (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-avatar-wrap">
                        {comment.userPhotoURL ? (
                          <img
                            src={comment.userPhotoURL}
                            alt=""
                            className="comment-avatar"
                          />
                        ) : (
                          <div className="comment-avatar-placeholder">
                            {(comment.userName || 'A').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="comment-content">
                        <div className="comment-meta">
                          <Link to={`/user/${comment.userId}`} className="comment-author">
                            {comment.userName || 'Anonymous'}
                          </Link>
                          <span className="comment-time">{formatDate(comment.createdAt)}</span>
                          {currentUser && currentUser.uid === comment.userId && (
                            <button
                              className="comment-delete"
                              onClick={() => handleDelete(comment.id)}
                              aria-label="Delete comment"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                        <p className="comment-text">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {currentUser ? (
                <form className="comment-form" onSubmit={handleSubmit}>
                  <textarea
                    className="comment-input"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    rows="2"
                    maxLength={500}
                  />
                  <button
                    type="submit"
                    className="comment-submit"
                    disabled={!newComment.trim() || submitting}
                  >
                    {submitting ? 'Posting...' : 'Post'}
                  </button>
                </form>
              ) : (
                <p className="comment-sign-in">
                  <Link to="/auth">Sign in</Link> to comment
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default CommentSection;
