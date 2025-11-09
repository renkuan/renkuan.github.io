$(document).ready(function() {
    $('#article img').each(function() {
      if ($(this).parent().hasClass('fancybox')) return;
      if ($(this).hasClass('nofancybox')) return;
      // 排除图片对比滑块容器中的图片
      if ($(this).closest('.image-compare-container').length > 0) return;
      // 排除图片轮播容器中的图片
      if ($(this).closest('.image-carousel-container').length > 0) return;
      var alt = this.alt;
      $(this).wrap(
          '<a href="' + ($(this).attr('data-src') == null ? this.src : 
          $(this).attr('data-src')) + '" data-src="'+ this.src +'" class="fancybox" data-fancybox="fancybox-gallery-img"></a>');
    });
    $(this).find('.fancybox').each(function(){
      $(this).attr('rel', 'article');
    });
});