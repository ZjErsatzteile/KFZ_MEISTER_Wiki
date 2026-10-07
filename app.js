let DB = null;
let routeState = { brand: null, vehicle: null, generationIndex: null, engine: null, transmission: null };

const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));
const arr = x => Array.isArray(x) ? x : [];
const go = hash => { location.hash = hash; };
const favs = () => JSON.parse(localStorage.getItem("kfz_favs") || "[]");
const recs = () => JSON.parse(localStorage.getItem("kfz_recent") || "[]");
const save = (k,v) => localStorage.setItem(k, JSON.stringify(v));

function setCrumb(t){ $("#crumb").textContent = "Werkstatt / " + t; }
function addRecent(type,id,title,extra={}) {
  const a = recs().filter(x => !(x.type===type && x.id===id));
  a.unshift({type,id,title,at:Date.now(),...extra});
  save("kfz_recent",a.slice(0,20));
}
function isFav(type,id){ return favs().some(x=>x.type===type&&x.id===id); }
function toggleFav(type,id,title){
  let a=favs(), i=a.findIndex(x=>x.type===type&&x.id===id);
  if(i>=0) a.splice(i,1); else a.unshift({type,id,title});
  save("kfz_favs",a); render();
}
function removeFav(type,id){ save("kfz_favs",favs().filter(x=>!(x.type===type&&x.id===id))); render(); }
function brandById(id){ return DB.brands.find(x=>x.id===id); }
function vehicleById(id){ return DB.vehicles.find(x=>x.id===id); }
function selectedTitle(v,g){ return `${brandById(v.brand)?.name || v.brand} ${v.model} · ${g.name}`; }

function stats(){
  return `<div class="stats">
    <div class="stat"><b>${DB.brands.length}</b><span>Marken</span></div>
    <div class="stat"><b>${DB.brands.reduce((n,b)=>n+b.models.length,0)}</b><span>Modelle</span></div>
    <div class="stat"><b>${DB.vehicles.reduce((n,v)=>n+arr(v.generations).length,0)}</b><span>Baureihen</span></div>
    <div class="stat"><b>${DB.repairs.length}</b><span>Reparaturen</span></div>
  </div>`;
}

function brandCard(b){
  return `<div class="brand-card" onclick="go('#vehicles/brand/${encodeURIComponent(b.id)}')">
    <div class="brand-top"><div class="brand-badge">${esc(b.id.slice(0,3).toUpperCase())}</div><span>${esc(b.flag||"")}</span></div>
    <h3>${esc(b.name)}</h3><div class="card-muted">${b.models.length} Modelle</div>
  </div>`;
}

function repairCard(r){
  return `<div class="repair-card" onclick="showRepair('${esc(r.id)}')">
    <div class="icon">🔧</div><h3>${esc(r.title)}</h3><p>${esc(r.summary)}</p>
    <div class="meta"><span>${esc(r.system)}</span><span>${esc(r.difficulty)}</span><span>${esc(r.time)}</span></div>
  </div>`;
}

function home(){
  setCrumb("Dashboard");
  return `<div class="hero">
    <div class="hero-card"><div class="eyebrow">Werkstattwissen · Version 3</div>
      <h1>Deine digitale KFZ-Werkstatt.</h1>
      <p>Hersteller → Modell → Baureihe → Motor → Getriebe → Fahrzeugprofil. Wähle zuerst das exakte Fahrzeug, bevor du technische Angaben verwendest.</p>
      <div class="hero-actions"><button class="btn primary" onclick="go('#vehicles')">Fahrzeug auswählen</button><button class="btn" onclick="openSearch()">⌕ Suche öffnen</button></div>
    </div>${stats()}
  </div>
  <div class="section-head"><div><h2>Marken</h2><p>Auswahl nach Hersteller</p></div><button class="btn" onclick="go('#vehicles')">Alle anzeigen</button></div>
  <div class="grid">${DB.brands.slice(0,12).map(brandCard).join("")}</div>
  <div class="section-head"><div><h2>Beliebte Reparaturen</h2><p>Arbeitsabläufe mit Sicherheits- und Prüfpunkten</p></div><button class="btn" onclick="go('#repairs')">Alle Reparaturen</button></div>
  <div class="grid">${DB.repairs.slice(0,8).map(repairCard).join("")}</div>
  <footer>Hinweis: Diese Wissensbasis ersetzt keine fahrzeugspezifische Reparaturanleitung. Drehmomente, Füllmengen, Messwerte, Codierungen und Wartungsintervalle müssen anhand der exakten Fahrzeugdaten geprüft werden.</footer>`;
}

