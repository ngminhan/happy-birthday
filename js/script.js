const candleImg = document.getElementById('candle-img');
const statusText = document.getElementById('status');
const resultDiv = document.getElementById('result');

let isBlown = false;

// Yêu cầu truy cập Microphone
navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        
        analyser.fftSize = 256; // Kích thước dữ liệu mẫu
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        microphone.connect(analyser);

        function detectBlow() {
            if (isBlown) return;

            analyser.getByteFrequencyData(dataArray);
            
            // Tính âm lượng trung bình
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
            }
            let averageVolume = sum / bufferLength;

            // Ngưỡng âm lượng (thường thổi vào mic sẽ > 40-60)
            if (averageVolume > 50) {
                extinguishCandle();
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
    
    // Thay đổi ảnh nến
    candleImg.src = 'candle-off.jpeg'; 
    
    // Ẩn tiêu đề cũ, hiện lời chúc
    statusText.classList.add('hidden');
    resultDiv.classList.remove('hidden');

    // Bắn pháo hoa giấy (confetti)
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
    });
}