import { applyVoteStyle } from "./applyVoteStyle.js";

const listOfVideoesElement = document.getElementById("listOfRequests");

export function renderSingleVideoRequest(videoInfo, state, isPrepend = false) {
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
          <strong>${new Date(
            videoInfo.submit_date
          ).toLocaleDateString()}</strong>
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
  applyVoteStyle(
    videoInfo._id,
    videoInfo.votes,
    state,
    videoInfo.status === "done"
  );

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
          applyVoteStyle(
            id,
            data,
            state,
            videoInfo.status === "done",
            vote_type
          );
        });
    });
  });
}