function vehicles(){
  setCrumb("Fahrzeuge");
  return `<div class="eyebrow">Fahrzeugdatenbank</div><h1>Hersteller wählen</h1><p>Danach Modell, Baureihe, Motor und Getriebe auswählen.</p><div class="grid" style="margin-top:22px">${DB.brands.map(brandCard).join("")}</div>`;
}

function brandPage(id){
  const b=brandById(decodeURIComponent(id));
  if(!b) return vehicles();
  setCrumb(`Fahrzeuge / ${b.name}`);
  return `<div class="breadcrumbs"><span class="back" onclick="go('#vehicles')">Fahrzeuge</span> / ${esc(b.name)}</div>
  <div class="eyebrow">${esc(b.flag||"")} Hersteller</div><h1>${esc(b.name)}</h1><p>${b.models.length} Modelle im Katalog.</p>
  <div class="grid model-grid" style="margin-top:22px">${b.models.map((m,i)=>`
    <div class="vehicle-card" onclick="go('#vehicles/${encodeURIComponent(b.id)}/${i}')">
      <div class="vehicle-code">${esc(b.id)}</div><strong>${esc(m)}</strong><div class="card-muted">Baureihen öffnen</div>
    </div>`).join("")}</div>`;
}

function modelPage(bid,index){
  const b=brandById(decodeURIComponent(bid));
  const model=b?.models?.[Number(index)];
  if(!b||!model) return brandPage(bid);
  const vehiclesForModel=DB.vehicles.filter(v=>v.brand===b.id && v.model===model);
  setCrumb(`Fahrzeuge / ${b.name} / ${model}`);
  const generations=[];
  vehiclesForModel.forEach(v=>arr(v.generations).forEach((g,gi)=>generations.push({v,g,gi})));
  return `<div class="breadcrumbs"><span class="back" onclick="go('#vehicles/brand/${encodeURIComponent(b.id)}')">${esc(b.name)}</span> / ${esc(model)}</div>
    <div class="eyebrow">${esc(b.flag||"")} Modell</div><h1>${esc(b.name)} ${esc(model)}</h1>
    <p>Wähle eine Baureihe. Danach werden Motor und Getriebe separat auswählbar.</p>
    <div class="generation-grid" style="margin-top:22px">
      ${generations.map(({v,g,gi})=>generationCard(v,g,gi,b,model)).join("")}
    </div>
    ${generations.length?"":"<div class='empty'>Für dieses Modell sind noch keine Baureihen hinterlegt.</div>"}`;
}

function generationCard(v,g,gi,b,model){
  const title=selectedTitle(v,g);
  return `<article class="generation-card" onclick="go('#vehicle/${encodeURIComponent(v.id)}/${gi}')">
    <div class="generation-header"><div><div class="eyebrow">Baureihe</div><h3>${esc(g.name)}</h3><span class="card-muted">${esc(g.years)}</span></div><span class="generation-arrow">›</span></div>
    <div class="generation-data"><div><b>Motoren</b><span>${arr(g.engines).map(esc).join(" · ")||"Keine Angabe"}</span></div>
    <div><b>Getriebe</b><span>${arr(g.transmissions).map(esc).join(" · ")||"Keine Angabe"}</span></div></div>
    <div class="generation-open">Baureihe öffnen →</div>
  </article>`;
}

