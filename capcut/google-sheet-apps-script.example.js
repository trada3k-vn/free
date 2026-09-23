// Deploy as a Web App riêng cho CapCut. Sheet columns: A=username, B=password,
// C=date (23/9), D=time (1543), E=usage flag (0 or 1 are eligible).
const SPREADSHEET_ID='PUT_CAPCUT_SPREADSHEET_ID_HERE';
const SHEET_NAME='Sheet1';
const TIMEZONE='Asia/Ho_Chi_Minh';

function json_(value){return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON)}
function doGet(e){try{if(String(e.parameter.action||'')==='claimCapcutAccount')return json_({success:true,account:claim_()});return json_({success:true,message:'CapCut Apps Script is running'})}catch(err){return json_({success:false,error:String(err.message||err)})}}
function claim_(){
  const lock=LockService.getScriptLock();lock.waitLock(30000);
  try{
    const sheet=SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);if(!sheet)throw Error('Sheet not found');
    const values=sheet.getDataRange().getValues();
    for(let i=1;i<values.length;i++){
      const row=values[i], flag=String(row[4]??'').trim();
      if(flag!=='0'&&flag!=='1')continue;
      const username=String(row[0]??'').trim(),password=String(row[1]??'').trim();if(!username||!password)continue;
      const created=parseDate_(row[2],row[3]);if(!created)continue;
      sheet.getRange(i+1,5).setValue(Number(flag)+1);SpreadsheetApp.flush();
      return{username,password,accountCreatedAt:created.toISOString(),rowNumber:i+1,flag:Number(flag)+1};
    }
    throw Error('Google Sheet không còn tài khoản hợp lệ.');
  }finally{lock.releaseLock()}
}
function parseDate_(dateValue,timeValue){
  const now=new Date(),year=now.getFullYear();let day=0,month=0;
  const text=String(dateValue??'').trim();const m=text.match(/^(\d{1,2})\s*[\/-]\s*(\d{1,2})$/);
  if(m){day=Number(m[1]);month=Number(m[2])-1}else if(dateValue instanceof Date&&!isNaN(dateValue)){day=dateValue.getDate();month=dateValue.getMonth()}
  if(day<1||month<0||month>11)return null;const t=String(timeValue??'').replace(/\D/g,'');if(!/^\d{3,4}$/.test(t))return null;const padded=t.padStart(4,'0');const hour=Number(padded.slice(0,2)),minute=Number(padded.slice(2));if(hour>23||minute>59)return null;
  const parsed=new Date(`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}T${padded.slice(0,2)}:${padded.slice(2)}:00+07:00`);return isNaN(parsed)?null:parsed;
}
