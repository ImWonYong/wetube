export const home = (req, res) =>
  res.render("home", { pageTitle: "Home", potato: 1234 });
export const search = (req, res) =>
  res.render("search", { pageTitle: "Search" });
export const videos = (req, res) =>
  res.render("videos", { pageTitle: "Upload" });
export const upload = (req, res) =>
  res.render("upload", { pageTitle: "Video Detail" });
export const videoDetail = (req, res) =>
  res.render("videoDetail", { pageTitle: "Video Detail" });
export const editVideo = (req, res) =>
  res.render("editVideo", { pageTitle: "Edit Video" });
export const deleteVideo = (req, res) =>
  res.render("deleteVideo", { pageTitle: "Delete Video" });
