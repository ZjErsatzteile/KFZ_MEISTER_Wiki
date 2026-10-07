let DB=null, routeState={brand:null,vehicle:null};
const $=s=>document.querySelector(s), esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const favs=()=>JSON.parse(localStorage.getItem("kfz_favs")||"[]");
const recs=()=>JSON.parse(localStorage.getItem("kfz_recent")||"[]");
const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
function addRecent(type,id,title){let a=recs().filter(x=>!(x.type===type&&x.id===id));a.unshift({type,id,title,at:Date.now()});save("kfz_recent",a.slice(0,20))}
function isFav(type,id){return favs().some(x=>x.type===type&&x.id===id)}
function toggleFav(type,id,title){let a=favs();let i=a.findIndex(x=>x.type===type&&x.id===id);i>=0?a.splice(i,1):a.unshift({type,id,title});save("kfz_favs",a);render()}
function go(hash){location.hash=hash}
function setCrumb(t){$("#crumb").textContent="Werkstatt / "+t}
function statCards(){let s=DB.stats;return `<div class="stats">${[
["Marken",s.brands],["Modelle",s.models],["Reparaturen",s.repairs],["Bauteile",s.components]
].map(x=>`<div class="stat"><b>${x[1]}</b><span>${x[0]}</span></div>`).join("")}</div>`}
function home(){
 setCrumb("Dashboard");
 return `<div class="hero"><div class="hero-card"><div class="eyebrow">Werkstattwissen · Version 2</div><h1>Deine digitale KFZ-Werkstatt.</h1><p>Marken, Modelle, Baugruppen, Bauteile, Reparaturen und Diagnosewissen in einer strukturierten Wissensbasis. Für den exakten Fahrzeugtyp immer mit Hersteller-/Werkstattunterlagen abgleichen.</p><div class="hero-actions"><button class="btn primary" onclick="go('#vehicles')">Fahrzeug auswählen</button><button class="btn" onclick="openSearch()">⌕ Suche öffnen</button></div></div>${statCards()}</div>
 <div class="section-head"><div><h2>Marken</h2><p>Auswahl nach Hersteller</p></div><button class="btn" onclick="go('#vehicles')">Alle anzeigen</button></div>
 <div class="grid">${DB.brands.slice(0,12).map(b=>brandCard(b)).join("")}</div>
 <div class="section-head"><div><h2>Beliebte Reparaturen</h2><p>Direkt zu Arbeitsschritten und Sicherheitschecks</p></div><button class="btn" onclick="go('#repairs')">Reparaturdatenbank</button></div>
 <div class="grid">${DB.repairs.slice(0,8).map(repairCard).join("")}</div>
 <footer>Hinweis: Diese Wissensbasis ersetzt keine fahrzeugspezifische Reparaturanleitung. Drehmomente, Füllmengen, Messwerte, Codierungen und Wartungsintervalle müssen anhand der exakten Fahrzeugdaten geprüft werden.</footer>`
}
function brandCard(b){return `<div class="brand-card" onclick="go('#vehicles/brand/${b.id}')"><div class="brand-top"><div class="brand-badge">${esc(b.id.slice(0,3))}</div><span>${b.flag}</span></div><h3 style="margin-top:14px">${esc(b.name)}</h3><div class="card-muted">${b.models.length} Modelle im Katalog</div></div>`}
function repairCard(r){return `<div class="repair-card" onclick="showRepair('${r.id}')"><div class="icon">🔧</div><h3>${esc(r.title)}</h3><p>${esc(r.summary)}</p><div class="meta"><span>${esc(r.system)}</span><span>${esc(r.difficulty)}</span><span>${esc(r.time)}</span></div></div>`}
function vehicles(){
 setCrumb("Fahrzeuge");
 return `<div class="eyebrow">Fahrzeugdatenbank</div><h1>Marke wählen</h1><p>Danach Modell und Fahrzeugkonfiguration auswählen.</p><div class="grid" style="margin-top:22px">${DB.brands.map(brandCard).join("")}</div>`
}
function brandPage(id){
 let b=DB.brands.find(x=>x.id===id); if(!b)return vehicles(); setCrumb(`Fahrzeuge / ${b.name}`);
 return `<div class="breadcrumbs"><span class="back" onclick="go('#vehicles')">Fahrzeuge</span> / ${esc(b.name)}</div><div class="eyebrow">${b.flag} Hersteller</div><h1>${esc(b.name)}</h1><p>${b.models.length} Modelle im Katalog.</p><div class="grid model-grid" style="margin-top:22px">${b.models.map((m,i)=>`<div class="vehicle-card" onclick="go('#vehicles/${b.id}/${i}')"><div class="vehicle-code">${esc(b.id)}</div><strong>${esc(m)}</strong><div class="card-muted">Baureihen &amp; Systeme öffnen</div></div>`).join("")}</div>`
}
function modelPage(bid,index){
 let b=DB.brands.find(x=>x.id===bid), model=b?.models[index]; if(!b||!model)return brandPage(bid);
 setCrumb(`Fahrzeuge / ${b.name} / ${model}`); let v=DB.vehicles.find(x=>x.brand===bid&&x.model===model);
 addRecent("vehicle",v.id,`${b.name} ${model}`);
 return `<div class="breadcrumbs"><span class="back" onclick="go('#vehicles/brand/${bid}')">${esc(b.name)}</span> / ${esc(model)}</div>
 <div class="eyebrow">${b.flag} Fahrzeugprofil</div><h1>${esc(b.name)} ${esc(model)}</h1>
 <div class="detail-layout" style="margin-top:22px"><div class="panel"><h2>Fahrzeugkonfiguration</h2><p>Wähle vor einer Reparatur immer die exakte Generation, Motorisierung und Getriebevariante.</p><div class="steps">
 ${v.generations.map((g,i)=>`<div class="step"><div class="step-num">${i+1}</div><div><b>${esc(g.name)}</b><p>${esc(g.years)}</p><div class="meta">${g.engines.map(e=>`<span>${esc(e)}</span>`).join("")}</div><div class="meta">${g.transmissions.map(e=>`<span>${esc(e)}</span>`).join("")}</div></div></div>`).join("")}</div></div>
 <div class="panel"><h3>Werkstattzugriff</h3><div class="side-list" style="margin-top:14px"><div onclick="go('#repairs')">🔧 Reparaturen</div><div onclick="go('#systems')">⚙ Baugruppen</div><div onclick="go('#diagnosis')">⌕ Diagnose</div><div onclick="go('#components')">◈ Bauteile</div></div><div class="notice" style="margin-top:14px">${esc(v.note)}</div></div></div>`
}
function repairs(){
 setCrumb("Reparaturen"); let sys=new URLSearchParams(location.hash.split("?")[1]||"").get("system");
 let list=sys?DB.repairs.filter(r=>r.system===sys):DB.repairs;
 return `<div class="eyebrow">Werkstattabläufe</div><h1>Reparaturdatenbank</h1><p>${list.length} strukturierte Arbeitsabläufe mit Werkzeug-, Sicherheits- und Prüfpunkten.</p>
 <div class="toolbar"><button class="filter ${!sys?"active":""}" onclick="go('#repairs')">Alle</button>${DB.systems.map(s=>`<button class="filter ${sys===s.id?"active":""}" onclick="go('#repairs?system=${s.id}')">${s.icon} ${esc(s.name)}</button>`).join("")}</div>
 <div class="grid">${list.map(repairCard).join("")}</div>`
}
function systems(){
 setCrumb("Baugruppen");
 return `<div class="eyebrow">Systemübersicht</div><h1>Fahrzeugsysteme</h1><p>Von Motor und Bremse bis Klima, Elektrik und Diagnose.</p><div class="grid" style="margin-top:22px">${DB.systems.map(s=>`<div class="system-card" onclick="go('#repairs?system=${s.id}')"><div class="icon">${s.icon}</div><h3>${esc(s.name)}</h3><p>${esc(s.desc)}</p><span class="tag">${DB.repairs.filter(r=>r.system===s.id).length} Abläufe</span></div>`).join("")}</div>`
}
function components(){
 setCrumb("Bauteile");
 return `<div class="eyebrow">Bauteilkatalog</div><h1>Bauteile &amp; Funktionen</h1><p>Grundinformationen zu typischen Komponenten, Einbauort, Symptomen und Werkzeugen.</p><div class="grid" style="margin-top:22px">${DB.components.map(c=>`<div class="component-card" onclick="showComponent('${c.id}')"><div class="vehicle-code">${esc(c.system)}</div><h3 style="margin-top:8px">${esc(c.name)}</h3><p>${esc(c.function)}</p><div class="tag">${esc(c.symptoms[0])}</div></div>`).join("")}</div>`
}
function diagnosis(){
 setCrumb("Diagnose");
 return `<div class="eyebrow">Fehler systematisch eingrenzen</div><h1>Diagnose-Assistent</h1><p>Symptom auswählen und mit einer strukturierten Prüfreihenfolge starten.</p><div class="grid" style="margin-top:22px">${DB.symptoms.map(s=>`<div class="diag-card panel" onclick="showSymptom('${s.id}')"><h3>⌕ ${esc(s.name)}</h3><p>Prüfen: ${esc(s.checks.slice(0,3).join(" · "))}</p><span class="tag">${s.related.length} passende Abläufe</span></div>`).join("")}</div>`
}
function favorites(){
 setCrumb("Merkliste");let a=favs();return `<div class="eyebrow">Persönliche Sammlung</div><h1>Merkliste</h1><p>Im Browser gespeicherte Einträge.</p>${a.length?`<div class="grid" style="margin-top:22px">${a.map(x=>`<div class="panel"><div class="card-muted">${esc(x.type)}</div><h3 style="margin:8px 0 14px">${esc(x.title)}</h3><button class="btn" onclick="removeFav('${x.type}','${x.id}')">★ Entfernen</button></div>`).join("")}</div>`:`<div class="empty" style="margin-top:22px">Noch keine Einträge gespeichert.</div>`}`
}
function removeFav(type,id){let a=favs().filter(x=>!(x.type===type&&x.id===id));save("kfz_favs",a);render()}
function recent(){
 setCrumb("Zuletzt geöffnet");let a=recs();return `<div class="eyebrow">Verlauf</div><h1>Zuletzt geöffnet</h1>${a.length?`<div class="grid" style="margin-top:22px">${a.map(x=>`<div class="panel"><div class="card-muted">${new Date(x.at).toLocaleString("de-DE")}</div><h3 style="margin:8px 0 14px">${esc(x.title)}</h3><button class="btn" onclick="reopen(${JSON.stringify(x).replace(/</g,"&lt;")})">Öffnen</button></div>`).join("")}</div>`:`<div class="empty" style="margin-top:22px">Noch nichts geöffnet.</div>`}`
}
function reopen(x){if(x.type==="vehicle"){let v=DB.vehicles.find(v=>v.id===x.id);if(v)go(`#vehicles/${v.brand}/${DB.brands.find(b=>b.id===v.brand).models.indexOf(v.model)}`)}else if(x.type==="repair")showRepair(x.id)}
function showRepair(id){let r=DB.repairs.find(x=>x.id===id);if(!r)return;addRecent("repair",id,r.title);$("#detailContent").innerHTML=`<div class="eyebrow">Reparaturablauf</div><h2>${esc(r.title)}</h2><p>${esc(r.summary)}</p><div class="meta"><span>${esc(r.difficulty)}</span><span>${esc(r.time)}</span><span>${esc(r.system)}</span></div><div class="notice" style="margin-top:18px">Sicherheitskritische Arbeiten nur mit geeigneter Qualifikation und fahrzeugspezifischer Dokumentation durchführen. Drehmomente und technische Werte nicht aus dieser allgemeinen Anleitung übernehmen.</div><div class="steps">${r.steps.map((s,i)=>`<div class="step"><div class="step-num">${i+1}</div><div>${esc(s)}</div></div>`).join("")}</div><h3 style="margin-top:22px">Abschlussprüfung</h3><div class="side-list" style="margin-top:10px">${r.checks.map(x=>`<div>✓ ${esc(x)}</div>`).join("")}</div>`;$("#detailModal").classList.remove("hidden")}
function showComponent(id){let c=DB.components.find(x=>x.id===id);if(!c)return;$("#detailContent").innerHTML=`<div class="eyebrow">${esc(c.system)}</div><h2>${esc(c.name)}</h2><p>${esc(c.function)}</p><div class="detail-layout"><div><h3>Einbauort</h3><p>${esc(c.location)}</p><h3>Typische Symptome</h3><div class="side-list">${c.symptoms.map(x=>`<div>${esc(x)}</div>`).join("")}</div></div><div><h3>Werkzeug</h3><div class="side-list" style="margin-top:10px">${c.tools.map(x=>`<div>${esc(x)}</div>`).join("")}</div></div></div><div class="notice" style="margin-top:18px">${esc(c.safety)}</div>`;$("#detailModal").classList.remove("hidden")}
function showSymptom(id){let s=DB.symptoms.find(x=>x.id===id);if(!s)return;$("#detailContent").innerHTML=`<div class="eyebrow">Diagnose</div><h2>${esc(s.name)}</h2><p>Arbeite die Prüfungen von oben nach unten ab und dokumentiere Messwerte sowie Fehlercodes.</p><h3>Prüfreihenfolge</h3><div class="steps">${s.checks.map((x,i)=>`<div class="step"><div class="step-num">${i+1}</div><div>${esc(x)}</div></div>`).join("")}</div><h3 style="margin-top:22px">Passende Abläufe</h3><div class="side-list" style="margin-top:10px">${s.related.map(id=>{let r=DB.repairs.find(r=>r.id===id);return r?`<div onclick="closeModals();showRepair('${r.id}')">🔧 ${esc(r.title)}</div>`:""}).join("")}</div>`;$("#detailModal").classList.remove("hidden")}
function openSearch(){ $("#searchModal").classList.remove("hidden");setTimeout(()=>$("#searchInput").focus(),50);search("")}
function closeModals(){$(".modal")?.classList.add("hidden");$("#detailModal").classList.add("hidden");$("#searchModal").classList.add("hidden")}
function search(q){q=q.trim().toLowerCase();let out=[];DB.brands.forEach(b=>{if(!q||b.name.toLowerCase().includes(q))out.push({t:"Marke",n:b.name,a:`#vehicles/brand/${b.id}`});b.models.forEach((m,i)=>{if(q&&m.toLowerCase().includes(q))out.push({t:"Modell",n:`${b.name} ${m}`,a:`#vehicles/${b.id}/${i}`})})});DB.repairs.forEach(r=>{if(!q||`${r.title} ${r.summary}`.toLowerCase().includes(q))out.push({t:"Reparatur",n:r.title,id:r.id})});DB.components.forEach(c=>{if(!q||`${c.name} ${c.function} ${c.symptoms.join(" ")}`.toLowerCase().includes(q))out.push({t:"Bauteil",n:c.name,id:c.id})});DB.symptoms.forEach(s=>{if(!q||s.name.toLowerCase().includes(q))out.push({t:"Diagnose",n:s.name,id:s.id})});out=out.slice(0,25);$("#searchResults").innerHTML=out.length?out.map(x=>`<div class="result" onclick="${x.a?`location.hash='${x.a}'`:x.t==='Reparatur'?`closeModals();showRepair('${x.id}')`:x.t==='Bauteil'?`closeModals();showComponent('${x.id}')`:`closeModals();showSymptom('${x.id}')`}"><b>${esc(x.n)}</b><small>${esc(x.t)}</small></div>`).join(""):`<div class="empty">Keine Treffer.</div>`}
function render(){
 let h=location.hash||"#home",parts=h.slice(1).split("?")[0].split("/"),html;
 if(parts[0]==="home")html=home();
 else if(parts[0]==="vehicles"&&parts[1]==="brand")html=brandPage(parts[2]);
 else if(parts[0]==="vehicles"&&parts[1])html=modelPage(parts[1],Number(parts[2]));
 else if(parts[0]==="vehicles")html=vehicles();
 else if(parts[0]==="repairs")html=repairs();
 else if(parts[0]==="diagnosis")html=diagnosis();
 else if(parts[0]==="systems")html=systems();
 else if(parts[0]==="components")html=components();
 else if(parts[0]==="favorites")html=favorites();
 else if(parts[0]==="recent")html=recent();
 else html=home();
 $("#content").innerHTML=html;
 document.querySelectorAll("nav a").forEach(a=>a.classList.toggle("active",a.dataset.route===parts[0]));
}
async function init(){try{let r=await fetch("database.json");DB=await r.json();render()}catch(e){$("#content").innerHTML=`<div class="empty">Datenbank konnte nicht geladen werden. Prüfe, ob <b>database.json</b> im Repository liegt.</div>`}}
$("#openSearch").onclick=openSearch;$("#openSearch2").onclick=openSearch;$("#mobileMenu").onclick=()=>$("#sidebar").classList.toggle("open");
document.addEventListener("click",e=>{if(e.target.matches("[data-close]"))closeModals()});
document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();openSearch()}if(e.key==="Escape")closeModals()});
$("#searchInput").addEventListener("input",e=>search(e.target.value));window.addEventListener("hashchange",render);init();
