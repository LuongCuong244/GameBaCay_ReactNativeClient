import { io } from "socket.io-client";

const socketRoom = io('http://xxx.xxx.x.xxx:3000/room');  // xxx.xxx.x.xxx là địa chỉ ip máy chủ

module.exports = socketRoom