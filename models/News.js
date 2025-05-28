const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'News title is required'], 
    maxlength: [100, 'Title cannot exceed 100 characters'] 
  },
  content: { 
    type: String, 
    required: [true, 'News content is required'], 
    maxlength: [2000, 'Content cannot exceed 2000 characters'] 
  },
  create_date: { 
    type: Date, 
    required: [true, 'Creation date is required'], 
    default: Date.now 
  },
  author_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Accounts', 
    required: [true, 'Author ID is required'] 
  },
  status: { 
    type: String, 
    required: [true, 'Status is required'], 
    enum: {
      values: ['active', 'archived'],
      message: 'Status must be either active or archived'
    },
    default: 'active'
  },
  imageURL: { 
    type: String, 
    validate: {
      validator: function(v) {
        return !v || /^(http|https):\/\/[^ "]+$/.test(v);
      },
      message: 'Image URL must be a valid URL'
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('News', NewsSchema);