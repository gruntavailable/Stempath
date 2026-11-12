const STORAGE_KEYS = {
  plan: "stemPathPlanV1",
  survey: "stemPathSurveyDemoV1",
  participant: "stemPathParticipantIdV1",
};

const assessmentQuestions = [
  { group: "Hứng thú khoa học – công nghệ", text: "Mình tò mò muốn biết những đồ dùng hoặc công nghệ quanh mình hoạt động như thế nào." },
  { group: "Hứng thú khoa học – công nghệ", text: "Mình thích thử một ý tưởng khoa học hoặc công nghệ nhỏ để xem điều gì xảy ra." },
  { group: "Tự tin học tập", text: "Khi gặp một bài toán khó, mình có thể chia nhỏ vấn đề để thử giải quyết." },
  { group: "Tự tin học tập", text: "Mình sẵn sàng học thêm một công cụ hoặc kiến thức mới khi cần." },
  { group: "Tư duy giải quyết vấn đề", text: "Mình thích tìm nhiều cách khác nhau để giải quyết một vấn đề." },
  { group: "Tư duy giải quyết vấn đề", text: "Mình muốn biết dữ liệu hoặc kết quả nào giúp kiểm chứng một lời giải." },
  { group: "Động lực nghề nghiệp", text: "Mình muốn tìm hiểu cách kiến thức STEM có thể tạo ra điều hữu ích cho người khác." },
  { group: "Động lực nghề nghiệp", text: "Mình muốn biết những công việc nào có thể dùng điều mình đang học." },
  { group: "Chủ động chuẩn bị tương lai", text: "Mình đã có một vài môn học muốn tìm hiểu sâu hơn." },
  { group: "Chủ động chuẩn bị tương lai", text: "Mình chủ động tìm hiểu ngành học, trường và điều kiện tuyển sinh." },
];

const likertLabels = ["Chưa giống", "Ít giống", "Một phần", "Khá giống", "Rất giống"];

const assessmentDimensions = [
  { key: "interest", label: "Hứng thú khoa học – công nghệ", questionIndexes: [0, 1] },
  { key: "confidence", label: "Tự tin học tập", questionIndexes: [2, 3] },
  { key: "problemSolving", label: "Tư duy giải quyết vấn đề", questionIndexes: [4, 5] },
  { key: "motivation", label: "Động lực nghề nghiệp", questionIndexes: [6, 7] },
  { key: "readiness", label: "Chủ động chuẩn bị tương lai", questionIndexes: [8, 9] },
];

const planSteps = [
  "Chọn một vài nhóm ngành em muốn tìm hiểu",
  "Đối chiếu môn học và yêu cầu của trường",
  "Ghi lại kiến thức hoặc kỹ năng muốn bổ sung",
  "Lưu trường, nguồn chính thức và mốc thời gian cần nhớ",
];

