window.GAS_API_URL = "填入你的GAS API網址";
// <!-- 修正 updateAsset()，讓 HTML 可以調用 -->
function updateAsset() {
    let assetId = document.getElementById("assetId").value;
    let assetName = document.getElementById("assetName").value;
    let user = document.getElementById("user").value;
    let location = document.getElementById("location").value;
    let status = document.getElementById("status").value;

    // 從 Sheets 取得 QR Code（如果已存在）
    fetch(`${window.GAS_API_URL}?action=getAssetInfo&assetId=${encodeURIComponent(assetId)}`)
        .then(response => response.json())
        .then(data => {
            let qrCode = data.qrCode || `https://quickchart.io/qr?text=${encodeURIComponent(assetId)}&size=150`;

            fetch(`${window.GAS_API_URL}?action=updateAssetInfo&assetId=${encodeURIComponent(assetId)}&assetName=${encodeURIComponent(assetName)}&user=${encodeURIComponent(user)}&location=${encodeURIComponent(location)}&status=${encodeURIComponent(status)}&qrCode=${encodeURIComponent(qrCode)}`)
                .then(response => response.text())
                .then(data => alert(data))
                .catch(error => console.error("❌ 更新失敗", error));
        })
        .catch(error => console.error("❌ 取得 QR Code 失敗", error));
}
function generatePrintQrCode() {
    let assetId = document.getElementById("printAssetId").value;

    if (!assetId) {
        alert("❌ 錯誤：請輸入財產編號！");
        return;
    }

    let qrCodeUrl = `https://quickchart.io/qr?text=${encodeURIComponent(assetId)}&size=150`;
    
    let qrCodeImg = document.getElementById("printQrCodeImage");
    qrCodeImg.src = qrCodeUrl;
    qrCodeImg.style.display = "block"; // 顯示 QR Code
    console.log("generatePrintQrCode is working");
}



function generatePrintQrRange() {
    let startNum = document.getElementById("startAssetNum").value;
    let endNum = document.getElementById("endAssetNum").value;
    let qrPreviewDiv = document.getElementById("qrPreview");
    qrPreviewDiv.innerHTML = ""; // 清空舊的 QR Code

    if (!startNum || !endNum || isNaN(startNum) || isNaN(endNum)) {
        alert("❌ 請輸入有效的範圍數字！");
        return;
    }

    startNum = parseInt(startNum, 10);
    endNum = parseInt(endNum, 10);

    if (startNum > endNum) {
        alert("❌ 開始編號不能大於結束編號！");
        return;
    }

    for (let i = startNum; i <= endNum; i++) {
        let assetId = "ASSET" + String(i).padStart(4, '0'); // 自動補 4 位數
        let qrCodeUrl = `https://quickchart.io/qr?text=${encodeURIComponent(assetId)}&size=150`;

        let qrDiv = document.createElement("div");
        qrDiv.classList.add("col");  // 讓它適應 Bootstrap Grid
        qrDiv.innerHTML = `
            <div class="card p-2 text-center">
                <img src="${qrCodeUrl}" alt="QR Code" class="img-fluid mx-auto">
                <p class="fw-bold mt-2">${assetId}</p>
            </div>
        `;
        qrPreviewDiv.appendChild(qrDiv);
    }
}



function toggleAssetSection() {
    const section = document.getElementById("assetSection");
    const currentDisplay = window.getComputedStyle(section).display; // 取得當前 CSS 設定的 display
    
    section.style.display = currentDisplay === "none" ? "block" : "none";
}
function toggleNewAssetSection() {
    const section = document.getElementById("newAssetSection");
    const currentDisplay = window.getComputedStyle(section).display;

    section.style.display = currentDisplay === "none" ? "block" : "none";

    if (section.style.display === "block") {
        fetchNextAssetId(); //取得下一個可用的 ASSET ID
    }
}
function togglePrintQrSection() {
const section = document.getElementById("printQrSection");

    if (section.style.display === "" || section.style.display === "none") {
        section.style.display = "block";
    } else {
        section.style.display = "none";
    }
}
function toggleEditAssetSection() {
    const section = document.getElementById("editAssetSection");

    if (section.style.display === "" || section.style.display === "none") {
        section.style.display = "block";
    } else {
        section.style.display = "none";
    }
}


