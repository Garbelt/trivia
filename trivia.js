document.addEventListener('DOMContentLoaded', () => {
  // Variables globales y elementos DOM
  const questionElement = document.getElementById('question');
  const optionsElement = document.getElementById('options');
  const messageElement = document.getElementById('message');
  const toggleButton = document.getElementById('toggleButton');
  const questionImage = document.getElementById('questionImage');
  const imageCell = document.getElementById('image-cell');
  const timeAcumuladoElement = document.getElementById('timeacumulado');
  const puntajeElement = document.getElementById('puntaje');
  const fallidosElement = document.getElementById('fallidos');
  const audioTictac = document.getElementById('audio-tictac');
  let questionAudioPlayer = null;
  let repeatQuestionAudio = null;
  let repeatBirdAudio = null;     // Para reiniciar el audio del botón parlante


  const actualUsername = localStorage.getItem("ActualUs") || "Invitado";
  document.getElementById("actualUsername").textContent = `Usuario: ${actualUsername}`;

  const questions = [
    {
      question: '¿CÓMO SE LLAMA EL PÁJARO QUE APARECE EN LA IMAGEN?',
      type: "image",
      options: [
          { text: 'GORRIÓN.', correct: false, audio: 'audio/GORRIÓN.mp3' },
          { text: 'CALANDRIA.', correct: true, audio: 'audio/CALANDRIA.mp3' },
          { text: 'LECHUZA.', correct: false, audio: 'audio/LECHUZA.mp3' },
          { text: 'ZORZAL.', correct: false, audio: 'audio/ZORZAL.mp3' },
          { text: 'BICHO FEO.', correct: false, audio: 'audio/BICHO FEO.mp3' },
      ],
      audio: 'audio/question1.mp3',
      image: 'image/imagen01.jpg',
      
    },

    {
      question: '¿CÓMO SE LLAMA EL PÁJARO QUE APARECE EN LA IMAGEN?',
      type: "soloaudio",
      options: [
          { text: 'GORRIÓN.', correct: false, audio: 'audio/GORRIÓN.mp3' },
          { text: 'COTORRA.', correct: true, audio: 'audio/COTORRA.mp3' },
          { text: 'LECHUZA.', correct: false, audio: 'audio/LECHUZA.mp3' },
          { text: 'ZORZAL.', correct: false, audio: 'audio/ZORZAL.mp3' },
          { text: 'BICHO FEO.', correct: false, audio: 'audio/BICHO FEO.mp3' },
      ],
      audio: 'audio/question1.mp3',
      image: 'image/imagen01.jpg',
      audioImage: 'audio/cotorra-canto.mp3'
    },

    {
      question: '¿CÓMO SE LLAMA EL PÁJARO QUE APARECE EN LA IMAGEN?',
      type: "simple",
      options: [
          { text: 'GORRIÓN.', correct: false, audio: 'audio/GORRIÓN.mp3' },
          { text: 'CARDENAL.', correct: true, audio: 'audio/CARDENAL.mp3' },
          { text: 'JILGUERO.', correct: false, audio: 'audio/JILGUERO.mp3' },
          { text: 'CHINGOLO.', correct: false, audio: 'audio/CHINGOLO.mp3' },
          { text: 'PALOMA.', correct: false, audio: 'audio/PALOMA.mp3' },
      ],
      audio: 'audio/question1.mp3',
    },
    {
      question: '¿CÓMO SE LLAMA EL PÁJARO QUE APARECE EN LA IMAGEN?',
      type: "imageChange",
      options: [
          { text: 'COTORRA.', correct: false, audio: 'audio/COTORRA.mp3' },
          { text: 'HORNERO.', correct: true, audio: 'audio/HORNERO.mp3' },
          { text: 'TERO.', correct: false, audio: 'audio/TERO.mp3' },
          { text: 'CHINGOLO.', correct: false, audio: 'CHINGOLO.mp3' },
          { text: 'CARDENAL.', correct: false, audio: 'audio/CARDENAL.mp3' },
      ],
      audio: 'audio/question1.mp3',
      image: 'image/imagen03.jpg',
      secondImage: 'image/imagen03_alt.jpg'
    },
    {
      question: '¿CÓMO SE LLAMA EL PÁJARO QUE APARECE EN LA IMAGEN?',
      type: "imageaudio",
      options: [
          { text: 'COTORRA.', correct: false, audio: 'audio/COTORRA.mp3' },
          { text: 'GORRIÓN.', correct: true, audio: 'audio/GORRIÓN.mp3' },
          { text: 'LECHUZA.', correct: false, audio: 'audio/LECHUZA.mp3' },
          { text: 'JILGUERO.', correct: false, audio: 'audio/JILGUERO.mp3' },
          { text: 'BICHO FEO.', correct: false, audio: 'audio/BICHO FEO.mp3' },
      ],
      audio: 'audio/question1.mp3',
      image: 'image/imagen04.jpg',
      birdAudio: 'audio/gorriónAudioImage.mp3'
    }
  ];

  let currentQuestionIndex = 0;
  let optionAudioPlayers = [];
  let audioPaused = false;
  let tiempoTotalSegundos = 0;
  let intervaloTiempoAcumulado;
  let puntaje = 0;
  let score = 0;
  let errores = 0;
  let intervaloTemporizador;

  function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
      }
  }

