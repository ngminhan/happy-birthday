const cakeContainer = document.getElementById('cake-container');
const statusText = document.getElementById('status');
const resultDiv = document.getElementById('result');
const actionContent = document.getElementById('action-content');

const lightsOutLayer = document.getElementById('lights-out-layer');

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
            let lowFreqSum = 0, highFreqSum = 0;
            const midPoint = Math.floor(bufferLength / 2);
            for (let i = 0; i < midPoint; i++) lowFreqSum += dataArray[i];
            for (let i = midPoint; i < bufferLength; i++) highFreqSum += dataArray[i];

            let lowFreqAvg = lowFreqSum / midPoint;
            let highFreqAvg = highFreqSum / (bufferLength - midPoint);

            if (lowFreqAvg > 100 && lowFreqAvg > highFreqAvg * 2) {
                blowSustainedFrames++; 
                if (blowSustainedFrames > 10) extinguishCandle();
            } else {
                blowSustainedFrames = 0;
            }
            requestAnimationFrame(detectBlow);
        }
        detectBlow();
    })
    .catch(err => {
        statusText.innerText = "Lỗi: Hãy cho phép quyền dùng Mic!";
    });

function extinguishCandle() {
    if (isBlown) return;
    isBlown = true;
    
    // 1. Chuyển ảnh nến tắt
    cakeContainer.classList.add('blown'); 
    
    // 2. Kích hoạt hiệu ứng bóng tối ập vào
    const lightsOut = document.getElementById('lights-out-layer');
    lightsOut.classList.add('darken');

    // 3. Đổi nội dung chữ và bắn pháo hoa sau khi đèn bắt đầu tắt
    setTimeout(() => {
        statusText.classList.add('hidden');
        resultDiv.classList.remove('hidden');
        actionContent.classList.remove('hidden');

        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ff4081', '#ffd700', '#ffffff']
        });
    }, 800); // Hiện chữ khi bóng tối đã thu hẹp một phần
}