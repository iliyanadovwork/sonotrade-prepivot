'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CommentProps, ReplyFormProps } from '@/types/comments';
import { Trash2, MessageCircle, ArrowLeft, Heart, X } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { useAuth } from '@/lib/context/AuthContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const gf = new GiphyFetch('IWgtAtuxJnea1tRbdy4nVnEjW96RrWSj');

// Helper to extract GIF URLs from content
const extractGifUrls = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+\.gif)/g;
  return text.match(urlRegex) || [];
};

// Helper to remove GIF URLs from content
const removeGifUrls = (text: string) => {
  return text.replace(/https?:\/\/[^\s]+\.gif/g, '').trim();
};

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
};

export const Comment: React.FC<CommentProps> = ({
  comment,
  onReply,
  onDelete,
  currentUserWallet,
}) => {
  const { isAuthenticated } = useAuth();
  const isOwner = currentUserWallet && comment.userId?.publicKey === currentUserWallet;
  const displayName = comment.userId?.username || comment.userId?.publicKey?.slice(0, 8) || 'Anonymous';
  const isReply = !!comment.parentId;

  const gifUrls = extractGifUrls(comment.content);
  const textContent = removeGifUrls(comment.content);

  // Likes state
  const [likesCount, setLikesCount] = useState(comment.likesCount || 0);
  const [isLiked, setIsLiked] = useState(comment.isLikedByCurrentUser || false);
  const [isLiking, setIsLiking] = useState(false);

  // Update state when comment prop changes
  useEffect(() => {
    setLikesCount(comment.likesCount || 0);
    setIsLiked(comment.isLikedByCurrentUser || false);
  }, [comment.likesCount, comment.isLikedByCurrentUser]);

  const handleLike = async () => {
    if (!isAuthenticated || isLiking) return;

    setIsLiking(true);
    try {
      if (isLiked) {
        const result = await apiClient.unlikeComment(comment._id);
        if (result.success) {
          setIsLiked(false);
          setLikesCount(result.likes);
        }
      } else {
        const result = await apiClient.likeComment(comment._id);
        if (result.success) {
          setIsLiked(true);
          setLikesCount(result.likes);
        }
      }
    } catch (error) {
      console.error('Error liking/unliking comment:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const profilePicture = comment.userId?.profilePicture;
  const isProfilePictureUrl = profilePicture && (profilePicture.startsWith('http://') || profilePicture.startsWith('https://'));

  return (
    <div className="py-1">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-white flex items-center justify-center text-gray-900 font-bold text-lg select-none overflow-hidden">
          {isProfilePictureUrl ? (
            <img
              src={profilePicture}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            profilePicture ||
            comment.userId?.username?.charAt(0).toUpperCase() ||
            comment.userId?.publicKey?.charAt(0).toUpperCase() ||
            "?"
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className={isReply ? "bg-[#0a0a0a] rounded-lg px-4 pt-3 pb-1" : ""}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs sm:text-[13px] font-semibold text-white truncate">
                {displayName}
              </span>
              <span className="text-[10px] sm:text-xs text-[#7a7a7a] flex-shrink-0">
                {formatTimeAgo(comment.createdAt)}
              </span>
            </div>
            {textContent && (
              <p className="text-[12px] sm:text-[13px] text-white break-words whitespace-pre-wrap mb-2 leading-relaxed">
                {textContent}
              </p>
            )}
            {gifUrls.length > 0 && (
              <div className="flex flex-col gap-2 mt-1">
                {gifUrls.map((url, i) => (
                  <img key={i} src={url} alt="GIF" className="rounded max-w-xs" />
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 mt-3 mb-4">
            <button
              onClick={handleLike}
              disabled={!isAuthenticated || isLiking}
              className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                isLiked
                  ? 'text-red-500 hover:text-red-600'
                  : 'text-[#7a7a7a] hover:text-white'
              } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Heart
                className="w-[18px] h-[18px]"
                fill={isLiked ? 'currentColor' : 'none'}
              />
              {likesCount > 0 && (
                <span className="text-xs font-medium">{likesCount}</span>
              )}
            </button>
            {onReply && (
              <button
                onClick={() => onReply(comment._id)}
                className="flex items-center text-[#7a7a7a] hover:text-white transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            )}
            {isOwner && onDelete && (
              <button
                onClick={() => onDelete(comment._id)}
                className="flex items-center text-[#7a7a7a] hover:text-white transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ReplyModalProps extends ReplyFormProps {
  parentComment: any;
  marketTitle?: string;
  marketImage?: string;
}

export const ReplyForm: React.FC<ReplyModalProps> = ({
  parentId,
  eventId,
  onReplyAdded,
  onReplyFailed,
  onCancel,
  parentComment,
  marketTitle,
  marketImage,
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifResults, setGifResults] = useState<any[]>([]);
  const [gifSearch, setGifSearch] = useState('');
  const [selectedGif, setSelectedGif] = useState<string | null>(null);
  const [isClosingGifPicker, setIsClosingGifPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '27px';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if ((!content.trim() && !selectedGif)) return;

    const combinedContent = selectedGif ? `${content.trim()}\n${selectedGif}`.trim() : content.trim();

    // Create optimistic reply with current user's info
    const optimisticId = `temp-${Date.now()}`;
    const optimisticReply = {
      _id: optimisticId,
      content: combinedContent,
      userId: user || parentComment.userId, // Use current user's info
      eventId,
      parentId,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      isLikedByCurrentUser: false,
    };

    // Immediately add reply to UI
    onReplyAdded(optimisticReply as any);
    setContent('');
    setSelectedGif(null);
    onCancel();

    // Make API call in background
    try {
      const data = await apiClient.postComment(eventId, combinedContent, parentId);

      if (data.success && data.comment) {
        // Replace optimistic reply with real one from server
        onReplyAdded(data.comment);
      } else {
        // API call succeeded but returned failure - remove optimistic reply
        if (onReplyFailed) {
          onReplyFailed(optimisticId);
        }
      }
    } catch (error) {
      console.error('Reply error:', error);
      // Remove the optimistic reply on error
      if (onReplyFailed) {
        onReplyFailed(optimisticId);
      }
    }
  };

  const handleGifSearch = async (query: string) => {
    const { data } = await gf.search(query, { limit: 10 });
    setGifResults(data);
  };

  const handleGifSelect = (gifUrl: string) => {
    setSelectedGif(gifUrl);
    setShowGifPicker(false);
  };

  const handleCloseGifPicker = () => {
    setIsClosingGifPicker(true);
    setTimeout(() => {
      setShowGifPicker(false);
      setIsClosingGifPicker(false);
    }, 200);
  };

  const maxLength = 500;
  const remainingChars = maxLength - content.length;

  const displayName = parentComment.userId?.username || parentComment.userId?.publicKey?.slice(0, 8) || 'Anonymous';
  const parentProfilePicture = parentComment.userId?.profilePicture;
  const isParentProfilePictureUrl = parentProfilePicture && (parentProfilePicture.startsWith('http://') || parentProfilePicture.startsWith('https://'));

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="p-0 bg-[#000000] border border-[rgba(255,255,255,0.1)]">
        {/* Header with back button */}
        <div className="p-2 border-b border-[#262626]">
          <button
            onClick={onCancel}
            className="p-1.5 hover:bg-[#262626] rounded transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-3 sm:p-2">
          {/* Market Info */}
          {marketTitle && (
            <div className="flex items-center gap-3 mb-3">
              {marketImage && (
                <img
                  src={marketImage}
                  alt=""
                  className="w-12 h-12 rounded-md object-cover"
                />
              )}
              <span className="text-[15px] font-semibold text-white">
                {marketTitle}
              </span>
            </div>
          )}

          {/* Original Comment */}
          <div className="mb-2 flex gap-4 border-b border-[#262626] pb-3">
            <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-white flex items-center justify-center text-gray-900 font-bold text-lg select-none overflow-hidden">
              {isParentProfilePictureUrl ? (
                <img
                  src={parentProfilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                parentProfilePicture || displayName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs sm:text-[13px] font-semibold text-white truncate">{displayName}</span>
                <span className="text-[10px] sm:text-xs text-[#7a7a7a] flex-shrink-0">
                  {formatTimeAgo(parentComment.createdAt)}
                </span>
              </div>
              <div className="mb-0.5 break-words">
                <span className="text-[15px] text-white">{removeGifUrls(parentComment.content)}</span>
                {extractGifUrls(parentComment.content).length > 0 && (
                  <div className="flex flex-col gap-2 mt-2">
                    {extractGifUrls(parentComment.content).map((url, i) => (
                      <img key={i} src={url} alt="GIF" className="rounded max-w-xs" />
                    ))}
                  </div>
                )}
              </div>
              <span className="text-[13px] text-[#7a7a7a]">
                Replying to <span className="text-white">@{displayName}</span>
              </span>
            </div>
          </div>

          {/* Reply Form */}
          <form onSubmit={handleSubmit} className="mt-2">
            <div className="mb-2">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Post your reply"
                className="text-base font-normal w-full border-0 outline-0 p-2 bg-transparent placeholder:text-[#7a7a7a] text-white resize-none rounded"
                disabled={isSubmitting}
                maxLength={maxLength}
                style={{ height: '48px', minHeight: '48px' }}
                rows={6}
              />
              {selectedGif && (
                <div className="mt-2">
                  <img src={selectedGif} alt="Selected GIF" className="rounded max-w-xs" />
                </div>
              )}
            </div>

            {/* Bottom bar */}
            <div className="flex items-center justify-between pt-2">
              <div>
                {selectedGif ? (
                  <button
                    type="button"
                    className="text-[#7a7a7a] text-xs font-semibold hover:underline p-0 bg-transparent cursor-pointer"
                    onClick={() => setSelectedGif(null)}
                  >
                    Delete GIF
                  </button>
                ) : (
                  <button
                    type="button"
                    className="text-[15px] font-medium text-white hover:opacity-80 p-1.5 bg-transparent cursor-pointer"
                    onClick={() => setShowGifPicker(true)}
                  >
                    GIF
                  </button>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[13px] text-[#7a7a7a]">
                  {remainingChars} left
                </span>
                <div style={{ width: '80px' }}>
                  <button
                    type="submit"
                    disabled={isSubmitting || (!content.trim() && !selectedGif)}
                    className="w-full py-1 px-1.5 min-w-[60px] min-h-[40px] bg-white text-black rounded-md text-[13px] font-medium hover:opacity-80 active:scale-90 transition-all duration-75 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? 'Replying...' : 'Reply'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* GIF Picker Modal */}
        {showGifPicker && (
          <div
            className={`fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 ${
              isClosingGifPicker ? 'animate-out fade-out duration-200' : 'animate-in fade-in duration-200'
            }`}
            onClick={handleCloseGifPicker}
          >
            <div
              className={`bg-[#000000] border border-[rgba(255,255,255,0.1)] rounded-lg p-4 w-[400px] max-w-full ${
                isClosingGifPicker ? 'animate-out fade-out zoom-out-95 duration-200' : 'animate-in fade-in zoom-in-95 duration-200'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[15px] font-semibold text-white">Search GIFs</span>
                <button type="button" className="text-[#7a7a7a] hover:text-white transition-colors cursor-pointer" onClick={handleCloseGifPicker}>
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="text"
                  value={gifSearch}
                  onChange={e => setGifSearch(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleGifSearch(gifSearch); } }}
                  placeholder="Search GIFs..."
                  className="flex-1 px-3 py-2 rounded-md bg-[#171717] border border-[rgba(255,255,255,0.1)] text-white text-sm placeholder-[#7a7a7a] focus:outline-none focus:ring-1 focus:ring-white"
                />
                <button type="button" className="px-3 py-2 bg-white text-black rounded-md text-[13px] font-medium hover:opacity-80 active:scale-90 transition-all duration-75 cursor-pointer" onClick={() => handleGifSearch(gifSearch)}>
                  Search
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                {gifResults.map((gif: any) => (
                  <img
                    key={gif.id}
                    src={gif.images.fixed_height_small.url}
                    alt={gif.title}
                    className="rounded cursor-pointer hover:opacity-80"
                    onClick={() => handleGifSelect(gif.images.fixed_height.url)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
