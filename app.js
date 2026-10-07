const brands=[
  ["VW","Volkswagen"],["AUDI","Audi"],["BMW","BMW"],["MB","Mercedes-Benz"],["OP","Opel"],["FORD","Ford"],["ŠK","Škoda"]
];
const repairs=[
  ["🔋","Batterie wechseln","Elektrik","Batterie ausbauen, einsetzen und anschließend prüfen."],
  ["🛑","Bremsbeläge wechseln","Bremse","Aufbau, Verschleißkontrolle und grundlegender Wechsel."],
  ["🛢️","Ölwechsel","Service","Motoröl und Ölfilter fachgerecht erneuern."],
  ["⚡","Zündkerzen wechseln","Motor","Zündkerzen prüfen und bei Bedarf ersetzen."],
  ["💨","Luftfilter wechseln","Ansaugung","Filtergehäuse öffnen, Filter prüfen und ersetzen."],
  ["🌡️","Kühlmittel prüfen","Kühlung","Kühlmittelstand, Zustand und mögliche Lecks kontrollieren."],
  ["⚙️","Keilrippenriemen","Nebenaggregate","Riemenführung und Zustand prüfen; Wechsel vorbereiten."],
  ["💡","Scheinwerfer wechseln","Elektrik","Leuchtmittel bzw. Baugruppe sicher ersetzen."]
];

const brandGrid=document.querySelector("#brandGrid");
const repairGrid=document.querySelector("#repairGrid");
brandGrid.innerHTML=brands.map(b=>`<div class="brand-card" data-search="${b[0]} ${b[1]}"><div class="brand-logo">${b[0]}</div><small>${b[1].toUpperCase()}</small></div>`).join("");
repairGrid.innerHTML=repairs.map(r=>`<article class="repair-card" data-search="${r[1]} ${r[2]}"><span class="repair-icon">${r[0]}</span><span class="tag">${r[2]}</span><h3>${r[1]}</h3><p>${r[3]}</p></article>`).join("");

const input=document.querySelector("#search");
function filter(q){
  q=q.trim().toLowerCase();
  document.querySelectorAll("[data-search]").forEach(el=>{
    el.classList.toggle("hidden", q && !el.dataset.search.toLowerCase().includes(q));
  });
}
input.addEventListener("input",e=>filter(e.target.value));
document.querySelectorAll("[data-search]").forEach(el=>el.addEventListener("click",()=>{
  input.value=el.dataset.search; filter(input.value); document.querySelector("#reparaturen").scrollIntoView({behavior:"smooth"});
}));
document.querySelectorAll(".quick button").forEach(btn=>btn.addEventListener("click",()=>{input.value=btn.dataset.search;filter(input.value);document.querySelector("#reparaturen").scrollIntoView({behavior:"smooth"})}));
document.addEventListener("keydown",e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();input.focus()}});
