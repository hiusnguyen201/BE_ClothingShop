import mongoose from 'mongoose';

const SoftDelete = (schema) => {
  schema.add({
    removedAt: { type: Date, default: null },
    isRemoved: { type: Boolean, default: false },
    removedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  });

  schema.pre(['find', 'findOne', 'findById', 'findOneAndUpdate', 'countDocuments'], function () {
    if (!this.options || !this.options.withRemoved) {
      this.where({ isRemoved: false });
    }
  });

  schema.statics.findByIdAndSoftDelete = function (id) {
    return this.findByIdAndUpdate(
      id,
      {
        isRemoved: true,
        removedAt: new Date(),
      },
      { new: true },
    );
  };
};

export default SoftDelete;