function enableOptions() {
  const options = optionsElement.querySelectorAll('li');
  options.forEach(option => {
      option.style.pointerEvents = 'auto';
  });

  // Habilitar la pregunta para repetir audio
  questionElement.style.pointerEvents = 'auto';
  questionElement.style.cursor = 'pointer';
  questionElement.classList.add('clickable-hover');

  // Habilitar la imagen solo si es clicable
  if (questions[currentQuestionIndex].type === 'imageChange' || questions[currentQuestionIndex].type === 'imageaudio') {
      questionImage.style.pointerEvents = 'auto';
      questionImage.classList.add('clickable-hover');
  }

  const speakerButton = document.getElementById('speaker-button');
  speakerButton.style.pointerEvents = 'auto';
  speakerButton.style.opacity = '1';
  speakerButton.onclick = speakerButton._playAudioFunc || null;
}

function disableOptions() {
  const options = optionsElement.querySelectorAll('li');
  options.forEach(option => {
      option.style.pointerEvents = 'none';
  });

  questionElement.style.pointerEvents = 'none';
  questionElement.style.cursor = 'default';
  questionElement.classList.remove('clickable-hover');

  questionImage.style.pointerEvents = 'none';
  questionImage.classList.remove('clickable-hover');

  const speakerButton = document.getElementById('speaker-button');
  speakerButton.style.pointerEvents = 'none';
  speakerButton.style.opacity = '0.4';
  speakerButton.onclick = null;
}


  function iniciarTemporizador() {
    clearInterval(intervaloTemporizador);
    let tiempoRestante = 15;

    actualizarRelojGrafico(tiempoRestante);
    audioTictac.currentTime = 0;
    audioTictac.play().catch(e => console.log('No se pudo reproducir tictac:', e));
    iniciarTiempoAcumulado();

    intervaloTemporizador = setInterval(() => {
      tiempoRestante--;
      if (tiempoRestante < 0) {
        clearInterval(intervaloTemporizador);
        manejarTiempoAgotado();
      } else {
        actualizarRelojGrafico(tiempoRestante);
      }
    }, 1000);
  }

  function iniciarTiempoAcumulado() {
      clearInterval(intervaloTiempoAcumulado);
      intervaloTiempoAcumulado = setInterval(() => {
          tiempoTotalSegundos++;
          timeAcumuladoElement.textContent = `Tiempo: ${formatearTiempo(tiempoTotalSegundos)}`;
      }, 1000);
  }

  function detenerTiempoAcumulado() {
      clearInterval(intervaloTiempoAcumulado);
  }

  function actualizarRelojGrafico(tiempoRestante, tiempoTotal = 15) {
    const porcentaje = (tiempoRestante / tiempoTotal) * 100;
    const reloj = document.getElementById('reloj');
    const porcentajeInvertido = 100 - porcentaje;
    reloj.style.background = `conic-gradient(from 0deg at 50% 50%, #2ecc71  ${porcentajeInvertido}%, #ecf0f1 ${porcentajeInvertido}%)`;
    reloj.textContent = `${tiempoRestante}`;
  }

  function playAudio(audioSrc) {
    const audio = new Audio(audioSrc);
    audio.play().catch(error => console.error('Audio playback failed:', error));
    return audio;
  }

