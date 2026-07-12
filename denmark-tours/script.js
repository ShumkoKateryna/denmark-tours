/**
 * Экскурсии по Дании — JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initSmoothScroll();
  initHeaderScroll();
  initActiveNavLink();
  initThemeToggle();
  initAboutSlider();
  initTourGallerySlider();
});

/**
 * Мобильное меню — открытие/закрытие
 */
function initMobileMenu() {
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  const navLinks = nav.querySelectorAll('.nav__link');

  if (!burger || !nav) return;

  burger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('nav--open');
    burger.classList.toggle('burger--active', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    burger.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
  });

  // Закрываем меню при клике на ссылку
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('nav--open');
      burger.classList.remove('burger--active');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Открыть меню');
    });
  });

  // Закрываем меню при клике вне его
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !burger.contains(e.target) && nav.classList.contains('nav--open')) {
      nav.classList.remove('nav--open');
      burger.classList.remove('burger--active');
      burger.setAttribute('aria-expanded', 'false');
    }
  });
}

/**
 * Плавный скролл по якорным ссылкам
 */
function initSmoothScroll() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');

      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/**
 * Тень у header при прокрутке
 */
function initHeaderScroll() {
  const header = document.getElementById('header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('header--scrolled', window.scrollY > 10);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/**
 * Подсветка активного пункта меню при прокрутке
 */
function initActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  if (!sections.length || !navLinks.length) return;

  const sectionMap = {};
  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      sectionMap[href.slice(1)] = link;
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((link) => link.classList.remove('nav__link--active'));
          if (sectionMap[id]) {
            sectionMap[id].classList.add('nav__link--active');
          }
        }
      });
    },
    {
      rootMargin: '-40% 0px -50% 0px',
      threshold: 0,
    }
  );

  sections.forEach((section) => observer.observe(section));
}

/**
 * Переключение светлой и тёмной темы
 */
function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  const root = document.documentElement;

  const applyTheme = (theme) => {
    const isDark = theme === 'dark';
    if (isDark) {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
    toggle.setAttribute('aria-label', isDark ? 'Включить светлую тему' : 'Включить тёмную тему');
  };

  toggle.addEventListener('click', () => {
    const isDark = root.getAttribute('data-theme') === 'dark';
    applyTheme(isDark ? 'light' : 'dark');
  });

  applyTheme('light');
}

/**
 * Слайдер фото гида в секции «О гиде»
 */
function initAboutSlider() {
  const slider = document.getElementById('about-slider');
  if (!slider) return;

  const slidesContainer = slider.querySelector('.about-slider__slides');
  const prevBtn = slider.querySelector('.about-slider__btn--prev');
  const nextBtn = slider.querySelector('.about-slider__btn--next');

  const slideNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const total = slideNumbers.length;
  let current = 0;
  let autoplayTimer = null;

  slideNumbers.forEach((num, index) => {
    const slide = document.createElement('div');
    slide.className = `about-slider__slide${index === 0 ? ' about-slider__slide--active' : ''}`;
    slide.innerHTML = `<img src="assets/guide/${num}.jpeg" alt="Владислав Адамович — фото ${num}" loading="${index === 0 ? 'eager' : 'lazy'}">`;
    slidesContainer.appendChild(slide);
  });

  const slides = slidesContainer.querySelectorAll('.about-slider__slide');

  function goTo(index) {
    slides[current].classList.remove('about-slider__slide--active');
    current = (index + total) % total;
    slides[current].classList.add('about-slider__slide--active');
    restartAutoplay();
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function restartAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => goTo(current + 1), 5000);
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  slider.addEventListener('mouseenter', stopAutoplay);
  slider.addEventListener('mouseleave', restartAutoplay);

  let touchStartX = 0;
  let touchStartY = 0;

  slider.addEventListener(
    'touchstart',
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
      stopAutoplay();
    },
    { passive: true }
  );

  slider.addEventListener(
    'touchend',
    (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      const touchEndY = e.changedTouches[0].screenY;
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;

      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        goTo(diffX > 0 ? current - 1 : current + 1);
      } else {
        restartAutoplay();
      }
    },
    { passive: true }
  );

  restartAutoplay();
}

/**
 * Слайдер «Фото с экскурсий»
 */
function initTourGallerySlider() {
  const slider = document.getElementById('tour-gallery-slider');
  if (!slider) return;

  const slidesContainer = slider.querySelector('.tour-gallery__slides');
  const prevBtn = slider.querySelector('.tour-gallery__btn--prev');
  const nextBtn = slider.querySelector('.tour-gallery__btn--next');

  const cityPhotos = Array.from({ length: 24 }, (_, i) => `${i + 1}.jpeg`);

  const total = cityPhotos.length;
  let current = 0;
  let autoplayTimer = null;

  cityPhotos.forEach((file, index) => {
    const slide = document.createElement('div');
    slide.className = `tour-gallery__slide${index === 0 ? ' tour-gallery__slide--active' : ''}`;
    const imgClass = file === '3.jpeg' ? ' class="tour-gallery__image--top"' : '';
    slide.innerHTML = `<img src="assets/city/${file}" alt="Фото с экскурсии по Дании"${imgClass} loading="${index === 0 ? 'eager' : 'lazy'}">`;
    slidesContainer.appendChild(slide);
  });

  const slides = slidesContainer.querySelectorAll('.tour-gallery__slide');

  function goTo(index) {
    slides[current].classList.remove('tour-gallery__slide--active');
    current = (index + total) % total;
    slides[current].classList.add('tour-gallery__slide--active');
    restartAutoplay();
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function restartAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => goTo(current + 1), 5000);
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  slider.addEventListener('mouseenter', stopAutoplay);
  slider.addEventListener('mouseleave', restartAutoplay);

  let touchStartX = 0;
  let touchStartY = 0;

  slider.addEventListener(
    'touchstart',
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
      stopAutoplay();
    },
    { passive: true }
  );

  slider.addEventListener(
    'touchend',
    (e) => {
      const diffX = e.changedTouches[0].screenX - touchStartX;
      const diffY = e.changedTouches[0].screenY - touchStartY;

      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        goTo(diffX > 0 ? current - 1 : current + 1);
      } else {
        restartAutoplay();
      }
    },
    { passive: true }
  );

  restartAutoplay();
}