const interestGroups = [
  {
    id: "computer",
    name: "Công nghệ & máy tính",
    symbol: "</>",
    palette: "pathway-navy",
    block: "Toán – Tin học",
    coreSubjects: ["Toán", "Tin học"],
    supportSubjects: ["Vật lí", "Công nghệ"],
    description: "Phần mềm, hệ thống số, dữ liệu và cách công nghệ giải quyết vấn đề thực tế.",
    weights: { interest: 0.28, confidence: 0.12, problemSolving: 0.28, motivation: 0.12, readiness: 0.20 },
  },
  {
    id: "engineering",
    name: "Kỹ thuật & công nghệ",
    symbol: "⌘",
    palette: "pathway-sage",
    block: "Toán – Vật lí",
    coreSubjects: ["Toán", "Vật lí"],
    supportSubjects: ["Công nghệ", "Tin học"],
    description: "Thiết kế, xây dựng, máy móc và những giải pháp biến ý tưởng thành sản phẩm.",
    weights: { interest: 0.25, confidence: 0.20, problemSolving: 0.25, motivation: 0.15, readiness: 0.15 },
  },
  {
    id: "science",
    name: "Khoa học tự nhiên & môi trường",
    symbol: "⌬",
    palette: "pathway-violet",
    block: "Hóa học – Sinh học",
    coreSubjects: ["Hóa học", "Sinh học"],
    supportSubjects: ["Vật lí", "Công nghệ"],
    description: "Thí nghiệm, vật liệu, sinh học và cách hiểu sâu hơn về môi trường quanh ta.",
    weights: { interest: 0.25, confidence: 0.15, problemSolving: 0.20, motivation: 0.25, readiness: 0.15 },
  },
  {
    id: "mathdata",
    name: "Toán ứng dụng & dữ liệu",
    symbol: "∑",
    palette: "pathway-cream",
    block: "Toán – Tin học",
    coreSubjects: ["Toán", "Tin học"],
    supportSubjects: ["Vật lí", "Hóa học"],
    description: "Mô hình hóa, thống kê và tìm quy luật để đưa ra cách nhìn có căn cứ.",
    weights: { interest: 0.15, confidence: 0.15, problemSolving: 0.35, motivation: 0.15, readiness: 0.20 },
  },
];

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
let toastTimer;
let communitySyncQueue = Promise.resolve();

function parseStored(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function saveStored(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    showToast("Trình duyệt chưa cho phép lưu trên thiết bị này.");
    return false;
  }
}

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function normalise(value) {
  return value
    .toLocaleLowerCase("vi")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ")
    .trim();
}

function defaultPlan() {
  return {
    tracks: [],
    priorityTracks: [],
    combinations: [],
    steps: planSteps.map(() => ({ done: false, note: "" })),
  };
}

let plan = parseStored(STORAGE_KEYS.plan, null) || defaultPlan();
if (!Array.isArray(plan.tracks)) plan.tracks = [];
if (!Array.isArray(plan.priorityTracks)) plan.priorityTracks = [];
if (!Array.isArray(plan.combinations)) plan.combinations = [];
if (!Array.isArray(plan.steps) || plan.steps.length !== planSteps.length) {
  plan.steps = planSteps.map(() => ({ done: false, note: "" }));
}

function persistPlan() {
  saveStored(STORAGE_KEYS.plan, plan);
}

function addOrRemove(list, item) {
  return list.includes(item) ? list.filter((value) => value !== item) : [...list, item];
}

function renderPlan() {
  const selected = $("#selected-items");
  const steps = $("#plan-steps");
  if (!selected || !steps) return;

  selected.replaceChildren();
  const tags = [
    ...plan.tracks.map((value) => ({ type: "track", value })),
    ...plan.combinations.map((value) => ({ type: "combination", value })),
  ];
  selected.hidden = tags.length === 0;
  tags.forEach((item) => {
    const chip = document.createElement("span");
    chip.className = "selected-chip";
    const label = document.createElement("span");
    label.textContent = item.value;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.setAttribute("aria-label", `Xóa ${item.value} khỏi kế hoạch`);
    remove.textContent = "×";
    remove.addEventListener("click", () => {
      if (item.type === "track") {
        plan.tracks = plan.tracks.filter((value) => value !== item.value);
        plan.priorityTracks = plan.priorityTracks.filter((value) => value !== item.value);
      } else plan.combinations = plan.combinations.filter((value) => value !== item.value);
      persistPlan();
      renderPlan();
      updateSelectionButtons();
    });
    chip.append(label, remove);
    selected.append(chip);
  });

  steps.replaceChildren();
  planSteps.forEach((title, index) => {
    const entry = plan.steps[index] || { done: false, note: "" };
    const row = document.createElement("div");
    row.className = `plan-step${entry.done ? " is-done" : ""}`;
    const checkbox = document.createElement("input");
    checkbox.className = "step-check";
    checkbox.type = "checkbox";
    checkbox.id = `plan-step-${index + 1}`;
    checkbox.checked = Boolean(entry.done);
    checkbox.setAttribute("aria-label", `Đánh dấu hoàn thành: ${title}`);
    const content = document.createElement("div");
    content.className = "plan-step-content";
    const label = document.createElement("label");
    label.htmlFor = checkbox.id;
    label.textContent = title;
    const note = document.createElement("textarea");
    note.rows = 1;
    note.maxLength = 500;
    note.value = entry.note || "";
    note.placeholder = "Ghi chú hoặc thời điểm em muốn bắt đầu…";
    note.setAttribute("aria-label", `Ghi chú cho bước ${index + 1}`);
    checkbox.addEventListener("change", () => {
      plan.steps[index].done = checkbox.checked;
      row.classList.toggle("is-done", checkbox.checked);
      persistPlan();
      updatePlanProgress();
    });
    note.addEventListener("input", () => {
      plan.steps[index].note = note.value;
      persistPlan();
    });
    content.append(label, note);
    row.append(checkbox, content);
    steps.append(row);
  });

  updatePlanProgress();
  updateSelectionButtons();
}

