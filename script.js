var pages = {
    "fx-991DEX typer": ["/fx-991DEX", "converts text to button presses on the fx-991DEX calculator"],
    "Hexguessr": ["/hexguessr", "hone your hex color reading and writing skills!"],
    "Rock-Paper-Scissors": ["/rockpaperscissors", "look at em go!"],
    "Gravity simulation": ["/particles", "balls go vroom vroom"],
    "4our 4ours": ["/4our4ours", "the Four Fours game from Numberphile, but digital and more customizable (not available yet)"],
    "Desmos": ["/desmos", "stuff I made with Desmos (not available yet)"],
    "Tampermonkey": ["/tampermonkey", "my userscripts (not available yet)"]
};

for (let i in pages) {
    $('#content').append(`
    	<div class="col-12 col-sm-6 col-md-6 col-lg-3 tile">
    		<img src="homepage_images${pages[i][0]}.png" class="image">
			<h4 style="margin-top: 5px;"><b><a href="${pages[i][0]}">${i}</a></b></h2>
			${pages[i][1]}
    	</div>
    `);
}

setInterval(() => {
	document.documentElement.style.height = document.body.getBoundingClientRect().height + "px";	
}, 50);
