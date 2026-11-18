(() => {
  const home = document.getElementById("home-view");
  const calendar = document.getElementById("calendar-view");
  const grid = document.getElementById("door-grid");
  const dialog = document.getElementById("door-dialog");
  let selectedCalendar = null;

  // Mittpunkterna för de 24 numrerade cirklarna i julhusbilden.
  const positions = {
    1:[42.8,30.6],2:[50.0,30.6],3:[57.2,30.6],
    4:[28.1,39.5],5:[37.0,39.5],6:[45.6,39.5],7:[54.3,39.5],8:[63.0,39.5],9:[71.9,39.5],
    10:[28.1,49.7],11:[37.0,49.7],12:[63.0,49.7],13:[71.9,49.7],
    14:[28.1,59.7],15:[37.0,59.7],16:[63.0,59.7],17:[71.9,59.7],
    18:[28.1,69.5],19:[37.0,69.5],20:[63.0,69.5],21:[71.9,69.5],
    22:[28.1,79.6],23:[37.0,79.6],24:[63.0,79.6]
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
    const door = window.CALENDAR_CONTENT[selectedCalendar].doors[day-1];
    document.getElementById("dialog-date").textContent = `LUCKA ${day} • DECEMBER 2026`;
    document.getElementById("dialog-title").textContent = door.title;
    const content = document.getElementById("dialog-content");
    content.replaceChildren();
    door.paragraphs.forEach(text => {
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
