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

// 全投稿を取得する API のエンドポイント
// ログインは不要なので、認証ミドルウェア (auth) は使いません。
app.get('/api/posts', async (req, res) => {
    try {
        // 1. データベースからすべての投稿を取得します。
        // .find({}) で全てのデータを探します。
        // .populate('author', 'username') で、投稿者のID (author) から Userモデルを参照し、
        // ユーザー名 (username) だけを取得して投稿データに含めます。
        // .sort({ createdAt: -1 }) で、新しい投稿が一番上に来るように降順で並べ替えます。
        const posts = await Post.find({})
            .populate('author', 'username') 
            .sort({ createdAt: -1 });
        
        // 2. 取得した投稿データを JSON 形式でブラウザに返します。
        res.json(posts);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('サーバーエラー: 投稿の取得に失敗しました。');
    }
});

// ... (投稿取得 API のコードは省略) ...

// コメントモデルを読み込みます
const Comment = require('./models/Comment');

// コメント投稿 API のエンドポイント
// POST /api/posts/:postId/comments の形式でアクセスされます
app.post('/api/posts/:postId/comments', auth, async (req, res) => {
    try {
        const { content } = req.body;
        const postId = req.params.postId; // URLから投稿IDを取得

        // 投稿が存在するか確認（任意だが推奨）
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ msg: '投稿が見つかりません。' });
        }

        // 新しいコメントを作成し、データベースに保存
        const newComment = new Comment({
            content,
            post: postId,         // どの投稿へのコメントか
            author: req.user.id   // ログインユーザーのID
        });

        const comment = await newComment.save();
        
        // 成功した応答として、作成されたコメントを返します
        res.json(comment);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('サーバーエラー: コメント投稿に失敗しました。');
    }
});

// いいね API のエンドポイント
// PUT /api/posts/:postId/like の形式でアクセスされます
app.put('/api/posts/:postId/like', auth, async (req, res) => {
    try {
        const postId = req.params.postId;

        // 投稿を探し、likesの数を1増やす
        const post = await Post.findByIdAndUpdate(
            postId,
            { $inc: { likes: 1 } }, // $incは「インクリメント（1増やす）」という意味のMongoDBの演算子です
            { new: true }           // 更新後のドキュメントを返すように指定
        )
        .populate('author', 'username'); // 更新後の投稿データにユーザー名も一緒に含める

        if (!post) {
            return res.status(404).json({ msg: '投稿が見つかりません。' });
        }

        // 成功した応答として、いいねが増えた投稿データを返します
        res.json(post);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('サーバーエラー: いいね処理に失敗しました。');
    }
});

// ユーザープロフィール取得 API のエンドポイント
// GET /api/users/:username の形式でアクセスされます
app.get('/api/users/:username', async (req, res) => {
    try {
        const profileUsername = req.params.username; // URLからユーザー名を取得
        console.log(`[Profile API] ユーザー名を取得しました: "${profileUsername}"`);
        
        // 1. ユーザー名でデータベースからユーザー情報を取得
        const user = await User.findOne({ username: profileUsername }).select('-password'); // パスワードは返さない
        if (!user) {
            return res.status(404).json({ msg: 'ユーザーが見つかりません。' });
        }

        // 2. そのユーザーIDに紐づく投稿を全て取得
        const posts = await Post.find({ author: user._id })
            .populate('author', 'username') // 投稿者名も一緒に取得
            .sort({ createdAt: -1 });

        // 3. ユーザー情報とその投稿一覧を JSON で返します
        res.json({
            user: {
                id: user._id,
                username: user.username,
                createdAt: user.createdAt
            },
            posts: posts
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('サーバーエラー: プロフィール情報の取得に失敗しました。');
    }
});


