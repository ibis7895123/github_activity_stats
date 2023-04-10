# GitHub Activity Stats
GitHub の統計情報を取得する Goole App Scripts 群

## 取得できる情報
- マージされた Pull Request
  - 直近 100 件を取得

## 処理の流れ
1. GitHub API で 指定したリポジトリの merged pull request を取得
2. 取得した情報をスプレッドシートに書き込み
3. (スプレッドシート側でデータをグラフ化)
4. 指定したグラフを画像にして slack に post

## 前提とするスプレッドシートの形式について
- `pullsRawData`という名前のシートがあること
  - ここに merged pull request の情報が書き込まれる
- 1行目はヘッダー想定で、書き込みは2行目から
- ヘッダーは以下を想定

| A | B | C | D |
| -- | -- | -- | -- |
| mergedAt | repoName | id | title |

- グラフが1つだけある

## スクリプトプロパティに必要な秘匿情報
- **githubIdTokenBase64**
  - GitHub の `user:pass` を base64 にエンコードしたもの
- **slackToken**
  - slack に post するために slack bot を使用する前提だが、その bot の `bot tokens`
  - see: https://api.slack.com/authentication/token-types#bot
- **slackChannelId**
  - post 先の slack channel id

