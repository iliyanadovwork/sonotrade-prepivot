export interface CommentUser {
  _id: string;
  username?: string;
  email: string;
  publicKey?: string;
  profilePicture?: string;
}

export interface Comment {
  _id: string;
  userId: CommentUser;
  eventId: string;
  content: string;
  parentId?: string;
  replyToUserId?: CommentUser;
  likesCount: number;
  isLikedByCurrentUser: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommentListProps {
  comments: Comment[];
  isLoading: boolean;
  onReply: (commentId: string) => void;
  onDelete: (commentId: string) => void;
  replyingTo: string;
  eventId: string;
  onReplyAdded: (comment: Comment) => void;
  onReplyFailed?: (optimisticId: string) => void;
  currentUserWallet?: string;
  hasMore: boolean;
  onLoadMore: () => void;
  isFetching: boolean;
}

export interface CommentProps {
  comment: Comment;
  onReply?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
  currentUserWallet?: string;
}

export interface CommentFormProps {
  eventId: string;
  onCommentAdded: (comment: Comment) => void;
}

export interface ReplyFormProps {
  parentId: string;
  eventId: string;
  onReplyAdded: (comment: Comment) => void;
  onReplyFailed?: (optimisticId: string) => void;
  onCancel: () => void;
  comments?: Comment[];
}