function getParticipantId() {
  let participantId = localStorage.getItem(STORAGE_KEYS.participant);
  if (!participantId) {
    participantId = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEYS.participant, participantId);
  }
  return participantId;
}

function renderCommunityStats(data) {
  const list = $("#community-stats-list");
  const count = $("#community-response-count");
  if (!list || !count) return;

  const byId = new Map((Array.isArray(data.groups) ? data.groups : []).map((group) => [group.id, Number(group.selectedCount) || 0]));
  const groups = interestGroups
    .map((group) => ({ ...group, selectedCount: byId.get(group.id) || 0 }))
    .sort((first, second) => second.selectedCount - first.selectedCount);
  count.textContent = `${Number(data.totalBrowserIds) || 0} mã tham gia`;
  list.replaceChildren();

  if (groups.every((group) => group.selectedCount === 0)) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 3;
    cell.textContent = "Chưa có lựa chọn nào được ghi nhận.";
    row.append(cell);
    list.append(row);
    return;
  }

  groups.forEach((group, index) => {
    const row = document.createElement("tr");
    const rank = document.createElement("th");
    rank.scope = "row";
    rank.className = "selection-rank";
    rank.textContent = `#${index + 1}`;
    const name = document.createElement("td");
    name.className = "selection-name";
    name.textContent = group.name;
    const selectedCount = document.createElement("td");
    selectedCount.className = "selection-total";
    selectedCount.textContent = `${group.selectedCount} lượt`;
    row.append(rank, name, selectedCount);
    list.append(row);
  });
}

function setCommunityStatsStatus(message, isError = false) {
  const status = $("#community-stats-status");
  if (!status) return;
  status.textContent = message;
  status.classList.toggle("is-error", isError);
}

