import QrScanner from "https://unpkg.com/qr-scanner@1.4.2/qr-scanner.min.js";
let videoElem, scanner;
const startScanBtn = document.getElementById("startScan");
const stopScanBtn = document.getElementById("stopScan");
const resultElem = document.getElementById("result");

async function startScanner() {
    if (!videoElem) {
        videoElem = document.createElement("video");
        videoElem.setAttribute("id", "video");
        document.getElementById("reader").appendChild(videoElem);
    }

    try {
        const cameras = await QrScanner.listCameras();
        if (cameras.length === 0) throw new Error("❌ 找不到可用相機");

        let backCamera = cameras.find(camera => 
            camera.label.toLowerCase().includes("back") || 
            camera.label.includes("環境")
        );
        let selectedCameraId = backCamera ? backCamera.id : cameras[0].id;

        scanner = new QrScanner(videoElem, result => {
            let scannedData = result.data; // 確保是字串
            resultElem.textContent = `✅ 掃描成功: ${scannedData}`;
            stopScanner();
            fetchAssetInfo(scannedData);
        }, {
            preferredCamera: selectedCameraId,
            highlightScanRegion: true,
            highlightCodeOutline: true
        });

        await scanner.start();
        startScanBtn.style.display = "none";
        stopScanBtn.style.display = "inline-block";
    } catch (error) {
        console.error(error);
        alert("無法開啟相機：" + error.message);
    }
}

function stopScanner() {
    if (scanner) {
        scanner.stop();
        scanner.destroy();
        scanner = null;
    }
    startScanBtn.style.display = "inline-block";
    stopScanBtn.style.display = "none";
}

function fetchAssetInfo(assetId) {
    fetch(`${window.GAS_API_URL}?action=getAssetInfo&assetId=${encodeURIComponent(assetId)}`)
        .then(response => response.json())
        .then(data => {
            console.log("📡 取得資產資訊:", data);
            
            if (data.error) {
                alert("❌ 找不到該資產: " + assetId);
                return;
            }

            document.getElementById("assetId").value = data.assetId || "";
            document.getElementById("assetName").value = data.assetName || "";
            document.getElementById("user").value = data.user || "";
            document.getElementById("location").value = data.location || "";

            // 讓狀態下拉選單預設選擇 API 回傳的值
            const statusSelect = document.getElementById("status");
            statusSelect.value = data.status || "正常";
        })
        .catch(error => {
            console.error("❌ 取得資產資訊失敗", error);
            alert("❌ 取得資產資訊失敗，請檢查 API URL");
        });
}

document.getElementById("startScan").addEventListener("click", startScanner);
document.getElementById("stopScan").addEventListener("click", stopScanner);