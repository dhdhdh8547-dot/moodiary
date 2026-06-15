

const STORAGE_KEY = 'moodiary_entries_v1';
const THEME_KEY = 'moodiary_theme_v1';

const moodMap = {
  happy: { label: '행복', icon: '😊', message: '밝은 순간을 더 오래 기억해요.' },
  calm: { label: '평온', icon: '🌿', message: '고요한 하루도 충분히 소중해요.' },
  tired: { label: '피곤', icon: '😴', message: '쉬어가는 날도 기록할 가치가 있어요.' },
  sad: { label: '우울', icon: '☁️', message: '흐린 마음도 지나가는 과정이에요.' },
  angry: { label: '화남', icon: '🔥', message: '감정을 적으면 마음이 조금 정리돼요.' }
};

const weatherMap = {
  sunny: '☀️ 맑음',
  cloudy: '☁️ 흐림',
  rainy: '🌧️ 비',
  snowy: '❄️ 눈',
  windy: '🍃 바람'
};

const sampleEntries = [
  {
    id: 'sample-1',
    date: '2026-06-14',
    title: '생각보다 괜찮았던 하루',
    mood: 'happy',
    weather: 'sunny',
    score: 8,
    keywords: ['친구', '산책', '커피'],
    content: '오전에 할 일이 많아서 조금 정신없었지만, 오후에 친구와 산책하면서 기분이 좋아졌다. 오늘은 완벽하진 않았지만 꽤 괜찮은 하루였다.',
    createdAt: '2026-06-14T10:30:00.000Z'
  },
  {
    id: 'sample-2',
    date: '2026-06-13',
    title: '천천히 쉬어간 날',
    mood: 'calm',
    weather: 'cloudy',
    score: 7,
    keywords: ['휴식', '정리'],
    content: '오늘은 해야 할 일을 조금 내려놓고 방을 정리했다. 마음이 복잡할 때 주변을 정돈하면 생각도 같이 정리되는 느낌이 든다.',
    createdAt: '2026-06-13T09:00:00.000Z'
  },
  {
    id: 'sample-3',
    date: '2026-06-12',
    title: '피곤했지만 끝낸 일',
    mood: 'tired',
    weather: 'rainy',
    score: 6,
    keywords: ['과제', '집중'],
    content: '몸은 피곤했지만 미루던 일을 끝냈다. 결과가 아주 만족스럽지는 않아도 끝까지 해냈다는 점에서 의미가 있었다.',
    createdAt: '2026-06-12T12:00:00.000Z'
  }
];

function $(selector, parent = document) {
  return parent.querySelector(selector);
}

function $all(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

function getEntries() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (error) {
    console.error('저장된 일기를 읽는 중 오류가 발생했습니다.', error);
    return [];
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function makeId() {
  return 'entry-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
}

function escapeHTML(text) {
  return String(text || '').replace(/[&<>'"]/g, function (char) {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    };
    return entities[char];
  });
}

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString + 'T00:00:00');
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  }).format(date);
}

function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMoodText(mood) {
  const item = moodMap[mood] || moodMap.happy;
  return `${item.icon} ${item.label}`;
}

function showToast(message) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(function () {
    toast.classList.remove('show');
  }, 1800);
}

function setTheme(theme) {
  document.body.classList.toggle('dark', theme === 'dark');
  localStorage.setItem(THEME_KEY, theme);
  const button = $('#themeToggle');
  if (button) button.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function initCommonUI() {
  const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
  setTheme(savedTheme);

  const themeToggle = $('#themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const nextTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
      setTheme(nextTheme);
      showToast(nextTheme === 'dark' ? '다크 모드로 변경했어요.' : '라이트 모드로 변경했어요.');
    });
  }

  const menuToggle = $('#menuToggle');
  const mainNav = $('#mainNav');
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', function () {
      mainNav.classList.toggle('open');
    });
  }
}

function initHomePage() {
  const todayDate = $('#todayDate');
  const todayMessage = $('#todayMessage');
  if (todayDate) todayDate.textContent = formatDate(getTodayString());
  if (todayMessage) {
    const messages = [
      '오늘의 감정을 하나 골라 기록해보세요.',
      '짧은 문장도 좋은 일기가 될 수 있어요.',
      '나중에 다시 보면 오늘의 내가 보여요.'
    ];
    let index = 0;
    todayMessage.textContent = messages[index];
    setInterval(function () {
      index = (index + 1) % messages.length;
      todayMessage.textContent = messages[index];
    }, 2500);
  }

  const searchInput = $('#searchInput');
  const filterButtons = $all('.filter-btn');
  let activeFilter = 'all';

  function render() {
    const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    renderDiaryList(activeFilter, keyword);
    renderStats();
  }

  if (searchInput) {
    searchInput.addEventListener('input', render);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      filterButtons.forEach(function (btn) { btn.classList.remove('active'); });
      button.classList.add('active');
      activeFilter = button.dataset.filter;
      render();
    });
  });

  const loadSampleBtn = $('#loadSampleBtn');
  if (loadSampleBtn) {
    loadSampleBtn.addEventListener('click', function () {
      const current = getEntries();
      const hasSample = current.some(function (entry) { return entry.id.startsWith('sample-'); });
      if (hasSample) {
        showToast('샘플 일기가 이미 있어요.');
        return;
      }
      saveEntries([...sampleEntries, ...current]);
      render();
      showToast('샘플 일기를 불러왔어요.');
    });
  }

  const clearAllBtn = $('#clearAllBtn');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', function () {
      const entries = getEntries();
      if (entries.length === 0) {
        showToast('삭제할 일기가 없어요.');
        return;
      }
      const ok = confirm('저장된 모든 일기를 삭제할까요?');
      if (ok) {
        saveEntries([]);
        render();
        showToast('전체 일기를 삭제했어요.');
      }
    });
  }

  render();
}