async function requestCommunityStats(method = "GET", body = null) {
  const response = await fetch("/api/industry-choices", {
    method,
    cache: "no-store",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Không thể tải thống kê.");
  renderCommunityStats(data);
  return data;
}

async function loadCommunityStats() {
  setCommunityStatsStatus("Đang tải bảng thống kê…");
  try {
    await requestCommunityStats();
    setCommunityStatsStatus("Thống kê được tổng hợp từ các lựa chọn đã gửi.");
  } catch {
    setCommunityStatsStatus("Chưa kết nối được thống kê chung. Lựa chọn trên thiết bị chưa được cộng vào bảng.", true);
  }
}

async function submitCommunityChoices(snapshot = plan.priorityTracks) {
  const trackIds = snapshot
    .map((name) => interestGroups.find((group) => group.name === name)?.id)
    .filter(Boolean);
  const body = { participantId: getParticipantId(), trackIds };
  setCommunityStatsStatus("Đang cập nhật lựa chọn vào thống kê chung…");
  try {
    const data = await requestCommunityStats("PUT", body);
    setCommunityStatsStatus("Lựa chọn đã được cập nhật vào bảng thống kê chung.");
    return data;
  } catch {
    setCommunityStatsStatus("Chưa gửi được lựa chọn lên máy chủ. Lựa chọn vẫn còn trên thiết bị; hãy thử cập nhật lại.", true);
    return null;
  }
}

function queueCommunityChoiceSync(snapshot = plan.priorityTracks) {
  const choices = [...snapshot];
  communitySyncQueue = communitySyncQueue
    .catch(() => undefined)
    .then(() => submitCommunityChoices(choices));
  return communitySyncQueue;
}

function updatePlanProgress() {
  const done = plan.steps.filter((step) => step.done).length;
  const label = $("#plan-progress-text");
  if (label) label.textContent = `${done}/${planSteps.length} bước đã đánh dấu`;
}

function updateSelectionButtons() {
  $$("[data-track]").forEach((button) => {
    const selected = plan.tracks.includes(button.dataset.track);
    button.setAttribute("aria-pressed", String(selected));
    button.innerHTML = `${selected ? "Đã chọn" : "Thêm vào kế hoạch"} <span aria-hidden="true">${selected ? "✓" : "+"}</span>`;
  });
  $$("[data-combination]").forEach((button) => {
    const selected = plan.combinations.includes(button.dataset.combination);
    button.setAttribute("aria-pressed", String(selected));
    button.innerHTML = `${selected ? "Đã thêm vào kế hoạch" : "Đưa vào kế hoạch"} <span aria-hidden="true">${selected ? "✓" : "→"}</span>`;
  });
  $$("[data-priority-track]").forEach((button) => {
    const selected = plan.priorityTracks.includes(button.dataset.priorityTrack);
    button.setAttribute("aria-pressed", String(selected));
    button.innerHTML = `${selected ? "Đã chọn" : "Thêm vào danh sách"} <span aria-hidden="true">${selected ? "✓" : "+"}</span>`;
  });
}

function appendSubjectSet(parent, title, subjects, modifier = "") {
  const section = document.createElement("div");
  section.className = `subject-set ${modifier}`.trim();
  const heading = document.createElement("strong");
  heading.textContent = title;
  const tags = document.createElement("div");
  tags.className = "subject-tags";
  subjects.forEach((subject) => {
    const tag = document.createElement("span");
    tag.className = "subject-tag";
    tag.textContent = subject;
    tags.append(tag);
  });
  section.append(heading, tags);
  parent.append(section);
}

function createSubjectBlockCard(group, index) {
  const card = document.createElement("article");
  card.className = `combo-card subject-card ${group.palette}`;
  card.dataset.subjectGroup = group.id;
  card.tabIndex = -1;

  const top = document.createElement("div");
  top.className = "combo-top";
  const number = document.createElement("span");
  number.className = "combo-index";
  number.textContent = `KHỐI MÔN 0${index + 1}`;
  const pill = document.createElement("span");
  pill.className = "combo-pill";
  pill.textContent = group.rank ? `Gợi ý #${group.rank}` : "Định hướng STEM";
  top.append(number, pill);

  const title = document.createElement("h3");
  title.textContent = group.name;
  const description = document.createElement("p");
  description.className = "subject-description";
  description.textContent = group.description;

  const block = document.createElement("div");
  block.className = "subject-block-name";
  block.textContent = `Khối ${group.block}`;
  const sets = document.createElement("div");
  sets.className = "subject-sets";
  appendSubjectSet(sets, "Môn trọng tâm", group.coreSubjects, "subject-set-core");
  appendSubjectSet(sets, "Môn bổ trợ", group.supportSubjects, "subject-set-support");

  const actions = document.createElement("div");
  actions.className = "combo-actions";
  const add = document.createElement("button");
  add.className = "combo-add";
  add.type = "button";
  add.dataset.track = group.name;
  add.innerHTML = "Thêm nhóm vào kế hoạch <span aria-hidden=\"true\">→</span>";
  actions.append(add);

  card.append(top, title, description, block, sets, actions);
  return card;
}

function renderSubjectBlocks(query = "") {
  const grid = $("#combo-grid");
  const count = $("#library-count");
  const empty = $("#empty-search");
  if (!grid || !count || !empty) return;

  const ranked = hasCompletedSurvey()
    ? rankInterestGroups()
    : interestGroups.map((group) => ({ ...group, rank: null, score: null }));
  const needle = normalise(query);
  const matches = ranked.filter((group) => normalise([
    group.name,
    group.block,
    group.description,
    ...group.coreSubjects,
    ...group.supportSubjects,
  ].join(" ")).includes(needle));

  grid.replaceChildren(...matches.map((group, index) => createSubjectBlockCard(group, index)));
  count.textContent = `${matches.length} nhóm ngành · khối môn gợi ý`;
  grid.hidden = matches.length === 0;
  empty.hidden = matches.length > 0;
  updateSelectionButtons();
}

function setSelection(button, listName, value) {
  const exists = plan[listName].includes(value);
  plan[listName] = addOrRemove(plan[listName], value);
  if (listName === "tracks" && exists) {
    plan.priorityTracks = plan.priorityTracks.filter((track) => track !== value);
  }
  persistPlan();
  renderPlan();
  const message = exists ? "Đã bỏ mục này khỏi kế hoạch." : "Đã thêm vào kế hoạch của em.";
  showToast(message);
  if (button) button.setAttribute("aria-pressed", String(!exists));
}

function setPriorityTrack(value) {
  const exists = plan.priorityTracks.includes(value);
  plan.priorityTracks = addOrRemove(plan.priorityTracks, value);
  if (exists) plan.tracks = plan.tracks.filter((track) => track !== value);
  else if (!plan.tracks.includes(value)) plan.tracks.push(value);
  persistPlan();
  queueCommunityChoiceSync();
  renderPlan();
  showToast(exists ? "Đã bỏ hướng này khỏi lựa chọn chung." : "Đã gửi hướng này để tính vào thống kê chung.");
}

let surveyIndex = 0;
const savedSurvey = parseStored(STORAGE_KEYS.survey, { answers: [], completed: false });
let surveyAnswers = Array.isArray(savedSurvey?.answers) ? savedSurvey.answers : [];

function saveSurvey(completed = false) {
  saveStored(STORAGE_KEYS.survey, { answers: surveyAnswers, completed });
}

function renderQuestion({ moveFocus = false } = {}) {
  const question = assessmentQuestions[surveyIndex];
  const count = $("#question-count");
  const progress = $(".progress-track");
  const fill = $("#progress-fill");
  const category = $("#question-category");
  const text = $("#question-text");
  const options = $("#likert-options");
  const previous = $("#previous-question");
  const next = $("#next-question");

  count.textContent = `CÂU ${surveyIndex + 1} / ${assessmentQuestions.length}`;
  category.textContent = question.group;
  text.textContent = question.text;
  const completedBefore = surveyAnswers.filter((value) => Number.isInteger(value)).length;
  progress.setAttribute("aria-valuenow", String(completedBefore));
  fill.style.width = `${(completedBefore / assessmentQuestions.length) * 100}%`;
  previous.disabled = surveyIndex === 0;
  previous.style.opacity = surveyIndex === 0 ? ".45" : "1";
  next.innerHTML = surveyIndex === assessmentQuestions.length - 1
    ? "Xem tóm tắt <span aria-hidden=\"true\">→</span>"
    : "Tiếp tục <span aria-hidden=\"true\">→</span>";
  $("#survey-error").textContent = "";

  options.replaceChildren();
  likertLabels.forEach((label, index) => {
    const value = index + 1;
    const button = document.createElement("button");
    button.className = "likert-option";
    button.type = "button";
    button.dataset.value = String(value);
    button.setAttribute("aria-pressed", String(surveyAnswers[surveyIndex] === value));
    const number = document.createElement("strong");
    number.textContent = String(value);
    const caption = document.createElement("small");
    caption.textContent = label;
    button.append(number, caption);
    options.append(button);
  });
  if (moveFocus) text.focus({ preventScroll: true });
}

function showSurveyView() {
  $("#assessment-start").hidden = true;
  $("#assessment-result").hidden = true;
  $("#survey-view").hidden = false;
  renderQuestion({ moveFocus: true });
}

function showAssessmentStart() {
  $("#assessment-start").hidden = false;
  $("#survey-view").hidden = true;
  $("#assessment-result").hidden = true;
}

function calculateSurveySummary() {
  const groups = new Map();
  assessmentQuestions.forEach((question, index) => {
    if (!groups.has(question.group)) groups.set(question.group, []);
    groups.get(question.group).push(Number(surveyAnswers[index] || 0));
  });
  return [...groups.entries()].map(([label, values], index) => ({
    key: assessmentDimensions[index].key,
    label,
    average: values.reduce((sum, value) => sum + value, 0) / values.length,
  }));
}

function hasCompletedSurvey() {
  return assessmentQuestions.every((_, index) => Number.isInteger(surveyAnswers[index]));
}

function rankInterestGroups() {
  if (!hasCompletedSurvey()) return [];
  const scores = Object.fromEntries(calculateSurveySummary().map(({ key, average }) => [key, average]));
  return interestGroups
    .map((group) => {
      const score = assessmentDimensions.reduce((total, dimension) => total + scores[dimension.key] * group.weights[dimension.key], 0);
      const signals = assessmentDimensions
        .map((dimension) => ({ label: dimension.label, contribution: scores[dimension.key] * group.weights[dimension.key] }))
        .sort((a, b) => b.contribution - a.contribution)
        .slice(0, 2)
        .map((dimension) => dimension.label);
      return { ...group, score, signals };
    })
    .sort((a, b) => b.score - a.score)
    .map((group, index) => ({ ...group, rank: index + 1 }));
}

function renderSurveySummary() {
  const container = $("#result-bars");
  container.replaceChildren();
  calculateSurveySummary().forEach(({ label, average }) => {
    const row = document.createElement("div");
    row.className = "result-row";
    const title = document.createElement("strong");
    title.textContent = label;
    const value = document.createElement("span");
    value.textContent = `${average.toFixed(1)} / 5 · điểm trung bình`;
    const meter = document.createElement("div");
    meter.className = "result-meter";
    meter.setAttribute("role", "progressbar");
    meter.setAttribute("aria-label", `${label}: ${average.toFixed(1)} trên 5`);
    meter.setAttribute("aria-valuemin", "1");
    meter.setAttribute("aria-valuemax", "5");
    meter.setAttribute("aria-valuenow", average.toFixed(1));
    const fill = document.createElement("span");
    fill.style.width = `${(average / 5) * 100}%`;
    meter.append(fill);
    row.append(title, value, meter);
    container.append(row);
  });
  renderRecommendations();
  renderPathways();
  renderSubjectBlocks($("#combo-search")?.value || "");
}

function renderRecommendations() {
  const container = $("#result-recommendations");
  if (!container || !hasCompletedSurvey()) return;
  container.replaceChildren();

  const heading = document.createElement("h4");
  heading.textContent = "3 nhóm ngành em nên tìm hiểu trước";
  const intro = document.createElement("p");
  intro.className = "recommendation-intro";
  intro.textContent = "Thứ tự này được gợi ý từ cả 10 câu trả lời. Điểm 1–5 giúp em so sánh các hướng trong bản thử nghiệm, không phải phần trăm phù hợp.";
  const list = document.createElement("div");
  list.className = "recommendation-list";

  rankInterestGroups().slice(0, 3).forEach((group) => {
    const item = document.createElement("article");
    item.className = `recommendation-item${group.rank === 1 ? " is-first" : ""}`;
    const rank = document.createElement("span");
    rank.className = "recommendation-rank";
    rank.textContent = group.rank === 1 ? "ƯU TIÊN TÌM HIỂU" : `GỢI Ý ${group.rank}`;
    const title = document.createElement("h5");
    title.textContent = group.name;
    const score = document.createElement("span");
    score.className = "recommendation-score";
    score.textContent = `${group.score.toFixed(1)} / 5 · tín hiệu tham khảo`;
    const reason = document.createElement("p");
    reason.textContent = `Các câu trả lời về ${group.signals[0].toLocaleLowerCase("vi")} và ${group.signals[1].toLocaleLowerCase("vi")} góp phần nhiều nhất vào gợi ý này.`;
    const actions = document.createElement("div");
    actions.className = "recommendation-actions";
    const subjects = document.createElement("button");
    subjects.type = "button";
    subjects.className = "recommendation-link";
    subjects.dataset.showSubjects = group.id;
    subjects.textContent = "Xem khối môn →";
    const save = document.createElement("button");
    save.type = "button";
    save.className = "recommendation-save";
    save.dataset.track = group.name;
    save.innerHTML = "Lưu vào kế hoạch <span aria-hidden=\"true\">+</span>";
    actions.append(subjects, save);
    item.append(rank, title, score, reason, actions);
    list.append(item);
  });

  container.append(heading, intro, list);
  updateSelectionButtons();
}

function renderPathways() {
  const container = $("#pathway-grid");
  if (!container) return;
  const groups = hasCompletedSurvey()
    ? rankInterestGroups()
    : interestGroups.map((group) => ({ ...group, rank: null, score: null }));

  container.replaceChildren(...groups.map((group) => {
    const card = document.createElement("article");
    card.className = `pathway-card ${group.palette}`;
    const top = document.createElement("div");
    top.className = "pathway-top";
    const symbol = document.createElement("span");
    symbol.className = "pathway-symbol";
    symbol.setAttribute("aria-hidden", "true");
    symbol.textContent = group.symbol;
    const rank = document.createElement("span");
    rank.className = "pathway-number";
    rank.textContent = group.rank ? `#${group.rank}` : "STEM";
    top.append(symbol, rank);

    const kicker = document.createElement("span");
    kicker.className = "pathway-kicker";
    kicker.textContent = `KHỐI ${group.block.toLocaleUpperCase("vi")}`;
    const title = document.createElement("h3");
    title.textContent = group.name;
    const description = document.createElement("p");
    description.textContent = group.description;
    const subjects = document.createElement("div");
    subjects.className = "pathway-subject-hint";
    subjects.textContent = `Trọng tâm: ${group.coreSubjects.join(" · ")}`;
    const score = document.createElement("span");
    score.className = "pathway-score";
    score.textContent = group.score === null ? "Chọn nhóm khiến em tò mò" : `${group.score.toFixed(1)} / 5 · gợi ý tham khảo`;
    const add = document.createElement("button");
    add.className = "pathway-add";
    add.type = "button";
    add.dataset.priorityTrack = group.name;
    add.innerHTML = "Thêm vào danh sách <span aria-hidden=\"true\">+</span>";
    const view = document.createElement("button");
    view.className = "pathway-subject-link";
    view.type = "button";
    view.dataset.showSubjects = group.id;
    view.textContent = "Xem môn trọng tâm →";
    card.append(top, kicker, title, description, subjects, score, add, view);
    return card;
  }));
  updateSelectionButtons();
}

function showSubjectGroup(groupId) {
  const group = interestGroups.find((item) => item.id === groupId);
  if (!group) return;
  const search = $("#combo-search");
  if (search) {
    search.value = group.name;
    renderSubjectBlocks(group.name);
  }
  $("#explore").scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => {
    const card = $(`[data-subject-group="${group.id}"]`);
    if (!card) return;
    card.classList.add("is-focused");
    card.focus({ preventScroll: true });
    window.setTimeout(() => card.classList.remove("is-focused"), 1800);
  }, 350);
}

function completeSurvey() {
  saveSurvey(true);
  renderSurveySummary();
  $("#survey-view").hidden = true;
  $("#assessment-start").hidden = true;
  $("#assessment-result").hidden = false;
  $("#assessment-result").scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function initSurvey() {
  const saved = parseStored(STORAGE_KEYS.survey, null);
  if (saved?.completed && assessmentQuestions.every((_, index) => Number.isInteger(saved.answers?.[index]))) {
    surveyAnswers = saved.answers;
    renderSurveySummary();
    $("#assessment-start").hidden = true;
    $("#assessment-result").hidden = false;
  }

  $("#start-assessment").addEventListener("click", () => {
    const firstUnanswered = assessmentQuestions.findIndex((_, index) => !Number.isInteger(surveyAnswers[index]));
    surveyIndex = firstUnanswered < 0 ? 0 : firstUnanswered;
    showSurveyView();
  });

  $("#exit-survey").addEventListener("click", () => {
    saveSurvey(false);
    showAssessmentStart();
    showToast("Câu trả lời đã được lưu trên thiết bị này.");
  });

  $("#likert-options").addEventListener("click", (event) => {
    const option = event.target.closest("[data-value]");
    if (!option) return;
    surveyAnswers[surveyIndex] = Number(option.dataset.value);
    $$(".likert-option", $("#likert-options")).forEach((button) => {
      button.setAttribute("aria-pressed", String(button === option));
    });
    $("#survey-error").textContent = "";
    saveSurvey(false);
  });

  $("#previous-question").addEventListener("click", () => {
    if (surveyIndex === 0) return;
    surveyIndex -= 1;
    renderQuestion({ moveFocus: true });
  });

  $("#next-question").addEventListener("click", () => {
    if (!Number.isInteger(surveyAnswers[surveyIndex])) {
      $("#survey-error").textContent = "Em chọn một mức độ trước khi tiếp tục nhé.";
      $(".likert-option", $("#likert-options"))?.focus();
      return;
    }
    if (surveyIndex < assessmentQuestions.length - 1) {
      surveyIndex += 1;
      renderQuestion({ moveFocus: true });
    } else {
      completeSurvey();
    }
  });

  $("#retake-assessment").addEventListener("click", () => {
    surveyAnswers = [];
    surveyIndex = 0;
    saveSurvey(false);
    renderPathways();
    renderSubjectBlocks($("#combo-search")?.value || "");
    showSurveyView();
  });
}

function initNavigation() {
  const toggle = $(".menu-toggle");
  const nav = $("#main-nav");
  if (!toggle || !nav) return;
  const close = () => {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Mở menu");
    nav.classList.remove("is-open");
  };
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Đóng menu" : "Mở menu");
    nav.classList.toggle("is-open", open);
  });
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
}

