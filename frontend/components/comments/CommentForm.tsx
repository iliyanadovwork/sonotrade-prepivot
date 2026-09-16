'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CommentFormProps } from '@/types/comments';
import { useAuth } from '@/lib/context/AuthContext';
import { apiClient } from '@/lib/api/client';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { X } from 'lucide-react';

const gf = new GiphyFetch('IWgtAtuxJnea1tRbdy4nVnEjW96RrWSj');

const CommentForm: React.FC<CommentFormProps> = ({ eventId, onCommentAdded }) => {
  const { isAuthenticated } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
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

    if ((!content.trim() && !selectedGif) || !isAuthenticated) return;

    try {
      setIsSubmitting(true);
      setError('');

      // Combine text and gif for submission
      const combinedContent = selectedGif ? `${content.trim()}\n${selectedGif}`.trim() : content.trim();
      const data = await apiClient.postComment(eventId, combinedContent);

      if (data.success && data.comment) {
        onCommentAdded(data.comment);
        setContent('');
        setSelectedGif(null);
      }
    } catch (error) {
      console.error('Comment error:', error);
      setError(error instanceof Error ? error.message : 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
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

  return (
    <form onSubmit={handleSubmit} className="py-2 md:py-4">
      <div className="border border-[#262626] rounded-lg p-4">
        {/* Textarea container */}
        <div className="w-full">
          <label className="block w-full cursor-text" htmlFor="comment-input">
            <div className="flex flex-col w-full">
              <span className="flex items-center">
                <textarea
                  ref={textareaRef}
                  id="comment-input"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={isAuthenticated ? "What's your prediction?" : "Sign in to comment"}
                  className="text-base font-normal w-full border-0 outline-0 p-0 bg-transparent placeholder:text-[#7a7a7a] text-white resize-none"
                  disabled={isSubmitting || !isAuthenticated}
                  maxLength={maxLength}
                  style={{ height: '27px', minHeight: '27px' }}
                />
              </span>
              {selectedGif && (
                <div className="mt-2 inline-block">
                  <img src={selectedGif} alt="Selected GIF" className="rounded max-w-xs" />
                </div>
              )}
            </div>
          </label>
        </div>
        {/* Bottom bar with GIF button, character count and Post button */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2">
            {selectedGif ? (
              <button type="button" className="text-[#7a7a7a] text-xs font-semibold hover:underline p-0 bg-transparent shadow-none cursor-pointer" onClick={() => setSelectedGif(null)}>
                Delete GIF
              </button>
            ) : (
              <button type="button" className="text-[#7a7a7a] text-xs font-semibold hover:underline p-0 bg-transparent shadow-none cursor-pointer" onClick={() => setShowGifPicker(true)}>
                GIF
              </button>
            )}
            {error && (
              <span className="text-red-500 text-[13px]">{error}</span>
            )}
          </div>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-[#7a7a7a] text-[13px]">
              {remainingChars} left
            </span>
            <div style={{ width: '80px' }}>
              <button
                type="submit"
                disabled={isSubmitting || (!content.trim() && !selectedGif) || !isAuthenticated}
                className="w-full py-1 px-1.5 min-w-[60px] min-h-[40px] bg-white text-black rounded-md text-[13px] font-medium hover:opacity-80 active:scale-90 transition-all duration-75 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
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
    </form>
  );
};

export default CommentForm;
