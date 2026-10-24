const URL_='https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent';
const BOX='Balas hanya JSON: {"found":true atau false,"box":[ymin,xmin,ymax,xmax]} dengan koordinat dinormalisasi 0-1000 terhadap gambar.';
const P={
 ring:'Ini foto dari kamera di lapangan basket. Temukan ring basket: lingkaran logam (biasanya oranye atau merah) tempat bola masuk. Jangan pilih papan pantul, jaring, tiang, gawang futsal, atau benda jingga lain. Kotak harus mengelilingi cincin ringnya saja. '+BOX,
 ball:'Ini foto dari kamera latihan basket. Temukan bola basket. Warnanya bisa apa saja (termasuk kusam, abu-abu, atau pudar) dan ukurannya bisa kecil. Kalau ada beberapa bola, pilih yang paling dekat dengan pemain. Kotak harus mengelilingi bolanya saja. '+BOX,
 form:'Kamu pelatih basket. Berikut beberapa frame dari sesi latihan beserta konteksnya. Nilai bentuk gerakan yang benar-benar terlihat (siku, kaki, langkah, postur, posisi bola; untuk latihan defense atau athleticism: posisi stance, lutut, punggung, pendaratan). Jawab dalam bahasa Indonesia, maksimal 3 poin pendek: satu hal yang sudah baik dan dua hal yang perlu diperbaiki. Kalau gambar kurang jelas, katakan apa adanya dan jangan mengarang.'};
module.exports=async(req,res)=>{
 if(req.method!=='POST')return res.status(405).json({error:'method'});
 const key=process.env.GeminiAPI;if(!key)return res.status(500).json({error:'GeminiAPI belum diatur di Vercel'});
 let b=req.body;if(typeof b==='string'){try{b=JSON.parse(b)}catch{b={}}}
 const task=b&&b.task,imgs=((b&&b.images)||[]).slice(0,4).filter(x=>typeof x==='string'&&x.length<1.5e6);
 if(!P[task]||!imgs.length)return res.status(400).json({error:'bad request'});
 const json=task!=='form';
 const parts=[{text:P[task]+(b.extra?'\nKonteks: '+JSON.stringify(b.extra).slice(0,800):'')},...imgs.map(d=>({inlineData:{mimeType:'image/jpeg',data:d}}))];
 try{
  const r=await fetch(URL_,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},
   body:JSON.stringify({contents:[{role:'user',parts}],generationConfig:{maxOutputTokens:2048,temperature:.2,...(json?{responseMimeType:'application/json'}:{})}})});
  const j=await r.json();
  const t=((j.candidates&&j.candidates[0]&&j.candidates[0].content&&j.candidates[0].content.parts)||[]).map(p=>p.text||'').join('').trim();
  if(!t)return res.status(502).json({error:'kosong'});
  if(!json)return res.status(200).json({text:t.slice(0,900)});
  let o;try{o=JSON.parse(t.replace(/```json|```/g,''))}catch{return res.status(502).json({error:'parse'})}
  const bx=Array.isArray(o.box)&&o.box.length===4&&o.box.every(n=>typeof n==='number')?o.box:null;
  res.status(200).json({found:!!o.found&&!!bx,box:bx});
 }catch{res.status(502).json({error:'gagal'})}};
