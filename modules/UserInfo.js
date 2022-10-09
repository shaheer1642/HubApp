import {eventHandler} from './EventHandler'
import {socket, session_key} from './websocket_connection'

var user_info = {
    logged_in: false,
}

eventHandler.on('hubapp/discordLoginAuthorized', (userInfo) => {
    user_info = {...userInfo, logged_in: true}
})

eventHandler.on('hubapp/forumsUsernameUpdate', (userInfo) => {
    user_info = {...userInfo, logged_in: true}
})

export {user_info}