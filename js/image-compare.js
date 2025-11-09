/**
 * 图片对比滑块功能
 * 通过拖拽滑块实现两张图片的切换展示
 */
(function() {
  'use strict';

  // 初始化所有图片对比容器
  function initImageCompare() {
    const containers = document.querySelectorAll('.image-compare-container');
    
    containers.forEach(function(container) {
      if (container.dataset.initialized === 'true') {
        return; // 已经初始化过，跳过
      }

      const handle = container.querySelector('.jx-handle');
      const imageBefore = container.querySelector('.image-before');
      const imageAfter = container.querySelector('.image-after');
      let isDragging = false;
      let startX = 0;
      let startLeft = 0;

      if (!handle || !imageBefore || !imageAfter) {
        return;
      }

      // 同步滑块手柄位置和高度与图片对齐
      function syncHandlePosition() {
        const afterImg = imageAfter.querySelector('img');
        if (afterImg && afterImg.offsetHeight > 0) {
          // 获取图片相对于容器的位置
          const containerRect = container.getBoundingClientRect();
          const imgRect = afterImg.getBoundingClientRect();
          const imgTopOffset = imgRect.top - containerRect.top;
          
          // 设置滑块手柄的 top 和 height
          handle.style.top = imgTopOffset + 'px';
          handle.style.height = afterImg.offsetHeight + 'px';
        }
      }

      // 等待图片加载完成后同步位置
      const afterImg = imageAfter.querySelector('img');
      const beforeImg = imageBefore.querySelector('img');
      
      if (afterImg && beforeImg) {
        // 如果图片已加载
        if (afterImg.complete && beforeImg.complete) {
          // 延迟一下确保布局完成
          setTimeout(syncHandlePosition, 0);
        } else {
          // 等待图片加载完成
          afterImg.addEventListener('load', function() {
            setTimeout(syncHandlePosition, 0);
          });
          beforeImg.addEventListener('load', function() {
            setTimeout(syncHandlePosition, 0);
          });
        }
      }
      
      // 使用 ResizeObserver 监听图片尺寸变化
      if (window.ResizeObserver && afterImg) {
        const resizeObserver = new ResizeObserver(function(entries) {
          syncHandlePosition();
        });
        resizeObserver.observe(afterImg);
        resizeObserver.observe(container);
      }

      // 设置位置函数（先定义，以便初始化时使用）
      function setPosition(percentage) {
        // 限制在0-100%之间
        percentage = Math.max(0, Math.min(100, percentage));
        
        // 使用 clip-path 控制显示区域
        // inset(0 右侧隐藏% 0 0) 表示从右侧隐藏，显示左侧
        const hiddenRight = 100 - percentage;
        imageBefore.style.clipPath = `inset(0 ${hiddenRight}% 0 0)`;
        
        // 更新滑块位置
        handle.style.left = percentage + '%';
      }

      // 设置初始位置（默认50%）
      const initialPosition = parseFloat(container.dataset.position) || 50;
      setPosition(initialPosition);

      // 获取当前显示百分比
      function getCurrentPosition() {
        const clipPath = imageBefore.style.clipPath || 'inset(0 50% 0 0)';
        const match = clipPath.match(/inset\(0\s+(\d+(?:\.\d+)?)%\s+0\s+0\)/);
        if (match) {
          return 100 - parseFloat(match[1]);
        }
        return 50;
      }

      // 鼠标按下事件
      handle.addEventListener('mousedown', function(e) {
        isDragging = true;
        startX = e.clientX;
        startLeft = getCurrentPosition();
        
        e.preventDefault();
        container.style.cursor = 'grabbing';
      });

      // 鼠标移动事件
      document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;

        const containerRect = container.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const deltaX = e.clientX - startX;
        const newLeft = startLeft + (deltaX / containerWidth) * 100;
        
        setPosition(newLeft);
        e.preventDefault();
      });

      // 鼠标释放事件
      document.addEventListener('mouseup', function() {
        if (isDragging) {
          isDragging = false;
          container.style.cursor = 'grab';
        }
      });

      // 触摸事件支持（移动端）
      handle.addEventListener('touchstart', function(e) {
        isDragging = true;
        startX = e.touches[0].clientX;
        startLeft = getCurrentPosition();
        e.preventDefault();
      });

      document.addEventListener('touchmove', function(e) {
        if (!isDragging) return;

        const containerRect = container.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const deltaX = e.touches[0].clientX - startX;
        const newLeft = startLeft + (deltaX / containerWidth) * 100;
        
        setPosition(newLeft);
        e.preventDefault();
      });

      document.addEventListener('touchend', function() {
        isDragging = false;
      });

      // 标记为已初始化
      container.dataset.initialized = 'true';
    });
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initImageCompare);
  } else {
    initImageCompare();
  }

  // 如果使用动态内容加载，可以手动调用 initImageCompare()
  window.initImageCompare = initImageCompare;

})();

