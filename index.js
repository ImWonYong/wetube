import express from "express";
const app = express();

const PORT = 4000;

//리스닝 콜백 함수를 주어 서버가 켜졌는지 콘솔로 확인하게 함
const handleListening = () =>
  console.log(`Listening on: http://localhost:${PORT}`);

const handleHome = (req, res) => res.send("Hello from Home!!");

const handleProfile = (req, res) => res.send("You are on my profile");

const handleBetween = (req, res, next) => {
  console.log("between");
  next();
};

app.use(handleBetween);

app.get("/", handleHome);

app.get("/profile", handleProfile);

app.listen(PORT, handleListening);