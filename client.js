import { debounce } from "./debounce.js";
import { renderSingleVideoRequest } from "./renderSingleVideoRequest.js";
import { checkValidity } from "./checkValidity.js";
import API from "./api.js";

const SUPER_USER_ID = "19900411";

// if you made load it will come back to this default value
// state is not persisted
export const state = {
  sortBy: "newFist",
  searchTerm: "",
  filterBy: "all",
  userId: "",
  isSuperUser: false,
};

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

  API.loadAllVideoRequests();

  filterByElements.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      state.filterBy = e.target.getAttribute("id").split("_")[2];

      filterByElements.forEach((option) => option.classList.remove("active"));
      this.classList.add("active");
      API.loadAllVideoRequests(state.sortBy, state.searchTerm, state.filterBy);
    });
  });

  sortByElements.forEach((element) => {
    element.addEventListener("click", function (e) {
      e.preventDefault();

      state.sortBy = this.querySelector("input").value;
      API.loadAllVideoRequests(state.sortBy, state.searchTerm, state.filterBy);

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
      API.loadAllVideoRequests(state.sortBy, state.searchTerm, state.filterBy);
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
        renderSingleVideoRequest(data, state, true);
      });
  });
});
