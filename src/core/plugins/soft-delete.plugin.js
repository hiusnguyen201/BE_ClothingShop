import MongooseDelete from 'mongoose-delete';

const SoftDelete = (schema) => {
  schema.plugin(MongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all',
  });

  schema.statics.findByIdAndSoftDelete = function (id) {
    return this.findByIdAndUpdate(
      id,
      {
        deleted: true,
        deletedAt: new Date(),
      },
      { new: true },
    );
  };
};

export default SoftDelete;
