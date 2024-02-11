// привіт, що ти тут шукаєш?
// для таких як ти, цей код прокоментовано, тому читай собі

// тема сайту
colorTheme = false;
var toggleColor = el => {
  colorTheme = !colorTheme;
  el.innerText = colorTheme ? '☀️' : '🌙';
  // зміна теми Bootstrap і задавання кукі
  var themename = colorTheme ? 'light' : 'dark'
  document.documentElement.setAttribute('data-bs-theme', themename);
  Cookies.set('theme', themename);
  // зміна кольору заголовку, бо я клав йому колір вручну і тепер він самостійно не міняється
  $("#title").css("color", colorTheme ? "#000" : "#fff")
}

var themecookie = Cookies.get('theme');
if (themecookie == "light") {
  toggleColor(document.getElementById("colortoggler"));
}

var notranslation = false;
var langcookie = Cookies.get('lang');
if (langcookie) { // якщо кукі перекладу встановлено то встановлюємо переклад
  for (var key in enchants) enchants[key]["translation"] = enchants[key][langcookie];
  document.getElementById("langdisplay").innerHTML += langs[langcookie];
} else { // інакше питаємо без підтвердження
  notranslation = true;
  changeLang();
}

for (var langkey in langs) {
  // додаєм радіо кнопки вибору мови в меню
  $('#langchecks').append(`
<div class="form-check-inline">
  <label class="form-check-label">
    <input type="radio" class="form-check-input" name="languageselection" id="tr-${langkey}"> ${langs[langkey]}
  </label>
</div>
  `);
  if (!notranslation) { // якщо мова є то обираємо її в списку щоб вона виглядала відміченою
    if (langcookie == langkey) {
      document.getElementById("tr-" + langcookie).checked = true;
    }
  }
}
if (notranslation) {
  for(let i of document.getElementsByClassName("notshowonfirst")) {
    i.style.display = "none";
  }
}


// вкл/викл меню вибору мови
function changeLang(doClose=true) {
  if (!doClose) return;
  var el = document.getElementById("langseloverlay");
  var body = document.body;
  el.style.display = (el.style.display == "none") ? "flex" : "none";
  body.style.overflowY = (body.style.overflowY == "visible") ? "hidden" : "visible";
}

// встановлюємо мову
function setLang() {
  var selector = document.querySelector('input[name="languageselection"]:checked');
  if (selector) {
  if (notranslation || confirm("Точно змінити мову? Якщо щось було введено на сторінці, то воно пропаде (сторінка перезавантажиться), за винятком посилань з заданими зачаруваннями та інструментом. Змінити знову можна поряд з вибором теми, в куті.")) {
      Cookies.set('lang', selector.id.slice(3));
      location.reload();
    }
  }
}

// список (словар) зачарів в форматі {"зачар": рівень, ...}
var enchlist = {};

