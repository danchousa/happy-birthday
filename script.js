// Check if mobile device
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;

// Создаем масляные круги
function createLiquidCircles() {
    const container = document.createElement('div');
    container.className = 'liquid-circles';
    
    // На мобильных создаем меньше кругов для производительности
    const circleCount = isMobile ? 2 : 4;
    
    for (let i = 0; i < circleCount; i++) {
        const circle = document.createElement('div');
        circle.className = 'liquid-circle';
        container.appendChild(circle);
    }
    
    document.body.appendChild(container);
    
    // Добавляем эффект переливов по краям
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

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    createLiquidCircles();
});

// ПРОДВИНУТАЯ ВЕРСИЯ УПРАВЛЕНИЯ ГРОМКОСТЬЮ
const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
let musicPlaying = false;
const originalVolume = 0.7; // Нормальная громкость музыки
const quietVolume = 0.15;   // Громкость когда играет голосовое

// Плавное изменение громкости
function fadeVolume(targetVolume, duration = 500) {
    if (!bgMusic) return;
    
    const startVolume = bgMusic.volume;
    const startTime = Date.now();
    
    function updateVolume() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Плавный переход с ease-out
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

// Наблюдаем за всеми элементами с анимацией
document.querySelectorAll('.message-card, .photo-item').forEach((element, index) => {
    element.dataset.delay = index * 100; // Задержка для каждого элемента
    observer.observe(element);
});

// ПРОДВИНУТОЕ УПРАВЛЕНИЕ АУДИО - УБИРАЕМ КОНФЛИКТ
document.querySelectorAll('audio').forEach(audio => {
    let wasMusicPlaying = false;
    
    audio.addEventListener('play', function() {
        const card = this.closest('.message-card');
        card.classList.add('playing');
        
        // Запоминаем состояние музыки и приглушаем ее
        wasMusicPlaying = !bgMusic.paused;
        if (wasMusicPlaying) {
            fadeVolume(quietVolume, 300);
        }
        
        // УБИРАЕМ ЭТУ ЧАСТЬ - она останавливает музыку!
        // document.querySelectorAll('audio').forEach(otherAudio => {
        //     if (otherAudio !== this && !otherAudio.paused) {
        //         otherAudio.pause();
        //         otherAudio.currentTime = 0;
        //         otherAudio.closest('.message-card').classList.remove('playing');
        //     }
        // });
        
        // Вместо этого останавливаем только другие голосовые (не музыку)
        document.querySelectorAll('audio').forEach(otherAudio => {
            // Проверяем что это не фоновая музыка и не текущее аудио
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
        
        // Восстанавливаем громкость когда голосовое закончилось
        if (wasMusicPlaying && !bgMusic.paused) {
            fadeVolume(originalVolume, 300);
        }
        wasMusicPlaying = false;
    });
});