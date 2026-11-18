(() => {
  const home=document.getElementById("home-view");
  const calendar=document.getElementById("calendar-view");
  const grid=document.getElementById("door-grid");
  const dialog=document.getElementById("door-dialog");
  const editorView=document.getElementById("editor-view");
  let selectedCalendar=null;
  const STORAGE_KEY="johannas-mattejulkalender-content-v1";
  let customContent={};
  try { customContent=JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}"); } catch {}
  const positions={
    14:[42.6,30.6],3:[50,30.6],21:[57.3,30.6],
    6:[28.1,39.6],18:[36.9,39.6],2:[45.5,39.6],9:[54,39.6],24:[63.1,39.6],11:[71.9,39.6],
    1:[28.1,49.6],15:[36.9,49.6],8:[63.1,49.6],4:[71.9,49.6],
    19:[28.1,59.7],7:[36.9,59.7],22:[63.1,59.7],13:[71.9,59.7],
    17:[28.1,69.6],20:[36.9,69.6],5:[63.1,69.6],12:[71.9,69.6],
    16:[28.1,79.5],23:[36.9,79.5],10:[63.1,79.5]
  };
  function getDoor(key,day){return customContent[key]?.[day]||window.CALENDAR_CONTENT[key].doors[day-1];}
  function isUnlocked(day){const now=new Date();return new Date(now.getFullYear(),now.getMonth(),now.getDate())>=new Date(2026,11,day);}
  function openCalendar(key){
    selectedCalendar=key;const data=window.CALENDAR_CONTENT[key];
    home.hidden=true;editorView.hidden=true;calendar.hidden=false;
    document.getElementById("calendar-title").textContent=data.title;
    document.getElementById("calendar-description").textContent=data.description;
    document.getElementById("calendar-eyebrow").textContent=key==="lagstadiet"?"FÖRSKOLEKLASS–ÅRSKURS 3":"ÅRSKURS 4–6";
    grid.replaceChildren();
    Object.entries(positions).forEach(([n,p])=>{
      const day=Number(n),button=document.createElement("button");
      button.className="door";button.type="button";button.style.left=p[0]+"%";button.style.top=p[1]+"%";
      button.disabled=!isUnlocked(day);button.setAttribute("aria-label",button.disabled?`Lucka ${day}, öppnas ${day} december 2026`:`Öppna lucka ${day}`);
      button.addEventListener("click",()=>showDoor(day));grid.append(button);
    });
  }
  function showDoor(day){
    const door=getDoor(selectedCalendar,day);
    document.getElementById("dialog-date").textContent=`LUCKA ${day} • DECEMBER 2026`;
    document.getElementById("dialog-title").textContent=door.title||"Dagens matteuppdrag";
    const content=document.getElementById("dialog-content");content.replaceChildren();
    (door.paragraphs||[]).forEach(t=>{const p=document.createElement("p");p.textContent=t;content.append(p);});
    if(door.image){const img=document.createElement("img");img.src=door.image;img.alt="Bild till matteuppgiften";img.className="door-task-image";content.append(img);}
    dialog.showModal();
  }
  document.querySelectorAll("[data-calendar]").forEach(b=>b.addEventListener("click",()=>openCalendar(b.dataset.calendar)));
  document.getElementById("back-home").addEventListener("click",()=>{calendar.hidden=true;home.hidden=false;});
  document.getElementById("close-dialog").addEventListener("click",()=>dialog.close());
  dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close();});

  const editCalendar=document.getElementById("edit-calendar"),editDoor=document.getElementById("edit-door");
  const editTitle=document.getElementById("edit-title"),editText=document.getElementById("edit-text");
  const editImage=document.getElementById("edit-image"),editPreview=document.getElementById("edit-preview");
  let pendingImage="";
  function loadEditorDoor(){
    const door=getDoor(editCalendar.value,Number(editDoor.value));
    editTitle.value=door.title||"";editText.value=(door.paragraphs||[]).join("\n");
    pendingImage=door.image||"";editPreview.hidden=!pendingImage;if(pendingImage)editPreview.src=pendingImage;editImage.value="";
  }
  function fillDoorChoices(){
    editDoor.replaceChildren();
    for(let n=1;n<=24;n++){const o=document.createElement("option");o.value=String(n);o.textContent="Lucka "+n;editDoor.append(o);}
    loadEditorDoor();
  }
  document.getElementById("open-editor").addEventListener("click",()=>{home.hidden=true;calendar.hidden=true;editorView.hidden=false;fillDoorChoices();});
  document.getElementById("editor-home").addEventListener("click",()=>{editorView.hidden=true;home.hidden=false;});
  editCalendar.addEventListener("change",loadEditorDoor);editDoor.addEventListener("change",loadEditorDoor);
  editImage.addEventListener("change",()=>{
    const file=editImage.files?.[0];if(!file)return;
    if(file.size>1500000){document.getElementById("editor-status").textContent="Välj en bild som är mindre än 1,5 MB.";editImage.value="";return;}
    const reader=new FileReader();reader.onload=()=>{pendingImage=String(reader.result);editPreview.src=pendingImage;editPreview.hidden=false;};reader.readAsDataURL(file);
  });
  document.getElementById("save-door").addEventListener("click",()=>{
    const key=editCalendar.value,day=Number(editDoor.value);customContent[key] ||= {};
    customContent[key][day]={title:editTitle.value.trim()||"Dagens matteuppdrag",paragraphs:editText.value.split(/\r?\n/).map(s=>s.trim()).filter(Boolean),image:pendingImage};
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(customContent));document.getElementById("editor-status").textContent="Lucka "+day+" sparad på den här datorn.";}
    catch{document.getElementById("editor-status").textContent="Kunde inte spara. Prova en mindre bild.";}
  });
  document.getElementById("export-content").addEventListener("click",()=>{
    const blob=new Blob([JSON.stringify(customContent,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob);
    const link=document.createElement("a");link.href=url;link.download="mina-mattejulkalender-uppgifter.json";link.click();URL.revokeObjectURL(url);
    document.getElementById("editor-status").textContent="Ditt innehåll har exporterats som en fil.";
  });
})();