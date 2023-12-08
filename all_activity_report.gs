// 2021 年以降のすべての merged PR を取得してスプシに書き込む
function all_activity_report_main() {
  updatePullsRawDataRecursiveGithub("pullsRawData_all")
  updateRequestsRawDataRecursiveGitlab("pullsRawData_all")
}

// スプレッドシートの内容を更新 GitHub
function updatePullsRawDataRecursiveGithub(sheetName) {
  GITHUB_REPO_NAMES.map((repoName)=> {
    console.log(`=== repoName: ${repoName} ===`)

    let pulls = []
    let isEnd = false
    let page = 1

    while(!isEnd) {
      console.log(`=== page: ${page} ===`)
      // レビュアーの取得が重いので全期間では取らない
      const response = getGithubPulls(repoName, page)

      // ページングが終わったかどうかを更新
      // 数が多いので2020年以前は見ない
      isEnd = response.isEndPage || Number(response.lastMergedAt.substr(0, 4)) <= 2020
      pulls = pulls.concat(response.data)
      // console.log(pulls)

      page++
    }

    console.log("=== END ===")
    // console.log(pulls)

    // スプシに書き込み
    pulls.map((pull) => {
      writeSpreadSheet('A', PULLS_ROW_NOW, pull.mergedAt, sheetName)
      writeSpreadSheet('B', PULLS_ROW_NOW, pull.repoName, sheetName)
      writeSpreadSheet('C', PULLS_ROW_NOW, pull.id, sheetName)
      writeSpreadSheet('D', PULLS_ROW_NOW, pull.title, sheetName)
      writeSpreadSheet('E', PULLS_ROW_NOW, pull.reviewerNames.join(","), sheetName) // reviewers はスプシ側で展開する
      writeSpreadSheet('F', PULLS_ROW_NOW, pull.authorName, sheetName)

      // 書き込み行を移動
      PULLS_ROW_NOW += 1
    })
  })
}

// スプレッドシートの内容を更新 Gitlab
function updateRequestsRawDataRecursiveGitlab(sheetName) {
  GITLAB_PROJECTS.map((project)=> {
    console.log(`=== repoName: ${project.name} ===`)

    let requests = []
    let isEnd = false
    let page = 1

    while(!isEnd) {
      console.log(`=== page: ${page} ===`)
      const response = getGitlabMergeRequests(project, page)

      // ページングが終わったかどうかを更新
      // 数が多いので2020年以前は見ない
      isEnd = response.isEndPage || Number(response.lastMergedAt.substr(0, 4)) <= 2020
      requests = requests.concat(response.data)
      // console.log(requests)

      page++
    }

    console.log("=== END ===")
    // console.log(requests)

    // スプシに書き込み
    requests.map((request) => {
      writeSpreadSheet('A', PULLS_ROW_NOW, request.mergedAt, sheetName)
      writeSpreadSheet('B', PULLS_ROW_NOW, request.repoName, sheetName)
      writeSpreadSheet('C', PULLS_ROW_NOW, request.id, sheetName)
      writeSpreadSheet('D', PULLS_ROW_NOW, request.title, sheetName)
      writeSpreadSheet('E', PULLS_ROW_NOW, request.reviewerNames.join(","), sheetName) // reviewers はスプシ側で展開する
      writeSpreadSheet('F', PULLS_ROW_NOW, request.authorName, sheetName)

      // 書き込み行を移動
      PULLS_ROW_NOW += 1
    })
  })
}
