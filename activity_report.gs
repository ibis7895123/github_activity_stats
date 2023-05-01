// 全体的にこれを参考にしてる
// https://qiita.com/erikaadno/items/9c42b7b0409bdfffd9cf
const GITHUB_ID_TOKEN_BASE64  = PropertiesService.getScriptProperties().getProperty("githubIdTokenBase64")
const GITLAB_PAT  = PropertiesService.getScriptProperties().getProperty("gitlabPAT")
const GITHUB_REPO_NAMES = [
  "xxx",
]
const GITLAB_PROJECTS = [
  {
    id: 1,
    name: "xxx",
  }
]
let PULLS_ROW_NOW = 2 // 書き込みスタート行 (1行目はヘッダーなので2行目から書き込み)
const PER_PAGE = 100 // github の PR 取得 API のページ制限の最大値

function activity_report_main() {
  updatePullsRawData("pullsRawData")
  postPullsGraphImage()
}

// スプレッドシートの内容を更新
function updatePullsRawData(sheetName) {
  GITHUB_REPO_NAMES.map((repoName)=> {
    const pulls = getGithubPulls(repoName).data

    // スプシに書き込み
    pulls.map((pull) => {
      writeSpreadSheet('A', PULLS_ROW_NOW, pull.mergedAt, sheetName)
      writeSpreadSheet('B', PULLS_ROW_NOW, pull.repoName, sheetName)
      writeSpreadSheet('C', PULLS_ROW_NOW, pull.id, sheetName)
      writeSpreadSheet('D', PULLS_ROW_NOW, pull.title, sheetName)

      // 書き込み行を移動
      PULLS_ROW_NOW += 1
    })
  })

  GITLAB_PROJECTS.map((project)=> {
    const requests = getGitlabMergeRequests(project).data

      // スプシに書き込み
    requests.map((request) => {
      writeSpreadSheet('A', PULLS_ROW_NOW, request.mergedAt, sheetName)
      writeSpreadSheet('B', PULLS_ROW_NOW, request.repoName, sheetName)
      writeSpreadSheet('C', PULLS_ROW_NOW, request.id, sheetName)
      writeSpreadSheet('D', PULLS_ROW_NOW, request.title, sheetName)

      // 書き込み行を移動
      PULLS_ROW_NOW += 1
    })
  })
}

// グラフをslackにPOST
function postPullsGraphImage() {
  // スプシから画像を取得
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID)
  const sheet = spreadsheet.getSheetByName(STATS_SHEET_NAME)
  const filename = "github_activity.png"
  const graph = sheet.getCharts()[0] // 1つ目のグラフ
    .getBlob().getAs('image/png').setName(filename)

  // 画像をslackにPOST
  postBlob2Slack(
    "Merged Pull Requests",
    "マージされたPull Request: 週毎に集計。",
    filename,
    graph
  )
}

function getGithubPulls(repoName, page=1) {
  const options = {
    'method': 'GET',
    'headers' : {
      "Accept": "application/vnd.github+json",
      "Authorization": "Basic " + GITHUB_ID_TOKEN_BASE64,
      'X-GitHub-Api-Version': '2022-11-28',
    }
  }

  // 過去 100 件の閉じられた PR 取得
  // see: https://docs.github.com/ja/rest/pulls/pulls?apiVersion=2022-11-28#list-pull-requests
  let response = UrlFetchApp.fetch(
    `https://api.github.com/repos/giftee/${repoName}/pulls?state=closed&per_page=${PER_PAGE}&page=${page}`,
    options
  )
  response = JSON.parse(response.getContentText())
  // console.log(response[0])

  // close された pr と merged_at がないものを除外する。
  // close されたものは mergeAt が1970年になるっぽい
  filteredResponse = response.filter((pull) =>
    pull.merged_at != null && pull.merged_at?.substr(0, 4) != "1970"
  )

  // 必要な情報だけ抽出
  const pulls = filteredResponse.map((pull) => ({
    mergedAt: formattedDate(pull.merged_at),
    repoName: repoName,
    id: pull.number,
    title: pull.title,
  }))
  // console.log(pulls[0])

  return {
    data: pulls,
    isEndPage: response.length != PER_PAGE,
    lastMergedAt: pulls.slice(-1)[0].mergedAt
  }
}

function getGitlabMergeRequests(project, page=1) {
  const options = {
    'method': 'GET',
    'headers' : {
      'PRIVATE-TOKEN': GITLAB_PAT,
    }
  }

  // 過去 100 件のマージ済み Merge Request 取得
  // see: https://docs.gitlab.com/ee/api/merge_requests.html#list-project-merge-requests
  let response = UrlFetchApp.fetch(
    `https://gitlab.com/api/v4/projects/${project.id}/merge_requests?state=merged&per_page=${PER_PAGE}&page=${page}`,
    options
  )

  response = JSON.parse(response.getContentText())
  // console.log(response[0])

  // 必要な情報だけ抽出
  const requests = response.map((request) => ({
    mergedAt: formattedDate(request.merged_at),
    repoName: project.name,
    id: request.iid,
    title: request.title,
  }))
  // console.log(requests[0])

  return {
    data: requests,
    isEndPage: response.length != PER_PAGE,
    lastMergedAt: requests.slice(-1)[0].mergedAt
  }
}
