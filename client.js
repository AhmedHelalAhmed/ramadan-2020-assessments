const listOfVideoesElement = document.getElementById("listOfRequests");
let sortBy = "newFist";
let searchTerm = "";

function renderSingleVideoRequest(videoInfo, isPrepend = false) {
  const videoRequestContainerElement = document.createElement("div"); // this is node
  // binding data
  videoRequestContainerElement.innerHTML = `
  <div class="card mb-3">
    <div class="card-body d-flex justify-content-between flex-row">
      <div class="d-flex flex-column">
        <h3>${videoInfo.topic_title}</h3>
        <p class="text-muted mb-2">${videoInfo.topic_details}</p>
        <p class="mb-0 text-muted">

         ${
           videoInfo.expected_result &&
           `<strong>Expected results:</strong> ${videoInfo.expected_result}`
         }
        </p>
      </div>
      <div class="d-flex flex-column text-center">
        <a id="votes_ups_${videoInfo._id}" class="btn btn-link">🔺</a>
        <h3 id="score_vote_${videoInfo._id}">${
    videoInfo.votes.ups - videoInfo.votes.downs
  }</h3>
        <a id="votes_downs_${videoInfo._id}" class="btn btn-link">🔻</a>
      </div>
      </div>
      <div class="card-footer d-flex flex-row justify-content-between">
      <div>
        <span class="text-info">${videoInfo.status.toUpperCase()}</span>
        &bullet; added by <strong>${videoInfo.author_name}</strong> on
        <strong>${new Date(videoInfo.submit_date).toLocaleDateString()}</strong>
      </div>
      <div
        class="d-flex justify-content-center flex-column 408ml-auto mr-2"
      >
        <div class="badge badge-success">
          ${videoInfo.target_level}
        </div>
      </div>
    </div>
  </div>
  `;
  if (isPrepend) {
    listOfVideoesElement.prepend(videoRequestContainerElement);
  } else {
    listOfVideoesElement.appendChild(videoRequestContainerElement);
  }

  const voteUpsElement = document.getElementById(`votes_ups_${videoInfo._id}`);
  const voteDownsElement = document.getElementById(
    `votes_downs_${videoInfo._id}`
  );
  const scoreVoteElement = document.getElementById(
    `score_vote_${videoInfo._id}`
  );

  voteUpsElement.addEventListener("click", (e) => {
    fetch("//localhost:7777/video-request/vote", {
      method: "PUT",
      headers: {
        "content-Type": "application/json",
      },
      // as we send json then we need to make it string
      body: JSON.stringify({
        id: videoInfo._id,
        vote_type: "ups",
      }),
    }) // it return promise => blo=>then pase it as json
      .then((bolb) => bolb.json())
      .then((data) => {
        scoreVoteElement.innerText = data.ups - data.downs;
      });
  });

  voteDownsElement.addEventListener("click", (e) => {
    fetch("//localhost:7777/video-request/vote", {
      method: "PUT",
      headers: {
        "content-Type": "application/json",
      },
      // as we send json then we need to make it string
      body: JSON.stringify({
        id: videoInfo._id,
        vote_type: "downs",
      }),
    }) // it return promise => blo=>then pase it as json
      .then((bolb) => bolb.json())
      .then((data) => {
        scoreVoteElement.innerText = data.ups - data.downs;
      });
  });
}

function loadAllVideoRequests(sortBy = "newFirst", searchTerm = "") {
  fetch(
    `//localhost:7777/video-request?sortBy=${sortBy}&searchTerm=${searchTerm}`
  )
    .then((bolb) => bolb.json())
    // .then((data) => console.log(data))
    .then((data) => {
      listOfVideoesElement.innerHTML = "";
      data.forEach((videoInfo) => {
        // debugger;
        renderSingleVideoRequest(videoInfo);
      });
    });
}

function debounce(fn, time) {
  // delay then do action
  let timeout;

  return function (...args) {
    clearTimeout(timeout);
    // apply to apply current context
    timeout = setTimeout(() => fn.apply(this, args), time);
  };
}

document.addEventListener("DOMContentLoaded", function () {
  /*
    this will fire after dom elements loaded and before images and css loaded
    but
    window.load event => will fire when every thing is loaded
  */
  const formVideoRequestElement = document.getElementById("formVideoRequest");

  const sortByElements = document.querySelectorAll("[id*=sort_by_]");

  const searchBoxElement = document.getElementById("search_box");

  loadAllVideoRequests();

  sortByElements.forEach((element) => {
    element.addEventListener("click", function (e) {
      e.preventDefault();

      sortBy = this.querySelector("input").value;
      loadAllVideoRequests(sortBy, searchTerm);

      this.classList.add("active");

      if (sortBy === "topVotedFirst") {
        document.getElementById("sort_by_new").classList.remove("active");
      } else {
        document.getElementById("sort_by_top").classList.remove("active");
      }
    });
  });

  searchBoxElement.addEventListener(
    "input",
    debounce((e) => {
      // console.log(e.target.value);
      searchTerm = e.target.value;

      // undefined to take the default
      loadAllVideoRequests(sortBy, searchTerm);
    }, 500)
  );

  formVideoRequestElement.addEventListener("submit", (e) => {
    e.preventDefault();
    /*
      fetch("//localhost:7777/video-request");
      this will make get request and reply with promise
    */
    const formData = new FormData(formVideoRequestElement);

    fetch("//localhost:7777/video-request", {
      method: "POST",
      /*
        // here you send data as json
        body: JSON.stringify({
          author_name: "Macey Bell",
          author_email: "jigiwegev@mailinator.net",
          topic_title: "Qui ut rerum quo sae",
          target_level: "medium",
          topic_details: "Eum ut earum enim es",
          expected_result: "Sed sequi veniam ut",
        }),
      */
      // another way to send data with form data
      body: formData, // this expect in server to deal with data multi part like you upload file
    })
      .then((bolb) => bolb.json()) // to be sure that data is json
      .then((data) => {
        formVideoRequestElement.reset();
        renderSingleVideoRequest(data, true);
      });
  });
});
