import mongoose from 'mongoose';
const { Schema } = mongoose;

export const USER_NOTIFICATION_MODEL = 'user_notification';

export const UserNotificationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notification: {
      type: Schema.Types.ObjectId,
      ref: 'Notification',
      required: true,
    },
    isRead: {
      type: Boolean,
      required: false,
      default: false,
    },
    readAt: {
      type: Date,
      required: false,
      default: null,
    },
    deliveredAt: {
      type: Date,
      required: true,
      default: new Date(),
    },
  },
  {
    _id: true,
    id: false,
    collection: USER_NOTIFICATION_MODEL,
    versionKey: false,
    timestamps: true,
  },
);

const UserNotificationModel = mongoose.model('User_Notification', UserNotificationSchema);
export { UserNotificationModel };