function generationPage(vehicleId,generationIndex){
  const v=vehicleById(decodeURIComponent(vehicleId));
  const gi=Number(generationIndex);
  const g=v?.generations?.[gi];
  const b=v?brandById(v.brand):null;
  if(!v||!g||!b) return vehicles();
  addRecent("generation",`${v.id}:${gi}`,selectedTitle(v,g),{vehicleId:v.id,generationIndex:gi});
  const saved=routeState.vehicle && routeState.vehicle.vehicleId===v.id && routeState.vehicle.generationIndex===gi ? routeState.vehicle : null;
  const engine=saved?.engine||"";
  const transmission=saved?.transmission||"";
  routeState.vehicle={vehicleId:v.id,generationIndex:gi,engine,transmission};
  setCrumb(`${b.name} / ${v.model} / ${g.name}`);
  return `<div class="breadcrumbs"><span class="back" onclick="go('#vehicles/${encodeURIComponent(v.brand)}/${b.models.indexOf(v.model)}')">${esc(v.model)}</span> / ${esc(g.name)}</div>
    <div class="eyebrow">Baureihe / Generation</div><h1>${esc(b.name)} ${esc(v.model)} · ${esc(g.name)}</h1>
    <p>${esc(g.years)} · Jetzt Motor und Getriebe auswählen.</p>
    <div class="config-layout" style="margin-top:22px">
      <section class="panel">
        <div class="section-title"><h2>1 · Motor auswählen</h2><span class="status-pill">Pflicht</span></div>
        <div class="selection-grid">${arr(g.engines).map(e=>selectionCard("engine",e,e===engine)).join("")}</div>
      </section>
      <section class="panel">
        <div class="section-title"><h2>2 · Getriebe auswählen</h2><span class="status-pill">Pflicht</span></div>
        <div class="selection-grid">${arr(g.transmissions).map(t=>selectionCard("transmission",t,t===transmission)).join("")}</div>
      </section>
    </div>
    <section class="panel vehicle-config" style="margin-top:18px">
      <div class="eyebrow">3 · Fahrzeugprofil</div>
      <h2>${engine?esc(engine):"Motor noch nicht gewählt"} <span class="config-sep">·</span> ${transmission?esc(transmission):"Getriebe noch nicht gewählt"}</h2>
      <p>Gespeicherte Auswahl: ${engine&&transmission?"vollständig":"noch nicht vollständig"}.</p>
      <div class="hero-actions">
        <button class="btn primary" onclick="openVehicleProfile('${esc(v.id)}',${gi})" ${engine&&transmission?"":"disabled"}>Fahrzeugprofil öffnen</button>
        <button class="btn" onclick="go('#repairs')">Reparaturen</button>
      </div>
    </section>`;
}

function selectionCard(type,value,selected){
  const icon=type==="engine"?"⚙":"▣";
  return `<button class="selection-card ${selected?"selected":""}" onclick="event.stopPropagation();selectVehicleConfig('${type}',${JSON.stringify(value).replace(/</g,"\\u003c")} )">
    <span class="selection-icon">${icon}</span><span><b>${esc(value)}</b><small>${selected?"Ausgewählt":"Auswählen"}</small></span><span class="selection-check">${selected?"✓":"›"}</span>
  </button>`;
}

function selectVehicleConfig(type,value){
  if(!routeState.vehicle) return;
  if(type==="engine") routeState.vehicle.engine=value;
  if(type==="transmission") routeState.vehicle.transmission=value;
  render();
}

function openVehicleProfile(vehicleId,generationIndex){
  const v=vehicleById(vehicleId),g=v?.generations?.[Number(generationIndex)];
  if(!v||!g) return;
  const s=routeState.vehicle;
  if(!s?.engine||!s?.transmission){ alert("Bitte zuerst Motor und Getriebe auswählen."); return; }
  const b=brandById(v.brand);
  addRecent("profile",`${vehicleId}:${generationIndex}:${s.engine}:${s.transmission}`,`${b.name} ${v.model} · ${g.name}`);
  $("#detailContent").innerHTML=`<div class="eyebrow">Konkretes Fahrzeugprofil</div>
    <h2>${esc(b.name)} ${esc(v.model)}</h2><p>${esc(g.name)} · ${esc(g.years)}</p>
    <div class="profile-grid">
      <div class="profile-item"><small>Baureihe</small><b>${esc(g.name)}</b></div>
      <div class="profile-item"><small>Motor</small><b>${esc(s.engine)}</b></div>
      <div class="profile-item"><small>Getriebe</small><b>${esc(s.transmission)}</b></div>
      <div class="profile-item"><small>Hinweis</small><b>${esc(v.note||"Fahrzeugdaten vor Reparatur nochmals verifizieren.")}</b></div>
    </div>
    <div class="notice" style="margin-top:18px">Dieses Profil dient der eindeutigen Auswahl. Technische Werte wie Drehmomente, Füllmengen und Messwerte nur aus verifizierten Unterlagen für genau diese Variante übernehmen.</div>`;
  $("#detailModal").classList.remove("hidden");
}

