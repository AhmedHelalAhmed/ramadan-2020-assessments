export function applyVoteStyle(
  video_id,
  votes_list,
  state,
  isDisabled,
  vote_type
) {
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
