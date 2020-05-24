const listOfVideoesElement = document.getElementById("listOfRequests");

const SUPER_USER_ID = "19900411";

// if you made load it will come back to this default value
// state is not persisted
const state = {
  sortBy: "newFist",
  searchTerm: "",
  filterBy: "all",
  userId: "",
  isSuperUser: false,
};

function renderSingleVideoRequest(videoInfo, isPrepend = false) {
  const videoRequestContainerElement = document.createElement("div"); // this is node
  // binding data
  videoRequestContainerElement.innerHTML = `
  <div class="card mb-3">
  ${
    state.isSuperUser
      ? `<div class="card-header d-flex justify-content-between">
  <select id="admin_change_status_${videoInfo._id}">
  <option value="new">new</option>
  <option value="planned">planned</option>
  <option value="done">done</option>
  </select>
  <div class="input-group ml-2 mr-5 ${
    videoInfo.status !== "done" ? "d-none" : ""
  }" id="admin_video_res_container_${videoInfo._id}">
    <input type="text" class="form-control" 
          id="admin_video_res_${videoInfo._id}"
          placeholder="paste here youtube video id"/>
    <div class="input-group-append">
    <button id="admin_save_video_res_${
      videoInfo._id
    }" class="btn btn-outline-secondary" type="button">Save</button>
    </div>
  </div>
  <button id="admin_delete_video_req_${
    videoInfo._id
  }" class="btn btn-danger" type="button">delete</button>
  </div>`
      : ""
  }
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

    ${
      videoInfo.status === "done"
        ? `  <div class="ml-auto mr-3">
      <iframe width="240" height="135"
      src="http://www.youtube.com/embed/${videoInfo.video_ref.link}"
      frameborder="0" allowfullscreen></iframe>
      </div>`
        : ""
    }
      <div class="d-flex flex-column text-center">
        <a id="votes_ups_${videoInfo._id}" class="btn btn-link">🔺</a>
        <h3 id="score_vote_${videoInfo._id}">${
    videoInfo.votes.ups.length - videoInfo.votes.downs.length
  }</h3>
        <a id="votes_downs_${videoInfo._id}" class="btn btn-link">🔻</a>
      </div>
      </div>
      <div class="card-footer d-flex flex-row justify-content-between">
      <div class="${
        videoInfo.status === "done"
          ? "text-success"
          : videoInfo.status === "planned"
          ? "text-primary"
          : ""
      }">
        <span>${videoInfo.status.toUpperCase()} ${
    videoInfo.status === "done"
      ? ` on ${new Date(videoInfo.video_ref.date).toLocaleDateString()}`
      : ""
  }</span>
        &bullet; added by <strong>${videoInfo.author_name}</strong> on
        <strong>${new Date(videoInfo.submit_date).toLocaleDateString()}</strong>
      </div>
      <divstatus
        class="d-flex justify-content-center flex-column 408ml-auto mr-2"
      >
        <div class="badge badge-success">
          ${videoInfo.target_level}
        </div>
      </divstatus>
    </div>
  </div>
  `;
  if (isPrepend) {
    listOfVideoesElement.prepend(videoRequestContainerElement);
  } else {
    listOfVideoesElement.appendChild(videoRequestContainerElement);
  }

  const adminChangeStatusElement = document.getElementById(
    `admin_change_status_${videoInfo._id}`
  );
  const adminVideoResolutionElement = document.getElementById(
    `admin_video_res_${videoInfo._id}`
  );
  const adminVideoResolutionContainer = document.getElementById(
    `admin_video_res_container_${videoInfo._id}`
  );
  const adminSaveVideoResolutionElement = document.getElementById(
    `admin_save_video_res_${videoInfo._id}`
  );
  const adminDeleteVideoRequestElement = document.getElementById(
    `admin_delete_video_req_${videoInfo._id}`
  );
  if (state.isSuperUser) {
    adminChangeStatusElement.value = videoInfo.status;
    adminVideoResolutionElement.value = videoInfo.video_ref.link;

    adminChangeStatusElement.addEventListener("change", (e) => {
      if (e.target.value === "done") {
        adminVideoResolutionContainer.classList.remove("d-none");
      } else {
        updateVideoStatus(videoInfo._id, e.target.value);
      }
    });

    adminSaveVideoResolutionElement.addEventListener("click", (e) => {
      e.preventDefault();

      if (!adminVideoResolutionElement.value) {
        adminVideoResolutionElement.classList.add("is-invalid");
        adminVideoResolutionElement.addEventListener("input", (_) => {
          adminVideoResolutionElement.classList.remove("is-invalid");
        });
        return;
      }

      updateVideoStatus(
        videoInfo._id,
        "done",
        adminVideoResolutionElement.value
      );
    });

    adminDeleteVideoRequestElement.addEventListener("click", (e) => {
      e.preventDefault();

      const isSure = confirm(
        `Are you sure you want to delete "${videoInfo.topic_title}" ?`
      );

      if (!isSure) {
        return;
      }
      fetch("//localhost:7777/video-request", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: videoInfo._id }),
      })
        .then((res) => res.json())
        .then((data) => window.location.reload());
    });
  }
  applyVoteStyle(videoInfo._id, videoInfo.votes, videoInfo.status === "done");

  const scoreVoteElement = document.getElementById(
    `score_vote_${videoInfo._id}`
  );
  const votesElements = document.querySelectorAll(
    `[id^=votes_][id$=_${videoInfo._id}]`
  );

  votesElements.forEach((item) => {
    if (state.isSuperUser || videoInfo.status === "done") {
      return;
    }

    item.addEventListener("click", function (e) {
      e.preventDefault();
      const [, vote_type, id] = e.target.getAttribute("id").split("_");

      fetch("//localhost:7777/video-request/vote", {
        method: "PUT",
        headers: {
          "content-Type": "application/json",
        },
        // as we send json then we need to make it string
        body: JSON.stringify({
          id,
          vote_type,
          user_id: state.userId,
        }),
      }) // it return promise => blo=>then pase it as json
        .then((bolb) => bolb.json())
        .then((data) => {
          scoreVoteElement.innerText = data.ups.length - data.downs.length;
          applyVoteStyle(id, data, videoInfo.status === "done", vote_type);
        });
    });
  });
}

