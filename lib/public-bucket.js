/**
 * @module storj-bridge/server/middleware/public-bucket
 */

'use strict';

module.exports = function PublicBucketFactory(storage){
  const Bucket = storage.models.Bucket;

  /**
   * Checks if the bucket id and operation are public
   * {String} req.params.id - Unique bucket id
   * {String} req.body.operation - Operation to perform
   */
  return function publicBucket(req, res, next) {
    var bucketId = req.params.id;
    var operation = req.body.operation;

    Bucket.findOne({
      _id: req.params.id,
      publicPermissions: { $in: [operation] }
    }, function(err, bucket){
      if(err){
        return next(err);
      }
      if(!bucket){
        return next(new Error('Bucket not found'));
      }
      next(null);
    });

  };

};