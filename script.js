// Check if mobile device
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;

// Создаем масляные круги
function createLiquidCircles() {
    const container = document.createElement('div');
    container.className = 'liquid-circles';
    
    const circleCount = isMobile ? 2 : 4;
    
    for (let i = 0; i < circleCount; i++) {
        const circle = document.createElement('div');
        circle.className = 'liquid-circle';
        container.appendChild(circle);
    }
    
    document.body.appendChild(container);
    
    const edges = document.createElement('div');
    edges.className = 'liquid-edges';
    document.body.appendChild(edges);
}

// Liquid Touch эффект - disabled on mobile for performance
function createLiquidTouch(x, y) {
    if (isMobile) return;
    
    const touch = document.createElement('div');
    touch.className = 'liquid-touch';
    touch.style.left = (x - 60) + 'px';
    touch.style.top = (y - 60) + 'px';
    
    document.body.appendChild(touch);
    
    setTimeout(() => {
        touch.remove();
    }, 1200);
}

// Обработчики касаний - disabled on mobile
if (!isMobile) {
    document.addEventListener('click', (e) => {
        createLiquidTouch(e.clientX, e.clientY);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    createLiquidCircles();
});

const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
let musicPlaying = false;
const originalVolume = 0.3; // Нормальная громкость музыки
const quietVolume = 0.08;   // Громкость когда играет голосовое

// Плавное изменение громкости
function fadeVolume(targetVolume, duration = 500) {
    if (!bgMusic) return;
    
    const startVolume = bgMusic.volume;
    const startTime = Date.now();
    
    function updateVolume() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        bgMusic.volume = startVolume + (targetVolume - startVolume) * progress;
        
        if (progress < 1) {
            requestAnimationFrame(updateVolume);
        }
    }
    
    updateVolume();
}

// Фоновая музыка
musicToggle.addEventListener('click', () => {
    if (musicPlaying) {
        bgMusic.pause();
        musicToggle.style.background = 'rgba(255,255,255,0.08)';
    } else {
        bgMusic.volume = originalVolume;
        bgMusic.play().catch(e => console.log('Auto-play prevented'));
        musicToggle.style.background = 'rgba(255,255,255,0.15)';
    }
    musicPlaying = !musicPlaying;

    if (musicPlaying) {
        musicToggle.classList.add("playing");
    } else {
        musicToggle.classList.remove("playing");
    }
});

document.addEventListener('click', () => {
    if (!musicPlaying) {
        bgMusic.volume = originalVolume;
        bgMusic.play();
        musicPlaying = true;
        musicToggle.style.background = 'rgba(255,255,255,0.15)';
    }
}, { once: true });

// Анимация появления всех элементов
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, entry.target.dataset.delay || 200);
        }
    });
}, { threshold: 0.2 });

document.querySelectorAll('.message-card, .photo-item').forEach((element, index) => {
    element.dataset.delay = index * 100; 
    observer.observe(element);
});

document.querySelectorAll('audio').forEach(audio => {
    let wasMusicPlaying = false;
    
    audio.addEventListener('play', function() {
        const card = this.closest('.message-card');
        card.classList.add('playing');
        
        wasMusicPlaying = !bgMusic.paused;
        if (wasMusicPlaying) {
            fadeVolume(quietVolume, 300);
        }
        
        document.querySelectorAll('audio').forEach(otherAudio => {
            if (otherAudio !== this && otherAudio !== bgMusic && !otherAudio.paused) {
                otherAudio.pause();
                otherAudio.currentTime = 0;
                otherAudio.closest('.message-card')?.classList.remove('playing');
            }
        });
    });
    
    audio.addEventListener('pause', function() {
        const card = this.closest('.message-card');
        card.classList.remove('playing');
        
        // Восстанавливаем громкость музыки если она играла
        if (wasMusicPlaying && !bgMusic.paused) {
            fadeVolume(originalVolume, 300);
        }
    });
    
    audio.addEventListener('ended', function() {
        const card = this.closest('.message-card');
        card.classList.remove('playing');
        
        if (wasMusicPlaying && !bgMusic.paused) {
            fadeVolume(originalVolume, 300);
        }
        wasMusicPlaying = false;
    });

});
