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
// **** ルーティングの定義 (次のステップで作成) ****
// **********************************************

