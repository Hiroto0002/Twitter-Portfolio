const mongoose = require('mongoose');

// 投稿の「設計図」を作ります（スキーマ）
const postSchema = new mongoose.Schema({
    // 投稿の本文（内容）
    content: {
        type: String,
        required: true,
        maxlength: 280 // Twitterの文字数制限に合わせて280文字に設定
    },
    // 投稿者：どのユーザーIDが投稿したか（この情報でユーザーと投稿を結びつけます）
    author: {
        type: mongoose.Schema.Types.ObjectId, // これはユーザーのIDを参照するという意味です
        ref: 'User', // 'User'モデルを参照します
        required: true
    },
    // いいねの数（シンプルな例として数値で管理）
    likes: {
        type: Number,
        default: 0
    },
    // 投稿日時
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// モデルを作成し、外部で使えるようにします
module.exports = mongoose.model('Post', postSchema);
