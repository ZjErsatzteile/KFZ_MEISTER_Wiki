
let DB = null;
const $ = s => document.querySelector(s);
const esc = v => String(v ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
const arr = v => Array.isArray(v) ? v : [];
const go = h => location.hash = h;

function byId(list,id){ return arr(list).find(x=>String(x.id)===String(id)); }
function pageHeader(title,sub){return `<section class="page-header"><div><span class="eyebrow">KFZ MEISTER WIKI</span><h1>${esc(title)}</h1><p>${esc(sub||"")}</p></div></section>`}
function empty(title,msg){return `<div class="empty"><h3>${esc(title)}</h3><p>${esc(msg)}</p></div>`}
function severityClass(s){return s==="kritisch"?"danger":s==="hoch"?"warn":"info"}

function layout(content){
return `<div class="app-shell">
<header class="topbar"><button class="brand" onclick="go('#home')"><span class="brand-mark">K</span><span><b>KFZ MEISTER</b><small>Wiki Pro</small></span></button>
<div class="global-search"><input id="search" placeholder="Suche: Bremsen, P0300, Batterie, Ölwechsel …" autocomplete="off"><button onclick="searchNow()">⌕</button><div id="suggestions"></div></div>
<nav><button onclick="go('#repairs')">🔧 Reparaturen</button><button onclick="go('#diagnosis')">🩺 Diagnose</button><button onclick="go('#systems')">⚙️ Systeme</button></nav></header>
<div class="layout"><aside><button onclick="go('#home')">⌂ Startseite</button><button onclick="go('#vehicles')">🚘 Fahrzeuge</button><button onclick="go('#repairs')">🔧 Reparaturen</button><button onclick="go('#systems')">⚙️ Systeme</button><button onclick="go('#components')">🔩 Komponenten</button><button onclick="go('#diagnosis')">🩺 Diagnose</button><button onclick="go('#tools')">🧰 Werkzeug</button><button onclick="go('#legal')">⚖️ Recht & Hinweise</button></aside>
<main><div id="content">${content}</div></main></div>
<footer><span>KFZ MEISTER Wiki Pro · statische GitHub-Pages-Anwendung</span><span>Technische Werte immer fahrzeugspezifisch verifizieren.</span></footer></div>`
}

function home(){
return pageHeader("KFZ MEISTER Wiki Pro","Diagnose, Reparatur, Fahrzeugsysteme, Komponenten, Werkzeuge und technische Übersichten – als erweiterbare Wissensdatenbank.")
+`<div class="hero-grid">
<div class="hero-panel"><span class="eyebrow">DIAGNOSE → URSACHE → REPARATUR</span><h2>Vom Fehlerbild zur sauberen Reparatur.</h2><p>Die Datenbank trennt Diagnose, Bauteil, Werkzeug, Arbeitsschritte und fahrzeugspezifische Werte. So kann ein Eintrag später gezielt mit OEM-Daten erweitert werden.</p><div class="hero-actions"><button class="primary" onclick="go('#diagnosis')">Diagnose öffnen</button><button onclick="go('#repairs')">Reparaturen</button></div></div>
<div class="stat-grid"><div><b>${DB.diagnosis.length}</b><span>Diagnosefälle</span></div><div><b>${DB.repairs.length}</b><span>Reparaturen</span></div><div><b>${DB.systems.length}</b><span>Systeme</span></div><div><b>${DB.components.length}</b><span>Komponenten</span></div></div></div>
<section class="section"><div class="section-head"><h2>Werkstattbereiche</h2></div><div class="card-grid">
${DB.systems.slice(0,8).map(s=>`<article class="card clickable" onclick="go('#system/${s.id}')"><span class="icon">⚙️</span><h3>${esc(s.name)}</h3><p>${esc(s.description)}</p></article>`).join("")}</div></section>
<section class="notice danger"><b>Sicherheitsregel:</b> Bremsen, Lenkung, Airbag und Hochvolt sind sicherheitskritisch. Keine pauschalen Drehmomente verwenden. Immer Fahrzeugidentifikation und Herstellerverfahren prüfen.</section>`;
}

function vehicles(){
return pageHeader("Fahrzeuge","Hersteller und Modelle als Einstieg. Exakte Motorcodes, PR-Codes, Ausstattungen und Baujahre müssen ergänzt/verifiziert werden.")
+`<div class="card-grid">${DB.brands.map(b=>`<article class="card clickable" onclick="go('#brand/${b.id}')"><span class="brand-logo">${esc(b.name[0])}</span><h3>${esc(b.name)}</h3><p>${b.models.length} Modelle</p></article>`).join("")}</div>`;
}
function brand(id){
const b=byId(DB.brands,id); if(!b)return empty("Nicht gefunden","Hersteller nicht vorhanden.");
return pageHeader(b.name,"Modelle auswählen.")+`<div class="card-grid">${b.models.map(m=>`<article class="card clickable" onclick="go('#model/${b.id}/${m.id}')"><span class="icon">🚗</span><h3>${esc(m.name)}</h3><p>${esc(m.description)}</p></article>`).join("")}</div>`;
}
function model(bid,mid){
const b=byId(DB.brands,bid), m=b?.models?.find(x=>x.id===mid); if(!b||!m)return empty("Nicht gefunden","Modell nicht vorhanden.");
const vs=DB.vehicles.filter(v=>v.brand===bid&&v.model===mid);
return pageHeader(`${b.name} ${m.name}`,"Baureihe öffnen und anschließend Motor/Getriebe fahrzeugspezifisch eingrenzen.")+
`<div class="card-grid">${vs.map(v=>`<article class="card clickable" onclick="go('#vehicle/${v.id}')"><span class="icon">⚙️</span><h3>${esc(v.name)}</h3><p>Baureihe / Generation · ${v.generations[0].years}</p></article>`).join("")}</div>`;
}
function vehicle(id){
const v=byId(DB.vehicles,id), b=byId(DB.brands,v?.brand); if(!v)return empty("Nicht gefunden","Fahrzeugdatensatz nicht vorhanden.");
const g=v.generations[0];
return pageHeader(`${b?.name||""} ${v.name}`,"Fahrzeugkonfiguration als Ausgangspunkt.")
+`<div class="config-grid"><div class="panel"><h2>Motor</h2>${g.engines.map(x=>`<div class="chip">${esc(x)}</div>`).join("")}</div><div class="panel"><h2>Getriebe</h2>${g.transmissions.map(x=>`<div class="chip">${esc(x)}</div>`).join("")}</div><div class="panel"><h2>Antrieb</h2>${g.drivetrains.map(x=>`<div class="chip">${esc(x)}</div>`).join("")}</div></div>
<div class="notice"><b>Wichtig:</b> Für Drehmomente, Füllmengen, Motorcodes, Steuerzeiten, Anzugswinkel und Reparaturgrenzen ist diese Auswahl noch nicht spezifisch genug. Dafür VIN/FIN, Motorcode, Getriebecode und Baujahr/Ausstattung heranziehen.</div>`;
}

function repairCard(r){return `<article class="card clickable" onclick="go('#repair/${r.id}')"><span class="tag">${esc(r.system)}</span><h3>${esc(r.title)}</h3><p>${esc(r.description)}</p><div class="meta"><span>${esc(r.difficulty||"—")}</span><span>${esc(r.safety||"—")}</span></div></article>`}
function repairs(){return pageHeader("Reparaturen","Arbeitsabläufe mit Werkzeug, Teilen, Sicherheit und Prüfungen.")+
`<div class="filterbar"><input id="repairFilter" placeholder="Reparatur filtern …" oninput="filterCards(this.value,'repair-list')"></div><div id="repair-list" class="card-grid">${DB.repairs.map(repairCard).join("")}</div>`}
function repair(id){
const r=byId(DB.repairs,id); if(!r)return empty("Nicht gefunden","Reparatur nicht vorhanden.");
const cs=arr(r.componentIds).map(x=>byId(DB.components,x)).filter(Boolean);
return pageHeader(r.title,r.description)+
`<div class="two-col"><section><div class="panel"><h2>Ablauf</h2><ol class="steps">${arr(r.workflow).map(x=>`<li>${esc(x)}</li>`).join("")}</ol></div>
${cs.map(c=>componentDetail(c,true)).join("")}</section><aside class="side"><div class="panel"><h3>Sicherheitsniveau</h3><span class="severity ${severityClass(r.safety?.toLowerCase())}">${esc(r.safety||"Prüfen")}</span><p><b>Schwierigkeit:</b> ${esc(r.difficulty||"—")}</p></div><div class="notice danger">Drehmomente und Anzugswinkel nur aus der exakten Hersteller-/Werkstattunterlage übernehmen.</div></aside></div>`;
}
function componentDetail(c,compact=false){
return `<article class="panel component"><div class="section-head"><div><span class="tag">${esc(c.system)}</span><h2>${esc(c.name)}</h2></div></div><p>${esc(c.description)}</p>
<div class="mini-grid"><div><h3>Werkzeug</h3><ul>${arr(c.tools).map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div><div><h3>Benötigte Teile</h3><ul>${arr(c.parts).map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div></div>
<div class="torque"><b>Drehmoment / technische Werte:</b><br>${esc(c.torque)}</div>
<h3>Reparaturablauf</h3><ol class="steps">${arr(c.steps).map(x=>`<li>${esc(x)}</li>`).join("")}</ol>
${c.after?.length?`<h3>Nachkontrolle</h3><ul>${c.after.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:""}</article>`;
}
function components(){return pageHeader("Komponenten","Bauteile mit Funktion, Werkzeug, Teilen, Ablauf und Prüfhinweisen.")+
`<div class="card-grid">${DB.components.map(c=>`<article class="card clickable" onclick="go('#component/${c.id}')"><span class="icon">🔩</span><h3>${esc(c.name)}</h3><p>${esc(c.description)}</p></article>`).join("")}</div>`}
function component(id){const c=byId(DB.components,id); return c?pageHeader(c.name,"Komponentenwissen und Reparaturinformation.")+componentDetail(c):empty("Nicht gefunden","Komponente nicht vorhanden.");}

function systems(){return pageHeader("Fahrzeugsysteme","Technische Übersicht der wichtigsten Fahrzeugbaugruppen.")+
`<div class="card-grid">${DB.systems.map(s=>`<article class="card clickable" onclick="go('#system/${s.id}')"><span class="icon">⚙️</span><h3>${esc(s.name)}</h3><p>${esc(s.description)}</p></article>`).join("")}</div>`}
function system(id){const s=byId(DB.systems,id); if(!s)return empty("Nicht gefunden","System nicht vorhanden.");
return pageHeader(s.name,s.description)+`<div class="two-col"><section><div class="panel"><h2>Technische Übersicht</h2><p>${esc(s.overview)}</p><h3>Prüfpunkte</h3><ul>${s.checks.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div></section><aside><div class="panel"><h3>Risiken</h3><ul>${s.risks.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div></aside></div>`}

function diagnosis(){return pageHeader("Diagnose","Symptom → mögliche Ursachen → Prüfungen → Reparaturentscheidung. Ein Fehlercode ist kein automatischer Teiletausch.")
+`<div class="filterbar"><input id="diagFilter" placeholder="Symptom, Code oder Bauteil …" oninput="filterCards(this.value,'diag-list')"></div><div id="diag-list" class="card-grid">${DB.diagnosis.map(d=>`<article class="card clickable" data-text="${esc((d.name+" "+d.symptom+" "+d.cause).toLowerCase())}" onclick="go('#diag/${d.id}')"><span class="severity ${severityClass(d.severity)}">${esc(d.severity)}</span><h3>${esc(d.name)}</h3><p>${esc(d.symptom)}</p><small>${esc(d.cause)}</small></article>`).join("")}</div>`}
function diag(id){const d=byId(DB.diagnosis,id); if(!d)return empty("Nicht gefunden","Diagnosefall nicht vorhanden.");
return pageHeader(d.name,d.symptom)+`<div class="two-col"><section><div class="panel"><h2>Mögliche Ursachen</h2><p>${esc(d.cause)}</p><h2>Diagnoseablauf</h2><ol class="steps">${d.checks.map(x=>`<li>${esc(x)}</li>`).join("")}</ol><h2>Reparaturentscheidung</h2><p>${esc(d.repair)}</p></div></section><aside><div class="panel"><h3>Priorität</h3><span class="severity ${severityClass(d.severity)}">${esc(d.severity)}</span></div><div class="notice">Messwerte immer mit fahrzeugspezifischen Sollwerten vergleichen.</div></aside></div>`}

function tools(){return pageHeader("Werkzeug","Grundausstattung und Hinweise für sichere Werkstattarbeit.")+
`<div class="card-grid">${DB.tools.map(t=>`<article class="card"><span class="icon">🧰</span><h3>${esc(t.name)}</h3><p>${esc(t.use)}</p><div class="note">${esc(t.note)}</div></article>`).join("")}</div>`}
function legal(){return pageHeader("Recht, Dokumentation & Grenzen","Allgemeine Hinweise – keine individuelle Rechtsberatung.")+
`<div class="card-grid">${DB.legal.map(x=>`<article class="card"><span class="icon">⚖️</span><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></article>`).join("")}</div><div class="notice danger"><b>Hinweis:</b> Rechtliche Anforderungen hängen vom Land, Fahrzeug und Eingriff ab. Bei Umbauten und sicherheitsrelevanten Änderungen vor der Inbetriebnahme die zuständige Prüfstelle/Behörde bzw. Fachbetrieb einbeziehen.</div>`}

function searchAll(q){
q=q.trim().toLowerCase(); if(!q)return [];
let out=[];
for(const x of DB.diagnosis) if((x.name+" "+x.symptom+" "+x.cause).toLowerCase().includes(q))out.push({t:"Diagnose",n:x.name,h:"#diag/"+x.id});
for(const x of DB.repairs) if((x.title+" "+x.description+" "+x.system).toLowerCase().includes(q))out.push({t:"Reparatur",n:x.title,h:"#repair/"+x.id});
for(const x of DB.components) if((x.name+" "+x.description+" "+x.system).toLowerCase().includes(q))out.push({t:"Komponente",n:x.name,h:"#component/"+x.id});
for(const x of DB.systems) if((x.name+" "+x.description).toLowerCase().includes(q))out.push({t:"System",n:x.name,h:"#system/"+x.id});
for(const b of DB.brands) if(b.name.toLowerCase().includes(q))out.push({t:"Hersteller",n:b.name,h:"#brand/"+b.id});
return out.slice(0,40);
}
function searchPage(q){const r=searchAll(q);return pageHeader("Suche",`Ergebnisse für „${q}“`)+(r.length?`<div class="search-results">${r.map(x=>`<button onclick="go('${x.h}')"><span>${esc(x.t)}</span><b>${esc(x.n)}</b>›</button>`).join("")}</div>`:empty("Keine Treffer","Andere Begriffe wie Bremsen, ABS, Batterie, Öl, P0300 oder Zündaussetzer versuchen."));}
function searchNow(){const q=$("#search")?.value.trim(); if(q)go("#search/"+encodeURIComponent(q));}
function filterCards(q,id){q=q.toLowerCase();document.querySelectorAll(`#${id} .card`).forEach(c=>c.style.display=(!q||((c.dataset.text||c.innerText).toLowerCase().includes(q)))?"":"none");}

function render(){
const p=location.hash.replace(/^#/,"").split("/").map(decodeURIComponent), r=p[0]||"home";
let c="";
if(r==="home")c=home(); else if(r==="vehicles")c=vehicles(); else if(r==="brand")c=brand(p[1]); else if(r==="model")c=model(p[1],p[2]); else if(r==="vehicle")c=vehicle(p[1]);
else if(r==="repairs")c=repairs(); else if(r==="repair")c=repair(p[1]); else if(r==="components")c=components(); else if(r==="component")c=component(p[1]);
else if(r==="systems")c=systems(); else if(r==="system")c=system(p[1]); else if(r==="diagnosis")c=diagnosis(); else if(r==="diag")c=diag(p[1]); else if(r==="tools")c=tools(); else if(r==="legal")c=legal(); else if(r==="search")c=searchPage(p.slice(1).join("/")); else c=empty("404","Seite nicht gefunden.");
document.body.innerHTML=layout(c);
const s=$("#search"); if(s){s.value=r==="search"?p.slice(1).join(" "):"";s.addEventListener("keydown",e=>{if(e.key==="Enter")searchNow()});}
}
async function init(){try{DB=await fetch("database.json",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("database.json konnte nicht geladen werden");return r.json()});render();}catch(e){document.body.innerHTML=`<main class="fatal"><h1>KFZ MEISTER Wiki</h1><p>${esc(e.message)}</p><p>Bitte database.json neben index.html ablegen.</p></main>`}}
addEventListener("hashchange",render); addEventListener("DOMContentLoaded",init);