var curritem = ""; // поточний предмет
// розрахунок ціни:
function calcPrice(enchlistfiltered) {
  var price = items[curritem]['base-price']; // базова ціна предмета
  for (const [name, level] of Object.entries(enchlistfiltered))
    // розрахунок за допомогою словара levelprices (див. itemdata.js)
    price += levelprices[enchants[name]['maxlevel']][level - 1];
  return price;
}
// зміна ціни, яка відображається
function updatePrice() {
  /* якщо зачар книга, то розрахунок іде по іншому:
  берем список зачарів які помічені
  дивимся на кожен набір можливих зачарів для всіх можливих предметів
  знаходимо перетин того що відмічено і то на що можна зачарити предмет для всіх можливих предметів, і вираховєм ціни для цього
  і дивимся яка з цих цін найбільша
  тобто яку найбільшу пользу можна витягнути з книжки
  */
  if (curritem == "enchanted_book") {
    var maxprice = 0;
    for (const [name, data] of Object.entries(items)) {
      var newench = {};
      for (const [namee, level] of Object.entries(enchlist)) {
        if (name != "enchanted_book" && data['enchants'].includes(namee)) newench[namee] = level;
      }
      var tempprice = calcPrice(newench);
      if (tempprice > maxprice) maxprice = tempprice;
    }
    $("#priceout").text(maxprice + " ГБ");
  }
  // нормальне відображення ціни
  else {
    $("#priceout").text(calcPrice(enchlist) + " ГБ");
  }
}
// ввімкнення галочки з зачаром:
var enchantItem = el => {
  if (el.id.slice(2) in exclusiveenchants) {
    // вимкнення / ввімкнення несумісних зачарів
    for (i of exclusiveenchants[el.id.slice(2)]) {
      $("#e_" + i).prop("disabled", el.checked);
      $("#e_" + i).parent().css('textDecoration', el.checked ? 'line-through' : 'none');
    }
  }
  // додаєм або забираєм зачар з списку зачарів
  if (el.checked) enchlist[el.id.slice(2)] = enchants[el.id.slice(2)]['maxlevel'] == 1 ? 1 : parseInt($("#r_" + el.id.slice(2)).val());
  else delete enchlist[el.id.slice(2)];
  updatePrice();
}
// обирання предмета
var chooseItem = name => {
  $("#bigimg").replaceWith(`<span class="inlineimg" id="bigimg" style="width: 24px; height: 24px; 
                                                           background-image: url('spritesheet.png'); 
                                                           background-position: -${(name=="shield"?1862.4:items[name]['sprite']*24)}px 0;
                                                           background-size: ${1048/(name=="shield"?40:16)*24}px;
                                                           transform: scale(${75/24});
                                                           margin: ${(75-24)/2}px"></span>`)
  $("#dropdowntext").text(items[name]['translation']);
  $("#enchcheck").empty()
  // додавання галочок з зачарами
  for (i of items[name]['enchants']) {
    // якщо перший рівень то без слайдера
    if (enchants[i]['maxlevel'] == 1) $("#enchcheck").append(`
      <label class="form-check-label">
        <input class="form-check-input" type="checkbox" id="e_${i}" onclick="enchantItem(this)">
        &nbsp;${enchants[i]['translation']}
      </label>
    `);
    // інакше з слайдером
    else $("#enchcheck").append(`
      <label class="form-check-label">
        <input class="form-check-input" type="checkbox" id="e_${i}" onclick="enchantItem(this)">
        &nbsp;${enchants[i]['translation']} 
        <span id="l_${i}">${levels[enchants[i]['maxlevel'] - 1]}</span>
        <input type="range" class="form-range" value="${enchants[i]['maxlevel']}" min="1" max="${enchants[i]['maxlevel']}" step="1" id="r_${i}" oninput="setLevel(this)">
      </label>
    `);
    // показ пояснення з зачар книжкою, якщо вибрана зачар книжка і навпаки
    if (name == "enchanted_book") $("#bookexpl").show();
    else $("#bookexpl").hide();
  }
  enchlist = {};
  curritem = name;
  updatePrice();
}
// коли змінюється слайдер зачару
var setLevel = el => {
  $("#l_" + el.id.slice(2)).text(levels[el.value - 1]);
  if (el.id.slice(2) in enchlist) {
    enchlist[el.id.slice(2)] = parseInt(el.value);
    updatePrice();
  }
}
// копіювання посилання
function copyLink() {
  var newdict = { "i": curritem };
  newdict['e'] = enchlist;
  navigator.clipboard.writeText("https://pricecalc.gummercraft.repl.co?data=" + encodeURIComponent(JSON.stringify(newdict))).then(
    () => alert('Скопійовано успішно'),
    () => alert('Не вдалось скопіювати')
  );
}

// додавання предметів в вибір предметів
for (const [name, data] of Object.entries(items)) {
  $("#itemslist").append(`
    <li>
      <a class="dropdown-item" href="#" onclick="chooseItem('${name}')">
        <span class="inlineimg" style="width: 24px; height: 24px; 
                                       background-image: url('spritesheet.png'); 
                                       background-position: -${(name=="shield"?1862.4:data['sprite']*24)}px 0;
                                       background-size: ${1048/(name=="shield"?40:16)*24}px;"></span>
        ${data['translation']}
      </a>
    </li>
  `);
}
// берем query параметр з ссилки (для відтворення даних, які збережені в скопійованому посиланні)
var querydata = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
}).data;
// якщо там є ті дані
if (querydata) {
  querydata = JSON.parse(querydata);
  chooseItem(querydata.i);
  // клікаєм на всі галочки і ставимо всі слайдери
  for (const [name, level] of Object.entries(querydata.e)) {
    $('#e_' + name).trigger("click");
    if (enchants[name]["maxlevel"] != 1) {
      $('#r_' + name).val(level);
      $('#r_' + name).trigger("input");
    }
  }
} else {
  chooseItem("netherite_pickaxe"); // інакше просто берем незер кирку
}

updatePrice();
