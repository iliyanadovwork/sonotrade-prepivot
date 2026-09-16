import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  userId: mongoose.Types.ObjectId;
  eventId: string;
  content: string;
  parentId?: mongoose.Types.ObjectId;
  replyToUserId?: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    eventId: {
      type: String,
      required: [true, 'Event ID is required'],
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    replyToUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    likes: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying by event and time
CommentSchema.index({ eventId: 1, createdAt: -1 });

// Index for finding replies to a comment
CommentSchema.index({ parentId: 1 });

export default mongoose.model<IComment>('Comment', CommentSchema);
