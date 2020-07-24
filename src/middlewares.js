import path from "path";
import routes from "./routes";
import multerS3 from "multer-s3";
import aws from "aws-sdk";
import multer from "multer";

export const s3 = new aws.S3({
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_PRIVATE_KEY,
  region: "ap-northeast-2",
});

const multerVideo = multer({
  storage: multerS3({
    s3,
    acl: "public-read",
    bucket: "wywetube/video",
    key: function (req, file, cb) {
      const extension = path.extname(file.originalname);
      cb(
        null,
        // 임의 파일 이름 생성 + 확장자
        Math.random().toString(36).substring(2, 12) +
          Date.now().toString() +
          extension
      );
    },
  }),
});
const multerAvatar = multer({
  storage: multerS3({
    s3,
    acl: "public-read",
    bucket: "wywetube/avatar",
  }),
});

export const uploadVideo = multerVideo.single("videoFile");
export const uploadAvatar = multerAvatar.single("avatar");

export const localMiddleware = (req, res, next) => {
  res.locals.siteName = "WeTube";
  res.locals.routes = routes;
  res.locals.loggedUser = req.user || null;
  next();
};

export const onlyPublic = (req, res, next) => {
  if (req.user) {
    res.redirect(routes.home);
  } else {
    next();
  }
};

export const onlyPrivate = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.redirect(routes.home);
  }
};
