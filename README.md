# 財產清冊掃描系統

## 🛠 技術棧
- **HTML5 + CSS3** 
- **JavaScript (ES6)** 
- **Bootstrap 5** 
- **(QrScanner)[https://www.npmjs.com/package/qr-scanner]**


這是一款基於 **QR Code** 的財產管理系統，能夠掃描、編輯、列印財產標籤，並透過 Google Sheets 作為後端儲存數據。
將 Excel (XLSX) 檔案 上傳至 Google Drive，並透過 Google Apps Script (GAS) 建立 API，再將 API Key 整合至 script.js 進行存取。
**（適用於 企業內部網路 或 個人使用，確保資料安全）**

---
## 🎯 **功能特色**
1. **掃描模式**：使用相機掃描 QR Code 來快速查詢財產資訊  
2. **編輯模式**：手動輸入財產編號，並更新使用者、位置、狀態等資訊  
3. **新建財產**：自動產生新的財產編號，並建立對應 QR Code  
4. **列印 QR Code**：批量產生 QR Code，並排版到 A4 以供列印  
5. **Google Sheets 連動**：透過 Google Apps Script，將財產數據存入 Google Sheets  


