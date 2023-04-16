const SLACK_TOKEN   = PropertiesService.getScriptProperties().getProperty("slackToken")
const SLACK_CHANNEL_ID = PropertiesService.getScriptProperties().getProperty("slackChannelId")
const SPREADSHEET_ID  = "xxx"
const STATS_SHEET_NAME  = "stats"

// 日付のフォーマット
// 2023-03-10T04:51:32Z => 2023/03/10 に変換
function formattedDate (input) {
  if (input == null) return null

  let result = input.replaceAll(/-/g, "/")
  result = result.replace(/T.*/, "")

  return result
}

// スプレットシートに書き出すための関数
function writeSpreadSheet(column, line, info, sheetName) {
  var sheet = SpreadsheetApp.getActive().getSheetByName(sheetName)
  // B5 みたいに指定する
  sheet.getRange(`${column}${line}`).setValue(info)
}

const postBlob2Slack = function(title, initial_comment, filename, blob){
    UrlFetchApp.fetch(
      "https://slack.com/api/files.upload",
      {
        'method': 'POST',
        'payload': {
          token: SLACK_TOKEN,
          channels: SLACK_CHANNEL_ID,
          title: title,
          initial_comment: initial_comment,
          filename:filename,
          file: blob,
        }
      }
    )
}