function repairs(){
  setCrumb("Reparaturen");
  const sys=new URLSearchParams(location.hash.split("?")[1]||"").get("system");
  const list=sys?DB.repairs.filter(r=>r.system===sys):DB.repairs;
  return `<div class="eyebrow">Werkstattabläufe</div><h1>Reparaturdatenbank</h1><p>${list.length} strukturierte Arbeitsabläufe.</p>
    <div class="toolbar"><button class="filter ${!sys?"active":""}" onclick="go('#repairs')">Alle</button>${DB.systems.map(s=>`<button class="filter ${sys===s.id?"active":""}" onclick="go('#repairs?system=${encodeURIComponent(s.id)}')">${s.icon} ${esc(s.name)}</button>`).join("")}</div>
    <div class="grid">${list.map(repairCard).join("")}</div>`;
}

function systems(){
  setCrumb("Baugruppen");
  return `<div class="eyebrow">Systemübersicht</div><h1>Fahrzeugsysteme</h1><p>Motor, Bremse, Elektrik, Klima und weitere Baugruppen.</p>
    <div class="grid" style="margin-top:22px">${DB.systems.map(s=>`<div class="system-card" onclick="go('#repairs?system=${encodeURIComponent(s.id)}')"><div class="icon">${s.icon}</div><h3>${esc(s.name)}</h3><p>${esc(s.desc)}</p><span class="tag">${DB.repairs.filter(r=>r.system===s.id).length} Abläufe</span></div>`).join("")}</div>`;
}

function components(){
  setCrumb("Bauteile");
  return `<div class="eyebrow">Bauteilkatalog</div><h1>Bauteile & Funktionen</h1><p>Einbauort, Funktion, Symptome und Werkzeug.</p>
    <div class="grid" style="margin-top:22px">${DB.components.map(c=>`<div class="component-card" onclick="showComponent('${esc(c.id)}')"><div class="vehicle-code">${esc(c.system)}</div><h3>${esc(c.name)}</h3><p>${esc(c.function)}</p><div class="tag">${esc(c.symptoms[0]||"")}</div></div>`).join("")}</div>`;
}

function diagnosis(){
  setCrumb("Diagnose");
  return `<div class="eyebrow">Fehler systematisch eingrenzen</div><h1>Diagnose-Assistent</h1><p>Symptom auswählen und Prüfreihenfolge starten.</p>
    <div class="grid" style="margin-top:22px">${DB.symptoms.map(s=>`<div class="diag-card panel" onclick="showSymptom('${esc(s.id)}')"><h3>⌕ ${esc(s.name)}</h3><p>Prüfen: ${esc(s.checks.slice(0,3).join(" · "))}</p><span class="tag">${s.related.length} passende Abläufe</span></div>`).join("")}</div>`;
}

function favorites(){
  setCrumb("Merkliste"); const a=favs();
  return `<div class="eyebrow">Persönliche Sammlung</div><h1>Merkliste</h1><p>Im Browser gespeicherte Einträge.</p>
    ${a.length?`<div class="grid" style="margin-top:22px">${a.map(x=>`<div class="panel"><div class="card-muted">${esc(x.type)}</div><h3>${esc(x.title)}</h3><button class="btn" onclick="removeFav('${esc(x.type)}','${esc(x.id)}')">★ Entfernen</button></div>`).join("")}</div>`:`<div class="empty" style="margin-top:22px">Noch keine Einträge gespeichert.</div>`}`;
}

