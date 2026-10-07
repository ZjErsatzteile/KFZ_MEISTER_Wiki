
import json, re
from pathlib import Path
DB=Path('database.json'); ADD=Path('database_additions.json')
db=json.loads(DB.read_text(encoding='utf-8')); add=json.loads(ADD.read_text(encoding='utf-8'))

def merge(lst, new):
    by={str(x.get('id')):x for x in lst}
    for x in new:
        k=str(x.get('id'))
        if k in by:
            # Only fill missing fields; existing content is never deleted.
            for a,b in x.items():
                if a not in by[k] or by[k][a] in (None,'',[],{}): by[k][a]=b
        else: lst.append(x)
for k,v in add.items():
    if isinstance(v,list):
        db.setdefault(k,[]); merge(db[k],v)
DB.write_text(json.dumps(db,ensure_ascii=False,indent=2),encoding='utf-8')

app=Path('app.js'); s=app.read_text(encoding='utf-8')
# Add image gallery helper if not present.
if 'function repairImages(' not in s:
    marker='function repair(id){'
    helper=r"""function repairImages(r){
 const imgs=Array.isArray(r.images)?r.images:[];
 if(!imgs.length)return "";
 return `<div class="panel repair-gallery"><h2>Schrittbilder</h2><div class="image-grid">${imgs.map(i=>`<figure><img src="${esc(i.path)}" alt="${esc(i.title||r.title)}" loading="lazy" onerror="this.onerror=null;this.src='images/repairs/'+this.src.split('/').pop().replace('.svg','.png')"><figcaption>${esc(i.title||'Arbeitsschritt')}</figcaption></figure>`).join('')}</div></div>`;
}
"""
    s=s.replace(marker,helper+marker)
# Inject gallery into repair page.
s=s.replace("return pageHeader(r.title,r.description)+\n`<div class=\"two-col\"><section>","return pageHeader(r.title,r.description)+repairImages(r)+\n`<div class=\"two-col\"><section>")
# Search vehicles/models too.
old='for(const b of DB.brands) if(b.name.toLowerCase().includes(q))out.push({t:"Hersteller",n:b.name,h:"#brand/"+b.id});'
new=old+'\n for(const b of DB.brands) for(const m of arr(b.models)) if((b.name+" "+m.name+" "+m.description).toLowerCase().includes(q))out.push({t:"Modell",n:b.name+" "+m.name,h:"#model/"+b.id+"/"+m.id});\n for(const v of DB.vehicles) if((v.name+" "+JSON.stringify(v.generations)).toLowerCase().includes(q))out.push({t:"Fahrzeug",n:v.name,h:"#vehicle/"+v.id});'
s=s.replace(old,new)
app.write_text(s,encoding='utf-8')
