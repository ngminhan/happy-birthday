const cakeContainer = document.getElementById('cake-container');
const statusText = document.getElementById('status');
const lightsOutLayer = document.getElementById('lights-out-layer');
const finalScreen = document.getElementById('final-screen');
const flashLayer = document.getElementById('flash-layer');
const audioBirthday = document.getElementById('audio-birthday');

let isBlown = false;
let blowSustainedFrames = 0; 

const FADE_TIME = 2000; 
const DARK_DELAY = 1000; 

navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        analyser.fftSize = 256; 
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        microphone.connect(analyser);

        function detectBlow() {
            if (isBlown) return;
            analyser.getByteFrequencyData(dataArray);
            let lowFreqSum = 0, highFreqSum = 0;
            const midPoint = Math.floor(dataArray.length / 2);
            for (let i = 0; i < midPoint; i++) lowFreqSum += dataArray[i];
            for (let i = midPoint; i < dataArray.length; i++) highFreqSum += dataArray[i];

            let lowFreqAvg = lowFreqSum / midPoint;
            let highFreqAvg = highFreqSum / (dataArray.length - midPoint);

            if (lowFreqAvg > 100 && lowFreqAvg > highFreqAvg * 2) {
                blowSustainedFrames++; 
                if (blowSustainedFrames > 8) extinguishSequence();
            } else {
                blowSustainedFrames = 0;
            }
            requestAnimationFrame(detectBlow);
        }
        detectBlow();
    });

function fireRandomConfetti() {
    if (!isBlown) return;
    confetti({
        particleCount: 6,
        angle: Math.random() * 360,
        spread: 100,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: ['#ff4081', '#ffd700', '#ffffff', '#00e5ff']
    });
    setTimeout(fireRandomConfetti, 150);
}

function extinguishSequence() {
    isBlown = true;
    
    // 1. Tắt nến ngay lập tức
    cakeContainer.classList.add('blown');
    if (statusText) statusText.style.opacity = '0';

    // 2. Tối dần màn hình
    lightsOutLayer.style.display = 'block';
    setTimeout(() => {
        lightsOutLayer.classList.add('darken');
    }, 50);

    // 3. Sau khi tối hẳn và chờ xong (Tổng 5.5s)
    setTimeout(() => {
        // Ẩn lớp đen để quay về nền hồng ban đầu
        lightsOutLayer.style.display = 'none';
        cakeContainer.classList.add('hidden');
        if (statusText) statusText.classList.add('hidden');

        // 4. Hiệu ứng loé sáng
        if (flashLayer) flashLayer.classList.add('do-flash');

        // 5. PHÁT NHẠC SINH NHẬT
        if (audioBirthday) audioBirthday.play();

        // --- BỔ SUNG: Khởi động lại các ảnh GIF ---
        // Việc này giúp GIF bắt đầu chạy từ khung hình đầu tiên đúng lúc đèn bật sáng
        const gifs = document.querySelectorAll('.gif-decoration');
        gifs.forEach(gif => {
            const originalSrc = gif.src.split('?')[0]; // Lấy đường dẫn gốc
            gif.src = originalSrc + '?t=' + new Date().getTime(); // Thêm tham số thời gian để buộc tải lại
        });

        // 6. Hiện màn hình kết quả và bắn pháo hoa liên tục
        if (finalScreen) finalScreen.classList.remove('hidden');
        fireRandomConfetti();
        
    }, FADE_TIME + DARK_DELAY); 
}