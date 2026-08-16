let sozluk = [];
let sozlukAlfabetik = [];
let trie = {};

const turkceCollator = new Intl.Collator('tr', { sensitivity: 'base' });

const temelYol = window.location.pathname.includes("/pages") ? "../js/" : "js/"
let veriHazir = fetch(temelYol + "data.json")
  .then(r => r.json())
  .then(data => {
    sozluk = data;
    data.forEach(item => trieEkle(item.sozcuk, item));

    const turevIdSeti = new Set();
    data.forEach(item => {
      (item.turev || []).forEach(id => turevIdSeti.add(id));
    });

    sozlukAlfabetik = data
      .filter(item => !turevIdSeti.has(item.id))
      .sort((a, b) => turkceCollator.compare(a.sozcuk, b.sozcuk));

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
    let index = sozlukAlfabetik.findIndex(k => k.id === mevcutId && k.tur === mevcutTur);
    let liste = sozlukAlfabetik;
    let aktifKayit = null;

    if (index === -1) {

        aktifKayit = sozluk.find(k => k.id === mevcutId && k.tur === mevcutTur);
        if (!aktifKayit) return [];

        index = sozlukAlfabetik.findIndex(
            k => turkceCollator.compare(k.sozcuk, aktifKayit.sozcuk) >= 0
        );
        if (index === -1) index = sozlukAlfabetik.length;

        liste = [
            ...sozlukAlfabetik.slice(0, index),
            aktifKayit,
            ...sozlukAlfabetik.slice(index)
        ];
    }

    const baslangic = Math.max(0, index - herYanda);
    const bitis = Math.min(liste.length, index + herYanda + 1);
    return liste.slice(baslangic, bitis).map(kayit => ({
        ...kayit,
        aktif: kayit.id === mevcutId && kayit.tur === mevcutTur
    }));
}

function turevleriGetir(turevIdListesi) {
    if (!turevIdListesi) return [];
    return turevIdListesi.map(id => idIleBul(id, 'sozcuk')).filter(Boolean);
}

function ilgilileriGetir(ilgiliIdListesi) {
    if (!ilgiliIdListesi) return [];
    return ilgiliIdListesi.map(id => idIleBul(id)).filter(Boolean);
}

function satirlaraBol(liste, boyut = 3) {
    const satirlar = [];
    for (let i = 0; i < liste.length; i += boyut) {
        satirlar.push(liste.slice(i, i + boyut));
    }
    return satirlar;
}

function kartListesiOlustur(konteyner, liste, elemanOlusturucu, bosMesaj = 'Henüz eklenmedi.') {
    konteyner.innerHTML = '';
    if (!liste || liste.length === 0) {
        const p = document.createElement('p');
        p.textContent = bosMesaj;
        konteyner.appendChild(p);
        return;
    }
    satirlaraBol(liste, 3).forEach(grup => {
        const satir = document.createElement('div');
        satir.className = 'kart-satir';
        grup.forEach(item => satir.appendChild(elemanOlusturucu(item)));
        konteyner.appendChild(satir);
    });
}

function idListesindenGetir(idListesi) {
    if (!idListesi) return [];
    return idListesi.map(id => idIleBul(id)).filter(Boolean);
}