function loadAllVideoRequests(
  sortBy = "newFirst",
  searchTerm = "",
  filterBy = "all"
) {
  fetch(
    `//localhost:7777/video-request?sortBy=${sortBy}&searchTerm=${searchTerm}&filterBy=${filterBy}`
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

function checkValidity(formData) {
  const topic = formData.get("topic_title");
  const topicDetails = formData.get("topic_details");

  if (!topic || topic.length > 30) {
    document.querySelector("[name=topic_title]").classList.add("is-invalid");
  }

  if (!topicDetails) {
    document.querySelector("[name=topic_details]").classList.add("is-invalid");
  }

  const allInvalidElements = document
    .getElementById("formVideoRequest")
    .querySelectorAll(".is-invalid");

  if (allInvalidElements.length) {
    allInvalidElements.forEach((element) => {
      element.addEventListener("input", function () {
        this.classList.remove("is-invalid");
      });
    });

    return false;
  }

  return true;
}

function updateVideoStatus(id, status, resVideo = "") {
  fetch("//localhost:7777/video-request", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status, resVideo }),
  })
    .then((res) => res.json())
    .then((data) => window.location.reload());
}

function applyVoteStyle(video_id, votes_list, isDisabled, vote_type) {
  const voteUpsElement = document.getElementById(`votes_ups_${video_id}`);
  const voteDownsElement = document.getElementById(`votes_downs_${video_id}`);

  // super admin have no right to vote
  if (isDisabled) {
    voteUpsElement.style.opacity = "0.5";
    voteUpsElement.style.cursor = "not-allowed";
    voteDownsElement.style.opacity = "0.5";
    voteDownsElement.style.cursor = "not-allowed";

    return;
  }

  if (!vote_type) {
    if (votes_list.ups.includes(state.userId)) {
      vote_type = "ups";
    } else if (votes_list.downs.includes(state.userId)) {
      vote_type = "downs";
    } else {
      return;
    }
  }

  const voteDirectionElement =
    vote_type === "ups" ? voteUpsElement : voteDownsElement;
  const otherDirectionElement =
    vote_type === "ups" ? voteDownsElement : voteUpsElement;

  if (votes_list[vote_type].includes(state.userId)) {
    voteDirectionElement.style.opacity = 1;
    otherDirectionElement.style.opacity = "0.5";
  } else {
    otherDirectionElement.style.opacity = "1";
  }
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
  const filterByElements = document.querySelectorAll("[id^=filter_by_]");
  const formLoginElement = document.querySelector(".login-form");

  const appContentElement = document.querySelector(".app-content");

  // this return query string
  // it should this be two pages and between them routing
  // in this case the above you need
  // 1- server send html and you render it
  // 2- mange browser histroy (push in browser history this is loaded to enable back button in browser)
  // here we send post back with data and then hide and show depend on the data sent from server
  if (window.location.search) {
    state.userId = new URLSearchParams(window.location.search).get("id");

    if (state.userId === SUPER_USER_ID) {
      state.isSuperUser = true;
      document.querySelector(".normal-user-content").classList.add("d-none");
    }

    formLoginElement.classList.add("d-none");
    appContentElement.classList.remove("d-none");
  }

  loadAllVideoRequests();

  filterByElements.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      state.filterBy = e.target.getAttribute("id").split("_")[2];

      filterByElements.forEach((option) => option.classList.remove("active"));
      this.classList.add("active");
      loadAllVideoRequests(state.sortBy, state.searchTerm, state.filterBy);
    });
  });

  sortByElements.forEach((element) => {
    element.addEventListener("click", function (e) {
      e.preventDefault();

      state.sortBy = this.querySelector("input").value;
      loadAllVideoRequests(state.sortBy, state.searchTerm, state.filterBy);

      this.classList.add("active");

      if (state.sortBy === "topVotedFirst") {
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
      state.searchTerm = e.target.value;

      // undefined to take the default
      loadAllVideoRequests(state.sortBy, state.searchTerm, state.filterBy);
    }, 500)
  );

  formVideoRequestElement.addEventListener("submit", (e) => {
    e.preventDefault();
    /*
      fetch("//localhost:7777/video-request");
      this will make get request and reply with promise
    */
    const formData = new FormData(formVideoRequestElement);

    formData.append("author_id", state.userId);

    const isValid = checkValidity(formData);

    if (!isValid) {
      return;
    }

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
