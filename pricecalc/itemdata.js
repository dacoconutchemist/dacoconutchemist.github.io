// тут всілякі дані, які потрібні для роботи проги
// якщо хочеш побчаити як реально працює цей сайт, іди в script.js і поглядуй сюди якщо що

var levels = ["I", "II", "III", "IV", "V"];

var levelprices = {
  1: [200],
  2: [100, 200],
  3: [50, 100, 200],
  4: [50, 100, 150, 200],
  5: [25, 50, 100, 150, 200]
};

var langs = {
  "translation": "Українська (версія 1.19.3 і вище)",
  "translation1": "Українська (версія 1.19.2 і нижче)",
  "translation2": "Англійська"
};

var exclusiveenchants = {
  "sharpness": ["smite", "bane_of_arthropods"],
  "smite": ["sharpness", "bane_of_arthropods"],
  "bane_of_arthropods": ["sharpness", "smite"],
  "blast_protection": ["fire_protection", "protection", "projectile_protection"], 
  "fire_protection": ["blast_protection", "protection", "projectile_protection"], 
  "protection": ["blast_protection", "fire_protection", "projectile_protection"], 
  "projectile_protection": ["blast_protection", "fire_protection", "protection"], 
  "riptide": ["loyalty", "channeling"], 
  "loyalty": ["riptide"], 
  "channeling": ["riptide"],
  "depth_strider": ["frost_walker"], 
  "frost_walker": ["depth_strider"], 
  "silk_touch": ["fortune"], 
  "fortune": ["silk_touch"], 
  "mending": ["infinity"],
  "infinity": ["mending"],
  "piercing": ["multishot"],
  "multishot": ["piercing"]
};

