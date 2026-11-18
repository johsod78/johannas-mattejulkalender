(() => {
  const home = document.getElementById("home-view");
  const calendar = document.getElementById("calendar-view");
  const grid = document.getElementById("door-grid");
  const dialog = document.getElementById("door-dialog");
  let selectedCalendar = null;\n  const STORAGE_KEY = "johannas-mattejulkalender-content-v1";\n  let customContent = loadCustomContent();\n\n  function loadCustomContent() {\n    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }\n  }\n  function getDoor(key, day) {\n    return customContent[key]?.[day] || window.CALENDAR_CONTENT[key].doors[day-1];\n  }

  // Mittpunkterna för de 24 numrerade cirklarna i julhusbilden.
  const positions = {
    14:[42.6,30.6],3:[50.0,30.6],21:[57.3,30.6],
    6:[28.1,39.6],18:[36.9,39.6],2:[45.5,39.6],9:[54.0,39.6],24:[63.1,39.6],11:[71.9,39.6],
    1:[28.1,49.6],15:[36.9,49.6],8:[63.1,49.6],4:[71.9,49.6],
    19:[28.1,59.7],7:[36.9,59.7],22:[63.1,59.7],13:[71.9,59.7],
    17:[28.1,69.6],20:[36.9,69.6],5:[63.1,69.6],12:[71.9,69.6],
    16:[28.1,79.5],23:[36.9,79.5],10:[63.1,79.5]
  };

  function isUnlocked(day) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(2026, 11, day);
    return today >= target;
  }

  function openCalendar(key) {
    selectedCalendar = key;
    const data = window.CALENDAR_CONTENT[key];
    home.hidden = true;
    calendar.hidden = false;
    document.getElementById("calendar-title").textContent = data.title;
    document.getElementById("calendar-description").textContent = data.description;
    document.getElementById("calendar-eyebrow").textContent = key === "lagstadiet" ? "FÖRSKOLEKLASS–ÅRSKURS 3" : "ÅRSKURS 4–6";
    grid.replaceChildren();
    Object.entries(positions).forEach(([number, point]) => {
      const day = Number(number);
      const button = document.createElement("button");
      button.className = "door";
      button.type = "button";
      button.style.left = point[0] + "%";
      button.style.top = point[1] + "%";
      button.disabled = !isUnlocked(day);
      button.setAttribute("aria-label", button.disabled ? `Lucka ${day}, öppnas ${day} december 2026` : `Öppna lucka ${day}`);
      button.addEventListener("click", () => showDoor(day));
      grid.append(button);
    });
  }

  function showDoor(day) {
    const door = getDoor(selectedCalendar, day);
    document.getElementById("dialog-date").textContent = `LUCKA ${day} • DECEMBER 2026`;
    document.getElementById("dialog-title").textContent = door.title;
    const content = document.getElementById("dialog-content");
    content.replaceChildren();
    (door.paragraphs || []).forEach(text => {
      const p = document.createElement("p");
      p.textContent = text;
      content.append(p);
    });
    dialog.showModal();
  }

  document.querySelectorAll("[data-calendar]").forEach(button => button.addEventListener("click", () => openCalendar(button.dataset.calendar)));
  document.getElementById("back-home").addEventListener("click", () => { calendar.hidden = true; home.hidden = false; });
  document.getElementById("close-dialog").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
})();
