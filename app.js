(() => {
  const home=document.getElementById("home-view");
  const calendar=document.getElementById("calendar-view");
  const grid=document.getElementById("door-grid");
  const dialog=document.getElementById("door-dialog");
  let selectedCalendar="";
  const testMode=new URLSearchParams(window.location.search).get("test")==="1";
  const positions={14:[42.6,30.6],3:[50,30.6],21:[57.3,30.6],6:[28.1,39.6],18:[36.9,39.6],2:[45.5,39.6],9:[54,39.6],24:[63.1,39.6],11:[71.9,39.6],1:[28.1,49.6],15:[36.9,49.6],8:[63.1,49.6],4:[71.9,49.6],19:[28.1,59.7],7:[36.9,59.7],22:[63.1,59.7],13:[71.9,59.7],17:[28.1,69.6],20:[36.9,69.6],5:[63.1,69.6],12:[71.9,69.6],16:[28.1,79.5],23:[36.9,79.5],10:[63.1,79.5]};
  const STORAGE_KEY="johannas-mattejulkalender-content-v1";
  let customContent={};
  function openContentDB(){
    return new Promise(function(resolve,reject){
      if(!window.indexedDB){reject(new Error("IndexedDB stöds inte i webbläsaren."));return;}
      const request=window.indexedDB.open("JohannasMattejulkalender",2);
      request.onupgradeneeded=function(){
        const db=request.result;
        if(!db.objectStoreNames.contains("drafts"))db.createObjectStore("drafts");
        if(!db.objectStoreNames.contains("doors"))db.createObjectStore("doors",{keyPath:"id"});
      };
      request.onsuccess=function(){resolve(request.result);};
      request.onerror=function(){reject(request.error||new Error("Kunde inte öppna webbläsarens databas."));};
      request.onblocked=function(){reject(new Error("Databasen är upptagen. Stäng andra kalenderflikar och försök igen."));};
    });
  }
  async function readSavedContent(){
    const db=await openContentDB();
    try{
      const records=await new Promise(function(resolve,reject){
        const tx=db.transaction("doors","readonly");
        const req=tx.objectStore("doors").getAll();
        req.onsuccess=function(){resolve(req.result||[]);};
        req.onerror=function(){reject(req.error);};
      });
      records.forEach(function(record){
        if(!customContent[record.calendar])customContent[record.calendar]={};
        customContent[record.calendar][record.day]=record.door;
      });
      // Importa äldre utkast som tidigare sparades i localStorage.
      try{
        const old=JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}");
        for(const key of Object.keys(old)){
          for(const day of Object.keys(old[key]||{})){
            if(!customContent[key])customContent[key]={};
            if(!customContent[key][day]){
              customContent[key][day]=old[key][day];
              await writeSavedDoor(db,key,Number(day),old[key][day]);
            }
          }
        }
        localStorage.removeItem(STORAGE_KEY);
      }catch(ignore){}
    }finally{db.close();}
  }
  function writeSavedDoor(db,key,day,door){
    return new Promise(function(resolve,reject){
      const tx=db.transaction("doors","readwrite");
      tx.objectStore("doors").put({id:key+"-"+day,calendar:key,day:day,door:door});
      tx.oncomplete=resolve;
      tx.onerror=function(){reject(tx.error||new Error("Databasen kunde inte spara luckan."));};
      tx.onabort=function(){reject(tx.error||new Error("Sparningen avbröts."));};
    });
  }
  async function saveDoorToDB(key,day,door){
    const db=await openContentDB();
    try{await writeSavedDoor(db,key,day,door);}finally{db.close();}
  }
  const storageReady=readSavedContent().catch(function(error){
    window.calendarStorageError=error;
    console.error("Kalenderlagring:",error);
  });
  function getDoor(key,day){return (customContent[key]&&customContent[key][day])||window.CALENDAR_CONTENT[key].doors[day-1];}
  function showDoor(day){
    const door=getDoor(selectedCalendar,day);
    document.getElementById("dialog-date").textContent="LUCKA "+day+" • DECEMBER 2026";
    document.getElementById("dialog-title").textContent=door.title||"Dagens matteuppdrag";
    const content=document.getElementById("dialog-content");content.replaceChildren();
    (door.paragraphs||[]).forEach(function(t){const p=document.createElement("p");p.textContent=t;content.append(p);});
    if(door.image){const img=document.createElement("img");img.src=door.image;img.alt="Bild till matteuppgiften";img.className="door-task-image";content.append(img);}
    dialog.showModal();
  }
  function openCalendar(key){
    selectedCalendar=key;
    const data=window.CALENDAR_CONTENT[key];
    home.hidden=true;document.getElementById("editor-view").hidden=true;calendar.hidden=false;
    document.getElementById("calendar-title").textContent=data.title;
    document.getElementById("calendar-description").textContent=testMode ? data.description+" (Testläge – alla luckor går att öppna.)" : data.description;
    document.getElementById("calendar-eyebrow").textContent=key==="lagstadiet"?"FÖRSKOLEKLASS–ÅRSKURS 3":"ÅRSKURS 4–6";
    grid.replaceChildren();
    Object.keys(positions).forEach(function(n){
      const day=Number(n),p=positions[n],button=document.createElement("button");
      button.className="door";button.type="button";button.style.left=p[0]+"%";button.style.top=p[1]+"%";
      const today=new Date();const start=new Date(today.getFullYear(),today.getMonth(),today.getDate());
      button.disabled=!testMode && start<new Date(2026,11,day);
      button.setAttribute("aria-label","Lucka "+day);
      button.addEventListener("click",function(){showDoor(day);});grid.append(button);
    });
  }
  document.querySelectorAll("[data-calendar]").forEach(function(button){
    button.addEventListener("click",async function(){await storageReady;openCalendar(button.getAttribute("data-calendar"));});
  });
  document.getElementById("back-home").addEventListener("click",function(){calendar.hidden=true;home.hidden=false;});
  document.getElementById("close-dialog").addEventListener("click",function(){dialog.close();});
  dialog.addEventListener("click",function(e){if(e.target===dialog)dialog.close();});

  const editCalendar=document.getElementById("edit-calendar");
  const editDoor=document.getElementById("edit-door");
  const editTitle=document.getElementById("edit-title");
  const editText=document.getElementById("edit-text");
  const editImage=document.getElementById("edit-image");
  const editPreview=document.getElementById("edit-preview");
  let pendingImage="";
  function loadEditorDoor(){
    const door=getDoor(editCalendar.value,Number(editDoor.value));
    editTitle.value=door.title||"";
    editText.value=(door.paragraphs||[]).join("\n");
    pendingImage=door.image||"";
    editPreview.hidden=!pendingImage;
    if(pendingImage)editPreview.src=pendingImage;
    editImage.value="";
  }
  function fillDoorChoices(){
    editDoor.replaceChildren();
    for(let n=1;n<=24;n++){const option=document.createElement("option");option.value=String(n);option.textContent="Lucka "+n;editDoor.append(option);}
    loadEditorDoor();
  }
  document.getElementById("open-editor").addEventListener("click",async function(){await storageReady;home.hidden=true;calendar.hidden=true;document.getElementById("editor-view").hidden=false;fillDoorChoices();});
  document.getElementById("editor-home").addEventListener("click",function(){document.getElementById("editor-view").hidden=true;home.hidden=false;});
  editCalendar.addEventListener("change",loadEditorDoor);editDoor.addEventListener("change",loadEditorDoor);
  editImage.addEventListener("change",function(){
    const file=editImage.files&&editImage.files[0];if(!file)return;
    const status=document.getElementById("editor-status");
    if(file.size>1500000){status.textContent="Bilden är större än 1,5 MB. Välj en mindre bild.";editImage.value="";return;}
    status.textContent="Bearbetar bilden …";
    const reader=new FileReader();
    reader.onload=function(){
      const source=new Image();
      source.onload=function(){
        const maxWidth=700,scale=Math.min(1,maxWidth/source.width);
        const canvas=document.createElement("canvas");
        canvas.width=Math.round(source.width*scale);canvas.height=Math.round(source.height*scale);
        const ctx=canvas.getContext("2d");ctx.drawImage(source,0,0,canvas.width,canvas.height);
        pendingImage=canvas.toDataURL("image/jpeg",0.48);
        editPreview.src=pendingImage;editPreview.hidden=false;
        status.textContent="Bilden är klar. Den har anpassats för att ta mindre plats.";
      };
      source.onerror=function(){status.textContent="Bilden kunde inte läsas. Prova en annan bild.";};
      source.src=String(reader.result);
    };
    reader.onerror=function(){status.textContent="Bilden kunde inte läsas. Prova igen.";};
    reader.readAsDataURL(file);
  });
  document.getElementById("save-door").addEventListener("click",async function(){
    const key=editCalendar.value,day=Number(editDoor.value);
    const updated={title:editTitle.value.trim()||"Dagens matteuppdrag",paragraphs:editText.value.split(/\r?\n/).map(function(s){return s.trim();}).filter(Boolean),image:pendingImage};
    const status=document.getElementById("editor-status");
    status.textContent="Sparar lucka "+day+" …";
    try{
      await saveDoorToDB(key,day,updated);
      if(!customContent[key])customContent[key]={};
      customContent[key][day]=updated;
      status.textContent="Lucka "+day+" sparad på den här datorn.";
    }catch(error){
      console.error("Kunde inte spara luckan:",error);
      status.textContent="Sparningen misslyckades: "+(error&&error.message?error.message:"okänt fel")+". Prova att öppna kalendern i Chrome eller exportera innehållet.";
    }
  });
  document.getElementById("export-content").addEventListener("click",function(){
    const blob=new Blob([JSON.stringify(customContent,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);const link=document.createElement("a");link.href=url;link.download="mina-mattejulkalender-uppgifter.json";link.click();URL.revokeObjectURL(url);
    document.getElementById("editor-status").textContent="Ditt innehåll har exporterats som en fil.";
  });
})();