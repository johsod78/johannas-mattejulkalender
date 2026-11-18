(() => {
  const home = document.getElementById("home-view");
  const calendar = document.getElementById("calendar-view");
  const grid = document.getElementById("door-grid");
  const dialog = document.getElementById("door-dialog");
  let selectedCalendar = null;

  const doorOrder = [14,3,21,6,18,2,9,24,11,1,15,8,4,19,7,22,13,17,20,5,12,16,23,10];

  function isUnlocked(day) {
    const now = new Date();
    const year = 2026;
    const start = new Date(year, 11, 1, 0, 0, 0);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(year, 11, day, 0, 0, 0);
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
    doorOrder.forEach(day => {
      const button = document.createElement("button");
      button.className = "door";
      button.type = "button";
      button.textContent = day;
      button.disabled = !isUnlocked(day);
      button.setAttribute("aria-label", button.disabled ? `Lucka ${day}, öppnas  ${day} december 2026` : `Öppna lucka ${day}`);
      if (button.disabled) {
        const lock = document.createElement("span");
        lock.className = "lock";
        lock.textContent = "🔒";
        button.append(lock);
      }
      button.addEventListener("click", () => showDoor(day));
      grid.append(button);
    });
  }

  function showDoor(day) {
    const door = window.CALENDAR_CONTENT[selectedCalendar].doors[day-1];
    document.getElementById("dialog-date").textContent = `LUCKA ${day} • 1–24 DECEMBER`;
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

  document.querySelectorAll("[data-calendar]").forEach(button => {
    button.addEventListener("click", () => openCalendar(button.dataset.calendar));
  });
  document.getElementById("back-home").addEventListener("click", () => {
    calendar.hidden = true;
    home.hidden = false;
  });
  document.getElementById("close-dialog").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });
})();
