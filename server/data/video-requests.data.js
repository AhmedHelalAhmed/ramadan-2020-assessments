const VideoRequest = require("./../models/video-requests.model");
const User = require("./../models/user.model");

module.exports = {
  createRequest: async (vidRequestData) => {
    const authorId = vidRequestData.author_id;
    if (authorId) {
      // this tell js to await in this line => instead of using promise and then word
      const userObject = await User.findOne({ _id: authorId });
      vidRequestData.author_name = userObject.author_name;
      vidRequestData.author_email = userObject.author_email;
    }
    let newRequest = new VideoRequest(vidRequestData);
    return newRequest.save();
  },

  getAllVideoRequests: (top) => {
    // descending => new first
    return VideoRequest.find({}).sort({ submit_date: "-1" }).limit(top);
  },

  searchRequests: (topic) => {
    return VideoRequest.find({
      topic_title: { $regex: topic, $options: "i" },
    }).sort({ addedAt: "-1" });
  },

  getRequestById: (id) => {
    return VideoRequest.findById({ _id: id });
  },

  updateRequest: (id, newVidDetails) => {
    return VideoRequest.findByIdAndUpdate(id, newVidDetails);
  },

  updateVoteForRequest: async (id, vote_type) => {
    const oldRequest = await VideoRequest.findById({ _id: id });
    const other_type = vote_type === "ups" ? "downs" : "ups";
    return VideoRequest.findByIdAndUpdate(
      { _id: id },
      {
        votes: {
          [vote_type]: ++oldRequest.votes[vote_type],
          [other_type]: oldRequest.votes[other_type],
        },
      },
      {
        new: true, // option to return new object not old one
      }
    );
  },

  deleteRequest: (id) => {
    return VideoRequest.deleteOne({ _id: id });
  },
};
