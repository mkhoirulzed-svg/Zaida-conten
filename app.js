const styles = [
  ["Kartun Flat","2D","🎨","linear-gradient(135deg,#ffb36b,#e96d8c)"],["Doodle","2D","✏️","linear-gradient(135deg,#f3d8a2,#9ab7b0)"],
  ["Anime Sinematik","2D","🌸","linear-gradient(135deg,#f7a7c4,#786bd9)"],["Komik","2D","💥","linear-gradient(135deg,#f8d24d,#e66d3f)"],
  ["Stickman","2D","⚪","linear-gradient(135deg,#cbd5e1,#64748b)"],["Kolase Kertas","2D","✂️","linear-gradient(135deg,#f4c2a1,#b18be8)"],
  ["Pixel Retro","2D","👾","linear-gradient(135deg,#55c7b1,#6b78d6)"],["Cat Air","2D","🖌️","linear-gradient(135deg,#a9d8dc,#b6a2e7)"],
  ["3D Clay","3D","🧸","linear-gradient(135deg,#f2ad86,#ca7a9e)"],["3D Animasi","3D","🪄","linear-gradient(135deg,#7dc7ed,#8d78db)"],
  ["Low Poly","3D","🔷","linear-gradient(135deg,#9bd3b0,#5c91bb)"],["Diorama Mini","3D","🏡","linear-gradient(135deg,#b8d6a2,#e5ad79)"],
  ["3D Medis","3D","🫀","linear-gradient(135deg,#f49caa,#8879d7)"],["3D Chibi","3D","🐣","linear-gradient(135deg,#f7c3a5,#d78bc4)"],
  ["Realistis Sinematik","Sinematik","🎬","linear-gradient(135deg,#657a9b,#252d4c)"],["Dokumenter Foto","Sinematik","📷","linear-gradient(135deg,#a6a18e,#536a70)"],
  ["Foto Arsip Lawas","Sinematik","📜","linear-gradient(135deg,#c6a77d,#77614c)"],["Fantasi Epik","Sinematik","🐉","linear-gradient(135deg,#8b7be0,#df8cae)"],
  ["Film Noir","Sinematik","🌑","linear-gradient(135deg,#777987,#252631)"],["Sketsa Pensil","Artistik","✍️","linear-gradient(135deg,#c9c7c1,#777b82)"],
  ["Lukisan Minyak","Artistik","🖼️","linear-gradient(135deg,#d49a68,#7c5368)"],["Infografis","Artistik","📊","linear-gradient(135deg,#64c5c4,#5f78d5)"],
  ["Sejarah Kartun","Artistik","🏛️","linear-gradient(135deg,#e2b47e,#8d9eaa)"],["Sketsa Arang","Artistik","🖤","linear-gradient(135deg,#88858b,#33343b)"]
];
const STORAGE_KEY = "zaida-content-projects-v2";
const $ = selector => document.querySelector(selector);
const FOOTAGE_API_BASE_URL = (document.querySelector('meta[name="zaida-api-base"]')?.content || window.ZAIDA_API_BASE_URL || "").trim().replace(/\/$/, "");

const grid = $("#styleGrid"), topic = $("#topic"), startButton = $("#startButton"), notice = $("#notice");
let selectedStyle = "", format = "9:16", activeFilter = "Semua", currentProjectId = null;
let projects = loadProjects();

