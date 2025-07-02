const myEmail = 'test@mail.com'; // ←自分のメールアドレスに置き換える

function onFormSubmit(e) {
  // フォームの入力内容を取得
  let itemResponses = e.response.getItemResponses();

  // 質問タイトルに応じてマッピング
  let name = "", email = "", days = "", message = "";
  
  itemResponses.forEach(item => {
    const title = item.getItem().getTitle();
    const response = item.getResponse().toString();
    
    switch (title) {
      case "お名前":
        name = response;
        break;
      case "メールアドレス":
        email = response;
        break;
      case "参加日程":
        days = response;
        break;
      case "ご意見、ご要望":
        message = response;
        break;
    }
  });

  // 主催へメール送信
  sendEmail(name, email, days, message);
  // 主催へslack送信
  sendSlackNotification(name, email, days, message);
}

// メール送信用関数
function sendEmail(name, email, days, message) {
  const now = new Date();
  const formattedDate = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy/MM/dd HH:mm');
  const subject = `【フォーム回答】${name}さんからの説明会申込み_${formattedDate}`;
  const body =`▼ フォームから新しい回答が届きました！

お名前：${name}
メールアドレス：${email}
参加日程：${days}
ご意見、ご要望：${message}`;

  try {
    MailApp.sendEmail({
      to: myEmail, 
      subject: subject,
      body: body
    });
  } catch (error) {
    Logger.log("メール送信エラー: " + error.message);
  }
}

// Slack通知用関数
function sendSlackNotification(name, email, days, message) {
  const slackWebhookUrl = 'https://hooks.slack.com/services/XXXX/XXXX/XXXX';// Webhook URLに置き換える
  const payload = {
    text: `▼フォームから新しい回答がありました\n` +
          `*お名前*: ${name}\n` +
          `*メール*: ${email}\n` +
          `*参加日程*: ${days}\n` +
          `*ご意見、ご要望*: ${message}` 
  };

  try {
    UrlFetchApp.fetch(slackWebhookUrl, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
  } catch (error) {
    Logger.log("Slack通知エラー: " + error.message);
    try {
      MailApp.sendEmail(myEmail, "【GAS通知】Slack通知失敗", error.stack);
    } catch (mailError) {
      Logger.log("Slack失敗通知メールも失敗: " + mailError.message);
    }
  }
}
