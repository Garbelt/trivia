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
          { text: 'CHINGOLO.', correct: false, audio: 'audio/CHINGOLO.mp3' },
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
      options.forEach(option => option.style.pointerEvents = 'auto');
      questionElement.style.pointerEvents = 'auto';
      questionElement.style.cursor = 'pointer';
      questionElement.classList.add('clickable-hover');

      if (['imageChange', 'imageaudio'].includes(questions[currentQuestionIndex].type)) {
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
      options.forEach(option => option.style.pointerEvents = 'none');

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
      reloj.style.background = `conic-gradient(from 0deg at 50% 50%, #2ecc71 ${porcentajeInvertido}%, #ecf0f1 ${porcentajeInvertido}%)`;
      reloj.textContent = `${tiempoRestante}`;
  }

  function playAudio(audioSrc) {
      const audio = new Audio(audioSrc);
      audio.play().catch(error => console.error('Audio playback failed:', error));
      return audio;
  }

  function playOptionAudio(event) {
      optionAudioPlayers.forEach(player => {
          player.pause();
          player.currentTime = 0;
      });
      optionAudioPlayers = [];

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

  // ---------- Aquí va la versión completa y corregida de loadQuestion ----------
  function loadQuestion() {
      if (questionAudioPlayer) {
          questionAudioPlayer.pause();
          questionAudioPlayer.removeEventListener('ended', questionAudioPlayer._onEndedHandler);
          questionAudioPlayer = null;
      }

      const currentQuestion = questions[currentQuestionIndex];
      questionElement.textContent = currentQuestion.question;

      optionsElement.innerHTML = '';
      questionImage.style.display = currentQuestion.image ? 'block' : 'none';
      questionImage.src = currentQuestion.image || '';
      imageCell.style.display = currentQuestion.image ? 'table-cell' : 'none';
      questionImage.dataset.secondImage = currentQuestion.secondImage || '';
      questionImage.dataset.birdAudio = currentQuestion.birdAudio || '';

      // Limpiar listeners antiguos
      ['mousedown', 'mouseup', 'mouseleave', 'click'].forEach(ev => {
          if (questionImage['_'+ev+'Handler']) {
              questionImage.removeEventListener(ev, questionImage['_'+ev+'Handler']);
              questionImage['_'+ev+'Handler'] = null;
          }
      });
      if (questionImage._timeoutId) {
          clearTimeout(questionImage._timeoutId);
          questionImage._timeoutId = null;
      }

      shuffleArray(currentQuestion.options);
      currentQuestion.options.forEach(option => {
          const li = document.createElement('li');
          li.textContent = option.text;
          li.dataset.correct = option.correct;
          li.dataset.audio = option.audio;
          li.style.pointerEvents = 'none';
          li.addEventListener('click', handleOptionClick);
          li.addEventListener('mouseover', playOptionAudio);
          optionsElement.appendChild(li);
      });

      repeatQuestionAudio = new Audio(currentQuestion.audio);
      questionAudioPlayer = repeatQuestionAudio;
      disableOptions();

      function onQuestionAudioEnded() {
          enableOptions();
          iniciarTemporizador();

          questionElement.classList.add('clickable-hover');
          questionElement.style.cursor = 'pointer';
          questionElement.onclick = () => {
              if (repeatQuestionAudio) {
                  repeatQuestionAudio.pause();
                  repeatQuestionAudio.currentTime = 0;
                  repeatQuestionAudio.play().catch(console.error);
              }
          };

          const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

          if (currentQuestion.type === 'imageChange' && questionImage.dataset.secondImage) {
              questionImage.style.pointerEvents = 'auto';
              questionImage.classList.add('clickable-hover');

              if (isTouchDevice) {
                  const clickHandler = () => {
                      const secondImage = questionImage.dataset.secondImage;
                      const originalImage = currentQuestion.image;
                      const isSecond = questionImage.src.includes(secondImage);
                      if (!isSecond) {
                          questionImage.src = secondImage;
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
                  };
                  questionImage._clickHandler = clickHandler;
                  questionImage.addEventListener('click', clickHandler);
              } else {
                  const mousedownHandler = () => { questionImage.src = questionImage.dataset.secondImage; };
                  const mouseupHandler = () => { questionImage.src = currentQuestion.image; };
                  const mouseleaveHandler = () => { questionImage.src = currentQuestion.image; };
                  questionImage._mousedownHandler = mousedownHandler;
                  questionImage._mouseupHandler = mouseupHandler;
                  questionImage._mouseleaveHandler = mouseleaveHandler;
                  questionImage.addEventListener('mousedown', mousedownHandler);
                  questionImage.addEventListener('mouseup', mouseupHandler);
                  questionImage.addEventListener('mouseleave', mouseleaveHandler);
              }
          } else if (currentQuestion.type === 'soloaudio' && currentQuestion.audioImage) {
              questionImage.style.pointerEvents = 'auto';
              questionImage.classList.add('clickable-hover');
              questionImage.onclick = () => {
                  if (repeatBirdAudio) {
                      repeatBirdAudio.pause();
                      repeatBirdAudio.currentTime = 0;
                  }
                  repeatBirdAudio = new Audio(currentQuestion.audioImage);
                  repeatBirdAudio.play().catch(console.error);
              };
          } else if (currentQuestion.type === 'imageaudio' && currentQuestion.birdAudio) {
              const speakerButton = document.getElementById('speaker-button');
              speakerButton.style.pointerEvents = 'auto';
              speakerButton.style.opacity = '1';
              speakerButton._playAudioFunc = () => {
                  if (repeatBirdAudio) {
                      repeatBirdAudio.pause();
                      repeatBirdAudio.currentTime = 0;
                  }
                  repeatBirdAudio = new Audio(currentQuestion.birdAudio);
                  repeatBirdAudio.play().catch(console.error);
              };
              speakerButton.onclick = speakerButton._playAudioFunc;
          }

          const musicaPregunta = document.getElementById('audio-musica-pregunta');
          musicaPregunta.volume = 1;
          musicaPregunta.currentTime = 0;
          musicaPregunta.play().catch(console.error);
      }

      questionAudioPlayer._onEndedHandler = onQuestionAudioEnded;
      questionAudioPlayer.addEventListener('ended', onQuestionAudioEnded);
      questionAudioPlayer.play().catch(console.error);
  }

  // Aquí seguirían todas las demás funciones: handleOptionClick, fadeOutAudio, etc., igual que tu código original.

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
