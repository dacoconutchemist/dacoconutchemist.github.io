var pages = {
    "Price Calculator": ["/pricecalc", "calculated the minimal allowed prices for goods on GummerCraft"],
    "Translator": ["/translate", "translates fictional languages on GummerCraft, doubling as an Ukrainian-to-English keyboard layout fixer"],
    "fx-991DEX typer": ["/fx-991DEX", "converts text to button presses on the fx-991DEX calculator"],
    "Hexguessr": ["/hexguessr", "hone your hex color reading and writing skills!"],
    "Rock-Paper-Scissors": ["/rockpaperscissors", "look at em go!"],
    "Gravity simulation": ["/particles", "balls go vroom vroom"],
    "4our 4ours": ["/4our4ours", "the Four Fours game from Numberphile, but digital and more customizable (beta version)"],
    "Desmos": ["/desmos", "stuff I made with Desmos (not available yet)"],
    "Tampermonkey": ["/tampermonkey", "my userscripts (not available yet)"]
};

var hashdict = {
    "#0": "/pricecalc",
    "#1": "/translate",
    "#2": "/fx-991DEX",
    "#3": "/hexguessr",
    "#4": "/rockpaperscissors",
    "#5": "/particles",
    "#6": "/4our4ours",
    "#7": "/desmos",
    "#8": "/tampermonkey"
}






if (document.location.hash in hashdict) {
    document.location.replace(
        "https://dacoconutchemist.github.io" + 
        hashdict[document.location.hash] +
        document.location.search.toString()
    );
} else {
	$("#copyright").html(`&copy; dacoconutchemist ${new Date().getFullYear()}`);
    for (let i in pages) {
        $('#content').append(`
            <div class="col-12 col-sm-6 col-md-6 col-lg-3 tile">
                <img src="homepage_images${pages[i][0]}.png" class="image">
                <h4 style="margin-top: 5px;"><b><a href="${pages[i][0]}">${i}</a></b></h2>
                <div style="flex:1"></div>
                <div style="width: 100%; padding: 10px; padding-top: 0px; text-align: center">${pages[i][1]}</div>
                <div style="flex:1"></div>
            </div>
        `);
    }

    setInterval(() => {
        document.documentElement.style.height = document.body.getBoundingClientRect().height + "px";    
    }, 50);

    var touchscreen = true;//window.DetectIt.primaryInput === 'touch';
    $(window).on("load", () => {
        let sharebutton = $('#sharebutton');
        let sharelabel = $('#urlsharelabel');
        let offsetY = sharebutton[0].getBoundingClientRect().top - sharelabel[0].getBoundingClientRect().top;
        let defaultTransition = `transform 0.3s ease-out, clip-path 0.3s ease-out`;
        let touchTimeout1 = undefined, touchTimeout2 = undefined;
        //console.log(offsetY);
        let mouseEnterEvent = () => {
            sharelabel.css("transform", `translateY(0px)`);
            sharelabel.css("clip-path", `polygon(0 0, 100% 0, 100% 120%, 0 120%)`);
            sharelabel.html("&nbsp;da.gd/ab");
        };
        let mouseLeaveEvent = () => {
            sharelabel.css("transform", `translateY(${offsetY}px)`);
            sharelabel.css("clip-path", `polygon(0 0, 100% 0, 100% 0, 0 0)`);
        };
        if (touchscreen) {
            mouseEnterEvent();
            sharelabel[0].offsetHeight; // https://stackoverflow.com/a/16575811
            sharelabel.css("opacity", `1`);
            sharelabel.css("transition", defaultTransition);
        } else {
            mouseLeaveEvent();
            sharelabel[0].offsetHeight; // https://stackoverflow.com/a/16575811
            sharelabel.css("opacity", `1`);
            sharelabel.css("transition", defaultTransition);
            sharebutton.hover(mouseEnterEvent, mouseLeaveEvent);
        }
        sharebutton.on("click", () => { 
            navigator.clipboard.writeText("da.gd/ab").then(
                () => {
                    mouseEnterEvent();
                    clearTimeout(touchTimeout1);
                    clearTimeout(touchTimeout2);
                    sharelabel.css("transition", defaultTransition);
                    sharelabel.css("color", `#00cc00`);
                    sharelabel[0].offsetHeight; // https://stackoverflow.com/a/16575811
                    sharelabel.css("transition", `${defaultTransition}, color 1s ease-out`);
                    sharelabel.css("color", `#ffffff`);
                    sharelabel.html("&nbsp;Copied!");
                    if (touchscreen) {
                        touchTimeout1 = setTimeout(() => {
                            mouseLeaveEvent();
                            touchTimeout2 = setTimeout(() => {
                                mouseEnterEvent();
                            }, 300);
                        }, 1000);
                    }
                },
                () => alert('Copying failed')
            );
        });
    });
}