function recent(){
  setCrumb("Zuletzt geöffnet"); const a=recs();
  return `<div class="eyebrow">Verlauf</div><h1>Zuletzt geöffnet</h1>
    ${a.length?`<div class="grid" style="margin-top:22px">${a.map(x=>`<div class="panel"><div class="card-muted">${new Date(x.at).toLocaleString("de-DE")}</div><h3>${esc(x.title)}</h3><button class="btn" onclick='reopen(${JSON.stringify(x)})'>Öffnen</button></div>`).join("")}</div>`:`<div class="empty" style="margin-top:22px">Noch nichts geöffnet.</div>`}`;
}

function reopen(x){
  if(x.type==="generation" && x.vehicleId!=null) go(`#vehicle/${encodeURIComponent(x.vehicleId)}/${x.generationIndex}`);
  else if(x.type==="profile" && x.vehicleId!=null) go(`#vehicle/${encodeURIComponent(x.vehicleId)}/${x.generationIndex}`);
  else if(x.type==="vehicle") {
    const v=vehicleById(x.id),b=v&&brandById(v.brand);
    if(v&&b) go(`#vehicles/${encodeURIComponent(v.brand)}/${b.models.indexOf(v.model)}`);
  } else if(x.type==="repair") showRepair(x.id);
}

function vehicleSelectOptions(){
  return DB.vehicles.map(v=>{
    const b=brandById(v.brand);
    return `<option value="${esc(v.id)}">${esc(b?.name||v.brand)} ${esc(v.model)} — ${arr(v.generations).map(g=>g.name).join(" · ")}</option>`;
  }).join("");
}

function showRepair(id){
  const r=DB.repairs.find(x=>x.id===id); if(!r)return;
  addRecent("repair",id,r.title);
  $("#detailContent").innerHTML=`<div class="eyebrow">Werkstatt-Anleitung · ${esc(r.system)}</div><h2>${esc(r.title)}</h2><p>${esc(r.summary)}</p>
    <div class="meta"><span>${esc(r.difficulty)}</span><span>${esc(r.time)}</span><span>${esc(r.system)}</span></div>
    <div class="workshop-vehicle panel"><div class="section-title"><h3>1 · Fahrzeug festlegen</h3><span class="status-pill">Pflicht</span></div>
    <select class="search-input" onchange="setRepairVehicle(this.value)"><option value="">Fahrzeug auswählen …</option>${vehicleSelectOptions()}</select>
    <div id="repairVehicleInfo" class="vehicle-context-box">Bitte zuerst das Fahrzeug auswählen.</div></div>
    <div class="notice" style="margin-top:16px"><b>Datenhinweis:</b> Exakte Drehmomente und Messwerte nur für die konkrete Variante aus verifizierten Unterlagen verwenden.</div>
    <div class="workshop-grid">
      <section class="workshop-section"><div class="section-title"><h3>2 · Werkzeug</h3></div><div class="chip-list">${arr(r.tools).map(x=>`<span class="tool-chip">🔧 ${esc(x)}</span>`).join("")}</div></section>
      <section class="workshop-section"><div class="section-title"><h3>3 · Teile</h3></div><div class="side-list">${arr(r.parts).map(x=>`<div>▸ ${esc(x)}</div>`).join("")}</div></section>
    </div>
    ${workshopSteps("4 · Vorbereitung",r.preparation)}
    ${workshopSteps("5 · Ausbau",r.removalSteps)}
    ${workshopSteps("6 · Einbau",r.installationSteps)}
    <section class="workshop-section"><div class="section-title"><h3>7 · Schrauben & Drehmomente</h3><span class="status-pill warn">Fahrzeugspezifisch prüfen</span></div>
      <div class="table-wrap"><table class="spec-table"><thead><tr><th>Befestiger</th><th>Drehmoment</th><th>Winkel</th><th>Neue Schraube?</th></tr></thead><tbody>
      ${arr(r.fasteners).map(f=>`<tr><td>${esc(f.name)}</td><td>${f.torqueNm==null?"—":esc(f.torqueNm+" Nm")}</td><td>${f.angleDeg==null?"—":esc(f.angleDeg+"°")}</td><td>${f.newBolt===true?"Ja":f.newBolt===false?"Nein":"Prüfen"}</td></tr>`).join("")}
      </tbody></table></div><div class="torque-box">${esc(r.torqueNotice||"Herstellerwert für die exakte Variante prüfen.")}</div>
    </section>
    ${workshopSteps("8 · Flüssigkeiten",r.fluids)}
    ${workshopSteps("9 · Diagnose / Reset",r.diagnostics)}
    ${workshopSteps("10 · Abschlussprüfung",r.finalChecks)}
    <div class="source-box"><b>Datenstatus:</b> ${esc(r.sourceStatus||"Allgemeiner Arbeitsablauf.")}</div>`;
  $("#detailModal").classList.remove("hidden");
}