var enchants = {
   "aqua_affinity": {
      "maxlevel": 1,
      "translation": "Рідність води", // 1.19.3+
      "translation1": "Рідність води", // 1.19.2-
      "translation2": "Aqua Affinity" // english
   },
   "bane_of_arthropods": {
      "maxlevel": 5,
      "translation": "Загибель членистоногих",
      "translation1": "Загибель членистоногих",
      "translation2": "Bane of Arthropods"
   },
   "binding_curse": {
      "maxlevel": 1,
      "translation": "Прокляття прив'язування",
      "translation1": "Прокляття прив'язування",
      "translation2": "Curse of Binding"
   },
   "blast_protection": {
      "maxlevel": 4,
      "translation": "Захист від вибухів",
      "translation1": "Захист від вибухів",
      "translation2": "Blast Protection"
   },
   "channeling": {
      "maxlevel": 1,
      "translation": "Блискавиця",
      "translation1": "Блискавиця",
      "translation2": "Channeling"
   },
   "depth_strider": {
      "maxlevel": 3,
      "translation": "Глибинний бігун",
      "translation1": "Глибинний бігун",
      "translation2": "Depth Strider"
   },
   "efficiency": {
      "maxlevel": 5,
      "translation": "Ефективність",
      "translation1": "Ефективність",
      "translation2": "Efficiency"
   },
   "feather_falling": {
      "maxlevel": 4,
      "translation": "Невагомість",
      "translation1": "Невагомість",
      "translation2": "Feather Falling"
   },
   "fire_aspect": {
      "maxlevel": 2,
      "translation": "Сила вогню",
      "translation1": "Сила вогню",
      "translation2": "Fire Aspect"
   },
   "fire_protection": {
      "maxlevel": 4,
      "translation": "Вогнестійкість",
      "translation1": "Вогнестійкість",
      "translation2": "Fire Protection"
   },
   "flame": {
      "maxlevel": 1,
      "translation": "Полум'я",
      "translation1": "Полум'я",
      "translation2": "Flame"
   },
   "fortune": {
      "maxlevel": 3,
      "translation": "Удача",
      "translation1": "Удача",
      "translation2": "Fortune"
   },
   "frost_walker": {
      "maxlevel": 2,
      "translation": "Льодохід",
      "translation1": "Льодохід",
      "translation2": "Frost Walker",
   },
   "impaling": {
      "maxlevel": 5,
      "translation": "Протикання",
      "translation1": "Пронизування",
      "translation2": "Impaling"
   },
   "infinity": {
      "maxlevel": 1,
      "translation": "Нескінченність",
      "translation1": "Нескінченність",
      "translation2": "Infinity"
   },
   "knockback": {
      "maxlevel": 2,
      "translation": "Відкидання",
      "translation1": "Відкидання",
      "translation2": "Knockback"
   },
   "looting": {
      "maxlevel": 3,
      "translation": "Продуктивність",
      "translation1": "Продуктивність",
      "translation2": "Looting"
   },
   "loyalty": {
      "maxlevel": 3,
      "translation": "Вірність",
      "translation1": "Вірність",
      "translation2": "Loyalty"
   },
   "luck_of_the_sea": {
      "maxlevel": 3,
      "translation": "Морська фортуна",
      "translation1": "Морська фортуна",
      "translation2": "Luck of the Sea"
   },
   "lure": {
      "maxlevel": 3,
      "translation": "Приманка",
      "translation1": "Приманка",
      "translation2": "Lure"
   },
   "mending": {
      "maxlevel": 1,
      "translation": "Ремонт",
      "translation1": "Ремонт",
      "translation2": "Mending"
   },
   "multishot": {
      "maxlevel": 1,
      "translation": "Потрiйний постріл",
      "translation1": "Потрiйний постріл",
      "translation2": "Multishot"
   },
   "piercing": {
      "maxlevel": 4,
      "translation": "Пронизування",
      "translation1": "Пронизуюча стріла",
      "translation2": "Piercing"
   },
   "power": {
      "maxlevel": 5,
      "translation": "Сила",
      "translation1": "Сила",
      "translation2": "Power"
   },
   "projectile_protection": {
      "maxlevel": 4,
      "translation": "Захист від снарядів",
      "translation1": "Захист від снарядів",
      "translation2": "Projectile Protection"
   },
   "protection": {
      "maxlevel": 4,
      "translation": "Захист",
      "translation1": "Захист",
      "translation2": "Protection"
   },
   "punch": {
      "maxlevel": 2,
      "translation": "Відкидування",
      "translation1": "Відкидування",
      "translation2": "Punch"
   },
   "quick_charge": {
      "maxlevel": 3,
      "translation": "Швидка перезарядка",
      "translation1": "Швидка перезарядка",
      "translation2": "Quick Charge"
   },
   "respiration": {
      "maxlevel": 3,
      "translation": "Дихання",
      "translation1": "Дихання",
      "translation2": "Respiration"
   },
   "riptide": {
      "maxlevel": 3,
      "translation": "Тягун",
      "translation1": "Тягун",
      "translation2": "Riptide"
   },
   "sharpness": {
      "maxlevel": 5,
      "translation": "Гострота",
      "translation1": "Гострота",
      "translation2": "Sharpness"
   },
   "silk_touch": {
      "maxlevel": 1,
      "translation": "Шовковий дотик",
      "translation1": "Шовковий дотик",
      "translation2": "Silk Touch"
   },
   "soul_speed": {
      "maxlevel": 3,
      "translation": "Швидкість душ",
      "translation1": "Швидкість душ",
      "translation2": "Soul Speed"
   },
   "smite": {
      "maxlevel": 5,
      "translation": "Небесна кара",
      "translation1": "Небесна кара",
      "translation2": "Smite"
   },
   "sweeping": {
      "maxlevel": 3,
      "translation": "Нищівне лезо",
      "translation1": "Нищівне лезо",
      "translation2": "Sweeping"
   },
   "thorns": {
      "maxlevel": 3,
      "translation": "Шипи",
      "translation1": "Шипи",
      "translation2": "Thorns"
   },
   "unbreaking": {
      "maxlevel": 3,
      "translation": "Незламність",
      "translation1": "Незламність",
      "translation2": "Unbreaking"
   },
   "vanishing_curse": {
      "maxlevel": 1,
      "translation": "Прокляття втрати",
      "translation1": "Прокляття втрати",
      "translation2": "Curse of Vanishing"
   },
   "swift_sneak": {
      "maxlevel": 3,
      "translation": "Біг крадькома",
      "translation1": "Біг крадькома",
      "translation2": "Swift Sneak"
   }
};

// дякую
// https://www.digminecraft.com/lists/enchantment_list_pc.php
// і
// console.log('"' + Array.from(document.querySelectorAll("td>em")).map(el => el.innerText).join('", "') + '"')

