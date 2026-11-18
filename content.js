// Ändra texterna här när du vill lägga in dina egna matteuppdrag.
// Varje lucka kan innehålla flera stycken text. Vi lägger till bilder och fler
// uppgiftstyper i nästa steg.
window.CALENDAR_CONTENT = {
  lagstadiet: {
    title: "Mattejulkalender – F–3",
    description: "24 kluriga matteuppdrag för förskoleklass–årskurs 3.",
    doors: Array.from({length:24}, (_,i) => ({
      title: "Tomtens paket",
      paragraphs: [`Tomten har 12 paket som ska delas upp i två högar. Hur kan han dela paketen?`, "Rita eller bygg två högar. Hitta så många olika sätt du kan.", "Utmaning: Kan du hitta ett sätt där det är lika många paket i varje hög? Hur vet du det?"]
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
