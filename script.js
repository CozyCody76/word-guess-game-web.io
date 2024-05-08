const main_container = document.querySelector(".main_container"),
  btn_container = document.querySelector(".btn_container"),
  start_btn = btn_container.querySelector(".play"),
  giveup_btn = btn_container.querySelector(".give_up"),
  row = 6,
  transitionTime = 250;

let currentRow = 0,
  currentColumn = 0,
  column,
  listenerEnable = false;
(game_state_start = false), (word_to_guess = ""), (arr_letter = []);

function fetchAPI() {
  main_container.innerHTML = `<p>loading...<p>`;
  currentRow = 0;
  let length = Math.floor(Math.random() * 4) + 3;
  let api = `https://random-word-api.herokuapp.com/word?length=${length}`;

  fetch(api)
    .then((res) => {
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      return res.json();
    })
    .then((data) => {
      word_to_guess = data[0];
      column = data[0].length;
      renderUI(row, column);
    });
}

function renderUI(r, c) {
  main_container.innerHTML = ``;
  for (let i = 0; i < r; i++) {
    let sub_container = document.createElement("div");
    sub_container.classList.add("sub_container");
    for (let j = 0; j < c; j++) {
      let card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
      <div class="card_inner">
        <div class="card_front"></div>
        <div class="card_back"></div>
      </div>
      `;
      sub_container.append(card);
    }
    main_container.append(sub_container);
  }
}

function handleKeypress(e) {
  if (listenerEnable) {
    console.log(currentRow);
    let sub_containers = main_container.querySelectorAll(".sub_container");
    let sub_container = sub_containers[currentRow];
    let cards = sub_container.querySelectorAll(".card");
    let current_card = cards[currentColumn].querySelector(".card_inner");
    let letter = e.key;
    arr_letter.push(letter);
    current_card.querySelector(".card_back").innerText = letter.toUpperCase();
    current_card.style.transform = "rotateY(180deg)";

    currentColumn++;

    if (currentColumn == column) {
      listenerEnable = false;
      currentColumn = 0;
      currentRow++;
      setTimeout(() => {
        checkPos(sub_container);
      }, transitionTime * 2);
    }
  }
}

function checkPos(r) {
  let milliseconds = column * transitionTime;
  let temp_arr = r.querySelectorAll(".card_inner");
  let same_letter = 0;

  temp_arr.forEach((card, i) => {
    card.style.transitionDelay = transitionTime * i + "ms";
    card.style.transform = "rotateY(540deg)";
    setTimeout(() => {
      if (arr_letter[i] == word_to_guess[i]) {
        card.classList.add("pos_same");
        same_letter++;
      } else if (word_to_guess.includes(arr_letter[i])) {
        card.classList.add("letter_same");
      } else {
        card.classList.add("not_same");
      }
    }, transitionTime * i + transitionTime);
  });

  setTimeout(() => {
    listenerEnable = true;
    arr_letter = [];

    if (same_letter == column) {
      console.log("win");
      game_state_start = false;
      listenerEnable = false;
      temp_arr.forEach((card) => {
        card.style.transform = `rotateY(1260deg) scale(0.85)`;
      });

      setTimeout(() => {
        switchBtnState();
      }, milliseconds + transitionTime * 2);
    }

    if (currentRow == row) {
      currentRow -= 1;
      console.log(currentRow);
      giveup();
    }
  }, milliseconds + transitionTime);
}

window.addEventListener("keypress", handleKeypress);

function switchBtnState() {
  if (game_state_start) {
    start_btn.disabled = true;
    giveup_btn.disabled = false;
  } else {
    start_btn.disabled = false;
    giveup_btn.disabled = true;
  }
}

start_btn.addEventListener("click", () => {
  if (game_state_start == false) {
    fetchAPI();
    listenerEnable = true;
    game_state_start = true;
    switchBtnState();
  }
});

giveup_btn.addEventListener("click", () => {
  if (game_state_start == true) {
    giveup();
  }
});

function giveup() {
  game_state_start = false;
  listenerEnable = false;

  let cards = [...main_container.querySelectorAll(".sub_container")][
    currentRow
  ].querySelectorAll(".card_inner");

  cards.forEach((card, i) => {
    card.style.transitionDelay = transitionTime * i + "ms";
    card.style.transform = "rotateY(1260deg) scale(0.85)";
    setTimeout(() => {
      card.classList.add("give_up");
      card.querySelector(".card_back").innerText =
        word_to_guess[i].toUpperCase();
    }, transitionTime * i + transitionTime);
  });
  switchBtnState();
}