function workshopSteps(title,items){
  return `<section class="workshop-section"><div class="section-title"><h3>${esc(title)}</h3></div><div class="steps">${arr(items).map((x,i)=>`<div class="step"><div class="step-num">${i+1}</div><div>${esc(x)}</div></div>`).join("")}</div></section>`;
}

function setRepairVehicle(id){
  const v=vehicleById(id),b=v&&brandById(v.brand);
  const el=$("#repairVehicleInfo"); if(!el)return;
  if(!v){el.textContent="Bitte zuerst das Fahrzeug auswählen.";return;}
  el.innerHTML=`<b>${esc(b?.name||v.brand)} ${esc(v.model)}</b>${arr(v.generations).map(g=>`<div class="vehicle-context"><b>${esc(g.name)}</b><span>${esc(g.years)}</span><span>${arr(g.engines).map(esc).join(" · ")}</span><span>${arr(g.transmissions).map(esc).join(" · ")}</span></div>`).join("")}`;
}

function showComponent(id){
  const c=DB.components.find(x=>x.id===id); if(!c)return;
  $("#detailContent").innerHTML=`<div class="eyebrow">${esc(c.system)}</div><h2>${esc(c.name)}</h2><p>${esc(c.function)}</p><div class="detail-layout">
    <div><h3>Einbauort</h3><p>${esc(c.location)}</p><h3>Typische Symptome</h3><div class="side-list">${arr(c.symptoms).map(x=>`<div>${esc(x)}</div>`).join("")}</div></div>
    <div><h3>Werkzeug</h3><div class="side-list" style="margin-top:10px">${arr(c.tools).map(x=>`<div>${esc(x)}</div>`).join("")}</div></div></div>
    <div class="notice" style="margin-top:18px">${esc(c.safety)}</div>`;
  $("#detailModal").classList.remove("hidden");
}

function showSymptom(id){
  const s=DB.symptoms.find(x=>x.id===id); if(!s)return;
  $("#detailContent").innerHTML=`<div class="eyebrow">Diagnose</div><h2>${esc(s.name)}</h2><p>Prüfungen von oben nach unten abarbeiten und Messwerte/Fehlercodes dokumentieren.</p>
    <h3>Prüfreihenfolge</h3>${workshopSteps("",s.checks)}<h3 style="margin-top:22px">Passende Abläufe</h3>
    <div class="side-list" style="margin-top:10px">${arr(s.related).map(id=>{const r=DB.repairs.find(x=>x.id===id);return r?`<div onclick="closeModals();showRepair('${esc(r.id)}')">🔧 ${esc(r.title)}</div>`:""}).join("")}</div>`;
  $("#detailModal").classList.remove("hidden");
}