function loadProjects() {
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    if (current !== null) {
      const parsed = JSON.parse(current);
      return Array.isArray(parsed) ? parsed.filter(project => project && project.id && Array.isArray(project.scenes)) : [];
    }
    // Migrasi otomatis dari penyimpanan versi sebelumnya agar draft lama tetap muncul.
    const legacy = localStorage.getItem("zaida-content-projects-v1");
    if (!legacy) return [];
    const parsedLegacy = JSON.parse(legacy);
    if (!Array.isArray(parsedLegacy)) return [];
    const migrated = parsedLegacy
      .filter(project => project && typeof project === "object")
      .map((project, index) => ({
        ...project,
        id: project.id || "legacy-" + Date.now() + "-" + index,
        title: project.title || "Proyek tanpa judul",
        style: project.style || "Kartun Flat",
        format: project.format || "9:16",
        script: project.script || (Array.isArray(project.scenes) ? project.scenes.map(scene => scene.text || "").join(" ") : ""),
        scenes: Array.isArray(project.scenes) ? project.scenes.map((scene, sceneIndex) => ({
          id: scene.id || "legacy-scene-" + index + "-" + sceneIndex,
          text: scene.text || "",
          title: scene.title || makeSceneTitle(scene.text || "", sceneIndex),
          keywords: scene.keywords || makeKeywords(scene.text || ""),
          duration: Number(scene.duration) || 6
        })) : [],
        createdAt: project.createdAt || new Date().toISOString(),
        status: project.status || "draft"
      }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    return migrated;
  } catch {
    showNotice("Sebagian draft lama tidak dapat dibaca. Data asli tidak dihapus.");
    return [];
  }
}
function persistProjects() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(projects)); return true; }
  catch { showNotice("Penyimpanan browser penuh atau tidak tersedia. Draft belum tersimpan."); return false; }
}
function showNotice(message) { notice.textContent = message; notice.hidden = false; }
function currentProject() { return projects.find(project => project.id === currentProjectId); }
function renderStyles() {
  grid.innerHTML = "";
  styles.forEach(([name, category, symbol, art]) => {
    if (activeFilter !== "Semua" && category !== activeFilter) return;
    const card = document.createElement("button");
    card.type = "button"; card.className = "style-card" + (selectedStyle === name ? " selected" : "");
    card.setAttribute("aria-pressed", String(selectedStyle === name));
    const artBox = document.createElement("span"); artBox.className = "style-art"; artBox.style.setProperty("--art", art);
    const icon = document.createElement("span"); icon.className = "art-symbol"; icon.textContent = symbol; artBox.append(icon);
    const meta = document.createElement("span"); meta.className = "style-meta";
    const title = document.createElement("span"); title.className = "style-name"; title.textContent = name;
    const type = document.createElement("span"); type.className = "style-category"; type.textContent = category;
    const check = document.createElement("span"); check.className = "check"; check.textContent = "✓";
    meta.append(title, type); card.append(check, artBox, meta);
    card.addEventListener("click", () => { selectedStyle = name; $("#selectedNote").textContent = "Gaya dipilih: " + name; updateCreateButton(); renderStyles(); });
    grid.append(card);
  });
}
function updateCreateButton() {
  startButton.disabled = !(topic.value.trim() && selectedStyle);
  $("#charCount").textContent = topic.value.length.toLocaleString("id-ID") + " / 12.000";
}
function splitIntoScenes(script) {
  const normalized = script.replace(/\s+/g, " ").trim();
  if (!normalized) return [];
  const sentences = normalized.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [normalized];
  const chunks = [];
  let current = "";
  sentences.forEach(sentence => {
    const part = sentence.trim();
    if (!part) return;
    if (current && (current.length + part.length > 230 || current.split(/\s+/).length > 34)) {
      chunks.push(current.trim()); current = "";
    }
    current += (current ? " " : "") + part;
  });
  if (current.trim()) chunks.push(current.trim());
  return chunks.map((text, index) => ({
    id: "scene-" + (index + 1) + "-" + Date.now().toString(36),
    text,
    title: makeSceneTitle(text, index),
    keywords: makeKeywords(text),
    duration: Math.max(4, Math.min(12, Math.ceil(text.split(/\s+/).length / 2.5)))
  }));
}
function makeSceneTitle(text, index) {
  const words = text.replace(/[^\p{L}\p{N}\s-]/gu, "").split(/\s+/).filter(Boolean);
  return words.slice(0, 6).join(" ") || ("Adegan " + (index + 1));
}
function makeKeywords(text) {
  const stop = new Set(["yang","dan","di","ke","dari","untuk","pada","dengan","adalah","ini","itu","akan","dalam","atau","oleh","juga","karena","setiap","secara","dapat","bisa","manusia","agar","lebih","saat","hingga","tidak","ada","sebuah","para"]);
  const words = (text.toLowerCase().match(/[\p{L}\p{N}]{3,}/gu) || []).filter(word => !stop.has(word));
  const unique = [...new Set(words)];
  return unique.slice(0, 5).join(", ");
}
function renderProjects() {
  const section = $("#recentSection"), list = $("#projectList");
  section.hidden = projects.length === 0; list.innerHTML = "";
  $("#projectCount").textContent = projects.length + " proyek";
  projects.slice(0, 6).forEach(project => {
    const card = document.createElement("button"); card.type = "button"; card.className = "project-card";
    const thumb = document.createElement("span"); thumb.className = "project-thumb";
    thumb.textContent = (styles.find(item => item[0] === project.style) || [null,null,"✦"])[2];
    const info = document.createElement("span"); info.className = "project-card-info";
    const title = document.createElement("b"); title.textContent = project.title;
    const detail = document.createElement("small"); detail.textContent = project.style + " · " + project.format + " · " + (project.scenes || []).length + " adegan";
    const arrow = document.createElement("span"); arrow.className = "project-arrow"; arrow.textContent = "›";
    info.append(title, detail); card.append(thumb, info, arrow); card.addEventListener("click", () => openProject(project.id)); list.append(card);
  });
}
function openProject(id) {
  currentProjectId = id;
  const project = currentProject(); if (!project) return;
  $("#projectTitle").textContent = project.title;
  $("#projectMeta").textContent = new Date(project.createdAt).toLocaleString("id-ID", {dateStyle:"medium",timeStyle:"short"});
  $("#projectStyle").textContent = project.style; $("#projectFormat").textContent = project.format;
  $("#sceneCount").textContent = (project.scenes || []).length + " adegan";
  $("#homeView").hidden = true; $("#projectView").hidden = false; notice.hidden = true;
  renderScenes(); window.scrollTo({top:0,behavior:"smooth"});
}
function renderScenes() {
  const project = currentProject(); if (!project) return;
  if (!Array.isArray(project.scenes)) project.scenes = [];
  const list = $("#sceneList"); list.innerHTML = "";
  $("#sceneCount").textContent = project.scenes.length + " adegan";
  $("#storyboardSubtitle").textContent = project.scenes.length + " adegan · Gaya " + project.style;
  if (project.scenes.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-scenes";
    empty.textContent = "Belum ada adegan. Tambahkan adegan atau edit naskah untuk menyusun storyboard kembali.";
    list.append(empty);
    return;
  }
  project.scenes.forEach((scene, index) => {
    const card = document.createElement("article"); card.className = "scene-card";
    const head = document.createElement("div"); head.className = "scene-head";
    const number = document.createElement("span"); number.className = "scene-number"; number.textContent = String(index + 1).padStart(2, "0");
    const name = document.createElement("div"); name.className = "scene-name";
    const title = document.createElement("b"); title.textContent = scene.title;
    const duration = document.createElement("span"); duration.className = "scene-duration"; duration.textContent = scene.duration + " dtk";
    name.append(title); head.append(number, name, duration);
    const body = document.createElement("p"); body.className = "scene-copy"; body.textContent = scene.text;
    const visual = document.createElement("div"); visual.className = "scene-visual";
    if (scene.footageUrl) {
      const preview = document.createElement("video");
      preview.className = "scene-video-preview"; preview.src = scene.footageUrl;
      preview.controls = true; preview.preload = "metadata"; preview.playsInline = true;
      preview.setAttribute("aria-label", "Preview footage adegan " + (index + 1));
      visual.classList.add("has-footage"); visual.append(preview);
    } else {
      const visualIcon = document.createElement("span"); visualIcon.className = "visual-placeholder-icon"; visualIcon.textContent = "▧";
      const visualText = document.createElement("span"); visualText.textContent = "Belum ada footage";
      const visualTag = document.createElement("small"); visualTag.textContent = "VISUAL ADEGAN";
      visual.append(visualIcon, visualText, visualTag);
    }
    const keywordLabel = document.createElement("div"); keywordLabel.className = "keyword-label"; keywordLabel.textContent = "KATA KUNCI PENCARIAN";
    const keywords = document.createElement("div"); keywords.className = "scene-keywords"; keywords.textContent = scene.keywords || scene.title || "Tambahkan kata kunci";
    const footagePanel = document.createElement("div"); footagePanel.className = "footage-panel";
    const searchQuery = [scene.keywords, scene.title].filter(Boolean).join(" ").trim();
    const autoSearch = document.createElement("button");
    autoSearch.type = "button"; autoSearch.className = "small-primary footage-auto-search";
    autoSearch.textContent = "✦ Cari footage otomatis";
    const searchStatus = document.createElement("p"); searchStatus.className = "footage-search-status";
    searchStatus.setAttribute("aria-live", "polite");
    const resultGrid = document.createElement("div"); resultGrid.className = "footage-results";
    autoSearch.addEventListener("click", () => searchFootage(scene, project, searchQuery, autoSearch, searchStatus, resultGrid));
    const providerRow = document.createElement("div"); providerRow.className = "footage-providers";
    [["Pixabay","https://pixabay.com/videos/search/"]].forEach(([label, base]) => {
      const link = document.createElement("a"); link.className = "footage-provider";
      link.href = base + encodeURIComponent(searchQuery || "cinematic background");
      link.target = "_blank"; link.rel = "noopener noreferrer"; link.textContent = "Cari di " + label;
      providerRow.append(link);
    });
    const urlLabel = document.createElement("label"); urlLabel.className = "footage-url-label";
    urlLabel.textContent = "Tempel URL file video langsung (.mp4 / .webm)";
    const urlInput = document.createElement("input"); urlInput.type = "url";
    urlInput.className = "footage-url-input"; urlInput.placeholder = "https://.../video.mp4";
    urlInput.value = scene.footageUrl || ""; urlInput.inputMode = "url";
    urlLabel.append(urlInput);
    const saveFootage = document.createElement("button"); saveFootage.type = "button";
    saveFootage.className = "small-primary footage-save"; saveFootage.textContent = scene.footageUrl ? "Ganti footage" : "Simpan footage";
    saveFootage.addEventListener("click", () => {
      const value = urlInput.value.trim();
      if (!value) { scene.footageUrl = ""; persistProjects(); renderScenes(); return; }
      try {
        const parsed = new URL(value);
        if (!["http:","https:"].includes(parsed.protocol) || !/\.(mp4|webm|ogg)(\?.*)?$/i.test(parsed.pathname + parsed.search)) {
          showNotice("Gunakan URL file video langsung berformat MP4, WebM, atau OGG. Tautan halaman pencarian tidak bisa diputar sebagai footage.");
          return;
        }
        scene.footageUrl = parsed.href;
        persistProjects(); renderScenes(); renderProjects();
        showNotice("Footage disimpan pada adegan ini.");
      } catch {
        showNotice("URL footage belum valid. Periksa kembali tautannya.");
      }
    });
    footagePanel.append(autoSearch, searchStatus, resultGrid, providerRow, urlLabel, saveFootage);
    const actions = document.createElement("div"); actions.className = "scene-actions";
    const edit = document.createElement("button"); edit.type = "button"; edit.className = "ghost-button"; edit.textContent = "Edit adegan";
    edit.addEventListener("click", () => editScene(scene.id));
    const remove = document.createElement("button"); remove.type = "button"; remove.className = "icon-button"; remove.setAttribute("aria-label", "Hapus adegan"); remove.textContent = "×";
    remove.addEventListener("click", () => { project.scenes = project.scenes.filter(item => item.id !== scene.id); persistProjects(); renderScenes(); renderProjects(); });
    actions.append(edit, remove); card.append(head, body, visual, keywordLabel, keywords, footagePanel, actions); list.append(card);
  });
}
async function searchFootage(scene, project, query, button, status, results) {
  if (!FOOTAGE_API_BASE_URL) {
    showNotice("API footage belum dihubungkan. Backend perlu di-deploy dan alamat API diatur terlebih dahulu.");
    status.textContent = "API belum dikonfigurasi.";
    return;
  }
  button.disabled = true; button.textContent = "Mencari...";
  status.textContent = "Mengambil pilihan video dari Pixabay...";
  results.innerHTML = "";
  try {
    const orientation = project.format === "16:9" ? "landscape" : "portrait";
    const params = new URLSearchParams({ q: query || scene.title || "cinematic background", orientation });
    const response = await fetch(FOOTAGE_API_BASE_URL + "/api/footage/search?" + params.toString(), {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(20000)
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) throw new Error(payload.error || "Pencarian tidak berhasil.");
    if (!payload.videos?.length) {
      status.textContent = "Belum ada video yang cocok. Coba kata kunci lain.";
      return;
    }
    status.textContent = payload.videos.length + " pilihan video ditemukan · Pixabay";
    payload.videos.forEach(video => {
      const item = document.createElement("article"); item.className = "footage-result";
      const thumb = document.createElement("img"); thumb.src = video.thumbnail; thumb.alt = "Preview footage dari Pixabay"; thumb.loading = "lazy";
      const meta = document.createElement("div"); meta.className = "footage-result-meta";
      const detail = document.createElement("span");
      detail.textContent = (video.width && video.height ? video.width + "×" + video.height + " · " : "") + (video.duration || 0) + " dtk";
      const credit = document.createElement("a"); credit.href = video.pageUrl; credit.target = "_blank"; credit.rel = "noopener noreferrer";
      credit.textContent = "Video oleh " + video.creator + " · Pixabay";
      const choose = document.createElement("button"); choose.type = "button"; choose.className = "footage-choose"; choose.textContent = "Pilih video";
      choose.disabled = !video.fileUrl;
      choose.addEventListener("click", () => {
        scene.footageUrl = video.fileUrl;
        scene.footageSource = "Pixabay";
        scene.footagePageUrl = video.pageUrl;
        scene.footageCreator = video.creator;
        persistProjects(); renderScenes(); renderProjects();
        showNotice("Footage Pixabay berhasil dipilih untuk adegan ini.");
      });
      meta.append(detail, credit, choose); item.append(thumb, meta); results.append(item);
    });
  } catch (error) {
    status.textContent = error.message || "Pencarian gagal.";
  } finally {
    button.disabled = false; button.textContent = "✦ Cari footage otomatis";
  }
}
function editScene(id) {
  const project = currentProject(), scene = project.scenes.find(item => item.id === id); if (!scene) return;
  const newText = window.prompt("Edit isi adegan:", scene.text); if (newText === null) return;
  const clean = newText.trim(); if (!clean) { showNotice("Isi adegan tidak boleh kosong."); return; }
  scene.text = clean; scene.title = makeSceneTitle(clean, project.scenes.indexOf(scene)); scene.keywords = makeKeywords(clean);
  persistProjects(); renderScenes();
}
function showHome() {
  $("#projectView").hidden = true; $("#homeView").hidden = false; currentProjectId = null;
  renderProjects(); window.scrollTo({top:0,behavior:"smooth"});
}
function createProject() {
  const script = topic.value.trim(); if (!script || !selectedStyle) return;
  const scenes = splitIntoScenes(script);
  if (!scenes.length) { showNotice("Naskah belum bisa disusun menjadi adegan."); return; }
  const project = {
    id: window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : "project-" + Date.now(),
    title: script.length > 58 ? script.slice(0,55) + "..." : script,
    script, style:selectedStyle, format, scenes, createdAt:new Date().toISOString(), status:"draft"
  };
  projects.unshift(project); projects = projects.slice(0, 30);
  persistProjects(); renderProjects(); topic.value = ""; selectedStyle = ""; format = "9:16";
  document.querySelectorAll(".format-option").forEach(item => item.classList.toggle("selected", item.dataset.format === format));
  $("#selectedNote").textContent = "Pilih satu gaya visual untuk melanjutkan.";
  renderStyles(); updateCreateButton(); openProject(project.id);
}
function addScene() {
  const project = currentProject(); if (!project) return;
  const text = window.prompt("Tulis isi adegan baru:");
  if (!text || !text.trim()) return;
  project.scenes.push({id:"scene-" + Date.now(),text:text.trim(),title:makeSceneTitle(text,project.scenes.length),keywords:makeKeywords(text),duration:6});
  persistProjects(); renderScenes();
}
$("#filters").addEventListener("click", event => {
  const button = event.target.closest("[data-filter]"); if (!button) return;
  activeFilter = button.dataset.filter;
  $("#filters").querySelectorAll(".filter").forEach(item => item.classList.toggle("active", item === button));
  renderStyles();
});
document.querySelectorAll(".format-option").forEach(button => button.addEventListener("click", () => {
  format = button.dataset.format;
  document.querySelectorAll(".format-option").forEach(item => item.classList.toggle("selected", item === button));
}));
topic.addEventListener("input", updateCreateButton);
startButton.addEventListener("click", createProject);
$("#backButton").addEventListener("click", showHome);
$("#addSceneButton").addEventListener("click", addScene);
$("#editScriptButton").addEventListener("click", () => {
  const project = currentProject(); if (!project) return;
  $("#editScript").value = project.script; $("#scriptEditor").hidden = false; $("#editScript").focus();
});
$("#cancelEditButton").addEventListener("click", () => { $("#scriptEditor").hidden = true; });
$("#saveScriptButton").addEventListener("click", () => {
  const project = currentProject(), script = $("#editScript").value.trim();
  if (!project || !script) { showNotice("Masukkan naskah terlebih dahulu."); return; }
  project.script = script; project.title = script.length > 58 ? script.slice(0,55) + "..." : script;
  project.scenes = splitIntoScenes(script); persistProjects();
  $("#projectTitle").textContent = project.title; $("#scriptEditor").hidden = true; renderScenes(); renderProjects();
  showNotice("Naskah diperbarui dan storyboard disusun ulang.");
});
updateCreateButton(); renderStyles(); renderProjects();