var items = {
   "enchanted_book":{
      "translation":"Зачарована книга",
      "base-price": 0,
      "enchants":[
         "aqua_affinity",
         "bane_of_arthropods",
         "binding_curse",
         "blast_protection",
         "channeling",
         "depth_strider",
         "efficiency",
         "feather_falling",
         "fire_aspect",
         "fire_protection",
         "flame",
         "fortune",
         "frost_walker",
         "impaling",
         "infinity",
         "knockback",
         "looting",
         "loyalty",
         "luck_of_the_sea",
         "lure",
         "mending",
         "multishot",
         "piercing",
         "power",
         "projectile_protection",
         "protection",
         "punch",
         "quick_charge",
         "respiration",
         "riptide",
         "sharpness",
         "silk_touch",
         "soul_speed",
         "smite",
         "sweeping",
         "thorns",
         "unbreaking",
         "vanishing_curse",
         "swift_sneak"
      ],
      "sprite": 0
   },
   "wooden_axe":{
      "translation":"Дерев'яна сокира",
      "base-price": 0,
      "enchants":[
         "mending",
         "unbreaking",
         "bane_of_arthropods",
         "vanishing_curse",
         "efficiency",
         "fortune",
         "sharpness",
         "silk_touch",
         "smite"
      ],
      "sprite": 1
   },
   "wooden_hoe":{
      "translation":"Дерев'яна мотика",
      "base-price": 0,
      "enchants":[
         "vanishing_curse",
         "efficiency",
         "fortune",
         "mending",
         "silk_touch",
         "unbreaking"
      ],
      "sprite": 2
   },
   "wooden_pickaxe":{
      "translation":"Дерев'яне кайло",
      "base-price": 0,
      "enchants":[
         "vanishing_curse",
         "efficiency",
         "fortune",
         "mending",
         "silk_touch",
         "unbreaking"
      ],
      "sprite": 3
   },
   "wooden_shovel":{
      "translation":"Дерев'яна лопата",
      "base-price": 0,
      "enchants":[
         "vanishing_curse",
         "efficiency",
         "fortune",
         "mending",
         "silk_touch",
         "unbreaking"
      ],
      "sprite": 4
   },
   "wooden_sword":{
      "translation":"Дерев'яний меч",
      "base-price": 0,
      "enchants":[
         "bane_of_arthropods",
         "vanishing_curse",
         "fire_aspect",
         "knockback",
         "looting",
         "mending",
         "sharpness",
         "smite",
         "sweeping",
         "unbreaking"
      ],
      "sprite": 5
   },
   "stone_axe":{
      "translation":"Кам'яна сокира",
      "base-price": 0,
      "enchants":[
         "mending",
         "unbreaking",
         "bane_of_arthropods",
         "vanishing_curse",
         "efficiency",
         "fortune",
         "sharpness",
         "silk_touch",
         "smite"
      ],
      "sprite": 6
   },
   "stone_hoe":{
      "translation":"Кам'яна мотика",
      "base-price": 0,
      "enchants":[
         "vanishing_curse",
         "efficiency",
         "fortune",
         "mending",
         "silk_touch",
         "unbreaking"
      ],
      "sprite": 7
   },
   "stone_pickaxe":{
      "translation":"Кам'яне кайло",
      "base-price": 0,
      "enchants":[
         "vanishing_curse",
         "efficiency",
         "fortune",
         "mending",
         "silk_touch",
         "unbreaking"
      ],
      "sprite": 8
   },
   "stone_shovel":{
      "translation":"Кам'яна лопата",
      "base-price": 0,
      "enchants":[
         "vanishing_curse",
         "efficiency",
         "fortune",
         "mending",
         "silk_touch",
         "unbreaking"
      ],
      "sprite": 9
   },
   "stone_sword":{
      "translation":"Кам'яний меч",
      "base-price": 0,
      "enchants":[
         "bane_of_arthropods",
         "vanishing_curse",
         "fire_aspect",
         "knockback",
         "looting",
         "mending",
         "sharpness",
         "smite",
         "sweeping",
         "unbreaking"
      ],
      "sprite": 10
   },
   "iron_axe":{
      "translation":"Залізна сокира",
      "base-price": 3,
      "enchants":[
         "mending",
         "unbreaking",
         "bane_of_arthropods",
         "vanishing_curse",
         "efficiency",
         "fortune",
         "sharpness",
         "silk_touch",
         "smite"
      ],
      "sprite": 11
   },
   "iron_hoe":{
      "translation":"Залізна мотика",
      "base-price": 2,
      "enchants":[
         "vanishing_curse",
         "efficiency",
         "fortune",
         "mending",
         "silk_touch",
         "unbreaking"
      ],
      "sprite": 12
   },
   "iron_pickaxe":{
      "translation":"Залізне кайло",
      "base-price": 3,
      "enchants":[
         "vanishing_curse",
         "efficiency",
         "fortune",
         "mending",
         "silk_touch",
         "unbreaking"
      ],
      "sprite": 13
   },
   "iron_shovel":{
      "translation":"Залізна лопата",
      "base-price": 1,
      "enchants":[
         "vanishing_curse",
         "efficiency",
         "fortune",
         "mending",
         "silk_touch",
         "unbreaking"
      ],
      "sprite": 14
   },
   "iron_sword":{
      "translation":"Залізний меч",
      "base-price": 2,
      "enchants":[
         "bane_of_arthropods",
         "vanishing_curse",
         "fire_aspect",
         "knockback",
         "looting",
         "mending",
         "sharpness",
         "smite",
         "sweeping",
         "unbreaking"
      ],
      "sprite": 15
   },
   "golden_axe":{
      "translation":"Золота сокира",
      "base-price": 15,
      "enchants":[
         "mending",
         "unbreaking",
         "bane_of_arthropods",
         "vanishing_curse",
         "efficiency",
         "fortune",
         "sharpness",
         "silk_touch",
         "smite"
      ],
      "sprite": 16
   },
   "golden_hoe":{
      "translation":"Золота мотика",
      "base-price": 10,
      "enchants":[
         "vanishing_curse",
         "efficiency",
         "fortune",
         "mending",
         "silk_touch",
         "unbreaking"
      ],
      "sprite": 17
   },
   "golden_pickaxe":{
      "translation":"Золоте кайло",
      "base-price": 15,
      "enchants":[
         "vanishing_curse",
         "efficiency",
         "fortune",
         "mending",
         "silk_touch",
         "unbreaking"
      ],
      "sprite": 18
   },
   "golden_shovel":{
      "translation":"Золота лопата",
      "base-price": 5,
      "enchants":[
         "vanishing_curse",
         "efficiency",
         "fortune",
         "mending",
         "silk_touch",
         "unbreaking"
      ],
      "sprite": 19
   },
   "golden_sword":{
      "translation":"Золотий меч",
      "base-price": 10,
      "enchants":[
         "bane_of_arthropods",
         "vanishing_curse",
         "fire_aspect",
         "knockback",
         "looting",
         "mending",
         "sharpness",
         "smite",
         "sweeping",
         "unbreaking"
      ],
      "sprite": 20
   },
   "diamond_axe":{
      "translation":"Діамантова сокира",
      "base-price": 120,
      "enchants":[
         "mending",
         "unbreaking",
         "bane_of_arthropods",
         "vanishing_curse",
         "efficiency",
         "fortune",
         "sharpness",
         "silk_touch",
         "smite"
      ],
      "sprite": 21
   },
   "diamond_hoe":{
      "translation":"Діамантова мотика",
      "base-price": 80,
      "enchants":[
         "vanishing_curse",
         "efficiency",
         "fortune",
         "mending",
         "silk_touch",
         "unbreaking"
      ],
      "sprite": 22
   },
   "diamond_pickaxe":{
      "translation":"Діамантове кайло",
      "base-price": 120,
      "enchants":[
         "vanishing_curse",
         "efficiency",
         "fortune",
         "mending",
         "silk_touch",
         "unbreaking"
      ],
      "sprite": 23
   },
   "diamond_shovel":{
      "translation":"Діамантова лопата",
      "base-price": 40,
      "enchants":[
         "vanishing_curse",
         "efficiency",
         "fortune",
         "mending",
         "silk_touch",
         "unbreaking"
      ],
      "sprite": 24
   },
   "diamond_sword":{
      "translation":"Діамантовий меч",
      "base-price": 80,
      "enchants":[
         "bane_of_arthropods",
         "vanishing_curse",
         "fire_aspect",
         "knockback",
         "looting",
         "mending",
         "sharpness",
         "smite",
         "sweeping",
         "unbreaking"
      ],
      "sprite": 25
   },
   "netherite_axe":{
      "translation":"Незеритова сокира",
      "base-price": 1720,
      "enchants":[
         "mending",
         "unbreaking",
         "bane_of_arthropods",
         "vanishing_curse",
         "efficiency",
         "fortune",
         "sharpness",
         "silk_touch",
         "smite"
      ],
      "sprite": 26
   },
   "netherite_hoe":{
      "translation":"Незеритова мотика",
      "base-price": 1680,
      "enchants":[
         "vanishing_curse",
         "efficiency",
         "fortune",
         "mending",
         "silk_touch",
         "unbreaking"
      ],
      "sprite": 27
   },
   "netherite_pickaxe":{
      "translation":"Незеритове кайло",
      "base-price": 1720,
      "enchants":[
         "vanishing_curse",
         "efficiency",
         "fortune",
         "mending",
         "silk_touch",
         "unbreaking"
      ],
      "sprite": 28
   },
   "netherite_shovel":{
      "translation":"Незеритова лопата",
      "base-price": 1640,
      "enchants":[
         "vanishing_curse",
         "efficiency",
         "fortune",
         "mending",
         "silk_touch",
         "unbreaking"
      ],
      "sprite": 29
   },
   "netherite_sword":{
      "translation":"Незеритовий меч",
      "base-price": 1680,
      "enchants":[
         "bane_of_arthropods",
         "vanishing_curse",
         "fire_aspect",
         "knockback",
         "looting",
         "mending",
         "sharpness",
         "smite",
         "sweeping",
         "unbreaking"
      ],
      "sprite": 30
   },
   "leather_helmet":{
      "translation":"Шкіряний шолом (шапка)",
      "base-price": 0,
      "enchants":[
         "aqua_affinity",
         "blast_protection",
         "binding_curse",
         "vanishing_curse",
         "fire_protection",
         "mending",
         "projectile_protection",
         "protection",
         "respiration",
         "thorns",
         "unbreaking"
      ],
      "sprite": 31
   },
   "leather_chestplate":{
      "translation":"Шкіряний нагрудник (туніка)",
      "base-price": 0,
      "enchants":[
         "blast_protection",
         "binding_curse",
         "vanishing_curse",
         "fire_protection",
         "mending",
         "projectile_protection",
         "protection",
         "thorns",
         "unbreaking"
      ],
      "sprite": 32
   },
   "leather_leggings":{
      "translation":"Шкіряні наголінники (штани)",
      "base-price": 0,
      "enchants":[
         "blast_protection",
         "binding_curse",
         "vanishing_curse",
         "fire_protection",
         "mending",
         "projectile_protection",
         "protection",
         "swift_sneak",
         "thorns",
         "unbreaking"
      ],
      "sprite": 33
   },
   "leather_boots":{
      "translation":"Шкіряні чоботи",
      "base-price": 0,
      "enchants":[
         "blast_protection",
         "binding_curse",
         "vanishing_curse",
         "depth_strider",
         "feather_falling",
         "fire_protection",
         "frost_walker",
         "mending",
         "projectile_protection",
         "protection",
         "soul_speed",
         "thorns",
         "unbreaking"
      ],
      "sprite": 34
   },
   "chainmail_helmet":{
      "translation":"Кольчужний шолом",
      "base-price": 0,
      "enchants":[
         "aqua_affinity",
         "blast_protection",
         "binding_curse",
         "vanishing_curse",
         "fire_protection",
         "mending",
         "projectile_protection",
         "protection",
         "respiration",
         "thorns",
         "unbreaking"
      ],
      "sprite": 35
   },
   "chainmail_chestplate":{
      "translation":"Кольчужний нагрудник",
      "base-price": 0,
      "enchants":[
         "blast_protection",
         "binding_curse",
         "vanishing_curse",
         "fire_protection",
         "mending",
         "projectile_protection",
         "protection",
         "thorns",
         "unbreaking"
      ],
      "sprite": 36
   },
   "chainmail_leggings":{
      "translation":"Кольчужні наголінники",
      "base-price": 0,
      "enchants":[
         "blast_protection",
         "binding_curse",
         "vanishing_curse",
         "fire_protection",
         "mending",
         "projectile_protection",
         "protection",
         "swift_sneak",
         "thorns",
         "unbreaking"
      ],
      "sprite": 37
   },
   "chainmail_boots":{
      "translation":"Кольчужні чоботи",
      "base-price": 0,
      "enchants":[
         "blast_protection",
         "binding_curse",
         "vanishing_curse",
         "depth_strider",
         "feather_falling",
         "fire_protection",
         "frost_walker",
         "mending",
         "projectile_protection",
         "protection",
         "soul_speed",
         "thorns",
         "unbreaking"
      ],
      "sprite": 38
   },
   "iron_helmet":{
      "translation":"Залізний шолом",
      "base-price": 5,
      "enchants":[
         "aqua_affinity",
         "blast_protection",
         "binding_curse",
         "vanishing_curse",
         "fire_protection",
         "mending",
         "projectile_protection",
         "protection",
         "respiration",
         "thorns",
         "unbreaking"
      ],
      "sprite": 39
   },
   "iron_chestplate":{
      "translation":"Залізний нагрудник",
      "base-price": 8,
      "enchants":[
         "blast_protection",
         "binding_curse",
         "vanishing_curse",
         "fire_protection",
         "mending",
         "projectile_protection",
         "protection",
         "thorns",
         "unbreaking"
      ],
      "sprite": 40
   },
   "iron_leggings":{
      "translation":"Залізні наголінники",
      "base-price": 7,
      "enchants":[
         "blast_protection",
         "binding_curse",
         "vanishing_curse",
         "fire_protection",
         "mending",
         "projectile_protection",
         "protection",
         "swift_sneak",
         "thorns",
         "unbreaking"
      ],
      "sprite": 41
   },
   "iron_boots":{
      "translation":"Залізні чоботи",
      "base-price": 4,
      "enchants":[
         "blast_protection",
         "binding_curse",
         "vanishing_curse",
         "depth_strider",
         "feather_falling",
         "fire_protection",
         "frost_walker",
         "mending",
         "projectile_protection",
         "protection",
         "soul_speed",
         "thorns",
         "unbreaking"
      ],
      "sprite": 42
   },
   "golden_helmet":{
      "translation":"Золотий шолом",
      "base-price": 25,
      "enchants":[
         "aqua_affinity",
         "blast_protection",
         "binding_curse",
         "vanishing_curse",
         "fire_protection",
         "mending",
         "projectile_protection",
         "protection",
         "respiration",
         "thorns",
         "unbreaking"
      ],
      "sprite": 43
   },
   "golden_chestplate":{
      "translation":"Золотий нагрудник",
      "base-price": 40,
      "enchants":[
         "blast_protection",
         "binding_curse",
         "vanishing_curse",
         "fire_protection",
         "mending",
         "projectile_protection",
         "protection",
         "thorns",
         "unbreaking"
      ],
      "sprite": 44
   },
   "golden_leggings":{
      "translation":"Золоті наголінники",
      "base-price": 35,
      "enchants":[
         "blast_protection",
         "binding_curse",
         "vanishing_curse",
         "fire_protection",
         "mending",
         "projectile_protection",
         "protection",
         "swift_sneak",
         "thorns",
         "unbreaking"
      ],
      "sprite": 45
   },
   "golden_boots":{
      "translation":"Золоті чоботи",
      "base-price": 20,
      "enchants":[
         "blast_protection",
         "binding_curse",
         "vanishing_curse",
         "depth_strider",
         "feather_falling",
         "fire_protection",
         "frost_walker",
         "mending",
         "projectile_protection",
         "protection",
         "soul_speed",
         "thorns",
         "unbreaking"
      ],
      "sprite": 46
   },
   "diamond_helmet":{
      "translation":"Діамантовий шолом",
      "base-price": 200,
      "enchants":[
         "aqua_affinity",
         "blast_protection",
         "binding_curse",
         "vanishing_curse",
         "fire_protection",
         "mending",
         "projectile_protection",
         "protection",
         "respiration",
         "thorns",
         "unbreaking"
      ],
      "sprite": 47
   },
   "diamond_chestplate":{
      "translation":"Діамантовий нагрудник",
      "base-price": 320,
      "enchants":[
         "blast_protection",
         "binding_curse",
         "vanishing_curse",
         "fire_protection",
         "mending",
         "projectile_protection",
         "protection",
         "thorns",
         "unbreaking"
      ],
      "sprite": 48
   },
   "diamond_leggings":{
      "translation":"Діамантові наголінники",
      "base-price": 280,
      "enchants":[
         "blast_protection",
         "binding_curse",
         "vanishing_curse",
         "fire_protection",
         "mending",
         "projectile_protection",
         "protection",
         "swift_sneak",
         "thorns",
         "unbreaking"
      ],
      "sprite": 50
   },
   "diamond_boots":{
      "translation":"Діамантові чоботи",
      "base-price": 160,
      "enchants":[
         "blast_protection",
         "binding_curse",
         "vanishing_curse",
         "depth_strider",
         "feather_falling",
         "fire_protection",
         "frost_walker",
         "mending",
         "projectile_protection",
         "protection",
         "soul_speed",
         "thorns",
         "unbreaking"
      ],
      "sprite": 49
   },
   "netherite_helmet":{
      "translation":"Незеритовий шолом",
      "base-price": 1800,
      "enchants":[
         "aqua_affinity",
         "blast_protection",
         "binding_curse",
         "vanishing_curse",
         "fire_protection",
         "mending",
         "projectile_protection",
         "protection",
         "respiration",
         "thorns",
         "unbreaking"
      ],
      "sprite": 51
   },
   "netherite_chestplate":{
      "translation":"Незеритовий нагрудник",
      "base-price": 1920,
      "enchants":[
         "blast_protection",
         "binding_curse",
         "vanishing_curse",
         "fire_protection",
         "mending",
         "projectile_protection",
         "protection",
         "thorns",
         "unbreaking"
      ],
      "sprite": 52
   },
   "netherite_leggings":{
      "translation":"Незеритові наголінники",
      "base-price": 1880,
      "enchants":[
         "blast_protection",
         "binding_curse",
         "vanishing_curse",
         "fire_protection",
         "mending",
         "projectile_protection",
         "protection",
         "swift_sneak",
         "thorns",
         "unbreaking"
      ],
      "sprite": 53
   },
   "netherite_boots":{
      "translation":"Незеритові чоботи",
      "base-price": 1760,
      "enchants":[
         "blast_protection",
         "binding_curse",
         "vanishing_curse",
         "depth_strider",
         "feather_falling",
         "fire_protection",
         "frost_walker",
         "mending",
         "projectile_protection",
         "protection",
         "soul_speed",
         "thorns",
         "unbreaking"
      ],
      "sprite": 54
   },
   "turtle_helmet":{
      "translation":"Черепашачий шолом (панцир)",
      "base-price": 0,
      "enchants":[
         "aqua_affinity",
         "blast_protection",
         "binding_curse",
         "vanishing_curse",
         "fire_protection",
         "mending",
         "projectile_protection",
         "protection",
         "respiration",
         "thorns",
         "unbreaking"
      ],
      "sprite": 55
   },
   "bow":{
      "translation":"Лук",
      "base-price": 0,
      "enchants":[
         "vanishing_curse",
         "flame",
         "infinity",
         "mending",
         "power",
         "punch",
         "unbreaking"
      ],
      "sprite": 56
   },
   "crossbow":{
      "translation":"Арбалет",
      "base-price": 0,
      "enchants":[
         "vanishing_curse",
         "mending",
         "multishot",
         "piercing",
         "quick_charge",
         "unbreaking"
      ],
      "sprite": 57
   },
   "elytra":{
      "translation":"Елітри",
      "base-price": 0,
      "enchants":[
         "binding_curse",
         "vanishing_curse",
         "mending",
         "unbreaking"
      ],
      "sprite": 58
   },
   "fishing_rod":{
      "translation":"Вудка",
      "base-price": 0,
      "enchants":[
         "vanishing_curse",
         "luck_of_the_sea",
         "lure",
         "mending",
         "unbreaking"
      ],
      "sprite": 59
   },
   "flint_and_steel":{
      "translation":"Кресало (запальничка)",
      "base-price": 1,
      "enchants":[
         "vanishing_curse",
         "mending",
         "unbreaking"
      ],
      "sprite": 60
   },
   "shears":{
      "translation":"Ножиці",
      "base-price": 2,
      "enchants":[
         "vanishing_curse",
         "efficiency",
         "mending",
         "unbreaking"
      ],
      "sprite": 61
   },
   "shield":{
      "translation":"Щит",
      "base-price": 1,
      "enchants":[
         "vanishing_curse",
         "mending",
         "unbreaking"
      ],
      "sprite": 63
   },
   "trident":{
      "translation":"Тризуб",
      "base-price": 0,
      "enchants":[
         "channeling",
         "vanishing_curse",
         "impaling",
         "loyalty",
         "mending",
         "riptide",
         "unbreaking"
      ],
      "sprite": 62
   }
};