function playOptionAudio(event) {
  // Detener cualquier audio que ya esté reproduciéndose
  optionAudioPlayers.forEach(player => {
    player.pause();
    player.currentTime = 0; // Reinicia por si se reproduce más tarde
  });
  optionAudioPlayers = [];

  // Reproducir solo si la lectura no está pausada
  if (!audioPaused) {
    const audioSrc = event.target.dataset.audio;
    if (audioSrc) {
      const player = playAudio(audioSrc);
      optionAudioPlayers.push(player);
    }
  }
}

  function showMessage(text, type) {
    const audioSrc = type === 'correct' ? 'sounds/correcto.mp3' : 'sounds/error.mp3';
    playAudio(audioSrc);
    messageElement.textContent = text;
    messageElement.className = `found-message ${type}`;
    messageElement.style.display = 'block';
  }

  function manejarTiempoAgotado() {
    clearInterval(intervaloTemporizador);
    fadeOutAudio(document.getElementById('audio-musica-pregunta'), 2000);
    audioTictac.pause();
    detenerTiempoAcumulado();
    disableOptions();

    errores++;
    fallidosElement.textContent = `Errores: ${errores}`;

    questions.push(questions[currentQuestionIndex]);
    questions.splice(currentQuestionIndex, 1);

    showMessage('ERROR', 'error');

    setTimeout(() => {
      messageElement.style.display = 'none';
      if (currentQuestionIndex >= questions.length) {
          currentQuestionIndex = 0;
      }
      loadQuestion();
    }, 2000);
  }

  function fadeOutAudio(audio, duration) {
    let volume = audio.volume;
    const step = volume / (duration / 100);
    const fadeAudio = setInterval(() => {
      if (volume > 0) {
        volume -= step;
        if (volume < 0) volume = 0;
        audio.volume = volume;
      } else {
        clearInterval(fadeAudio);
      }
    }, 100);
  }

  function formatearTiempo(segundosTotales) {
    const minutos = Math.floor(segundosTotales / 60);
    const segundos = segundosTotales % 60;
    return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
  }

function handleOptionClick(event) {
  optionAudioPlayers.forEach(player => player.pause());
  if(questionAudioPlayer) questionAudioPlayer.pause();
  clearInterval(intervaloTemporizador);
  audioTictac.pause();
  detenerTiempoAcumulado();

  disableOptions(); // ahora también deshabilita título, imagen y botón parlante

  const correct = event.target.dataset.correct === 'true';

  if (correct) {
    fadeOutAudio(document.getElementById('audio-musica-pregunta'), 2000);
    puntaje += 20;
    score += 20;
    puntajeElement.textContent = `Puntaje: ${puntaje}`;
    showMessage('CORRECTO', 'correct');

    setTimeout(() => {
      messageElement.style.display = 'none';
      enableOptions(); // habilita TODO de nuevo
      questions.splice(currentQuestionIndex, 1);

      if (questions.length === 0) {
        showMessagexExito();
      } else {
        if (currentQuestionIndex >= questions.length) {
          currentQuestionIndex = 0;
        }
        loadQuestion();
      }
    }, 5000);
  } else {
    fadeOutAudio(document.getElementById('audio-musica-pregunta'), 2000);
    errores++;
    fallidosElement.textContent = `Errores: ${errores}`;

    questions.push(questions[currentQuestionIndex]);
    questions.splice(currentQuestionIndex, 1);

    showMessage('ERROR', 'error');

    setTimeout(() => {
      messageElement.style.display = 'none';
      enableOptions(); // habilita TODO de nuevo

      if (currentQuestionIndex >= questions.length) {
        currentQuestionIndex = 0;
      }
      loadQuestion();
    }, 2000);
  }
}


