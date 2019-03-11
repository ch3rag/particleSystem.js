window.onload = function () {
    div = document.getElementById("particle");
    particleSystem = new ParticleSystem(div,
        {
            "particle": {
                "number": 60, "stroke": "#057195", "color": "rgb(255,26,111)", "strokeWeight": 0, "collision": "wrap",
                "display": { "size": 5, "random": true },
                "opacity": { "value": 1, "random": true, "animate": true, "speed": 0.02 },
                "velocity": { "direction": "random", "random": true, "value": 2, "x": -1, "y": 2 },
                "trails": { "enabled": true, "length": 0.02 }
            },
            "linking": { "enabled": true, "distance": 200, "color": "grey", "width": 0.2, "mouseLinking": false },
            "interaction": { "mousemove": { "enabled": false, "radius": 100, "force": -1000 } }
        });
    setupMenu();
}

function setupMenu() {
    const optionButton = document.getElementsByClassName("option-button")[0];
    const menu = document.getElementsByClassName("side-bar")[0];
    const particleNumber = document.getElementById("particleNumber");
    const strokeColor = document.getElementById("particleStrokeColor");
    const color = document.getElementById("particleColor");
    const strokeWeight = document.getElementById("particleStrokeWeight");
    const randomStroke = document.getElementById("particleStrokeRandom");
    const randomColor = document.getElementById("particleColorRandom");

    const size = document.getElementById("particleSize");
    const randomSize = document.getElementById("particleRandomSize");

    const opacity = document.getElementById("particleOpacity");
    const opacityRandom = document.getElementById("particleOpacityRandom");
    const opacityAnimation = document.getElementById("particleOpacityAnimate");
    const opactiyAnimationSpeed = document.getElementById("particleOpacitySpeed");

    const velocityRandom = document.getElementById("particleVelocityRandom");
    const velocityValue = document.getElementById("particleVelocityValue");
    const velocityX = document.getElementById("particleVelocityX");
    const velocityY = document.getElementById("particleVelocityY");

    const trail = document.getElementById("particleTrailEnabled");
    const trailLength = document.getElementById("particleTrailLength");

    const linking = document.getElementById("particleLinkingEnabled");
    const length = document.getElementById("particleLinkingDistance");
    const width = document.getElementById("particleLinkingWidth");
    const linkColor = document.getElementById("particleLinkingColor");
    const mouseLink = document.getElementById("particleLinkingMouse");


    const pageColor = document.getElementById("pageColor");

    optionButton.addEventListener("click", () => {
        if (!menu.classList.contains("hide")) {
            div.removeChild(particleSystem.canvas);
            particleSystem.handler.stopAnimation();
            particleSystem.parent.style["background-color"] = pageColor.value;
            let collision = Array.from(document.getElementsByClassName("radio-collision")).filter(x => x.checked)[0];
            let direction = Array.from(document.getElementsByClassName("radio-direction")).filter(x => x.checked)[0];
            particleSystem = new ParticleSystem(div,
                {
                    "particle": {
                        "number": particleNumber.value, "stroke": (randomStroke.checked ? "random" : false) || strokeColor.value, "color": (randomColor.checked ? "random" : false) || color.value, "strokeWeight": strokeWeight.value, "collision": collision.value,
                        "display": { "size": size.value, "random": randomSize.checked },
                        "opacity": { "value": opacity.value / 100, "random": opacityRandom.checked, "animate": opacityAnimation.checked, "speed": opactiyAnimationSpeed.value / 100 },
                        "velocity": { "direction": direction.value, "random": velocityRandom.checked, "value": velocityValue.value, "x": velocityX.value, "y": velocityY.value },
                        "trails": { "enabled": trail.checked, "length": (1 - trailLength.value / 100) }
                    },
                    "linking": { "enabled": linking.checked, "distance": length.value, "color": linkColor.value, "width": width.value / 100, "mouseLinking": mouseLink.checked },
                    "interaction": { "mousemove": { "enabled": false, "radius": 100, "force": -1000 } }
                });
        }
        menu.classList.toggle("hide");
        optionButton.classList.toggle("active");
    });

    const options = document.getElementsByClassName("collapsable");
    for (i = 0; i < options.length; i++) {
        options[i].addEventListener("click", (e) => {
            e.target.nextElementSibling.classList.toggle("active");
            e.target.classList.toggle("active");
        });
    }
}