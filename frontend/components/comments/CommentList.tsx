'use client';

import React, { useRef, useCallback } from 'react';
import Image from 'next/image';
import { CommentListProps } from '@/types/comments';
import { Comment, ReplyForm } from './Comment';
import { FadeIn } from '@/components/FadeIn';

interface ExtendedCommentListProps extends CommentListProps {
  marketTitle?: string;
  marketImage?: string;
}

const CommentList: React.FC<ExtendedCommentListProps> = ({
  comments,
  isLoading,
  onReply,
  onDelete,
  replyingTo,
  eventId,
  onReplyAdded,
  onReplyFailed,
  currentUserWallet,
  hasMore,
  onLoadMore,
  isFetching,
  marketTitle,
  marketImage,
}) => {
  const observer = useRef<IntersectionObserver | null>(null);

  const lastCommentRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetching) {
          onLoadMore();
        }
      });

      if (node) observer.current.observe(node);
    },
    [hasMore, isFetching, onLoadMore]
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div
          style={{
            animation: 'pulsate 2s ease-in-out infinite',
          }}
        >
          <Image
            src="/st-glyph.png"
            alt="Loading"
            width={48}
            height={48}
            priority
          />
        </div>
        <style jsx>{`
          @keyframes pulsate {
            0%, 100% {
              opacity: 0.3;
              transform: scale(1);
            }
            50% {
              opacity: 1;
              transform: scale(1.05);
            }
          }
        `}</style>
      </div>
    );
  }

  const topLevelComments = comments.filter((c) => !c.parentId);

  if (topLevelComments.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className="space-y-0">
      {topLevelComments.map((comment, index) => {
        const isLast = index === topLevelComments.length - 1;
        const repliesForComment = comments.filter((reply) => reply.parentId === comment._id) || [];

        return (
          <FadeIn key={comment._id} delay={index * 50}>
            <div ref={isLast ? lastCommentRef : null}>
            <Comment
              comment={comment}
              onReply={onReply}
              onDelete={onDelete}
              currentUserWallet={currentUserWallet}
            />

            {replyingTo === comment._id && (
              <ReplyForm
                parentId={comment._id}
                eventId={eventId}
                onReplyAdded={onReplyAdded}
                onReplyFailed={onReplyFailed}
                onCancel={() => onReply('')}
                parentComment={comment}
                marketTitle={marketTitle}
                marketImage={marketImage}
              />
            )}

            {repliesForComment.length > 0 && (
              <div className="ml-10 pl-4 mt-2">
                {repliesForComment.map((reply) => (
                  <div key={reply._id}>
                    <Comment
                      comment={reply}
                      onReply={onReply}
                      onDelete={onDelete}
                      currentUserWallet={currentUserWallet}
                    />
                    {replyingTo === reply._id && (
                      <ReplyForm
                        parentId={reply._id}
                        eventId={eventId}
                        onReplyAdded={onReplyAdded}
                        onReplyFailed={onReplyFailed}
                        onCancel={() => onReply('')}
                        parentComment={reply}
                        marketTitle={marketTitle}
                        marketImage={marketImage}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
            </div>
          </FadeIn>
        );
      })}

      {isFetching && (
        <div className="flex justify-center items-center py-4">
          <div
            style={{
              animation: 'pulsate 2s ease-in-out infinite',
            }}
          >
            <Image
              src="/st-glyph.png"
              alt="Loading"
              width={32}
              height={32}
            />
          </div>
          <style jsx>{`
            @keyframes pulsate {
              0%, 100% {
                opacity: 0.3;
                transform: scale(1);
              }
              50% {
                opacity: 1;
                transform: scale(1.05);
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default CommentList;