function showMessagexExito() {
  // Deshabilitar clics en opciones y otros elementos clave
  disableOptions();
  questionElement.style.pointerEvents = 'none';
  questionElement.style.cursor = 'default';
  questionImage.style.pointerEvents = 'none';
  const speakerButton = document.getElementById('speaker-button');
  speakerButton.style.pointerEvents = 'none';
  speakerButton.style.opacity = '0.4';
  speakerButton.onclick = null;

  let bonus = Math.floor((score - tiempoTotalSegundos) / (errores + 1));
  if (bonus < 0) bonus = 0;
  score += bonus;

  const message = document.createElement("div");
  message.classList.add("found-message");
  message.innerHTML = `
    <div style="font-weight: bold; font-size: 32px;">¡FELICITACIONES!</div>
    <div style="font-size: 24px;">Has completado el juego.</div>
    <div style="margin-top: 10px; font-size: 20px;">Puntaje final: ${score} (Bonus: ${bonus})</div>
  `;
  document.body.appendChild(message);
  document.body.classList.add("disable-clicks");
  message.style.display = "block";
  message.style.zIndex = "9999";

  fadeOutAudio(document.getElementById('background-music'), 4000);

  const audioFin = new Audio("sounds/finporcompletar.mp3");
  audioFin.play();

  setTimeout(() => {
    endGame();
    almacenarRegistroConZ(score);
    window.location.href = "out.html";
  }, 7000);
}


  function endGame() {
    const currentDate = new Date().toLocaleDateString();
    const userData = {
      fecha: currentDate,
      usuario: localStorage.getItem("ActualUs"),
      puntaje: score,
      juegonumero: incrementGameNumber(),
      game: "AVE_trivia",
      rutina: localStorage.getItem("rutina")
    };
    const gamesHistory = JSON.parse(localStorage.getItem("gamesHistory")) || [];
    gamesHistory.push(userData);
    localStorage.setItem("gamesHistory", JSON.stringify(gamesHistory));
    updateAcumulado(score);
  }

  function updateAcumulado(scoreToAdd) {
    let acumulado = parseInt(localStorage.getItem("acumulado")) || 0;
    acumulado += scoreToAdd;
    localStorage.setItem("acumulado", acumulado);
  }

  function incrementGameNumber() {
    let gameNumber = parseInt(localStorage.getItem("gameNumber")) || 0;
    gameNumber++;
    localStorage.setItem("gameNumber", gameNumber);
    return gameNumber;
  }

  function almacenarRegistroConZ(finalScore) {
    const juegonumero = localStorage.getItem("gameNumber") || 1;
    const fechaActual = new Date().toLocaleDateString();
    const usuario = localStorage.getItem("ActualUs") || "Desconocido";
    const acumulado = localStorage.getItem("acumulado") || 0;
    const rutina = localStorage.getItem("rutina") || "No disponible";

    const registro = {
      juegoZ: `Juego ${juegonumero}Z`,
      fecha: fechaActual,
      usuario: usuario,
      acumulado: acumulado,
      rutina: rutina
    };

    localStorage.setItem(`registroConZ-${Date.now()}`, JSON.stringify(registro));
    console.log("Registro almacenado con Z:", registro);
  }

  // Esta función carga la pregunta y configura todo
