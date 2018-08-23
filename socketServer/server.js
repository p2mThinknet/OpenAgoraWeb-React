const express = require('express');
const sequelize = require('sequelize');
// const socket_io = require('socket.io');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
// const WebSocketServer = require('ws').Server;
const fs = require('fs');
const AipFaceClient = require('baidu-aip-sdk').face;
const path = require('path');
const _ = require('lodash');
const moment = require('moment');

moment.locale('zh-CN');


// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// 设置APPID/AK/SK
const APP_ID = '11432170';
const API_KEY = 'PhVFDP290U64VM95V1jxnnSM';
const SECRET_KEY = '8YIIKy2gSnpQE8a2dn9F9jacVOOGxoyD';

// 新建一个对象，建议只保存一个对象调用服务接口
const falseClient = new AipFaceClient(APP_ID, API_KEY, SECRET_KEY);

// mysql connection
// const connection = mysql.createConnection({
//     host: 'mysql',
//     user: 'root',
//     password: 'DheY0a2VyB6SlcKq',
// });
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'thinknet',
  password: 'p2m13456',
});

connection.connect((err) => {
  if (err) {
    return console.error(`error: ${err.message}`);
  }

  const createDb = 'create database if not exists videoconference';
  connection.query(createDb, (err, results, fields) => {
    if (err) {
      console.log(`createDb${err.message}`);
    }
    const useDb = 'use videoconference';
    connection.query(useDb, (err, results, fields) => {
      if (err) {
        console.log(`useDb${err.message}`);
      }
      const createTable = `create table if not exists conference(
                          id int primary key auto_increment,
                          name varchar(255)not null
                      )`;

      connection.query(createTable, (err, results, fields) => {
        if (err) {
          console.log(`createTable${err.message}`);
        }
      });
    });
  });
});

// App
const app = express();
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use('/public', express.static(path.resolve(__dirname, 'public')));
app.set('view engine', 'ejs');

const http = require('http').Server(app);
const io = require('socket.io')(http);
const models = require('./models');

async function handleUserChat(data) {
  const d = /^([^:]*):(.*)$/.exec(data);
  if (!d) {
    console.error('userChat message format error.');
    return;
  }
  await models.UserChat.create({
    MeetingId: 1,
    username: d[1],
    message: d[2],
  });
  console.log(data);
  io.emit('userChat', data);
}

async function handleUserOnline(data) {
  const d = /^([^:]*):\s*([0-9]+)\s*/.exec(data);
  if (!d) {
    console.error('userOnline message format error.');
    return;
  }
  await models.UserOnline.create({
    MeetingId: 1,
    username: d[1],
    duration: parseInt(d[2]),
  });
  const userDurations = await models.UserOnline.findAll({
    attributes: [
      [sequelize.fn('sum', sequelize.col('duration')), 'duration'],
    ],
    group: ['username'],
    where: { username: d[1] },
  });
  io.emit('userOnline', `${d[1]}:${userDurations[0].duration}`);
}

io.on('connection', (socket) => {
  console.log(`a user connected---${socket.id}`);
  // disconnect
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  // 开始签到消息
  socket.on('startSignin', (data) => {
    io.emit('startSignin', data);
  });
  // 用户登录消息
  socket.on('loginInfo', (data) => {
    io.emit('loginInfo', data);
  });
  // 开始会议消息
  socket.on('startConference', async (data) => {
    await models.UserOnline.destroy({ truncate: true, cascade: false });
    await models.UserChat.destroy({ truncate: true, cascade: false });
    io.emit('startConference', data);
  });
  // 结束会议消息
  socket.on('stopConference', (data) => {
    io.emit('stopConference', data);
  });
  // 静音消息
  socket.on('controlMute', (data) => {
    io.emit('controlMute', data);
  });
  // 麦克风消息
  socket.on('controlSpeaker', (data) => {
    io.emit('controlSpeaker', data);
  });
  // 用户会议聊天信息
  socket.on('userChat', handleUserChat);

  // 用户在线时长
  socket.on('userOnline', handleUserOnline);
});

app.get('/', (req, res) => {
  res.send('Hello world\n');
});

