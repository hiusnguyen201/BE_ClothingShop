import mongoose from 'mongoose';

const SoftDelete = (schema) => {
  schema.add({
    removedAt: { type: Date, default: null },
    isRemoved: { type: Boolean, default: false },
    removedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  });

  schema.pre(['find', 'findOne', 'findById', 'findOneAndUpdate', 'update', 'countDocuments', 'aggregate'], function () {
    this.where({ isRemoved: false });
  });

  schema.statics.findByIdAndSoftDelete = function (id, removerId) {
    return this.findByIdAndUpdate(
      id,
      {
        isRemoved: true,
        removedAt: new Date(),
        removedBy: removerId,
      },
      { new: true },
    );
  };
};

export default SoftDelete;
