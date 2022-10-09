
import { View, Text, Button, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, ActivityIndicator, Modal} from 'react-native';
import {styles} from './styles'
import {socket} from './websocket_connection'
import React, { Component } from 'react';
import {user_info} from './UserInfo'
import { FontAwesome } from '@expo/vector-icons'; 

class PublicChatScreen extends Component {
    constructor(props) {
        super(props);
        this.scrollViewRef = React.createRef();
        this.textInputRef = React.createRef();
        this.state = {
            loadingChat: true,
            chats: [],
            inputText: '',
            contextModalVisible: false,
            contextModalTargetUser: {
                discord_id: 0,
                username: ''
            },
            start_limit: 1,
            end_limit: 15,
            end_of_chat_reached: false
        }
    };
    
    componentDidMount() {
        console.log('[PublicChatScreen] mounted')
        socket.addEventListener('hubapp/receivedPublicChat', this.receivedPublicChatListener)
        socket.addEventListener('hubapp/receivedNewPublicMessage', this.receivedNewPublicMessageListener)
        socket.emit('hubapp/getPublicChat', {start_limit: this.state.start_limit, end_limit: this.state.end_limit})
        socket.emit('hubapp/publicChatMarkAsRead',{discord_id: user_info.discord_id})
    }

    componentWillUnmount() {
        console.log('[PublicChatScreen] unmounted')
        socket.removeEventListener('hubapp/receivedPublicChat', this.receivedPublicChatListener)
        socket.removeEventListener('hubapp/receivedNewPublicMessage', this.receivedNewPublicMessageListener)
        socket.emit('hubapp/publicChatMarkAsRead',{discord_id: user_info.discord_id})
    }

    componentDidUpdate() {
        console.log('[PublicChatScreen] updated')
    }

    receivedPublicChatListener = (data) => {
        console.log('[PublicChatScreen] hubapp/receivedPublicChat')
        if (data.code != 200) {
            console.log(data.response)
            return
        }
        console.log(data.response)
        this.setState({
            chats: [...data.response, ...this.state.chats], 
            loadingChat: false,
            start_limit: this.state.start_limit + 15,
            end_limit: this.state.end_limit + 15,
            end_of_chat_reached: data.response.length == 0 ? true:false
        });
    }

    receivedNewPublicMessageListener = (data) => {
        console.log('[PublicChatScreen] hubapp/receivedNewPublicMessage')
        if (data.code != 200) {
            console.log(data.response)
            return
        }
        console.log(data)
        this.setState({chats: [...this.state.chats, data.response]});
        this.scrollViewRef.current.scrollToEnd({ animated: true })
    }

    displayChats = () => {
        return this.state.chats.map((chat,index) => {
            return (
                <TouchableOpacity key={index} onPress={() => this.setState({contextModalVisible: true, contextModalTargetUser: {discord_id: chat.discord_id, username: chat.ign? chat.ign:chat.discord_username}})}>
                    <View style={{flex:1, flexDirection:'row',padding: 10}}>
                        <Image
                            source={{ uri: chat.avatar }}
                            style={{ width: 50, height: 50, borderRadius: 50 }}
                        />
                        <View style={{flex:1,flexDirection: 'column', paddingLeft: 10, paddingTop: 0}}>
                            <View style={{flex:1,flexDirection: 'row'}}>
                                <Text style={{color: 'white', fontSize: 18}}>{chat.ign? chat.ign:chat.discord_username + ` [non-verified]`}</Text>
                                <Text style={{color: 'grey', paddingLeft: 10, paddingTop: 5}}>{`${new Date(Number(chat.timestamp)).getDate()}/${new Date(Number(chat.timestamp)).getMonth() + 1} ${new Date(Number(chat.timestamp)).getHours()}:${new Date(Number(chat.timestamp)).getMinutes()}`}</Text>
                            </View>
                            <Text style={{color: '#5eead4'}}>{chat.message}</Text>
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
        socket.emit('hubapp/createPublicMessage', {
            message: this.state.inputText,
            discord_id: user_info.discord_id
        })
        this.setState({inputText: ''})
    }

    isCloseToTop({layoutMeasurement, contentOffset, contentSize}){
       return contentOffset.y == 0;
    }
    
    render() {
        return (
            <View style={{flex: 1, backgroundColor: '#000e21'}}>
                {
                this.state.loadingChat ? 
                    <View style={{flex: 2, position: 'absolute',alignSelf: 'center', justifyContent: 'center', alignItems:'center', marginVertical: 10}}>
                        <ActivityIndicator size='large'/>
                    </View>
                :<></>
                }
                <View style={{flex: 10}}>
                    <ScrollView ref={this.scrollViewRef} onContentSizeChange={() => this.state.start_limit == 16 ? this.scrollViewRef.current.scrollToEnd({ animated: true }):true}
                    onScroll={({nativeEvent})=> {
                        if (nativeEvent.contentOffset.y == 0) {
                           console.log('is close to top')
                            if (!this.state.end_of_chat_reached) {
                                socket.emit('hubapp/getPublicChat', {start_limit: this.state.start_limit, end_limit: this.state.end_limit})
                                this.setState({loadingChat: true})
                            }
                        }
                        }}
                    
                    >
                        {this.displayChats()}
                    </ScrollView>
                </View>
                <View style={styles.viewFooter}>
                    <View style={{flexDirection: 'row', width: '100%'}}>
                        <View style={{flex:9, alignSelf: 'center'}}>
                            <TextInput
                                ref={this.textInputRef}
                                style={styles.textInput}
                                placeholder="Send new message"
                                placeholderTextColor={'white'}
                                value={this.state.inputText}
                                onSubmitEditing={(event) => this.sendNewMessage()}
                                onChangeText={(text) => this.setState({inputText: text})}
                                blurOnSubmit={false}
                            />
                        </View>
                            <TouchableOpacity
                                onPress={() => this.sendNewMessage()}
                                style={{width: 50, height: 50, backgroundColor: 'white', borderRadius: 25, marginRight: 10, alignItems: 'center',justifyContent: 'center', paddingRight: 5}}
                            >
                                <FontAwesome name="send" size={28} color="#000e21"/>
                            </TouchableOpacity>
                    </View>
                </View>
<Modal
animationType="none"
transparent={true}
visible={this.state.contextModalVisible}
children={
    <TouchableOpacity style={{
        flex: 1,
        backgroundColor: 'black',
        opacity: 0.8,
        justifyContent: 'flex-end',
    }} onPress={() => this.setState({contextModalVisible: false})} activeOpacity={0.8}>
        <TouchableOpacity style={{backgroundColor: '#000e21',paddingBottom: 50,paddingTop: 20}} onPress={() => {}} activeOpacity={1}>
            <View style={{borderBottomWidth: 1,borderBottomColor: 'grey', width: '100%'}}>
                <TouchableOpacity onPress={() => {
                    this.props.navigation.pop(1)
                    this.props.navigation.push('PrivateChatScreen', {title: this.state.contextModalTargetUser.username, targetUser: this.state.contextModalTargetUser})
                    }}>
                    <Text style={{fontSize: 18, color: 'white', alignSelf: 'center'}}>Send private message</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    </TouchableOpacity>
}
onRequestClose={() => this.setState({contextModalVisible: false})}
></Modal>
            </View>
        )
    }
}

export {PublicChatScreen}