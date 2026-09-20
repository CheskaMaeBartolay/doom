const list = document.getElementById("downloadList");
const empty = document.getElementById("downloadEmpty");
const search = document.getElementById("downloadSearch");
let downloads = [];

function escapeHTML(value=""){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function renderDownloads(){
 const q=(search.value||"").toLowerCase().trim();
 const filtered=downloads.filter(x=>`${x.name} ${x.description||""} ${x.category||""}`.toLowerCase().includes(q));
 list.innerHTML=filtered.map(x=>`<article class="download-item">
   <div class="download-icon">⬇</div><div class="download-info"><h3>${escapeHTML(x.name)}</h3>
   <p>${escapeHTML(x.description||"No description provided.")}</p><span>${escapeHTML(x.category||"File")} · ${escapeHTML(x.file_size||"")}</span></div>
   <a class="primary-btn download-btn" href="${x.url}" target="_blank" rel="noopener">Download →</a>
 </article>`).join("");
 empty.hidden=filtered.length!==0;
}
async function loadDownloads(){
 try{
  if(!window.supabase || !KAFKA_SUPABASE_URL || KAFKA_SUPABASE_URL.includes("YOUR-")){
    downloads=JSON.parse(localStorage.getItem("kafkaDownloads")||"[]"); renderDownloads(); return;
  }
  const client=supabase.createClient(KAFKA_SUPABASE_URL,KAFKA_SUPABASE_ANON_KEY);
  const {data,error}=await client.from("downloads").select("*").order("created_at",{ascending:false});
  if(error) throw error; downloads=data||[]; renderDownloads();
 }catch(e){console.error(e); downloads=JSON.parse(localStorage.getItem("kafkaDownloads")||"[]"); renderDownloads();}
}
search.addEventListener("input",renderDownloads); loadDownloads();