function loadQuestion() {
  if (questionAudioPlayer) {
    questionAudioPlayer.pause();
    questionAudioPlayer.removeEventListener('ended', onQuestionAudioEnded);
  }

  const currentQuestion = questions[currentQuestionIndex];
  questionElement.textContent = currentQuestion.question;
  optionsElement.innerHTML = '';

  // Reset imagen y botón parlante
  questionImage.style.display = 'none';
  questionImage.src = '';
  questionImage.onclick = null;
  questionImage.style.pointerEvents = 'none';
  questionImage.classList.remove('clickable-hover');

  const speakerButton = document.getElementById('speaker-button');
  speakerButton.style.display = 'none';
  speakerButton.onclick = null;
  speakerButton.style.pointerEvents = 'none';
  speakerButton.style.opacity = '0.4';

  // Mostrar imagen si corresponde
  if (currentQuestion.type === 'imageaudio') {
    if (currentQuestion.image) {
      questionImage.style.display = 'block';
      imageCell.style.display = 'table-cell';
      questionImage.src = currentQuestion.image;

      speakerButton.style.display = 'block';
      speakerButton._playAudioFunc = () => {
        if (repeatBirdAudio) {
          repeatBirdAudio.pause();
          repeatBirdAudio.currentTime = 0;
        }
        if (currentQuestion.birdAudio) {
          repeatBirdAudio = new Audio(currentQuestion.birdAudio);
          repeatBirdAudio.play().catch(console.error);
        }
      };
    } else {
      imageCell.style.display = 'none';
      questionImage.style.display = 'none';
    }

  } else if (currentQuestion.type === 'soloaudio') {
    if (currentQuestion.image && currentQuestion.audioImage) {
      questionImage.style.display = 'block';
      imageCell.style.display = 'table-cell';
      questionImage.src = currentQuestion.image;

      questionImage._playImageAudio = () => {
        if (repeatBirdAudio) {
          repeatBirdAudio.pause();
          repeatBirdAudio.currentTime = 0;
        }
        repeatBirdAudio = new Audio(currentQuestion.audioImage);
        repeatBirdAudio.play().catch(console.error);
      };
    } else {
      imageCell.style.display = 'none';
    }

  } else {
    if (currentQuestion.image) {
      questionImage.style.display = 'block';
      imageCell.style.display = 'table-cell';
      questionImage.src = currentQuestion.image;
    } else {
      imageCell.style.display = 'none';
    }
  }

  questionImage.dataset.secondImage = currentQuestion.secondImage || '';
  questionImage.dataset.birdAudio = currentQuestion.birdAudio || '';

  // Crear opciones
  shuffleArray(currentQuestion.options);
  currentQuestion.options.forEach((option) => {
    const li = document.createElement('li');
    li.textContent = option.text;
    li.dataset.correct = option.correct;
    li.dataset.audio = option.audio;
    li.style.pointerEvents = 'none';
    li.addEventListener('click', handleOptionClick);
    li.addEventListener('mouseover', playOptionAudio);
    optionsElement.appendChild(li);
  });

  // Preparar audio de la pregunta
  if (repeatQuestionAudio) {
    repeatQuestionAudio.pause();
    repeatQuestionAudio.currentTime = 0;
  }
  repeatQuestionAudio = new Audio(currentQuestion.audio);
  questionAudioPlayer = repeatQuestionAudio;

  // Deshabilitar interacción mientras se lee la pregunta
  disableOptions();

  function onQuestionAudioEnded() {
    enableOptions();
    iniciarTemporizador();

    // Pregunta clicable
    questionElement.classList.add('clickable-hover');
    questionElement.style.cursor = 'pointer';
    questionElement.onclick = () => {
      if (repeatQuestionAudio) {
        repeatQuestionAudio.pause();
        repeatQuestionAudio.currentTime = 0;
      }
      repeatQuestionAudio = new Audio(currentQuestion.audio);
      repeatQuestionAudio.play().catch(console.error);
    };

    // Detectar si es dispositivo táctil
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Tipos de imagen interactiva
    if (currentQuestion.type === 'imageChange' && questionImage.dataset.secondImage) {
      questionImage.style.pointerEvents = 'auto';
      questionImage.classList.add('clickable-hover');

      // Limpiar listeners y timeouts previos
      questionImage.replaceWith(questionImage.cloneNode(true));
      questionImage = document.getElementById('questionImage');
      questionImage._timeoutId = null;
      questionImage.dataset.secondImage = currentQuestion.secondImage;

      if (isTouchDevice) {
        // Celulares: toggle al clic
        questionImage.addEventListener('click', () => {
          const secondImageSrc = questionImage.dataset.secondImage;
          const originalImage = currentQuestion.image;
          const isSecondImage = questionImage.src.includes(secondImageSrc);

          if (!isSecondImage) {
            questionImage.src = secondImageSrc;
            if (questionImage._timeoutId) clearTimeout(questionImage._timeoutId);
            questionImage._timeoutId = setTimeout(() => {
              questionImage.src = originalImage;
              questionImage._timeoutId = null;
            }, 4000);
          } else {
            questionImage.src = originalImage;
            if (questionImage._timeoutId) {
              clearTimeout(questionImage._timeoutId);
              questionImage._timeoutId = null;
            }
          }
        });
        questionImage.src = currentQuestion.image; // reiniciar imagen original
      } else {
        // PC: comportamiento original
        questionImage.addEventListener('mousedown', () => {
          questionImage.src = questionImage.dataset.secondImage;
        });
        questionImage.addEventListener('mouseup', () => {
          questionImage.src = currentQuestion.image;
        });
        questionImage.addEventListener('mouseleave', () => {
          questionImage.src = currentQuestion.image;
        });
        questionImage.src = currentQuestion.image; // reiniciar imagen original
      }
    } 
    else if (currentQuestion.type === 'soloaudio' && questionImage._playImageAudio) {
      questionImage.classList.add('clickable-hover');
      questionImage.style.pointerEvents = 'auto';
      questionImage.onclick = questionImage._playImageAudio;
    } 
    else {
      questionImage.classList.remove('clickable-hover');
      questionImage.style.pointerEvents = 'none';
    }

    // Habilitar botón parlante si corresponde
    if (speakerButton._playAudioFunc) {
      speakerButton.style.pointerEvents = 'auto';
      speakerButton.style.opacity = '1';
      speakerButton.onclick = speakerButton._playAudioFunc;
    }

    // Reproducir música de fondo de la pregunta
    const musicaPregunta = document.getElementById('audio-musica-pregunta');
    musicaPregunta.volume = 1;
    musicaPregunta.currentTime = 0;
    musicaPregunta.play().catch(console.error);
  }

  questionAudioPlayer.addEventListener('ended', onQuestionAudioEnded);
  questionAudioPlayer.play().catch(console.error);
}



