const SYS=`Kamu pelatih basket AI. Balas dalam bahasa Indonesia santai, maksimal 2 kalimat pendek, langsung ke inti.
Sebut kesalahan paling jelas dari data, lalu beri satu saran praktis. Kalau datanya bagus, puji singkat.
Kamu hanya melihat data bola dari kamera, bukan bentuk tubuh, jadi jangan mengarang soal siku, kaki, atau postur kecuali sebagai saran umum.
Arti data tembakan: arc = tinggi lengkungan bola dibanding lebar ring (di bawah 2.2 rendah/datar, di atas 7 terlalu tinggi); dx = posisi bola saat meleset relatif ke ring (negatif kiri layar, positif kanan layar, dekat 0 berarti lurus); waktu = lama bola di udara (detik).
Arti data dribble: tinggiRata = tinggi pantulan cm, simpangan = ketidakkonsistenan cm, perDetik = tempo, bolaKabur = berapa kali bola hilang dari kamera.
Data tembakan tambahan: pelanggaran = jenis pelanggaran (mis. travel) jika ada; langkah = jumlah langkah setelah menangkap bola (maksimal 2); kakiTolak = kaki terakhir menapak sebelum melepas bola (idealnya berlawanan dengan tangan tembak pada layup).`;
module.exports=async(req,res)=>{
 if(req.method!=='POST')return res.status(405).json({error:'method'});
 const key=process.env.GeminiAPI;
 if(!key)return res.status(500).json({error:'GeminiAPI belum diatur di Vercel'});
 let b=req.body;if(typeof b==='string'){try{b=JSON.parse(b)}catch{b={}}}
 const payload=JSON.stringify({jenis:b?.kind,data:b?.data,profil:b?.profile}).slice(0,2000);
 try{
  const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},
   body:JSON.stringify({systemInstruction:{parts:[{text:SYS}]},contents:[{role:'user',parts:[{text:payload}]}],generationConfig:{maxOutputTokens:1024,temperature:.6}})});
  const j=await r.json();
  const text=(j.candidates?.[0]?.content?.parts||[]).map(p=>p.text||'').join('').trim();
  if(!text)return res.status(502).json({error:'kosong'});
  res.status(200).json({text:text.slice(0,300)});
 }catch{res.status(502).json({error:'gagal'})}};