function initInteractions() {
  document.addEventListener("click", (event) => {
    const subjectGroup = event.target.closest("[data-show-subjects]");
    if (subjectGroup) {
      showSubjectGroup(subjectGroup.dataset.showSubjects);
      return;
    }
    const priorityTrack = event.target.closest("[data-priority-track]");
    if (priorityTrack) {
      setPriorityTrack(priorityTrack.dataset.priorityTrack);
      return;
    }
    const track = event.target.closest("[data-track]");
    if (track) {
      setSelection(track, "tracks", track.dataset.track);
      return;
    }
    const combo = event.target.closest("[data-combination]");
    if (combo) setSelection(combo, "combinations", combo.dataset.combination);
  });

  $("#combo-search").addEventListener("input", (event) => renderSubjectBlocks(event.target.value));
  $("#refresh-community-stats").addEventListener("click", () => queueCommunityChoiceSync());
  $("#print-plan").addEventListener("click", () => window.print());

  $("#feedback-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const result = $("#feedback-result");
    result.textContent = "Cảm ơn em đã góp ý. Bản mô phỏng chưa gửi nội dung này đi.";
    event.currentTarget.reset();
  });
}

renderPlan();
initSurvey();
initNavigation();
initInteractions();
renderPathways();
renderSubjectBlocks();
if (plan.priorityTracks.length) queueCommunityChoiceSync();
else loadCommunityStats();
