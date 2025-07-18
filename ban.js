const maxRedBan = 3;
let currentWeek = 1;
let step = 1;
let selectedWeekBan = {};
let selectedRedBan = [];

const roleList = ["聖普", "帝君", "螳螂", "莫", "索", "天尊", "元神", "神羅", "星皇"];
const fixedRoles = { 1: ["天尊"], 2: ["索"], 3: ["星皇"], 4: ["莫"] };

window.onload = async() => {
  await loadRecommendations();
  const weekSelect = document.getElementById("weekSelect");
  [1, 2, 3, 4].forEach(w => {
    weekSelect.append(new Option(`第 ${w} 週`, w));
  });
  onWeekChange();
};

function onWeekChange() {
  currentWeek = parseInt(document.getElementById("weekSelect").value);
  step = 1;
  selectedWeekBan = {};
  selectedRedBan = [];
  setText("statusBox", "請選擇週ban角色。");
  clear(["tagList", "comboArea", "recommendBox"]);
  renderWeekBanUI();
}

function renderWeekBanUI() {
  const area = document.getElementById("comboArea");
  fixedRoles[currentWeek].forEach((fix, i) => {
    const wrap = document.createElement("div");
    wrap.innerHTML = `固定角色：<b>${fix}</b> + ${renderSelect(i)}`;
    area.appendChild(wrap);
  });

  const btn = createButton("繼續選紅ban", confirmWeekBan);
  area.appendChild(btn);
}

function renderSelect(idx) {
  const opts = roleList.concat("空ban").map(r => `<option>${r}</option>`).join("");
  return `<select data-row="${idx}"><option value="">請選擇</option>${opts}</select>`;
}

function confirmWeekBan() {
  selectedWeekBan = {};
  const selects = document.querySelectorAll("#comboArea select");
  for (const sel of selects) {
    if (!sel.value) return alert("請完成所有週ban選擇");
    selectedWeekBan[sel.dataset.row] = sel.value;
    sel.disabled = true;
  }

  step = 2;
  setText("statusBox", "請選擇紅色 ban（3 個）");
  renderRedBanOptions();
}

function renderRedBanOptions() {
  const tagList = document.getElementById("tagList");
  tagList.innerHTML = "";

  const banned = new Set([...Object.values(selectedWeekBan), ...fixedRoles[currentWeek], "空ban"]);

  roleList.forEach(role => {
    const tag = createTag(role, banned.has(role), toggleRedBan);
    tagList.appendChild(tag);
  });

  tagList.appendChild(createButton("查看推薦", showRecommendation));
}

function toggleRedBan(tag) {
  const role = tag.textContent;
  const i = selectedRedBan.indexOf(role);
  if (i >= 0) {
    selectedRedBan.splice(i, 1);
    tag.classList.remove("highlight");
  } else if (selectedRedBan.length < maxRedBan) {
    selectedRedBan.push(role);
    tag.classList.add("highlight");
  }
  setText("statusBox", `已選紅ban：${selectedRedBan.join(" / ")}`);
}

// Helpers
function setText(id, text) {
  document.getElementById(id).textContent = text;
}
function clear(ids) {
  ids.forEach(id => {
    document.getElementById(id).innerHTML = "";
    if (id === "recommendBox") document.getElementById(id).style.display = "none";
  });
}
function createButton(label, onClick) {
  const btn = document.createElement("button");
  btn.textContent = label;
  btn.onclick = onClick;
  return btn;
}
function createTag(text, dim, onClick) {
  const tag = document.createElement("span");
  tag.className = "tag";
  tag.textContent = text;
  if (dim) {
    tag.classList.add("dimmed");
    tag.style.pointerEvents = "none";
  } else {
    tag.onclick = () => onClick(tag);
  }
  return tag;
}
let RECOMMEND_DATA = [];

async function loadRecommendations() {
  const res = await fetch('./recommend.json');
  RECOMMEND_DATA = await res.json();
}

function showRecommendation() {
  if (selectedRedBan.length !== 3) {
    alert("請選滿 3 個紅色 ban");
    return;
  }

  const week = currentWeek;
  const weekBan = [
    ...fixedRoles[week],                          // 加入固定角色
    ...Object.values(selectedWeekBan)
  ].sort();

  const redBan = [...selectedRedBan].sort();

  const match = RECOMMEND_DATA.find(entry =>
    entry.week === week &&
    arraysEqual(entry.weekBan.sort(), weekBan) &&
    arraysEqual(entry.redBan.sort(), redBan)
  );

  const result = match ? match.recommendation : "推薦：暫無資料";
  document.getElementById("recommendBox").style.display = "block";
  document.getElementById("recommendBox").textContent = result;
}


// 用來比較兩陣列內容是否相同
function arraysEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
