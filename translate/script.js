const langs = {
  'ukr': "Українська",
  'dw': "Дворфська",
  'gr': "Грізлі",
  'cat': "Котяча"
}

const flip = (data) => Object.fromEntries(
  Object
    .entries(data)
    .map(([key, value]) => [value, key])
);

function scoreLang(text) {
  console.log("ukr: " + scoreUkr(text));
  console.log("dw: " + scoreDwarf(text));
  console.log("gr: " + scoreGrizzly(text));
  console.log("cat: " + scoreCat(text));
}

/* УКРАЇНСЬКА */

function scoreUkr(text) {
  return ((text || '').match(/[а-яА-ЯґҐїЇєЄ]/g) || []).reduce((len, m) => len + m.length, 0);
}

/* ДВОРФСЬКА */

var ukrAlphabet = "'йцукенгшщзхї\\фівапролджєячсмитьбю.₴\"№;:?ЙЦУКЕНГШЩЗХЇ/ФІВАПРОЛДЖЄЯЧСМИТЬБЮ,";
var dwAlphabet = "`qwertyuiop[]\\asdfghjkl;'zxcvbnm,./~@#$^&QWERTYUIOP{}|ASDFGHJKL:\"ZXCVBNM<>?";

function fromDwarf(inp) {
  var out = "";
  for (let i = 0; i < inp.length; i++) {
    var ind = dwAlphabet.indexOf(inp[i]);
    if (ind > -1) {
      out += ukrAlphabet[ind];
    } else out += inp[i];
  }
  return out
}

function toDwarf(inp) {
  var out = "";
  for (let i = 0; i < inp.length; i++) {
    var ind = ukrAlphabet.indexOf(inp[i]);
    if (ind > -1) {
      out += dwAlphabet[ind];
    } else out += inp[i];
  }
  return out
}

function scoreDwarf(text) {
  return ((text || '').match(/[a-zA-Z]/g) || []).reduce((len, m) => len + m.length, 0);
}

/* ГРІЗЛІ */

var grDict = {
  'Ч': 'гррРррРРРрРРРРрр',
  'Щ': 'ГГГГГГГггггррр',
  'Х': 'ГГГГгггГГрр',
  'Ф': 'гррРРРРРрр',
  'Ш': 'гГгРРрррР',
  'П': 'гРРррРРРр',
  'Ю': 'грррРРРЮ',
  'Й': 'грррРРРР',
  'О': 'ггРРРРрр',
  'У': 'гггггРРр',
  'Н': 'гррРРРр',
  'Л': 'гррррРр',
  'Р': 'ГГГГГГр',
  'Т': 'ГРрррРр',
  'С': 'ГгГгрр',
  'К': 'грРррр',
  'Ж': 'гРрРр',
  'І': 'ггРРР',
  'Ї': 'гРРРР',
  'М': 'ГРРРр',
  'Ц': 'ггггр',
  'Я': 'ГГрря',
  'З': 'гРрр',
  'И': 'ГГрр',
  'Д': 'гррр',
  'Ґ': 'Гррр',
  'Е': 'гррР',
  'Є': 'грРР',
  'Ь': 'грь',
  'Б': 'грр',
  'В': 'Грр',
  'А': 'гр',
  'Г': 'ГР',
  " ": " "
};
var invGrDict = flip(grDict);

function fromGrizzly(inp) {
  var out = inp.split(' ').map(i => i in invGrDict ? invGrDict[i] : i);
  return out.join('');
}

function toGrizzly(inp) {
  var out = [...inp.toUpperCase()].map(i => i in grDict ? grDict[i] : i);
  return out.join(' ');
}

function scoreGrizzly(text) {
  var total = 0;
  for (let i of text.split(' ')) {
    if (i in invGrDict) total += i.length;
  }
  return total;
}

/* КОТЯЧА */

var catDict = {
  "а": "мяу",
  "б": "Мяу",
  "в": "мЯу",
  "г": "МЯу",
  "ґ": "мяУ",
  "д": "МяУ",
  "е": "мЯУ",
  "є": "мє",
  "ж": "МЯУ",
  "з": "мєу",
  "и": "Мєу",
  "і": "мЄу",
  "ї": "МЄу",
  "й": "мєУ",
  "к": "МєУ",
  "л": "мЄУ",
  "м": "МЄУ",
  "н": "мняв",
  "о": "Мняв",
  "п": "мНяв",
  "р": "МНяв",
  "с": "мнЯв",
  "т": "МнЯв",
  "у": "мНЯв",
  "ф": "МНЯв",
  "х": "мняВ",
  "ц": "МняВ",
  "ч": "мНяВ",
  "ш": "МНяВ",
  "щ": "мнЯВ",
  "ь": "мНЯВ",
  "ю": "МНЯВ",
  "я": "шш",
  "'": "шщ",
  "*матюки*": "ЩЩ",
  " ": " "
};
  
var invCatDict = flip(catDict);

function fromCat(inp) {
  var out = inp.split(' ').map(i => i in invCatDict ? invCatDict[i] : i);
  return out.join('');
}

function toCat(inp) {
  var out = [...inp.toLowerCase()].map(i => i in catDict ? catDict[i] : i);
  return out.join(' ');
}

function scoreCat(text) {
  var total = 0;
  for (let i of text.split(' ')) {
    if (i in invCatDict) total += i.length;
  }
  return total;
}






for (let lang in langs) {
  $('.langselect').append(`<option value="${lang}">${langs[lang]}</option>`);
}

function detectLanguage() {
  let text = $('#textinput').val();
  let langIn = $('#textinputselect').find(":selected").val();
  // це було дописано 12.02.2024 через втрату даних на InfinityFree
  if (langIn == 'auto') {
    let scores = {
      'ukr': scoreUkr(text) - scoreGrizzly(text) - scoreCat(text),
      'dw': scoreDwarf(text),
      'gr': scoreGrizzly(text),
      'cat': scoreCat(text)
    }
    langIn = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    $('#autolang').text(`Авто детекція - ${langs[langIn]}`);
  } // </дописане>
  return langIn;
}

function updateOut() {
  //console.log("event triggered");
  let text = $('#textinput').val();
  let langIn = detectLanguage();
  let langOut = $('#textoutputselect').find(":selected").val();
  switch (langIn) {
    case 'ukr':
      text = text;
      break;
    case 'dw':
      text = fromDwarf(text);
      break;
    case 'gr':
      text = fromGrizzly(text);
      break;
    case 'cat':
      text = fromCat(text);
      break;
    default:
      return 0;
  }
  switch (langOut) {
    case 'ukr':
      text = text;
      break;
    case 'dw':
      text = toDwarf(text);
      break;
    case 'gr':
      text = toGrizzly(text);
      break;
    case 'cat':
      text = toCat(text);
      break;
    default:
      return 0;
  }
  $('#textoutput').text(text);
}

$(".langselect").on("change", updateOut);
$("#textinput").on('input propertychange', updateOut);

$("#delete").on("click", () => { 
  $('#textinput').val('');
  updateOut();
});

$("#copy").on("click", () => { 
  navigator.clipboard.writeText($('#textoutput').val()).then(
    () => alert('Переклад скопійовано успішно'),
    () => alert('Не вдалось скопіювати')
  );
});

$("#swap").on("click", () => { 
  let langIn = detectLanguage();
  let langOut = $('#textoutputselect').find(":selected").val();
  let text = $('#textoutput').val();
  $('#textinput').val(text);
  $('#textinputselect option[value="' + langOut + '"]').prop('selected', true);
  $('#textoutputselect option[value="' + langIn + '"]').prop('selected', true);
  $('#textoutputselect').change();
});