import express from "express";
import mysql from "mysql2/promise";

// DB 설정
const pool = mysql.createPool({
  host: "localhost",
  user: "newbean",
  password: "juv0312",
  database: "wise_saying",
  waitForConnections: true, // 연결하는 동안 대기 여부
  connectionLimit: 10, // 연결 제한 개수
  queueLimit: 0, // 최대 0(제한없음)개의 연결 요청을 대기열에 추가
});

const app = express();
app.use(express.json());
const port = 3000;

const wiseSayings = [
  {
    content: "나는 의적이다.",
    author: "홍길동",
  },
  {
    content: "나는 도적이다.",
    author: "임꺽정",
  },
];

app.get("/wise-sayings", async (req, res) => {
  // 쿼리를 가져옴
  const [rows] = await pool.query("SELECT * FROM wise_saying ORDER BY id DESC");

  // json으로 담음
  res.json(rows);
});

app.post("/wise-sayings", async (req, res) => {
  const { author, content } = req.body;

  if (!author) {
    res.status(400).json({
      msg: "author required",
    });
    return;
  }

  if (!content) {
    res.status(400).json({
      msg: "content required",
    });
    return;
  }

  const [rs] = await pool.query(
    `
    INSERT INTO wise_saying
    SET regDate = NOW(),
    content = ?,
    author = ?
    `,
    [content, author]
  );

  // 성공 및 전송
  res.status(201).json({
    id: rs.insertId,
  });
});

// 데이터를 원하는 id만 받아오기
app.get("/wise-sayings/:id", async (req, res) => {
  // 요청을 보냄
  const { id } = req.params;
  const [rows] = await pool.query("SELECT * FROM wise_saying WHERE id = ?", [
    id,
  ]);

  // 없는 id를 요청하는 경우
  if (rows.length == 0) {
    res.status(404).send("not found");
    return;
  }

  // json으로 담음s
  res.json(rows[0]);
});

// 데이터 삭제
app.delete("/wise-sayings/:id", async (req, res) => {
  // 요청을 보냄
  const { id } = req.params;
  const [rows] = await pool.query("SELECT * FROM wise_saying WHERE id = ?", [
    id,
  ]);

  // 없는 id를 요청하는 경우
  if (rows.length == 0) {
    res.status(404).send("not found");
    return;
  }

  const [rs] = await pool.query(
    `
    DELETE FROM wise_saying
    WHERE id = ?
    `,
    [id]
  );

  res.status(200).json({
    id,
  })
  
  // json으로 담음
  res.json(rows[0]);
});

// 데이터 수정
app.patch("/wise-sayings/:id", async (req, res) => {
  // 요청을 보냄
  const { id } = req.params;
  const { author, content } = req.body;
  const [rows] = await pool.query("SELECT * FROM wise_saying WHERE id = ?", [
    id,
  ]);

  if (rows.length == 0) {
    res.status(404).send("not found");
    return;
  }

  if (rows.author == 0) {
    res.status(400).json({
      msg: "author required",
    });
    return;
  }

  if (!content) {
    res.status(400).json({
      msg: "content required",
    });
    return;
  }

  const [rs] = await pool.query(
    `
    UPDATE wise_saying
    SET content = ?,
    author = ?
    WHERE id = ?
    `,
    [content, author, id]
  );

  res.status(201).json({
    id,
    author,
    content,
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