const allFilesSync = (dir, fileList = []) => {
  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file);

    fileList.push(
      fs.statSync(filePath).isDirectory()
        ? { [file]: allFilesSync(filePath) }
        : file,
    );
  });
  return fileList;
};

app.post('/api/uploadFaceDetectImage', async (req, res) => {
  const files = allFilesSync('./photoLibrary');
  const base64Data = req.body.imageData.replace(/^data:image\/png;base64,/, '');
  let compareResult = false;
  let name = '';
  for (let i = 0; i < files.length; i++) {
    const result = await falseClient.match([{
      image: base64Data, // new Buffer(fs.readFileSync('./out.png')).toString('base64'),
      image_type: 'BASE64',
      // liveness_control: 'low' // none, low, normal, heigh
    }, {
      image: new Buffer(fs.readFileSync(`./photoLibrary/${files[i]}`)).toString('base64'),
      image_type: 'BASE64',
    }]);
    if (result.error_code === 0 && result.result.score > 90) {
      compareResult = true;
      name = files[i];
      score = result.result.score;
      break;
    }
  }
  res.json({
    success: true, compareResult, name, score,
  });
});

app.post('/api/detectFacesFromImage', async (req, res) => {
  const files = allFilesSync('./photoLibrary');
  // const base64Data = req.body.imageData.slice(1, -1);
  let compareResult = false;
  let name = '';
  let score = 0;
  const resResult = [];
  const reqBody = JSON.parse(req.body.faceImageData);
  for (let i = 0; i < reqBody.imageData.length; i++) {
    const base64Data = reqBody.imageData[i];
    for (let j = 0; j < files.length; j++) {
      const result = await falseClient.match([{
        image: base64Data, // new Buffer(fs.readFileSync('./out.png')).toString('base64'),
        image_type: 'BASE64',
        // liveness_control: 'low' // none, low, normal, heigh
      }, {
        image: new Buffer(fs.readFileSync(`./photoLibrary/${files[j]}`)).toString('base64'),
        image_type: 'BASE64',
      }]);
      if (result.error_code === 0 && result.result.score > 50) {
        compareResult = true;
        name = files[j];
        score = result.result.score;
        resResult.push({
          name,
          position: reqBody.position[i],
          score,
        });
        break;
      }
    }
  }
  res.json({ success: true, resResult });
});

// get conference list
app.get('/api/allConferences', (req, res) => {
  connection.query('SELECT * FROM conference', (error, result, fields) => {
    if (error) {
      res.json({ success: false, error: error.toString() });
    } else {
      res.json({ success: true, result });
    }
  });
});


app.post('/api/userOnline', (req, res) => {
  for (let i = 0; i < req.body.length; i++) {
    console.log(`人脸识别到:${req.body[i]}`);
    handleUserOnline(`${req.body[i]}:10`);
  }
  res.json({ success: true });
});

app.post('/api/speechAsr', (req, res) => {
  if (req.body.results_recognition.length > 0) {
    console.log(`语音识别到最终结果:${req.body.results_recognition[0]}`);
    handleUserChat(`主会场:${req.body.results_recognition[0]}`);
  }
  res.json({ success: true });
});

app.post('/api/tmpSpeechAsr', (req, res) => {
  if (req.body.results_recognition.length > 0) {
    // console.log('语音识别到临时结果:' + req.body.results_recognition[0]);
    io.emit('userChatTemp', `主会场:${req.body.results_recognition[0]}`);
  }
  res.json({ success: true });
});

app.get('/meeting-minutes/:id', async (req, res) => {
  res.render('pages/meeting-minutes', {
    records: _.map(await models.UserChat.findAll({
      attributes: ['username', 'createdAt', 'message'],
      where: { MeetingId: req.params.id },
    }), c => ({
      username: c.username,
      message: c.message,
      time: moment(c.createdAt).format('HH:mm:ss'),
    })),
  });
});

// app.listen(PORT, HOST);
http.listen(3001, HOST, () => {
  console.log('listening on *:3001');
});
// console.log(`Running on http://${HOST}:${PORT}`);
