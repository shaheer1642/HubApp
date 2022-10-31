import SocketIOClient from "socket.io-client/dist/socket.io.js";
import {api_url} from './api'
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import {eventHandler} from './EventHandler'

var socket;
var session_key=null;

AsyncStorage.getItem('session_key').then(key => {
    if (key == null) {
        refreshSessionKey()
        return
    }
    session_key=key;
    connectSocket()
}).catch(console.error)

async function refreshSessionKey() {
    if (socket)
        await socket.disconnect()
    const key = uuid.v1()
    session_key = key;
    connectSocket()
    AsyncStorage.setItem('session_key',key).catch(console.error)
}

function connectSocket() {
    console.log(session_key)
    socket = SocketIOClient(api_url, {
        jsonp: false,
        transports : ['websocket'],
        query: {
            session_key: session_key
        },
    })
    socket.on("connect", async () => {
        console.log("[websocket log] connected");
        eventHandler.emit('websocketConnected')
    });
      
    socket.on("connect_error", (err) => {
        console.log('[websocket error]',JSON.stringify(err));
        eventHandler.emit('websocketDisconnected')
    });
    
    socket.on('disconnect', () => {
        console.log("[websocket log] disconnected");
        eventHandler.emit('websocketDisconnected')
    })

    socket.on('hubapp/discordLoginAuthorized', (data) => {
        console.log('[websocket log] hubapp/discordLoginAuthorized')
        if (data.code != 200) {
            console.log(data.response)
            return
        }
        eventHandler.emit('hubapp/discordLoginAuthorized', data.response)
    })

    socket.on('hubapp/forumsUsernameUpdate', (data) => {
        console.log('[websocket log] hubapp/forumsUsernameUpdate')
        if (data.code != 200) {
            console.log(data.response)
            return
        }
        eventHandler.emit('hubapp/forumsUsernameUpdate', data.response)
    })
}

export {socket,session_key,refreshSessionKey}