// Cambio de imagen mientras se mantiene presionado el clic
questionImage.addEventListener('mousedown', () => {
  const currentQuestion = questions[currentQuestionIndex];
  if (currentQuestion.type === 'imageChange') {
    const secondImageSrc = questionImage.dataset.secondImage;
    if (secondImageSrc) {
      questionImage.src = secondImageSrc;
    }
  }
});

questionImage.addEventListener('mouseup', () => {
  const currentQuestion = questions[currentQuestionIndex];
  if (currentQuestion.type === 'imageChange' && currentQuestion.image) {
    questionImage.src = currentQuestion.image;
  }
});

questionImage.addEventListener('mouseleave', () => {
  const currentQuestion = questions[currentQuestionIndex];
  if (currentQuestion.type === 'imageChange' && currentQuestion.image) {
    questionImage.src = currentQuestion.image;
  }
});


  // Botón de inicio
  document.getElementById("start-button").addEventListener("click", () => {
    document.getElementById("start-button-container").style.display = "none";
    toggleButton.style.display = "block";
    document.querySelector(".container").style.display = "flex";

    const audio = document.getElementById("background-music");
    audio.play().catch(console.error);

    loadQuestion();
  });

  toggleButton.addEventListener('click', () => {
    audioPaused = !audioPaused;
    toggleButton.textContent = audioPaused ? 'Activar Lectura' : 'Cancelar Lectura';
  });


});
