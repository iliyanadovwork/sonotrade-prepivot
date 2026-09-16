'use client';

import React, { useState, useEffect, useCallback } from 'react';
import CommentForm from './CommentForm';
import CommentList from './CommentList';
import { Comment } from '@/types/comments';
import { useAuth } from '@/lib/context/AuthContext';
import { apiClient } from '@/lib/api/client';

interface CommentSectionProps {
  eventId: string;
  onTotalChange?: (total: number) => void;
  className?: string;
  marketTitle?: string;
  marketImage?: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  eventId,
  onTotalChange,
  className,
  marketTitle,
  marketImage,
}) => {
  const { user, wallet } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [replyingTo, setReplyingTo] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const currentUserWallet = wallet?.publicKey;

  const fetchComments = useCallback(async (reset: boolean = false) => {
    if (!eventId) return;

    try {
      const currentOffset = reset ? 0 : offset;

      if (!reset) {
        setIsFetching(true);
      }

      const data = await apiClient.getComments(eventId, 50, currentOffset);

      if (data.success) {
        if (reset) {
          setComments(data.comments || []);
          setOffset(0);
        } else {
          setComments((prev) => [...prev, ...(data.comments || [])]);
        }

        setHasMore(data.hasMore || false);
        setTotal(data.total || 0);

        if (onTotalChange) {
          onTotalChange(data.total || 0);
        }
      }
    } catch (error) {
      console.error('Fetch comments error:', error);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [eventId, offset, onTotalChange]);

  useEffect(() => {
    fetchComments(true);
  }, [eventId]);

  const handleLoadMore = useCallback(() => {
    if (!isFetching && hasMore) {
      setOffset((prev) => prev + 50);
      setTimeout(() => {
        fetchComments(false);
      }, 100);
    }
  }, [isFetching, hasMore, fetchComments]);

  const handleCommentAdded = useCallback((newComment: Comment) => {
    // Refresh the comments list
    fetchComments(true);
  }, [fetchComments]);

  const handleReplyAdded = useCallback((newReply: Comment) => {
    setComments((prev) => {
      // If this is a real reply replacing an optimistic one, replace it
      const isOptimistic = newReply._id.startsWith('temp-');
      if (!isOptimistic) {
        // Check if there's an optimistic reply to replace
        const optimisticIndex = prev.findIndex(c => c._id.startsWith('temp-') && c.parentId === newReply.parentId);
        if (optimisticIndex !== -1) {
          // Replace optimistic reply with real one
          const updated = [...prev];
          updated[optimisticIndex] = newReply;
          return updated;
        }
      }
      // Otherwise, just add the new reply
      return [...prev, newReply];
    });

    // Only increment total for optimistic replies (real ones are just replacements)
    if (newReply._id.startsWith('temp-')) {
      setTotal((prev) => prev + 1);
      if (onTotalChange) {
        onTotalChange(total + 1);
      }
    }

    setReplyingTo('');
  }, [total, onTotalChange]);

  const handleReplyFailed = useCallback((optimisticId: string) => {
    // Remove the failed optimistic reply
    setComments((prev) => prev.filter(c => c._id !== optimisticId));
    setTotal((prev) => prev - 1);
    if (onTotalChange) {
      onTotalChange(total - 1);
    }
  }, [total, onTotalChange]);

  const handleDelete = useCallback(async (commentId: string) => {
    try {
      await apiClient.deleteComment(commentId);
      // Refresh comments after deletion
      fetchComments(true);
    } catch (error) {
      console.error('Delete comment error:', error);
    }
  }, [fetchComments]);

  return (
    <div className={className || ''}>
      <CommentForm eventId={eventId} onCommentAdded={handleCommentAdded} />

      {/* Remove max-h-[600px] overflow-y-auto so comments are not in a fixed box */}
      <div className="py-2 md:py-4">
        <CommentList
          comments={comments}
          isLoading={isLoading}
          onReply={setReplyingTo}
          onDelete={handleDelete}
          replyingTo={replyingTo}
          eventId={eventId}
          onReplyAdded={handleReplyAdded}
          onReplyFailed={handleReplyFailed}
          currentUserWallet={currentUserWallet}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          isFetching={isFetching}
          marketTitle={marketTitle}
          marketImage={marketImage}
        />
      </div>
    </div>
  );
};

export default CommentSection;
