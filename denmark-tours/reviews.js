/**
 * Отзывы — Firebase Firestore
 *
 * ВАЖНО: чтобы отзывы заработали, заполните firebaseConfig ниже.
 * Пошаговая инструкция — в файле НАСТРОЙКА-ОТЗЫВОВ.md
 */

// ⬇️ Вставьте сюда конфигурацию вашего проекта Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyCnlog3LUstMwTtY2g0hGmrw-lXvLeO0Kw',
  authDomain: 'denmark-tours.firebaseapp.com',
  projectId: 'denmark-tours',
  storageBucket: 'denmark-tours.firebasestorage.app',
  messagingSenderId: '59544137507',
  appId: '1:59544137507:web:8ff4ee5a6ce3295e9be696',
};

const els = {
  list: document.getElementById('reviews-list'),
  empty: document.getElementById('reviews-empty'),
  status: document.getElementById('reviews-status'),
  formWrap: document.getElementById('review-form-wrap'),
  form: document.getElementById('review-form'),
  submit: document.getElementById('review-submit'),
  success: document.getElementById('review-success'),
  error: document.getElementById('review-error'),
};

const isConfigured = !Object.values(firebaseConfig).some((v) => String(v).startsWith('YOUR_'));

if (!isConfigured) {
  // Firebase ещё не настроен — прячем форму, показываем заглушку
  els.formWrap.hidden = true;
  els.status.hidden = false;
  els.status.textContent = 'Раздел отзывов скоро откроется — заходите позже!';
} else {
  initReviews();
}

async function initReviews() {
  const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
  const { getFirestore, collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp } = await import(
    'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js'
  );

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const reviewsRef = collection(db, 'reviews');

  // --- Загрузка отзывов ---
  async function loadReviews() {
    try {
      const snap = await getDocs(query(reviewsRef, orderBy('createdAt', 'desc'), limit(50)));
      els.list.innerHTML = '';

      if (snap.empty) {
        els.empty.hidden = false;
        return;
      }

      els.empty.hidden = true;
      snap.forEach((doc) => els.list.appendChild(renderCard(doc.data())));
    } catch (err) {
      console.error('Не удалось загрузить отзывы:', err);
      els.status.hidden = false;
      els.status.textContent = 'Не удалось загрузить отзывы. Обновите страницу.';
    }
  }

  // --- Карточка отзыва (безопасно, через textContent) ---
  function renderCard(data) {
    const card = document.createElement('article');
    card.className = 'review-card';

    const rating = Math.min(5, Math.max(1, Number(data.rating) || 5));
    const stars = document.createElement('div');
    stars.className = 'review-card__stars';
    stars.setAttribute('aria-label', `Оценка: ${rating} из 5`);
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement('span');
      star.textContent = '★';
      if (i > rating) star.className = 'star--empty';
      stars.appendChild(star);
    }

    const text = document.createElement('p');
    text.className = 'review-card__text';
    text.textContent = String(data.text || '');

    const author = document.createElement('div');
    author.className = 'review-card__author';

    const name = document.createElement('span');
    name.className = 'review-card__name';
    name.textContent = String(data.name || 'Гость');

    const meta = document.createElement('span');
    meta.className = 'review-card__route';
    const parts = [];
    if (data.route) parts.push(String(data.route));
    if (data.createdAt && data.createdAt.toDate) {
      parts.push(data.createdAt.toDate().toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }));
    }
    meta.textContent = parts.join(' · ');

    author.append(name, meta);
    card.append(stars, text, author);
    return card;
  }

  // --- Отправка формы ---
  els.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    els.success.hidden = true;
    els.error.hidden = true;

    const name = els.form.name.value.trim();
    const text = els.form.text.value.trim();
    const route = els.form.route.value;
    const rating = Number(els.form.rating.value);

    if (!name) return showError('Пожалуйста, укажите ваше имя.');
    if (!rating) return showError('Пожалуйста, поставьте оценку.');
    if (text.length < 10) return showError('Отзыв должен содержать минимум 10 символов.');

    els.submit.disabled = true;
    els.submit.textContent = 'Отправка…';

    try {
      await addDoc(reviewsRef, {
        name: name.slice(0, 60),
        route: route.slice(0, 60),
        rating,
        text: text.slice(0, 1000),
        createdAt: serverTimestamp(),
      });
      els.form.reset();
      els.success.hidden = false;
      await loadReviews();
    } catch (err) {
      console.error('Не удалось отправить отзыв:', err);
      showError('Не удалось отправить отзыв. Проверьте соединение и попробуйте ещё раз.');
    } finally {
      els.submit.disabled = false;
      els.submit.textContent = 'Отправить отзыв';
    }
  });

  function showError(message) {
    els.error.textContent = message;
    els.error.hidden = false;
  }

  loadReviews();
}
