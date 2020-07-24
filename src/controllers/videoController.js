import routes from "../routes";
import Video from "../models/Video";
import Comment from "../models/Comment";
import { s3 } from "../middlewares";

export const home = async (req, res) => {
  try {
    const videos = await Video.find({}).sort({ _id: -1 });
    res.render("home", { pageTitle: "Home", videos });
  } catch (error) {
    console.log(error);
    res.render("home", { pageTitle: "Home", videos: [] });
  }
};

export const search = async (req, res) => {
  const {
    query: { term: searchingBy },
  } = req;
  let videos = [];
  try {
    videos = await Video.find({
      title: { $regex: searchingBy, $options: "i" },
    });
  } catch (error) {
    console.log(error);
  }
  res.render("search", { pageTitle: "Search", searchingBy, videos });
};

export const getUpload = (req, res) =>
  res.render("upload", { pageTitle: "Video Detail" });

export const postUpload = async (req, res) => {
  const {
    body: { title, description },
    file: { location },
  } = req;
  const newVideo = await Video.create({
    fileUrl: location,
    title,
    description,
    creator: req.user.id,
  });
  req.user.videos.push(newVideo.id);
  req.user.save();
  res.redirect(routes.videoDetail(newVideo.id));
};

export const videoDetail = async (req, res) => {
  const {
    params: { id },
  } = req;
  try {
    const video = await Video.findById(id)
      .populate("creator")
      .populate("comments");
    res.render("videoDetail", { pageTitle: video.title, video });
  } catch (error) {
    console.log(error);
    res.redirect(routes.home);
  }
};

export const getEditVideo = async (req, res) => {
  const {
    params: { id },
  } = req;
  try {
    const video = await Video.findById(id);
    if (String(video.creator) !== req.user.id) {
      throw Error();
    } else {
      res.render("editVideo", { pageTitle: `Edit ${video.title}`, video });
    }
  } catch (error) {
    res.redirect(routes.home);
  }
};

export const postEditVideo = async (req, res) => {
  const {
    params: { id },
    body: { title, description },
  } = req;
  try {
    await Video.findOneAndUpdate({ _id: id }, { title, description });
    res.redirect(routes.videoDetail(id));
  } catch (error) {
    res.redirect(routes.home);
  }
};

// export const deleteVideo = async (req, res) => {
//   const {
//     params: { id },
//   } = req;
//   try {
//     const video = await Video.findById(id);
//     if (String(video.creator) !== req.user.id) {
//       throw Error();
//     } else {
//       await Video.findOneAndDelete({ _id: id });
//     }
//   } catch (error) {
//     console.log(error);
//   }
//   res.redirect(routes.home);
// };

// 비디오 삭제 시 aws에 올라간 비디오도 삭제하기
export const deleteVideo = async (req, res) => {
  const {
    params: { id },
  } = req;
  try {
    const currentPost = await Video.findById(id);
    if (String(currentPost.creator) !== req.user.id) {
      throw Error();
    } else {
      const regex = /(http[s]?:\/\/)?([^\/\s]+\/)(.*)/;
      const filePath = await currentPost.fileUrl.match(regex)[3];

      const delFile = {
        Bucket: "wywetube/video",
        Key: filePath,
      };

      await s3
        .deleteObject(delFile, function (err, data) {
          if (err) console.log(err);
          else console.log("The file has been removed");
        })
        .promise();

      await Video.findOneAndDelete({ _id: id });
    }
  } catch {
    res.status(400);
  } finally {
    res.redirect(routes.home);
  }
};

// Register Video view

export const postRegisterView = async (req, res) => {
  const {
    params: { id },
  } = req;
  try {
    const video = await Video.findById(id);
    video.views += 1;
    video.save();
    res.status(200);
  } catch (error) {
    res.status(400);
  } finally {
    res.end();
  }
};

// Add Comment

export const postAddComment = async (req, res) => {
  const {
    params: { id },
    body: { comment },
    user,
  } = req;
  try {
    const video = await Video.findById(id);
    const newComment = await Comment.create({
      text: comment,
      creator: user.id,
    });
    video.comments.push(newComment.id);
    video.save();
  } catch (error) {
    res.status(400);
  } finally {
    res.end();
  }
};
