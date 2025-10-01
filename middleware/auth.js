const jwt = require('jsonwebtoken');

// 認証チェックを行うための関数
module.exports = function(req, res, next) {
    // 1. チケット（トークン）がどこにあるかを確認
    // 通常、ブラウザからサーバーに送られるヘッダーの中に含まれています
    const token = req.header('x-auth-token');

    // 2. チケットがない場合 (ログインしていない場合)
    if (!token) {
        return res.status(401).json({ msg: '認証トークンがありません。アクセス拒否。' });
    }

    try {
        // 3. チケットが有効か検証する
        // 秘密鍵を使って、チケットが本物で、有効期限が切れていないか確認します
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. 検証が成功したら、チケットの中に入っているユーザー情報をリクエストに追加
        // これで、他のAPIで「誰がリクエストしたか」がわかるようになります
        req.user = decoded.user;
        
        // 5. 次の処理（実際のAPIロジック）に進む
        next();
    } catch (err) {
        // 4. チケットが無効な場合（期限切れ、改ざんなど）
        res.status(401).json({ msg: 'トークンが無効です。' });
    }
};