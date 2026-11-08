const styles = [
  ["Kartun Flat","2D","🎨","linear-gradient(135deg,#ffb36b,#e96d8c)"],
  ["Doodle","2D","✏️","linear-gradient(135deg,#f3d8a2,#9ab7b0)"],
  ["Anime Sinematik","2D","🌸","linear-gradient(135deg,#f7a7c4,#786bd9)"],
  ["Komik","2D","💥","linear-gradient(135deg,#f8d24d,#e66d3f)"],
  ["Stickman","2D","⚪","linear-gradient(135deg,#cbd5e1,#64748b)"],
  ["Kolase Kertas","2D","✂️","linear-gradient(135deg,#f4c2a1,#b18be8)"],
  ["Pixel Retro","2D","👾","linear-gradient(135deg,#55c7b1,#6b78d6)"],
  ["Cat Air","2D","🖌️","linear-gradient(135deg,#a9d8dc,#b6a2e7)"],
  ["3D Clay","3D","🧸","linear-gradient(135deg,#f2ad86,#ca7a9e)"],
  ["3D Animasi","3D","🪄","linear-gradient(135deg,#7dc7ed,#8d78db)"],
  ["Low Poly","3D","🔷","linear-gradient(135deg,#9bd3b0,#5c91bb)"],
  ["Diorama Mini","3D","🏡","linear-gradient(135deg,#b8d6a2,#e5ad79)"],
  ["3D Medis","3D","🫀","linear-gradient(135deg,#f49caa,#8879d7)"],
  ["3D Chibi","3D","🐣","linear-gradient(135deg,#f7c3a5,#d78bc4)"],
  ["Realistis Sinematik","Sinematik","🎬","linear-gradient(135deg,#657a9b,#252d4c)"],
  ["Dokumenter Foto","Sinematik","📷","linear-gradient(135deg,#a6a18e,#536a70)"],
  ["Foto Arsip Lawas","Sinematik","📜","linear-gradient(135deg,#c6a77d,#77614c)"],
  ["Fantasi Epik","Sinematik","🐉","linear-gradient(135deg,#8b7be0,#df8cae)"],
  ["Film Noir","Sinematik","🌑","linear-gradient(135deg,#777987,#252631)"],
  ["Sketsa Pensil","Artistik","✍️","linear-gradient(135deg,#c9c7c1,#777b82)"],
  ["Lukisan Minyak","Artistik","🖼️","linear-gradient(135deg,#d49a68,#7c5368)"],
  ["Infografis","Artistik","📊","linear-gradient(135deg,#64c5c4,#5f78d5)"],
  ["Sejarah Kartun","Artistik","🏛️","linear-gradient(135deg,#e2b47e,#8d9eaa)"],
  ["Sketsa Arang","Artistik","🖤","linear-gradient(135deg,#88858b,#33343b)"]
];

const grid = document.querySelector("#styleGrid");
const filters = document.querySelector("#filters");
const note = document.querySelector("#selectedNote");
const topic = document.querySelector("#topic");
const startButton = document.querySelector("#startButton");
const notice = document.querySelector("#notice");
let selectedStyle = "";
let format = "9:16";
let activeFilter = "Semua";

function renderStyles() {
  grid.innerHTML = "";
  styles.forEach(([name, category, symbol, art]) => {
    if (activeFilter !== "Semua" && category !== activeFilter) return;
    const card = document.createElement("button");
    card.type = "button";
    card.className = "style-card" + (selectedStyle === name ? " selected" : "");
    card.setAttribute("aria-pressed", selectedStyle === name ? "true" : "false");
    card.innerHTML = `<span class="check" aria-hidden="true">✓</span><span class="style-art" style="--art:${art}"><span class="art-symbol">${symbol}</span></span><span class="style-meta"><span class="style-name">${name}</span><span class="style-category">${category}</span></span>`;
    card.addEventListener("click", () => {
      selectedStyle = name;
      note.textContent = "Gaya dipilih: " + name;
      notice.hidden = true;
      startButton.disabled = !topic.value.trim();
      renderStyles();
    });
    grid.appendChild(card);
  });
}
filters.addEventListener("click", event => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;
  activeFilter = button.dataset.filter;
  filters.querySelectorAll(".filter").forEach(item => item.classList.toggle("active", item === button));
  renderStyles();
});
document.querySelectorAll(".format-option").forEach(button => button.addEventListener("click", () => {
  format = button.dataset.format;
  document.querySelectorAll(".format-option").forEach(item => item.classList.toggle("selected", item === button));
}));
topic.addEventListener("input", () => {
  startButton.disabled = !(topic.value.trim() && selectedStyle);
  notice.hidden = true;
});
startButton.addEventListener("click", () => {
  if (!topic.value.trim() || !selectedStyle) return;
  notice.textContent = "Pilihan proyek tersimpan di tampilan prototipe: " + selectedStyle + " · " + format + ". Mesin AI dan otomatisasi belum diaktifkan; tahap ini khusus menguji fondasi UI.";
  notice.hidden = false;
});
renderStyles();