function openSearch(){ $("#searchModal").classList.remove("hidden"); setTimeout(()=>$("#searchInput").focus(),50); search(""); }
function closeModals(){ document.querySelectorAll(".modal").forEach(x=>x.classList.add("hidden")); }
function search(q){
  q=q.trim().toLowerCase(); const out=[];
  DB.brands.forEach(b=>{if(!q||b.name.toLowerCase().includes(q))out.push({t:"Marke",n:b.name,a:`#vehicles/brand/${b.id}`});
    b.models.forEach((m,i)=>{if(q&&m.toLowerCase().includes(q))out.push({t:"Modell",n:`${b.name} ${m}`,a:`#vehicles/${b.id}/${i}`});});
  });
  DB.vehicles.forEach(v=>arr(v.generations).forEach((g,gi)=>{
    const hay=`${v.model} ${g.name} ${g.years} ${arr(g.engines).join(" ")} ${arr(g.transmissions).join(" ")}`.toLowerCase();
    if(q&&hay.includes(q))out.push({t:"Baureihe",n:`${brandById(v.brand)?.name||v.brand} ${v.model} · ${g.name}`,a:`#vehicle/${v.id}/${gi}`});
  }));
  DB.repairs.forEach(r=>{if(!q||`${r.title} ${r.summary}`.toLowerCase().includes(q))out.push({t:"Reparatur",n:r.title,id:r.id});});
  DB.components.forEach(c=>{if(!q||`${c.name} ${c.function} ${arr(c.symptoms).join(" ")}`.toLowerCase().includes(q))out.push({t:"Bauteil",n:c.name,id:c.id});});
  DB.symptoms.forEach(s=>{if(!q||s.name.toLowerCase().includes(q))out.push({t:"Diagnose",n:s.name,id:s.id});});
  const list=out.slice(0,30);
  $("#searchResults").innerHTML=list.length?list.map(x=>`<div class="result" onclick="${x.a?`location.hash='${x.a}'`:x.t==="Reparatur"?`closeModals();showRepair('${x.id}')`:x.t==="Bauteil"?`closeModals();showComponent('${x.id}')`:`closeModals();showSymptom('${x.id}')`}"><b>${esc(x.n)}</b><small>${esc(x.t)}</small></div>`).join(""):`<div class="empty">Keine Treffer.</div>`;
}

function favoritesRoute(){ return favorites(); }

function render(){
  if(!DB)return;
  const raw=location.hash||"#home", parts=raw.slice(1).split("?")[0].split("/").map(decodeURIComponent);
  let html;
  if(parts[0]==="home") html=home();
  else if(parts[0]==="vehicles"&&parts[1]==="brand") html=brandPage(parts[2]);
  else if(parts[0]==="vehicles"&&parts[1]) html=modelPage(parts[1],Number(parts[2]));
  else if(parts[0]==="vehicles") html=vehicles();
  else if(parts[0]==="vehicle"&&parts[1]) html=generationPage(parts[1],Number(parts[2]||0));
  else if(parts[0]==="repairs") html=repairs();
  else if(parts[0]==="diagnosis") html=diagnosis();
  else if(parts[0]==="systems") html=systems();
  else if(parts[0]==="components") html=components();
  else if(parts[0]==="favorites") html=favoritesRoute();
  else if(parts[0]==="recent") html=recent();
  else html=home();
  $("#content").innerHTML=html;
  document.querySelectorAll("nav a").forEach(a=>a.classList.toggle("active",a.dataset.route===parts[0]));
}

async function init(){
  try{
    const r=await fetch("database.json",{cache:"no-store"});
    if(!r.ok) throw new Error(`HTTP ${r.status}`);
    DB=await r.json();
    render();
  }catch(e){
    console.error(e);
    $("#content").innerHTML=`<div class="empty"><h2>Datenbank konnte nicht geladen werden</h2><p>Bitte prüfen, ob <b>database.json</b> im gleichen Ordner wie index.html und app.js liegt.</p><p>${esc(e.message)}</p></div>`;
  }
}

$("#openSearch").onclick=openSearch;
$("#openSearch2").onclick=openSearch;
$("#mobileMenu").onclick=()=>$("#sidebar").classList.toggle("open");
document.addEventListener("click",e=>{if(e.target.matches("[data-close]"))closeModals();});
document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();openSearch();}if(e.key==="Escape")closeModals();});
window.addEventListener("hashchange",render);

window.go=go; window.openSearch=openSearch; window.closeModals=closeModals; window.showRepair=showRepair;
window.showComponent=showComponent; window.showSymptom=showSymptom; window.setRepairVehicle=setRepairVehicle;
window.selectVehicleConfig=selectVehicleConfig; window.openVehicleProfile=openVehicleProfile;
window.toggleFav=toggleFav; window.removeFav=removeFav; window.reopen=reopen;

init();
