// import mongoose from 'mongoose';

const SoftDelete = (schema) => {
  schema.add({
    isRemoved: { type: Boolean, default: false },
    removedAt: { type: Date, default: null },
    // removedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  });

  schema.pre(['find', 'findOne', 'findById', 'findOneAndUpdate', 'countDocuments'], function () {
    if (!this.options || !this.options.withRemoved) {
      this.where({ isRemoved: false });
    }
  });

  schema.pre('aggregate', function () {
    if (!this.options || !this.options.withRemoved) {
      const pipeline = this.pipeline();

      pipeline.unshift({ $match: { isRemoved: false } });

      for (const stage of pipeline) {
        if (stage.$lookup && Array.isArray(stage.$lookup.pipeline)) {
          const hasIsRemovedMatch = stage.$lookup.pipeline.some((p) => p.$match && 'isRemoved' in p.$match);

          if (!hasIsRemovedMatch) {
            stage.$lookup.pipeline.unshift({ $match: { isRemoved: false } });
          }
        }
      }
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
