(function(){
  const id=decodeURIComponent(location.pathname.split('/').filter(Boolean).pop()||'');
  const $=s=>document.querySelector(s); const escText=x=>String(x??'');
  let link=null;
  function state(text,good=false){$('#state').textContent=text;$('#state').style.color=good?'#71e3a3':''}
  function render(data){link=data;$('#accountCard').classList.toggle('hidden',!data.accountAssigned);$('#emptyCard').classList.toggle('hidden',data.accountAssigned);$('#username').value=escText(data.username);$('#password').value=escText(data.password);$('#status').textContent=data.accountExpired?'Tài khoản đã hết hạn':(data.accountAssigned?'Đang hoạt động':'Chưa được cấp tài khoản');$('#status').style.color=data.accountExpired?'#ff9b9b':'';state('Link đang hoạt động',true);showNotice(data.popupMessage)}
  function showNotice(text){if(!text)return;$('#noticeText').textContent=text;$('#notice').classList.remove('hidden')}
  async function load(){if(!id){state('Link không hợp lệ');return}try{const r=await fetch('/api/capcut/links/'+encodeURIComponent(id));const d=await r.json();if(!r.ok)throw Error(d.error||'Không tải được link');render(d.link)}catch(e){state(e.message);$('#emptyCard').classList.remove('hidden')}}
  async function warranty(){const b=$('#warrantyBtn');b.disabled=true;b.textContent='ĐANG KIỂM TRA...';$('#actionState').textContent='';try{const r=await fetch('/api/capcut/links/'+encodeURIComponent(id)+'/warranty',{method:'POST'});const d=await r.json();if(!r.ok)throw Error(d.error||'Bảo hành thất bại');render(d.link);$('#actionState').textContent=d.message||'Đã xử lý xong.';$('#actionState').style.color='#71e3a3'}catch(e){$('#actionState').textContent=e.message;$('#actionState').style.color='#ff9b9b'}finally{b.disabled=false;b.textContent='BẢO HÀNH TỰ ĐỘNG'}}
  document.addEventListener('click',e=>{const copy=e.target.closest('[data-copy]');if(copy){const input=$('#'+copy.dataset.copy);navigator.clipboard?.writeText(input.value);copy.textContent='Đã copy';setTimeout(()=>copy.textContent='Copy',1000)}});
  $('#warrantyBtn').onclick=warranty;$('#closeNotice').onclick=()=>$('#notice').classList.add('hidden');$('#noticeOk').onclick=()=>$('#notice').classList.add('hidden');load();
})();
