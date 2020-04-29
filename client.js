document.addEventListener("DOMContentLoaded", function () {
  /*
            this will fire after dom elements loaded and before images and css loaded
            but
            window.load event => will fire when every thing is loaded
          */
  const formVidReq = document.getElementById("formVideoRequest");
  let videos = [];

  // loadVideos();

  formVidReq.addEventListener("submit", (e) => {
    e.preventDefault();
    /*
            fetch("//localhost:7777/video-request");
            this will make get request and reply with promise
            */

    const formData = new FormData(formVidReq);
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
      .then((bold) => bold.json()) // to be sure that data is json
      .then((data) => {
        console.log(data);
      });
  });
});

function loadVideos() {
  let request = new XMLHttpRequest();
  request.addEventListener("load", (e) => {
    videos = JSON.parse(request.response);
    let referenceCard = document.getElementsByClassName("card")[0];
    referenceCard.setAttribute("style", "display:none");
    videos.forEach((element, key) => {
      let card = referenceCard.cloneNode(true);
      card.childNodes[1].childNodes[1].childNodes[1].textContent =
        "Title " + key;
      card.style = "";
      document.getElementById("listOfRequests").appendChild(card);
    });
  });
  request.open("get", "//localhost:7777/video-request");
  request.send();
}
