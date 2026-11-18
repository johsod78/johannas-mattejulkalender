(() => {
  const home = document.getElementById("home-view");
  const calendar = document.getElementById("calendar-view");
  const grid = document.getElementById("door-grid");
  const dialog = document.getElementById("door-dialog");
  let selectedCalendar = null;

  // Mittpunkterna för de 24 numrerade cirklarna i julhusbilden.
  const positions = {
    1:[42.7,31.5],2:[50.0,31.5],3:[57.4,31.5],
    4:[28.1,40.8],5:[36.9,40.8],6:[45.6,40.8],7:[54.3,40.8],8:[63.1,40.8],9:[71.8,40.8],
    10:[28.1,51.2],11:[36.9,51.2],12:[63.1,51.2],13:[71.8,51.2],
    14:[28.1,61.3],15:[36.9,61.3],16:[63.1,61.3],17:[71.8,61.3],
    18:[28.1,71.8],19:[36.9,71.8],20:[63.1,71.8],21:[71.8,71.8],
    22:[28.1,82.0],23:[36.9,82.0],24:[63.1,82.0]
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
