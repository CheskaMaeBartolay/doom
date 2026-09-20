const ready=window.supabase&&KAFKA_SUPABASE_URL&&!KAFKA_SUPABASE_URL.includes("YOUR-");
const db=ready?supabase.createClient(KAFKA_SUPABASE_URL,KAFKA_SUPABASE_ANON_KEY):null;
let editing=null,scriptRows=[],downloadRows=[];
const $=id=>document.getElementById(id);
const msg=$('uploadMessage'),smsg=$('scriptMessage');

function say(el,t,ok=false){
  if(!el)return;
  el.textContent=t;
  el.style.color=ok?"#43e58b":"#ff8090";
}

function esc(v){
  return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

async function guard(){
  if(!db){say(msg,"Configure Supabase first in supabase-config.js.");return false}
  const {data}=await db.auth.getSession();
  if(!data.session){location.href="login.html";return false}
  const {data:a,error}=await db.from("admin_users").select("email").eq("user_id",data.session.user.id).maybeSingle();
  if(error||!a){
    await db.auth.signOut();
    alert("Your account is not authorized as an admin.");
    location.href="login.html";
    return false;
  }
  return true;
}

$('logoutBtn').onclick=async()=>{if(db)await db.auth.signOut();location.href='login.html'};

document.querySelectorAll('.admin-tab').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('.admin-tab').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');
  document.querySelectorAll('.admin-panel').forEach(p=>p.hidden=p.id!==b.dataset.panel);
  if(b.dataset.panel==='managePanel')loadScripts();
  if(b.dataset.panel==='manageDownloadPanel')loadDownloads();
});

$('uploadForm').onsubmit=async e=>{
  e.preventDefault();
  if(!await guard())return;
  say(msg,'Uploading...');
  const f=$('file').files[0];
  if(!f){say(msg,'Please select a file.');return}
  const path=Date.now()+'-'+f.name.replace(/[^a-zA-Z0-9._-]/g,'-');
  const up=await db.storage.from(KAFKA_DOWNLOAD_BUCKET).upload(path,f);
  if(up.error){say(msg,up.error.message);return}
  const pub=db.storage.from(KAFKA_DOWNLOAD_BUCKET).getPublicUrl(path);
  const r=await db.from('downloads').insert({
    name:$('fileName').value,
    description:$('description').value,
    category:$('category').value,
    file_size:(f.size/1048576).toFixed(2)+' MB',
    url:pub.data.publicUrl
  });
  if(r.error){
    // Try to clean up the uploaded file if the database insert fails.
    await db.storage.from(KAFKA_DOWNLOAD_BUCKET).remove([path]);
    say(msg,r.error.message);
  }else{
    $('uploadForm').reset();
    say(msg,'Download uploaded successfully.',true);
  }
};

$('scriptForm').onsubmit=async e=>{
  e.preventDefault();
  if(!await guard())return;
  say(smsg,editing?'Updating script...':'Uploading script...');
  const f=$('scriptFile').files[0];
  let url=editing?.url||'';
  if(f){
    const path=Date.now()+'-'+f.name.replace(/[^a-zA-Z0-9._-]/g,'-');
    const up=await db.storage.from(KAFKA_SCRIPTS_BUCKET).upload(path,f);
    if(up.error){say(smsg,up.error.message);return}
    url=db.storage.from(KAFKA_SCRIPTS_BUCKET).getPublicUrl(path).data.publicUrl;
  }
  const payload={
    title:$('scriptTitle').value,
    game:$('scriptGame').value,
    category:$('scriptCategory').value,
    description:$('scriptDescription').value,
    url
  };
  const r=editing?await db.from('scripts').update(payload).eq('id',editing.id):await db.from('scripts').insert(payload);
  if(r.error)say(smsg,r.error.message);
  else{
    say(smsg,editing?'Script updated.':'Script uploaded successfully.',true);
    resetScript();
    loadScripts();
  }
};

