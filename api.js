import { renderSingleVideoRequest } from "./renderSingleVideoRequest.js";
import { state } from "./client.js";
export default {
  updateVideoStatus: (id, status, resVideo = "") => {
    fetch("//localhost:7777/video-request", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, resVideo }),
    })
      .then((res) => res.json())
      .then((data) => window.location.reload());
  },
  loadAllVideoRequests: (
    sortBy = "newFirst",
    searchTerm = "",
    filterBy = "all",
    localState = state
  ) => {
    const listOfVideoesElement = document.getElementById("listOfRequests");

    fetch(
      `//localhost:7777/video-request?sortBy=${sortBy}&searchTerm=${searchTerm}&filterBy=${filterBy}`
    )
      .then((bolb) => bolb.json())
      // .then((data) => console.log(data))
      .then((data) => {
        listOfVideoesElement.innerHTML = "";
        data.forEach((videoInfo) => {
          // debugger;
          renderSingleVideoRequest(videoInfo, localState);
        });
      });
  },
};
