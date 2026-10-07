function modelPage(bid,index){
  let b=DB.brands.find(x=>x.id===bid);
  let model=b?.models[index];

  if(!b || !model) return brandPage(bid);

  setCrumb(`Fahrzeuge / ${b.name} / ${model}`);

  // Alle Fahrzeuge dieses Herstellers + Modells holen
  let vehicles=DB.vehicles.filter(
    x=>x.brand===bid && x.model===model
  );

  if(!vehicles.length){
    return `
      <div class="breadcrumbs">
        <span class="back" onclick="go('#vehicles/brand/${bid}')">
          ${esc(b.name)}
        </span> / ${esc(model)}
      </div>

      <div class="empty">
        Für ${esc(b.name)} ${esc(model)} sind keine Fahrzeugdaten hinterlegt.
      </div>
    `;
  }

  // Alle Baureihen aus allen Fahrzeugdatensätzen sammeln
  let generations=[];

  vehicles.forEach(v=>{
    (v.generations||[]).forEach((g,gi)=>{
      generations.push({
        vehicleId:v.id,
        generationIndex:gi,
        name:g.name,
        years:g.years,
        engines:g.engines||[],
        transmissions:g.transmissions||[]
      });
    });
  });

  return `
    <div class="breadcrumbs">
      <span class="back" onclick="go('#vehicles/brand/${bid}')">
        ${esc(b.name)}
      </span> / ${esc(model)}
    </div>

    <div class="eyebrow">${b.flag} Fahrzeugprofil</div>

    <h1>${esc(b.name)} ${esc(model)}</h1>

    <p>
      Wähle zuerst die exakte Baureihe. Danach kannst du
      Motorisierung und Getriebe auswählen.
    </p>

    <div class="generation-grid" style="margin-top:22px">

      ${generations.map((g,i)=>`

        <div class="generation-card"
             onclick="go('#vehicle/${g.vehicleId}/${g.generationIndex}')">

          <div class="generation-header">
            <div>
              <div class="vehicle-code">
                ${esc(b.id)}
              </div>

              <h3>${esc(g.name)}</h3>

              <div class="card-muted">
                ${esc(g.years)}
              </div>
            </div>

            <div class="generation-arrow">
              →
            </div>
          </div>

          <div class="generation-data">

            <div>
              <b>Motoren</b>
              <div class="chip-list">
                ${g.engines.map(e=>`
                  <span class="tool-chip">
                    ${esc(e)}
                  </span>
                `).join("")}
              </div>
            </div>

            <div>
              <b>Getriebe</b>
              <div class="chip-list">
                ${g.transmissions.map(e=>`
                  <span class="tool-chip">
                    ${esc(e)}
                  </span>
                `).join("")}
              </div>
            </div>

          </div>

          <div class="card-muted" style="margin-top:14px">
            Baureihe öffnen →
          </div>

        </div>

      `).join("")}

    </div>
  `;
}
function generationPage(vehicleId,generationIndex){

  let v=DB.vehicles.find(x=>x.id===vehicleId);

  if(!v) return vehicles();

  let b=DB.brands.find(x=>x.id===v.brand);

  let g=v.generations?.[generationIndex];

  if(!g) return modelPage(
    v.brand,
    b?.models.indexOf(v.model)
  );

  setCrumb(
    `Fahrzeuge / ${b?.name||v.brand} / ${v.model} / ${g.name}`
  );

  addRecent(
    "vehicle",
    v.id,
    `${b?.name||v.brand} ${v.model} ${g.name}`
  );

  return `
    <div class="breadcrumbs">

      <span class="back"
        onclick="go('#vehicles/brand/${v.brand}')">
        ${esc(b?.name||v.brand)}
      </span>

      /

      <span class="back"
        onclick="go('#vehicles/${v.brand}/${b.models.indexOf(v.model)}')">
        ${esc(v.model)}
      </span>

      / ${esc(g.name)}

    </div>

    <div class="eyebrow">
      ${b?.flag||""} Baureihe
    </div>

    <h1>
      ${esc(b?.name||v.brand)}
      ${esc(v.model)}
      ${esc(g.name)}
    </h1>

    <p>
      Baujahre: ${esc(g.years)}
    </p>

    <div class="detail-layout" style="margin-top:22px">

      <div class="panel">

        <h2>Motorisierung</h2>

        <div class="selection-grid">

          ${(g.engines||[]).map((engine,i)=>`

            <div class="selection-card"
                 onclick="selectVehicleConfig(
                   '${v.id}',
                   ${generationIndex},
                   ${i},
                   'engine'
                 )">

              <div class="icon">⚙</div>

              <h3>${esc(engine)}</h3>

              <div class="card-muted">
                Motor auswählen →
              </div>

            </div>

          `).join("")}

        </div>

      </div>

      <div class="panel">

        <h2>Getriebe</h2>

        <div class="selection-grid">

          ${(g.transmissions||[]).map((transmission,i)=>`

            <div class="selection-card"
                 onclick="selectVehicleConfig(
                   '${v.id}',
                   ${generationIndex},
                   ${i},
                   'transmission'
                 )">

              <div class="icon">▣</div>

              <h3>${esc(transmission)}</h3>

              <div class="card-muted">
                Getriebe auswählen →
              </div>

            </div>

          `).join("")}

        </div>

      </div>

    </div>
  `;
}
