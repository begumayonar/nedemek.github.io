
let sozluk = [];
let trie = {};
let veriHazir = fetch('../js/data.json')
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

function onerileriGetir(prefix, limit = 8) {
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