function editFetchAssetInfo() {
    let assetIdInput = document.getElementById("editAssetId").value.trim();
    
    // 如果使用者只輸入數字，就自動補上 "ASSET"
    let assetId = assetIdInput.startsWith("ASSET") ? assetIdInput : `ASSET${assetIdInput.padStart(4, "0")}`;

    fetch(`${window.GAS_API_URL}?action=getAssetInfo&assetId=${encodeURIComponent(assetId)}`)
        .then(response => response.json())
        .then(data => {
            console.log("📡 取得資產資訊:", data);
            
            if (data.error) {
                alert("❌ 找不到該資產: " + assetId);
                return;
            }

            document.getElementById("editAssetId").value = data.assetId || "";
            document.getElementById("editAssetName").value = data.assetName || "";
            document.getElementById("editUser").value = data.user || "";
            document.getElementById("editLocation").value = data.location || "";

            const statusSelect = document.getElementById("editStatus");
            statusSelect.value = data.status || "正常";
        })
        .catch(error => {
            console.error("❌ 取得資產資訊失敗", error);
            alert("❌ 取得資產資訊失敗，請檢查 API URL");
        });
}

function updateEditAsset() {
    let assetId = document.getElementById("editAssetId").value.trim();
    let assetName = document.getElementById("editAssetName").value.trim();
    let user = document.getElementById("editUser").value.trim();
    let location = document.getElementById("editLocation").value.trim();
    let status = document.getElementById("editStatus").value;

    // 如果資產編號沒有輸入，則不執行更新
    if (!assetId) {
        alert("❌ 請輸入有效的財產編號！");
        return;
    }

    // **確保 ASSET ID 格式正確**
    assetId = assetId.startsWith("ASSET") ? assetId : `ASSET${assetId.padStart(4, "0")}`;

    fetch(`${window.GAS_API_URL}?action=updateAssetInfo&assetId=${encodeURIComponent(assetId)}&assetName=${encodeURIComponent(assetName)}&user=${encodeURIComponent(user)}&location=${encodeURIComponent(location)}&status=${encodeURIComponent(status)}`)
        .then(response => response.text())
        .then(data => {
            alert(`✅ ${data}`);
        })
        .catch(error => {
            console.error("❌ 更新失敗", error);
            alert("❌ 更新資產失敗！");
        });
}





function fetchNextAssetId() {
    fetch(`${window.GAS_API_URL}?action=getNextAssetId`)
        .then(response => response.json())
        .then(data => {
            document.getElementById("newAssetId").value = data.nextAssetId; // 顯示新ID
        })
        .catch(error => console.error("❌ 取得新 ASSET ID 失敗", error));
}
function printQrCode() {
    let qrPreviewDiv = document.getElementById("qrPreview");
    let qrImages = qrPreviewDiv.querySelectorAll("img");

    if (qrImages.length === 0) {
        alert("❌ 請先產生 QR Code！");
        return;
    }

    const jsPDF = window.jspdf.jsPDF;
    const pdf = new jsPDF("p", "mm", "a4");
    let x = 10, y = 10, qrSize = 40, cols = 4, rows = 5, count = 0;

    qrImages.forEach((img, index) => {
        let assetId = img.nextElementSibling.textContent; // 讀取對應的 ASSET ID
        pdf.addImage(img.src, "PNG", x, y, qrSize, qrSize);
        pdf.text(assetId, x, y + qrSize + 5);

        x += 50; // 移動到下一欄
        count++;

        if (count % cols === 0) {
            x = 10;
            y += 60; // 下一行
        }
        if (count % (cols * rows) === 0) {
            pdf.addPage();
            x = 10;
            y = 10;
        }
    });

    pdf.save("QRCodes.pdf");
}






function createNewAsset() {
    let assetId = document.getElementById("newAssetId").value;
    let assetName = document.getElementById("newAssetName").value;
    let user = document.getElementById("newUser").value;
    let location = document.getElementById("newLocation").value;
    let status = document.getElementById("newStatus").value;

    if (!assetId) {
        alert("❌ 錯誤：無法取得新的財產編號！");
        return;
    }

    // 生成 QR Code URL
    let qrCodeUrl = `https://quickchart.io/qr?text=${encodeURIComponent(assetId)}&size=150`;

    fetch(`${window.GAS_API_URL}?action=updateAssetInfo&assetId=${encodeURIComponent(assetId)}&assetName=${encodeURIComponent(assetName)}&user=${encodeURIComponent(user)}&location=${encodeURIComponent(location)}&status=${encodeURIComponent(status)}&qrCode=${encodeURIComponent(qrCodeUrl)}`)
        .then(response => response.text())
        .then(data => {
            alert(data);

            // 確保 QR Code 圖片存在並顯示
            let qrCodeImg = document.getElementById("qrCodeImage");
            if (qrCodeImg) {
                qrCodeImg.src = qrCodeUrl;
                qrCodeImg.style.display = "block";
            } else {
                console.error("❌ 錯誤：找不到 qrCodeImage 元素");
            }

            // // 延遲關閉新建資產區，避免 QR Code 消失太快
            // setTimeout(() => {
            //     toggleNewAssetSection();
            // }, 2000);
        })
        .catch(error => console.error("❌ 新建資產失敗", error));
}


