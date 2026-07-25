const radio = document.getElementById("radio");
const boton = document.getElementById("playButton");
const estado = document.getElementById("state");

boton.addEventListener("click", () => {

    if (radio.paused) {

        radio.play();

        boton.textContent = "ESCUCHANDO";

        estado.textContent = "● TRANSMITIENDO";

    } else {

        radio.pause();

        boton.textContent = "ENTRAR";

        estado.textContent = "● HABITADA";

    }

});