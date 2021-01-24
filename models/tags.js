const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TagSchema = new Schema({
  tag_name: {
    type: String,
  },
  tag_url: {
    type: String
  },
  tag_owner: {
    type: Schema.Types.Mixed,
  },
  tag_room: {
    type: Number
  },
  is_public: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Number
  },
});

const Model = mongoose.model('Tag', TagSchema);

module.exports = Model;