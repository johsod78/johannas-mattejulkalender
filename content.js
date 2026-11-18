// Ändra texterna här när du vill lägga in dina egna matteuppdrag.
// Varje lucka kan innehålla flera stycken text. Vi lägger till bilder och fler
// uppgiftstyper i nästa steg.
window.CALENDAR_CONTENT = {
  lagstadiet: {
    title: "Mattejulkalender – lågstadiet",
    description: "24 kluriga matteuppdrag för årskurs 1–3.",
    doors: Array.from({length:24}, (_,i) => ({
      title: "Dagens matteuppdrag",
      paragraphs: [`Här kommer matteuppdraget för lucka ${i+1}.`, "Uppdraget fylls på tillsammans med Johanna."]
    }))
  },
  mellanstadiet: {
    title: "Mattejulkalender – mellanstadiet",
    description: "24 kluriga matteuppdrag för årskurs 4–6.",
    doors: Array.from({length:24}, (_,i) => ({
      title: "Dagens matteuppdrag",
      paragraphs: [`Här kommer matteuppdraget för lucka ${i+1}.`, "Uppdraget fylls på tillsammans med Johanna."]
    }))
  }
};
