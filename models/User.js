// Mongooseを読み込みます
const mongoose = require('mongoose');

// ユーザーの「設計図」を作ります（スキーマ）
const userSchema = new mongoose.Schema({
    // ユーザー名：必ず必要で、重複は許されません
    username: {
        type: String,
        required: true,
        unique: true
    },
    // パスワード：必ず必要です
    password: {
        type: String,
        required: true
    },
    // 登録日時：自動的に記録します
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// スキーマから「モデル」（データベースで実際に使う道具）を作成し、外部で使えるようにします
module.exports = mongoose.model('User', userSchema);