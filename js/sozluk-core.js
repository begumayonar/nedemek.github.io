
let sozluk = [];
let trie = {};

const temelYol = window.location.pathname.includes("/pages") ? "../js/" : "js/"
let veriHazir = fetch(temelYol + "data.json")  
.then(r => r.json())
  .then(data => {
    sozluk = data;
    data.forEach(item => trieEkle(item.sozcuk, item));
    return data;
  });

function normalize(str) {
  return str.toLocaleLowerCase('tr').replace(/İ/g, 'i').replace(/I/g, 'ı');
}

function trieEkle(sozcuk, veri) {
  let node = trie;
  for (const harf of normalize(sozcuk)) {
    node = node[harf] ??= {};
  }
  node.veri = veri;
}

function onerileriGetir(prefix, limit = 5) {
  let node = trie;
  const q = normalize(prefix);
  if (!q) return [];
  for (const harf of q) {
    if (!node[harf]) return [];
    node = node[harf];
  }
  const sonuclar = [];
  toplaTum(node, sonuclar, limit);
  return sonuclar;
}

function toplaTum(node, sonuclar, limit) {
  if (sonuclar.length >= limit) return;
  if (node.veri) sonuclar.push(node.veri);
  for (const k in node) {
    if (k !== 'veri') toplaTum(node[k], sonuclar, limit);
  }
}

function idIleBul(id) {
  return sozluk.find(k => k.id === Number(id));
}

function rastgeleSozcuk(){
  const rastgeleIndex = Math.floor(Math.random() * sozluk.length);
  return sozluk[rastgeleIndex];
}

function rastgeleSozcukler(adet = 5){
  const kopya = [...sozluk];
  const secilenler = [];
  for (let i = 0; i < adet && kopya.length > 0; i++){
    const index = Math.floor(Math.random() * kopya.length);
    secilenler.push(kopya[index]);
    kopya.splice(index, 1);
  }
  return secilenler
}
function komsulariGetir(mevcutId, mevcutTur, herYanda = 4) {
    const index = sozluk.findIndex(k => k.id === mevcutId && k.tur === mevcutTur);
    const baslangic = Math.max(0, index - herYanda);
    const bitis = Math.min(sozluk.length, index + herYanda + 1);
    return sozluk.slice(baslangic, bitis).map(kayit => ({
        ...kayit,
        aktif: kayit.id === mevcutId && kayit.tur === mevcutTur
    }));
}

function turevleriGetir(turevIdListesi) {
    if (!turevIdListesi) return [];
    return turevIdListesi.map(id => idIleBul(id, 'sozcuk')).filter(Boolean);
}