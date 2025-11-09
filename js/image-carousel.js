/**
 * 图片轮播功能
 * 支持自动播放、手动导航、暂停/播放、分页点指示
 */
(function() {
  'use strict';

  // 初始化所有图片轮播容器
  function initImageCarousel() {
    const containers = document.querySelectorAll('.image-carousel-container');
    
    containers.forEach(function(container) {
      if (container.dataset.initialized === 'true') {
        return; // 已经初始化过，跳过
      }

      const wrapper = container.querySelector('.carousel-wrapper');
      const track = container.querySelector('.carousel-track');
      const slides = container.querySelectorAll('.carousel-slide');
      const prevBtn = container.querySelector('.carousel-prev');
      const nextBtn = container.querySelector('.carousel-next');
      const playPauseBtn = container.querySelector('.carousel-play-pause');
      const dotsContainer = container.querySelector('.carousel-dots');

      if (!track || slides.length === 0) {
        return;
      }

      // 设置固定高度（如果指定了 data-height 属性）
      if (wrapper && container.dataset.height) {
        const height = container.dataset.height;
        // 支持 px 和数字（默认 px）
        if (/^\d+$/.test(height)) {
          wrapper.style.height = height + 'px';
        } else {
          wrapper.style.height = height;
        }
      }

      let currentIndex = 0;
      let autoPlayInterval = null;
      let isPaused = false;
      const intervalTime = parseInt(container.dataset.interval) || 2000; // 默认2秒
      
      // 获取 wrapper 的宽度（用于计算 translateX）
      function getWrapperWidth() {
        return wrapper.getBoundingClientRect().width;
      }
      
      // 初始化位置
      track.style.transform = 'translateX(0px)';

      // 为每个 slide 创建标题（从图片的 alt 属性读取）
      slides.forEach(function(slide) {
        const img = slide.querySelector('img');
        if (img && img.alt) {
          // 检查是否已经存在标题元素
          let titleElement = slide.querySelector('.carousel-slide-title');
          if (!titleElement) {
            titleElement = document.createElement('div');
            titleElement.className = 'carousel-slide-title';
            slide.appendChild(titleElement);
          }
          titleElement.textContent = img.alt;
        }
      });

      // 创建分页点
      if (dotsContainer && slides.length > 1) {
        dotsContainer.innerHTML = '';
        slides.forEach(function(_, index) {
          const dot = document.createElement('button');
          dot.className = 'carousel-dot' + (index === 0 ? ' active' : '');
          dot.setAttribute('aria-label', '跳转到第' + (index + 1) + '张图片');
          dot.addEventListener('click', function() {
            goToSlide(index);
          });
          dotsContainer.appendChild(dot);
        });
      }

      // 更新分页点状态
      function updateDots() {
        if (!dotsContainer) return;
        const dots = dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach(function(dot, index) {
          if (index === currentIndex) {
            dot.classList.add('active');
          } else {
            dot.classList.remove('active');
          }
        });
      }

      // 跳转到指定幻灯片
      function goToSlide(index) {
        if (index < 0) {
          index = slides.length - 1; // 循环到最后一张
        } else if (index >= slides.length) {
          index = 0; // 循环到第一张
        }
        
        currentIndex = index;
        // 使用像素值计算，更准确
        // 每个 slide 的宽度等于 wrapper 的宽度
        const wrapperWidth = getWrapperWidth();
        const offset = currentIndex * wrapperWidth;
        track.style.transform = `translateX(-${offset}px)`;
        updateDots();
      }

      // 下一张
      function nextSlide() {
        goToSlide(currentIndex + 1);
      }

      // 上一张
      function prevSlide() {
        goToSlide(currentIndex - 1);
      }

      // 开始自动播放
      function startAutoPlay() {
        if (autoPlayInterval) {
          clearInterval(autoPlayInterval);
        }
        if (slides.length <= 1) return; // 只有一张图片时不需要自动播放
        
        autoPlayInterval = setInterval(function() {
          if (!isPaused) {
            nextSlide();
          }
        }, intervalTime);
      }

      // 停止自动播放
      function stopAutoPlay() {
        if (autoPlayInterval) {
          clearInterval(autoPlayInterval);
          autoPlayInterval = null;
        }
      }

      // 切换暂停/播放状态
      function togglePlayPause() {
        isPaused = !isPaused;
        if (playPauseBtn) {
          if (isPaused) {
            playPauseBtn.classList.add('paused');
            playPauseBtn.setAttribute('aria-label', '播放');
          } else {
            playPauseBtn.classList.remove('paused');
            playPauseBtn.setAttribute('aria-label', '暂停');
          }
        }
      }

      // 绑定事件
      if (nextBtn) {
        nextBtn.addEventListener('click', function() {
          nextSlide();
          // 点击手动导航时，重置自动播放计时器
          if (!isPaused) {
            stopAutoPlay();
            startAutoPlay();
          }
        });
      }

      if (prevBtn) {
        prevBtn.addEventListener('click', function() {
          prevSlide();
          // 点击手动导航时，重置自动播放计时器
          if (!isPaused) {
            stopAutoPlay();
            startAutoPlay();
          }
        });
      }

      if (playPauseBtn) {
        playPauseBtn.addEventListener('click', togglePlayPause);
        playPauseBtn.setAttribute('aria-label', '暂停');
      }

      // 鼠标悬停时暂停自动播放
      container.addEventListener('mouseenter', function() {
        if (!isPaused) {
          stopAutoPlay();
        }
      });

      // 鼠标离开时恢复自动播放
      container.addEventListener('mouseleave', function() {
        if (!isPaused) {
          startAutoPlay();
        }
      });

      // 窗口大小改变时重新计算位置
      let resizeTimer = null;
      window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
          // 重新定位到当前图片
          goToSlide(currentIndex);
        }, 100);
      });

      // 初始化：开始自动播放
      // 延迟一点确保布局已完成
      setTimeout(function() {
        goToSlide(0); // 确保初始位置正确
        startAutoPlay();
      }, 100);

      // 标记为已初始化
      container.dataset.initialized = 'true';
    });
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initImageCarousel);
  } else {
    initImageCarousel();
  }

  // 如果使用动态内容加载，可以手动调用 initImageCarousel()
  window.initImageCarousel = initImageCarousel;

})();

