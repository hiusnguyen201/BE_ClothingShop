import mongoose from 'mongoose';
import { NOTIFICATION_TYPE } from '#src/app/notifications/notifications.constant';
const { Schema } = mongoose;

export const NOTIFICATION_MODEL = 'notifications';

const NotificationSchema = new Schema(
  {
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPE),
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      required: false,
      default: {},
    },
  },
  {
    versionKey: false,
    timestamps: true,
    _id: true,
    id: false,
    collection: NOTIFICATION_MODEL,
  },
);

const NotificationModel = mongoose.model('Notification', NotificationSchema);
export { NotificationModel };
