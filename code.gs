function doGet(e) {
  var action = e.parameter.action;
  
  if (action === "getAssetInfo") {
    return getAssetInfo(e.parameter.assetId);
  } else if (action === "updateAssetInfo") {
    return updateAssetInfo(e.parameter.assetId, e.parameter.assetName, e.parameter.user, e.parameter.location, e.parameter.status, e.parameter.qrCode); // ✅ 加入 qrCode
  } else if (action === "getNextAssetId") { // 確保這行存在
    return getNextAssetId();
  }
  
  return ContentService.createTextOutput("Invalid action").setMimeType(ContentService.MimeType.TEXT);
}


// 取得資產資訊
function getAssetInfo(assetId) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) { // 跳過標題列
    if (data[i][0] === assetId) {
      var assetData = {
        assetId: data[i][0],
        assetName: data[i][1],
        user: data[i][2],
        location: data[i][3],
        status: data[i][4]
      };
      return ContentService.createTextOutput(JSON.stringify(assetData)).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  // 如果找不到，回傳 JSON 格式錯誤訊息
  return ContentService.createTextOutput(JSON.stringify({ error: "Asset not found" })).setMimeType(ContentService.MimeType.JSON);
}

// 更新資產資訊
function updateAssetInfo(assetId, assetName, user, location, status, qrCode) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
  var data = sheet.getDataRange().getValues();
  var updated = false;

  for (var i = 1; i < data.length; i++) { 
    if (data[i][0] === assetId) {
      // 如果 `qrCode` 為空，則保留原有的 QR Code
      let existingQRCode = data[i][5] ? data[i][5] : qrCode;
      
      sheet.getRange(i + 1, 2).setValue(assetName);
      sheet.getRange(i + 1, 3).setValue(user);
      sheet.getRange(i + 1, 4).setValue(location);
      sheet.getRange(i + 1, 5).setValue(status);
      sheet.getRange(i + 1, 6).setValue(existingQRCode); // 保持 QR Code 不變
      updated = true;
      break;
    }
  }

  if (!updated) {
    sheet.appendRow([assetId, assetName, user, location, status, qrCode]);
  }

  return ContentService.createTextOutput(updated ? "資產更新成功" : "資產新增成功").setMimeType(ContentService.MimeType.TEXT);
}



// 新增資產資料
function addAsset(assetId, assetName, user, location, status) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");

  if (!assetId) {
    assetId = generateNextAssetId(sheet);
  }

  var found = sheet.getRange("A:A").createTextFinder(assetId).findNext();
  if (found) {
    return ContentService.createTextOutput("財產編號 " + assetId + " 已存在").setMimeType(ContentService.MimeType.TEXT);
  }

  var qrCodeUrl = generateQRCode(assetId);
  var timestamp = new Date();

  sheet.appendRow([assetId, assetName, user, location, status, qrCodeUrl, timestamp]);

  return ContentService.createTextOutput("成功新增資產：" + assetId).setMimeType(ContentService.MimeType.TEXT);
}

// 產生下一個可用 ASSET 編號
function generateNextAssetId(sheet) {
  var data = sheet.getRange("A:A").getValues();
  var maxNum = 0;

  for (var i = 1; i < data.length; i++) { 
    var id = data[i][0];
    if (id && id.startsWith("ASSET")) {
      var num = parseInt(id.replace("ASSET", ""), 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }

  return "ASSET" + String(maxNum + 1).padStart(4, '0');
}

// 產生 QR Code（QuickChart.io）
function generateQRCode(data) {
  return "https://quickchart.io/qr?text=" + encodeURIComponent(data) + "&size=150";
}

function getNextAssetId() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
  var data = sheet.getDataRange().getValues();

  var maxId = 0;
  for (var i = 1; i < data.length; i++) {
    var assetId = data[i][0];
    var match = assetId.match(/^ASSET(\d+)$/);
    if (match) {
      maxId = Math.max(maxId, parseInt(match[1], 10));
    }
  }

  var nextId = "ASSET" + String(maxId + 1).padStart(4, "0");
  return ContentService.createTextOutput(JSON.stringify({ nextAssetId: nextId })).setMimeType(ContentService.MimeType.JSON);
}

function fetchNextAssetId() {
    fetch(`${window.GAS_API_URL}?action=getNextAssetId`)
        .then(response => response.json())
        .then(data => {
            document.getElementById("newAssetId").value = data.nextAssetId; // 顯示新ID
        })
        .catch(error => console.error("❌ 取得新 ASSET ID 失敗", error));
}

