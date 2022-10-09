
import { View, Text, Button, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, ActivityIndicator, Modal} from 'react-native';
import {styles} from './styles'
import {socket} from './websocket_connection'
import React, { Component } from 'react';
import {user_info} from './UserInfo'
import { FontAwesome } from '@expo/vector-icons'; 

class ViewChatsScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            chatsList: [],
            loadingChats: true
        }
    };
    
    componentDidMount() {
        console.log('[ViewChatsScreen] mounted')
        socket.addEventListener('hubapp/receivedNewPrivateMessage', this.receivedNewPrivateMessageListener)
        socket.addEventListener('hubapp/receivedNewPublicMessage', this.receivedNewPublicMessageListener)
        socket.addEventListener('hubapp/privateChatMarkedAsRead', this.privateChatMarkedAsReadListener)
        socket.addEventListener('hubapp/publicChatMarkedAsRead', this.publicChatMarkedAsReadListener)
        socket.addEventListener('hubapp/receivedChatsList', this.receivedChatsListListener)
        socket.emit('hubapp/getChatsList', {discord_id: user_info.discord_id})
    }

    componentWillUnmount() {
        console.log('[ViewChatsScreen] unmounted')
        socket.removeEventListener('hubapp/receivedNewPrivateMessage', this.receivedNewPrivateMessageListener)
        socket.removeEventListener('hubapp/receivedNewPublicMessage', this.receivedNewPublicMessageListener)
        socket.removeEventListener('hubapp/privateChatMarkedAsRead', this.privateChatMarkedAsReadListener)
        socket.removeEventListener('hubapp/publicChatMarkedAsRead', this.publicChatMarkedAsReadListener)
        socket.removeEventListener('hubapp/receivedChatsList', this.receivedChatsListListener)
    }
    
    receivedChatsListListener = (data) => {
        console.log('[ViewChatsScreen] hubapp/receivedChatsList')
        if (data.code != 200) {
            console.log(data.response)
            return
        }
        console.log(data.response)
        data.response.forEach((chat,index) => {
            if (chat.name == 'Public Chat') {
                data.response[index].onPress = () => {
                    this.props.navigation.push('PublicChatScreen')
                }
            } else {
                data.response[index].onPress = () => {
                    this.props.navigation.push('PrivateChatScreen', {title: chat.name, targetUser: {discord_id: chat.discord_id, username: chat.name}})
                }
            }
        })
        this.setState({chatsList: [...this.state.chatsList, ...data.response], loadingChats: false});
    }

    receivedNewPrivateMessageListener = (data) => {
        console.log('[ViewChatsScreen] hubapp/receivedNewPrivateMessage')
        if (data.code != 200) {
            console.log(data.response)
            return
        }
        if (data.response.chat.discord_id == user_info.discord_id)
            return
        this.setState(state => {
            const chatsList = state.chatsList.map((chat, index) => {
                console.log(chat.unread_messages)
                if (data.response.chat.channel.includes(chat.discord_id)) {
                    return {
                        ...chat,
                        unread_messages: chat.unread_messages + 1
                    }
                } else {
                    return chat
                }
            });
            return {
                chatsList,
            };
        });
    }
    receivedNewPublicMessageListener = (data) => {
        console.log('[ViewChatsScreen] hubapp/receivedNewPublicMessage')
        if (data.code != 200) {
            console.log(data.response)
            return
        }
        this.setState(state => {
            const chatsList = state.chatsList.map((chat, index) => {
                if (chat.name == 'Public Chat') {
                    return {
                        ...chat,
                        unread_messages: chat.unread_messages + 1
                    }
                } else {
                    return chat
                }
            });
            return {
                chatsList,
            };
        });
    }
    privateChatMarkedAsReadListener = (data) => {
        console.log('[ViewChatsScreen] hubapp/privateChatMarkedAsRead')
        if (data.code != 200) {
            console.log(data.response)
            return
        }
        if (data.response.discord_id_2 == user_info.discord_id)
            return
        this.setState(state => {
            const chatsList = state.chatsList.map((stateChat, index) => {
                if (stateChat.discord_id == data.response.discord_id_2) {
                    return {
                        ...stateChat,
                        unread_messages: 0
                    }
                } else return stateChat
            });
            return {
                chatsList,
            };
        });
    }
    publicChatMarkedAsReadListener = (data) => {
        console.log('[ViewChatsScreen] hubapp/publicChatMarkedAsRead')
        if (data.code != 200) {
            console.log(data.response)
            return
        }
        this.setState(state => {
            const chatsList = state.chatsList.map((stateChat, index) => {
                if (stateChat.name == 'Public Chat') {
                    return {
                        ...stateChat,
                        unread_messages: 0
                    }
                } else return stateChat
            });
            return {
                chatsList,
            };
        });
    }

    componentDidUpdate() {
        console.log('[ViewChatsScreen] updated')
    }

    displayChats = () => {
        return this.state.chatsList.map((chat,index) => {
            return (
                <TouchableOpacity key={index} onPress={chat.onPress}>
                    <View style={{flex:1, flexDirection:'row',padding: 10}}>
                        <Image
                            source={{ uri: chat.avatar  }}
                            style={{ width: 50, height: 50, borderRadius: 50 }}
                        />
                        <View style={{flex:1,flexDirection: 'column', paddingLeft: 10}}>
                            <View style={{flex:1,flexDirection: 'row'}}>
                                <Text style={{color: 'white', fontSize: 22}}>{chat.name}</Text>
                                {chat.unread_messages == 0 ? <></>:
                                <View style={{marginTop:5,marginLeft: 5, justifyContent: 'center',alignItems: 'center',borderRadius:25, width: 25, height: 25,backgroundColor: 'red'}}>
                                    <Text style={{color: 'white'}}>{chat.unread_messages}</Text>
                                </View>
                                }
                                {chat.last_update_timestamp == 2072777963000 ? <></>:
                                <Text style={{color: 'grey', paddingLeft: 10, paddingTop: 5}}>{`${new Date(Number(chat.last_update_timestamp)).getDate()}/${new Date(Number(chat.last_update_timestamp)).getMonth()} ${new Date(Number(chat.last_update_timestamp)).getHours()}:${new Date(Number(chat.last_update_timestamp)).getMinutes()}`}</Text>
                                }
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            )
        })
    }

    sendNewMessage = () => {
        console.log(this.state.inputText)
        if (this.state.inputText == "")
            return
        socket.emit('hubapp/createPrivateMessage', {
            message: this.state.inputText,
            discord_id_1: user_info.discord_id,
            discord_id_2: this.targetUser.discord_id
        })
        this.setState({inputText: ''})
    }
    
    render() {
        return (
            <View style={styles.viewContainer}>
                <View style={{flex: 10, justifyContent: 'flex-start'}}>
                {
                this.state.loadingChats ? 
                <View style={{flex: 10, justifyContent: 'center', alignItems:'center'}}>
                    <Text style={{color: '#5eead4', marginBottom: 20, fontSize: 16}}>Loading Chats...</Text>
                    <ActivityIndicator size='large' color='#5eead4'/>
                </View>:
                <ScrollView style={{marginTop: 10}}>
                    {this.displayChats()}
                </ScrollView>
                }
                </View>
                <View style={styles.viewFooter}>
                </View>
            </View>
        )
    }
}

export {ViewChatsScreen}