// ============================================================
// Public page: loads products.json and renders the find cards.
// Read-only display — no write access, no keys involved.
// ============================================================

const DATA_URL = "products.json";

let allProducts = [];
let activeCategory = "All";

document.getElementById("year").textContent = new Date().getFullYear();

async function loadProducts() {
  const grid = document.getElementById("grid");
  try {
    const res = await fetch(DATA_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("products.json not reachable (" + res.status + ")");
    allProducts = await res.json();
  } catch (err) {
    grid.innerHTML = `<div class="empty">Couldn't load finds.<br>` +
      `Check that <code>products.json</code> exists and the page is opened via GitHub Pages (not as a local file).</div>`;
    console.error(err);
    return;
  }
  document.getElementById("statCount").textContent = allProducts.length;
  renderFilters();
  renderGrid();
}

function renderFilters() {
  const filters = document.getElementById("filters");
  const categories = ["All", ...new Set(allProducts.map(p => p.category).filter(Boolean))];

  filters.innerHTML = categories.map(cat => `
    <button class="chip ${cat === activeCategory ? "active" : ""}" data-cat="${escapeAttr(cat)}">
      ${escapeHtml(cat)}
    </button>
  `).join("");

  filters.querySelectorAll(".chip").forEach(btn => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.cat;
      renderFilters();
      renderGrid();
    });
  });
}

function renderGrid() {
  const grid = document.getElementById("grid");
  const list = allProducts
    .filter(p => activeCategory === "All" || p.category === activeCategory)
    .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  if (list.length === 0) {
    grid.innerHTML = `<div class="empty">Nothing in this category yet.</div>`;
    return;
  }

  grid.innerHTML = list.map((p, i) => `
    <a class="find-card ${p.featured ? "featured" : ""}" style="animation-delay:${Math.min(i * 45, 400)}ms" href="${escapeAttr(p.link || "#")}" target="_blank" rel="noopener sponsored">
      <div class="thumb-wrap">
        <img class="thumb" src="${escapeAttr(p.image || "")}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">
        ${p.category ? `<span class="cat-badge">${escapeHtml(p.category)}</span>` : ""}
        ${p.featured ? `<span class="hot-badge">🔥 Hot</span>` : ""}
      </div>
      <div class="body">
        <div class="row-top">
          <h3>${escapeHtml(p.title || "Untitled")}</h3>
          ${p.price ? `<span class="price">${escapeHtml(p.price)}</span>` : ""}
        </div>
        <p>${escapeHtml(p.description || "")}</p>
        <span class="cta">Shop this find →</span>
      </div>
    </a>
  `).join("");
}

// ---------- Share ----------

function initShare() {
  const btn = document.getElementById("shareBtn");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    const shareData = {
      title: document.title,
      text: "Check out my curated finds:",
      url: location.href,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* user cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(location.href);
        showToast("Link copied ✓");
      } catch {
        showToast("Couldn't copy link");
      }
    }
  });
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 2200);
}

function escapeHtml(str = "") {
  return String(str).replace(/[&<>"']/g, s => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[s]));
}
function escapeAttr(str = "") { return escapeHtml(str); }

initShare();
loadProducts();
