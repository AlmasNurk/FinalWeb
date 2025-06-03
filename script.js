let articles = [];

// Calculate reading time (200 words per minute)
function calculateReadingTime(wordCount) {
  const wordsPerMinute = 200;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}

// Render articles
function renderArticles(articles) {
  const container = document.getElementById('articles-container');
  if (!container) {
    console.error('Articles container not found');
    return;
  }
  container.innerHTML = '';
  if (articles.length === 0) {
    container.innerHTML = '<p>No articles available. Please try again later.</p>';
    return;
  }
  articles.forEach(article => {
    if (!article.title || !article.content || !article.date || !article.views || !article.wordCount) {
      console.warn(`Invalid article data for ID ${article.id}:`, article);
      return;
    }
    const readingTime = calculateReadingTime(article.wordCount);
    const card = `
            <div class="col">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${article.title}</h5>
                        <p class="card-text">${article.content.substring(0, 100)}...</p>
                        <p class="card-text"><small class="text-muted">Category: ${article.category || 'Unknown'} | ${article.date} | ${readingTime} | Views: ${article.views}</small></p>
                        <button class="btn btn-primary" onclick="showArticleModal(${article.id})">Read More</button>
                    </div>
                </div>
            </div>
        `;
    container.innerHTML += card;
  });
  renderMostPopular();
}

// Render most popular article
function renderMostPopular() {
  if (articles.length === 0) return;
  const container = document.getElementById('most-popular');
  if (!container) {
    console.error('Most popular container not found');
    return;
  }
  const mostPopular = articles.reduce((max, article) => article.views > max.views ? article : max, articles[0]);
  const readingTime = calculateReadingTime(mostPopular.wordCount);
  container.innerHTML = `
        <div class="card-body">
            <h5 class="card-title">${mostPopular.title}</h5>
            <p class="card-text">${mostPopular.content.substring(0, 150)}...</p>
            <p class="card-text"><small class="text-muted">Category: ${mostPopular.category || 'Unknown'} | ${mostPopular.date} | ${readingTime} | Views: ${mostPopular.views}</small></p>
            <button class="btn btn-primary" onclick="showArticleModal(${mostPopular.id})">Read More</button>
        </div>
    `;
}

// Show article details in modal
function showArticleModal(id) {
  const article = articles.find(a => a.id === id);
  if (!article) {
    console.error(`Article with ID ${id} not found`);
    return;
  }
  article.views++;
  localStorage.setItem('articles', JSON.stringify(articles));
  document.getElementById('articleModalLabel').textContent = article.title;
  document.getElementById('modal-date').textContent = `Date: ${article.date}`;
  document.getElementById('modal-category').textContent = `Category: ${article.category || 'Unknown'}`;
  document.getElementById('modal-content').textContent = article.content;
  document.getElementById('modal-reading-time').textContent = `Reading Time: ${calculateReadingTime(article.wordCount)}`;
  document.getElementById('modal-views').textContent = `Views: ${article.views}`;
  const modal = new bootstrap.Modal(document.getElementById('articleModal'));
  modal.show();
  renderArticles(articles);
}

// Sort articles
function sortArticles(criteria) {
  if (criteria === 'views') {
    articles.sort((a, b) => b.views - a.views);
  } else if (criteria === 'date') {
    articles.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
  renderArticles(articles);
}

// Theme toggle
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeToggleText(newTheme);
}

// Update theme toggle button text
function updateThemeToggleText(theme) {
  const toggleButton = document.querySelector('.theme-toggle');
  if (toggleButton) {
    toggleButton.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Load theme from localStorage
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeToggleText(savedTheme);

  // Check for stored articles in localStorage
  const storedArticles = localStorage.getItem('articles');
  if (storedArticles) {
    try {
      articles = JSON.parse(storedArticles);
      renderArticles(articles);
    } catch (e) {
      console.error('Error parsing stored articles from localStorage:', e);
      localStorage.removeItem('articles'); // Clear invalid data
    }
  }

  // Fetch articles from articles.json
  fetch('articles.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to load articles.json: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      if (!data.articles || !Array.isArray(data.articles)) {
        throw new Error('Invalid articles data format');
      }
      articles = data.articles;
      localStorage.setItem('articles', JSON.stringify(articles));
      renderArticles(articles);
    })
    .catch(error => {
      console.error('Error fetching articles:', error);
      const container = document.getElementById('articles-container');
      if (container) {
        container.innerHTML = '<p>Error loading articles. Please check if articles.json is available and try again.</p>';
      }
    });
});