function renderStats() {
  const entries = getEntries();
  const totalCount = $('#totalCount');
  const avgScore = $('#avgScore');
  const topMood = $('#topMood');

  if (totalCount) totalCount.textContent = String(entries.length);

  if (avgScore) {
    const avg = entries.length ? entries.reduce((sum, entry) => sum + Number(entry.score || 0), 0) / entries.length : 0;
    avgScore.textContent = entries.length ? avg.toFixed(1) + '점' : '0점';
  }

  if (topMood) {
    const counts = entries.reduce(function (acc, entry) {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {});
    const top = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; })[0];
    topMood.textContent = top ? getMoodText(top) : '-';
  }
}

function renderDiaryList(filter, keyword) {
  const list = $('#diaryList');
  const emptyState = $('#emptyState');
  if (!list || !emptyState) return;

  const entries = getEntries()
    .sort(function (a, b) { return new Date(b.date) - new Date(a.date); })
    .filter(function (entry) {
      const matchMood = filter === 'all' || entry.mood === filter;
      const searchBase = [entry.title, entry.content, (entry.keywords || []).join(' ')].join(' ').toLowerCase();
      const matchKeyword = !keyword || searchBase.includes(keyword);
      return matchMood && matchKeyword;
    });

  list.innerHTML = '';

  if (entries.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  entries.forEach(function (entry) {
    const card = document.createElement('a');
    card.className = `diary-card mood-${entry.mood}`;
    card.href = `detail.html?id=${encodeURIComponent(entry.id)}`;
    card.innerHTML = `
      <div class="card-top">
        <span class="mood-badge">${getMoodText(entry.mood)}</span>
        <span class="date-text">${formatDate(entry.date)}</span>
      </div>
      <h3 title="${escapeHTML(entry.title)}">${escapeHTML(entry.title)}</h3>
      <p>${escapeHTML(entry.content)}</p>
      <div class="card-meta">
        <span>${weatherMap[entry.weather] || '☀️ 맑음'}</span>
        <span>${escapeHTML(entry.score)}점</span>
      </div>
      <div class="tag-list">
        ${(entry.keywords || []).map(function (tag) { return `<span class="tag">#${escapeHTML(tag)}</span>`; }).join('')}
      </div>
    `;
    list.appendChild(card);
  });

  // jQuery CDN이 정상 로드된 경우, 수업에서 배운 시각 효과를 적용합니다.
  if (window.jQuery) {
    window.jQuery('.diary-card').hide().fadeIn(260);
  }
}

function initWritePage() {
  const form = $('#diaryForm');
  if (!form) return;

  const entryId = $('#entryId');
  const dateInput = $('#dateInput');
  const titleInput = $('#titleInput');
  const weatherInput = $('#weatherInput');
  const scoreInput = $('#scoreInput');
  const scoreValue = $('#scoreValue');
  const keywordInput = $('#keywordInput');
  const contentInput = $('#contentInput');
  const charCount = $('#charCount');
  const resetBtn = $('#resetBtn');
  const writeTitle = $('#writeTitle');

  const editId = new URLSearchParams(location.search).get('id');
  const editingEntry = editId ? getEntries().find(function (entry) { return entry.id === editId; }) : null;

  dateInput.value = getTodayString();
  titleInput.focus();

  if (editingEntry) {
    entryId.value = editingEntry.id;
    dateInput.value = editingEntry.date;
    titleInput.value = editingEntry.title;
    weatherInput.value = editingEntry.weather;
    scoreInput.value = editingEntry.score;
    keywordInput.value = (editingEntry.keywords || []).join(', ');
    contentInput.value = editingEntry.content;
    const moodRadio = $(`input[name="mood"][value="${editingEntry.mood}"]`);
    if (moodRadio) moodRadio.checked = true;
    if (writeTitle) writeTitle.textContent = '일기 수정하기';
  }

  function updatePreview() {
    const mood = $('input[name="mood"]:checked').value;
    const title = titleInput.value.trim() || '제목이 이곳에 표시됩니다';
    const content = contentInput.value.trim() || '일기 내용을 입력하면 실시간으로 미리보기가 바뀝니다.';
    const score = scoreInput.value;
    const keywordList = parseKeywords(keywordInput.value);

    scoreValue.textContent = score + '점';
    charCount.textContent = String(contentInput.value.length);

    const previewCard = $('#previewCard');
    previewCard.className = `diary-card preview-card mood-${mood}`;
    $('#previewMood').textContent = getMoodText(mood);
    $('#previewDate').textContent = formatDate(dateInput.value);
    $('#previewTitle').textContent = title;
    $('#previewContent').textContent = content;
    $('#previewWeather').textContent = weatherMap[weatherInput.value] || '☀️ 맑음';
    $('#previewScore').textContent = score + '점';
    $('#previewTags').innerHTML = keywordList.map(function (tag) {
      return `<span class="tag">#${escapeHTML(tag)}</span>`;
    }).join('');
  }

  $all('input, textarea, select', form).forEach(function (field) {
    field.addEventListener('input', updatePreview);
    field.addEventListener('change', updatePreview);
  });

  resetBtn.addEventListener('click', function () {
    form.reset();
    entryId.value = editingEntry ? editingEntry.id : '';
    dateInput.value = getTodayString();
    updatePreview();
    titleInput.focus();
    showToast('입력 내용을 초기화했어요.');
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (!title) {
      showToast('제목을 입력해주세요.');
      titleInput.focus();
      return;
    }

    if (!content) {
      showToast('일기 내용을 입력해주세요.');
      contentInput.focus();
      return;
    }

    const entries = getEntries();
    const id = entryId.value || makeId();
    const newEntry = {
      id,
      date: dateInput.value || getTodayString(),
      title,
      mood: $('input[name="mood"]:checked').value,
      weather: weatherInput.value,
      score: Number(scoreInput.value),
      keywords: parseKeywords(keywordInput.value),
      content,
      createdAt: editingEntry ? editingEntry.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const existingIndex = entries.findIndex(function (entry) { return entry.id === id; });
    if (existingIndex >= 0) {
      entries[existingIndex] = newEntry;
    } else {
      entries.unshift(newEntry);
    }

    saveEntries(entries);
    showToast('일기를 저장했어요.');
    window.setTimeout(function () {
      location.href = `detail.html?id=${encodeURIComponent(id)}`;
    }, 500);
  });

  updatePreview();
}

function parseKeywords(value) {
  return String(value || '')
    .split(',')
    .map(function (item) { return item.trim(); })
    .filter(Boolean)
    .slice(0, 6);
}

function initDetailPage() {
  const id = new URLSearchParams(location.search).get('id');
  const detailCard = $('#detailCard');
  const notFoundState = $('#notFoundState');
  if (!detailCard || !notFoundState) return;

  const entry = getEntries().find(function (item) { return item.id === id; });

  if (!entry) {
    detailCard.classList.add('hidden');
    notFoundState.classList.remove('hidden');
    return;
  }

  detailCard.className = `detail-card mood-${entry.mood}`;
  detailCard.innerHTML = `
    <div class="detail-head">
      <div>
        <p class="eyebrow">Diary Detail</p>
        <h1>${escapeHTML(entry.title)}</h1>
      </div>
      <span class="mood-badge">${getMoodText(entry.mood)}</span>
    </div>

    <div class="detail-info">
      <span class="date-text">${formatDate(entry.date)}</span>
      <span class="date-text">${weatherMap[entry.weather] || '☀️ 맑음'}</span>
      <span class="date-text">하루 점수 ${escapeHTML(entry.score)}점</span>
    </div>

    <div class="tag-list">
      ${(entry.keywords || []).map(function (tag) { return `<span class="tag">#${escapeHTML(tag)}</span>`; }).join('')}
    </div>

    <div class="detail-content">${escapeHTML(entry.content)}</div>

    <p class="page-desc">${moodMap[entry.mood]?.message || moodMap.happy.message}</p>

    <div class="detail-actions">
      <a class="btn primary" href="write.html?id=${encodeURIComponent(entry.id)}">수정하기</a>
      <button class="btn danger" id="deleteBtn" type="button">삭제하기</button>
      <button class="btn ghost" id="printBtn" type="button">인쇄하기</button>
      <a class="btn light" href="index.html">목록으로</a>
    </div>
  `;

  const deleteBtn = $('#deleteBtn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', function () {
      const ok = confirm('이 일기를 삭제할까요?');
      if (!ok) return;
      const nextEntries = getEntries().filter(function (item) { return item.id !== entry.id; });
      saveEntries(nextEntries);
      showToast('일기를 삭제했어요.');
      window.setTimeout(function () {
        location.href = 'index.html';
      }, 500);
    });
  }

  const printBtn = $('#printBtn');
  if (printBtn) {
    printBtn.addEventListener('click', function () {
      window.print();
    });
  }
}

document.addEventListener('DOMContentLoaded', function () {
  initCommonUI();

  const page = document.body.dataset.page;
  if (page === 'home') initHomePage();
  if (page === 'write') initWritePage();
  if (page === 'detail') initDetailPage();
});
