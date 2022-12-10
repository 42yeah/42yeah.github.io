"use strict"


window.onload = function() {
    const quote = document.getElementById("quote")

    if (quote) {
        const list = [
            "What's the point of beauty?",
            "If I leave here tomorrow, will you still remember me?",
            "You're the measure of my dream.",
            "Your quest is at an end for you have reached the home of <a href=\"http://nethack.org\">NetHack</a>.",
            "The camera does not move. The universe moves around camera.",
            "Goodnight, and if there's an apocalypse, good luck.",
            "You can't make a half sandwich. If it's not half of a whole sandwich it's just a small sandwich.",
            "Scissors cuts paper, paper covers rock, rock crushes lizard, lizard poisons Spock, Spock smashes scissors, scissors decapitates lizard, lizard eats paper, paper disproves Spock, Spock vaporizes rock, and as it always has, rock crushes scissors.",
            "All problems in computer graphics can be solved with a matrix inversion.",
            "There are about a dozen great computer graphics people and Jim Blinn is six of them.",
        
        ]
    
        const choose = Math.floor(Math.random() * list.length)
        quote.innerHTML = list[choose]
    }
}
