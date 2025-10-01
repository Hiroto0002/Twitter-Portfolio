// .envファイルから環境変数を読み込みます
require('dotenv').config();

// Expressというツールを使えるように読み込みます
const express = require('express');

// Node.jsの標準機能で、ファイルパスを扱うための'path'モジュールを読み込みます
const path = require('path'); 

// Mongooseを読み込みます
const mongoose = require('mongoose');

// Expressの機能を使ってサーバー（アプリ）を作ります
const app = express();

// サーバーを起動するポート番号を決めます
const PORT = 3000;

// **********************************************
// **** ここから新しく追加・修正する部分です ****
// **********************************************

// **********************************************
// **** フォームデータの受け取り設定を追加 (New!) ****
// **********************************************

// フォームで送信されたデータをJavaScriptのオブジェクトとして解析できるようにします
app.use(express.urlencoded({ extended: true }));
// JSON形式のデータも受け取れるようにします
app.use(express.json());

// **********************************************
// **********************************************



// MongoDB Atlasから取得した接続URLをここに貼り付けます
// 🚨 <username>と<password>、<dbname>を、あなたが設定した値に置き換えてください！
const DB_URL = 'mongodb+srv://Hiro:1tOkU1jt2YyaldzN@cluster0.pkspjnj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
// データベースに接続
mongoose.connect(DB_URL)
    .then(() => {
        console.log('✅ MongoDBへの接続に成功しました！');
    })
    .catch(err => {
        console.error('❌ MongoDB接続エラー:', err);
    });

// **********************************************
// **********************************************

// 静的ファイルを配信するための設定
// app.use() は「すべてのリクエストでこれを使ってね」という意味です。
// express.static() は、指定したフォルダの中のファイルをブラウザに公開する機能です。
app.use(express.static(path.join(__dirname, 'public')));

// 以前の「Hello World!」の設定は削除またはコメントアウトします。
/*
app.get('/', (req, res) => {
  res.send('Hello World! これが私の作った最初のサーバーです！');
});
*/

// **********************************************
// **********************************************

// サーバーを指定したポート番号で起動します
app.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`);
  console.log('ブラウザでこのアドレスにアクセスしてみてください。');
});

// 静的ファイルを配信するための設定 (変更なし)
app.use(express.static(path.join(__dirname, 'public')));

// サーバーを指定したポート番号で起動します (変更なし)
app.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`);
});

// **********************************************
// ****   ルーティングの定義   ****
// **********************************************

// モデルを読み込みます
const User = require('./models/User');
// パスワード暗号化ツールを読み込みます
const bcrypt = require('bcryptjs');

// ユーザー登録 API のエンドポイント
// ユーザーがフォームから登録情報を POST で送信すると、この処理が実行されます。
app.post('/register', async (req, res) => {
    try {
        // フォームから送られたデータ（ユーザー名とパスワード）を受け取ります
        const { username, password } = req.body;

        // 1. ユーザー名の重複チェック
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).send('ユーザー名は既に使用されています。');
        }

        // 2. パスワードの暗号化
        // 10は暗号化の強度（コスト）で、高いほど安全ですが処理時間は長くなります
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. データベースに新しいユーザーを保存
        const newUser = new User({
            username,
            password: hashedPassword // 暗号化されたパスワードを保存
        });

        await newUser.save();

        // 成功時の応答
        res.status(201).send('ユーザー登録が完了しました！');

    } catch (err) {
        console.error(err);
        res.status(500).send('サーバーエラーが発生しました。');
    }
});

// ... (ユーザー登録APIのコードは省略) ...

// JWTを読み込みます
const jwt = require('jsonwebtoken');

// ユーザーログイン API のエンドポイント
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. ユーザー名でデータベースからユーザーを探す
        const user = await User.findOne({ username });
        if (!user) {
            // ユーザーが見つからない場合はエラー
            return res.status(400).send('ユーザー名またはパスワードが間違っています。');
        }

        // 2. パスワードの照合（フォームのパスワード vs DBの暗号化されたパスワード）
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // パスワードが一致しない場合はエラー
            return res.status(400).send('ユーザー名またはパスワードが間違っています。');
        }

        // 3. ログイン成功！ JWT（チケット）を作成
        const payload = {
            user: {
                id: user.id // ユーザーIDをチケットに含める
            }
        };

        // 秘密鍵を使ってチケット（トークン）を発行します
        jwt.sign(
            payload,
            process.env.JWT_SECRET, // .envファイルから秘密鍵を取得
            { expiresIn: '1h' }, // チケットの有効期限は1時間
            (err, token) => {
                if (err) throw err;
                // 成功した応答として、チケット（トークン）をブラウザに返します
                res.json({ token, message: 'ログインに成功しました！' });
            }
        );

    } catch (err) {
        console.error(err);
        res.status(500).send('サーバーエラーが発生しました。');
    }
});

　// ... (ログインAPIのコードは省略) ...

// 認証ミドルウェアを読み込みます
const auth = require('./middleware/auth');

// ----------------------------------------------------
// ステップ 7: 投稿機能の実装（次に行う作業）
// ----------------------------------------------------

// 投稿モデルも読み込みます
const Post = require('./models/Post');

// 投稿作成API
// ここで auth を使うことで、「ログインしているユーザーしかアクセスできない」ようになります
app.post('/api/posts', auth, async (req, res) => {
    // 認証ミドルウェアが通れば、req.userにログインユーザーの情報が入っています
    try {
        const newPost = new Post({
            content: req.body.content,
            author: req.user.id // ログインユーザーのIDを投稿者として記録
        });

        const post = await newPost.save();
        res.json(post);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('サーバーエラー');
    }
});