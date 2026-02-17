// Thay đổi: Lấy container chứa nến thay vì thẻ img đơn lẻ
const cakeContainer = document.getElementById('cake-container');
const statusText = document.getElementById('status');
const resultDiv = document.getElementById('result');

let isBlown = false;
let blowSustainedFrames = 0; 

navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        
        analyser.fftSize = 256; 
        const bufferLength = analyser.frequencyBinCount; 
        const dataArray = new Uint8Array(bufferLength);
        
        microphone.connect(analyser);

        function detectBlow() {
            if (isBlown) return;

            analyser.getByteFrequencyData(dataArray);
            
            let lowFreqSum = 0;
            let highFreqSum = 0;
            const midPoint = Math.floor(bufferLength / 2);

            for (let i = 0; i < midPoint; i++) {
                lowFreqSum += dataArray[i];
            }
            for (let i = midPoint; i < bufferLength; i++) {
                highFreqSum += dataArray[i];
            }

            let lowFreqAvg = lowFreqSum / midPoint;
            let highFreqAvg = highFreqSum / (bufferLength - midPoint);

            // Logic nhận diện tiếng thổi bạn đã cung cấp
            if (lowFreqAvg > 100 && lowFreqAvg > highFreqAvg * 2) {
                blowSustainedFrames++; 
                if (blowSustainedFrames > 10) {
                    extinguishCandle();
                }
            } else {
                blowSustainedFrames = 0;
            }

            requestAnimationFrame(detectBlow);
        }

        detectBlow();
    })
    .catch(err => {
        statusText.innerText = "Lỗi: Hãy cho phép quyền dùng Mic để thổi nến!";
        console.error(err);
    });

function extinguishCandle() {
    isBlown = true;
    
    // Thêm class 'blown' để kích hoạt hiệu ứng mờ nến cháy/hiện nến tắt trong CSS
    cakeContainer.classList.add('blown'); 
    
    statusText.classList.add('hidden');
    resultDiv.classList.remove('hidden');

    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
    });
}