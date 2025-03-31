var pages = {
    "Price Calculator": ["/pricecalc", "calculates the minimal allowed prices for goods on GummerCraft"],
    "Translator": ["/translate", "translates fictional languages on GummerCraft, doubling as an Ukrainian-to-English keyboard layout fixer"],
    "fx-991DEX typer": ["/fx-991DEX", "converts text to button presses on the fx-991DEX calculator"],
    "Hexguessr": ["/hexguessr", "hone your hex color reading and writing skills!"],
    "Rock-Paper-Scissors": ["/rockpaperscissors", "look at em go!"],
    "Gravity simulation": ["/particles", "balls go vroom vroom"],
    "Electric Field Simulation": ["/elfield", "charged balls but they look nice"],
    "4our 4ours": ["/4our4ours", "the Four Fours game from Numberphile, but digital and more customizable (beta version)"],
    "Desmos": ["/desmos", "stuff I made with Desmos (not available yet)"],
    "Tampermonkey": ["/tampermonkey", "my userscripts (not available yet)"]
};

let prevscroll = undefined;
var cardcount = Object.keys(pages).length;
let k = 500; 

let egg = false;
let mode = true;

$("#egg").on("click", () => {
    egg = !egg;
    if (egg) {
        $("#hampter").attr("src", "homepage_images/hamster.png");
        document.body.style.setProperty("--hampterRotation", `0turn`);
        $(".eggspacer").css("width", "5px")
    } else {
        if (mode) {
            $("#hampter").attr("src", "homepage_images/hampter.png");
        } else {
            $("#hampter").attr("src", "homepage_images/hamptersleep.png");
        }
        $(".eggspacer").css("width", "1px")
    }
});

$("#modeswitcher").on("click", () => {
    mode = !mode;
    if (mode) {
        $("#modeswitcher").html('🌙');
        $("body").attr('data-theme', "dark");
        if (!egg) {
            $("#hampter").attr("src", "homepage_images/hampter.png");
        } else {
            $("#hampter").attr("src", "homepage_images/hamster.png");
        }
        window.onscroll = null;
    } else {
        $("#modeswitcher").html(
            `<span class="outlined" style="font-size: medium">The hamster is nocturnal (he's sleeping)</span> ☀️`
        );
        $("body").attr('data-theme', "light");
        if (!egg) {
            $("#hampter").attr("src", "homepage_images/hamptersleep.png");
        }
        let x=window.scrollX;
        let y=window.scrollY;
        window.onscroll = () => {window.scrollTo(x, y)};
    }
    processScroll();
});

let scrollpos = $(window).scrollTop();
let processScroll = () => {
    if (mode) scrollpos = $(window).scrollTop();
    let radius = 800;
    let count = 80;
    let h = 2 * radius * Math.sin(Math.PI / count);
    $('.bar').each(function (i) {
        let angle = -i / count * 2 * Math.PI - scrollpos / k;
        $(this).css("transform", `translate(-50%, -50%) /*rotate3d(0.7071, -0.5, 0.5, 54.74deg)*/
                                  translate3d(0px, ${radius * Math.sin(angle)}px, ${-radius + radius * Math.cos(angle)}px) 
                                  rotateX(${-angle}rad)`);
        $(this).css("height", `${h}px`);
        if (mode) $(this).css("background-color", i%2 ? "#fff1" : "#ffffff18");
        else $(this).css("background-color", i%2 ? "#0001" : "#00000018");
    });

    let largerradius = 810;
    let backs = $(".stickToWheelBack");
    $('.stickToWheel').each(function (i, el) {
        let angle = i / cardcount * 2 * Math.PI -scrollpos / k;
        $(el).css("transform", `translate(-50%, -50%) /*rotate3d(0.7071, -0.5, 0.5, 54.74deg)*/
                                translate3d(0px, ${largerradius * Math.sin(angle)}px, ${-radius + largerradius * Math.cos(angle)}px) 
                                rotateX(${-angle}rad)`);
        $(backs[i]).css("height", `${this.offsetHeight}px`);
        $(backs[i]).css("transform", `translate(-50%, -50%) /*rotate3d(0.7071, -0.5, 0.5, 54.74deg)*/
                                      translate3d(0px, ${largerradius * Math.sin(angle)}px, ${-radius + largerradius * Math.cos(angle)}px) 
                                      rotateX(${-angle}rad) rotateX(0.5turn)`);
    });
    

    let deltascroll = $(window).scrollTop() - prevscroll;
    if (deltascroll != 0 && prevscroll && mode) {
        let dir = deltascroll > 0;
        document.body.style.setProperty("--hampterRotation", `${egg ? 0 : dir ? 0.5 : 0}turn`);
        //document.body.style.setProperty("--hampterOffset", `${dir ? 50 : -50}%`);
        if (!$('#hampter').hasClass("bouncing")) $('#hampter').addClass("bouncing");
    }

    prevscroll = $(window).scrollTop();
};

let processScale = () => {
    let scale = Math.min(1, window.innerHeight/1100, window.innerWidth/560);
    $('.main').css("transform", `scale(${scale})`)
};

$('#hampter').on('animationiteration', () => {
    $('#hampter').removeClass("bouncing");
    $('#hampter').css('transform', 'translate3d(0px, 0px, -1500px)');
});

setTimeout(() => $('#hampter').css("transition", "rotate ease-in-out 0.15s"), 1)

$(document).ready(function() {
    for (let i = 80; i > 0; i--) {
        $('.main').append(`<div class="bar"></div>`);
    }
    for (let i in pages) {
        $('.main').append(`
            <div class="stickToWheel">
                <img src="homepage_images${pages[i][0]}.png">
                <a href="${pages[i][0]}">${i}</a>
                <span>${pages[i][1]}</span>
            </div>
        `);
        $('.main').append(`
            <div class="stickToWheelBack"></div>
        `);
    }
    $("#scrollspacer").css("height", `${2 * Math.PI * k * (cardcount-1)/cardcount + window.innerHeight}px`)
    processScroll();
    processScale();
});

$(document).on("scroll", processScroll);
$(window).resize(processScale);

$('#slider_charge').on('change', e => {
    console.log(e.target.value)
})