function resetScript(){
  $('scriptForm').reset();
  $('scriptId').value='';
  editing=null;
  $('cancelEdit').hidden=true;
  $('scriptFile').required=true;
}
$('cancelEdit').onclick=resetScript;

async function loadScripts(){
  if(!db)return;
  const r=await db.from('scripts').select('*').order('created_at',{ascending:false});
  if(r.error){$('adminScriptList').textContent=r.error.message;return}
  scriptRows=r.data||[];
  $('adminScriptList').innerHTML=scriptRows.map(x=>`
    <div class="admin-item">
      <div><b>${esc(x.title)}</b><small>${esc(x.game||'Universal')} · ${esc(x.category||'Script')}</small></div>
      <div>
        <button class="outline-btn edit-script" data-id="${x.id}">Edit</button>
        <button class="danger-btn delete-script" data-id="${x.id}">Delete</button>
      </div>
    </div>`).join('')||'<p class="empty">No scripts uploaded yet.</p>';
  document.querySelectorAll('.edit-script').forEach(b=>b.onclick=()=>editScript(scriptRows.find(x=>String(x.id)===b.dataset.id)));
  document.querySelectorAll('.delete-script').forEach(b=>b.onclick=()=>deleteScript(b.dataset.id));
}

function editScript(x){
  editing=x;
  $('scriptTitle').value=x.title||'';
  $('scriptGame').value=x.game||'';
  $('scriptCategory').value=x.category||'';
  $('scriptDescription').value=x.description||'';
  $('scriptFile').required=false;
  $('cancelEdit').hidden=false;
  document.querySelector('[data-panel="scriptPanel"]').click();
  window.scrollTo({top:0,behavior:'smooth'});
}

async function deleteScript(id){
  if(!await guard())return;
  const row=scriptRows.find(x=>String(x.id)===String(id));
  if(!row)return;
  if(!confirm(`Delete "${row.title}"?`))return;
  const r=await db.from('scripts').delete().eq('id',id);
  if(r.error){alert(r.error.message);return}
  loadScripts();
}

function storagePathFromPublicUrl(url,bucket){
  if(!url)return null;
  const marker=`/storage/v1/object/public/${bucket}/`;
  const i=url.indexOf(marker);
  return i>=0?decodeURIComponent(url.slice(i+marker.length)):null;
}

async function loadDownloads(){
  if(!db)return;
  const r=await db.from('downloads').select('*').order('created_at',{ascending:false});
  if(r.error){$('adminDownloadList').textContent=r.error.message;return}
  downloadRows=r.data||[];
  $('adminDownloadList').innerHTML=downloadRows.map(x=>`
    <div class="admin-item">
      <div>
        <b>${esc(x.name)}</b>
        <small>${esc(x.category||'File')} · ${esc(x.file_size||'')}</small>
      </div>
      <div>
        <a class="outline-btn" href="${esc(x.url)}" target="_blank" rel="noopener">Open</a>
        <button class="danger-btn delete-download" data-id="${x.id}">Delete</button>
      </div>
    </div>`).join('')||'<p class="empty">No downloads uploaded yet.</p>';
  document.querySelectorAll('.delete-download').forEach(b=>b.onclick=()=>deleteDownload(b.dataset.id));
}

async function deleteDownload(id){
  if(!await guard())return;
  const row=downloadRows.find(x=>String(x.id)===String(id));
  if(!row)return;
  if(!confirm(`Delete "${row.name}"? This will remove the download record and its uploaded file.`))return;

  const path=storagePathFromPublicUrl(row.url,KAFKA_DOWNLOAD_BUCKET);
  if(path){
    const storageResult=await db.storage.from(KAFKA_DOWNLOAD_BUCKET).remove([path]);
    if(storageResult.error){
      alert(`Could not delete the stored file: ${storageResult.error.message}`);
      return;
    }
  }

  const r=await db.from('downloads').delete().eq('id',id);
  if(r.error){alert(r.error.message);return}
  loadDownloads();
}

guard();
