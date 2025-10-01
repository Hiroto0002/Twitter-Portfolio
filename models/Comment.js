const mongoose = require('mongoose');

// コメントの「設計図」を作ります（スキーマ）
const commentSchema = new mongoose.Schema({
    // コメントの本文
    content: {
        type: String,
        required: true,
        maxlength: 140
    },
    // どの投稿へのコメントか（Postモデルを参照）
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    // 誰がコメントしたか（Userモデルを参照）
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // 投稿日時
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Comment', commentSchema);