
import { View, Text, Button, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, ActivityIndicator, Modal} from 'react-native';
import {styles} from './styles'
import {socket} from './websocket_connection'
import React, { Component } from 'react';
import {user_info} from './UserInfo'
import { FontAwesome } from '@expo/vector-icons'; 
import { eventHandler } from './EventHandler';

class PrivateChatScreen extends Component {
    constructor(props) {
        super(props);
        console.log('Navigated to PrivateChatScreen',props.route.params)
        this.scrollViewRef = React.createRef();
        this.textInputRef = React.createRef();
        this.targetUser = props.route.params.targetUser
        this.state = {
            trade_active: false,
            last_trading_session: 0,
            trade_receipt_id: '',
            trade_type: '',
            loadingChat: true,
            chats: [],
            inputText: '',
            contextModalVisible: false,
            contextModalTarget: 0,
            start_limit: 1,
            end_limit: 15,
            end_of_chat_reached: false
        }
    };
    
    componentDidMount() {
        console.log('[PrivateChatScreen] mounted')
        socket.addEventListener('hubapp/receivedPrivateChat', this.receivedPrivateChatListener)
        socket.addEventListener('hubapp/receivedNewPrivateMessage', this.receivedNewPrivateMessageListener)
        socket.emit('hubapp/getPrivateChat', {discord_id_1: user_info.discord_id,discord_id_2: this.targetUser.discord_id,start_limit: this.state.start_limit, end_limit: this.state.end_limit})
        socket.emit('hubapp/privateChatMarkAsRead', {discord_id_1: user_info.discord_id,discord_id_2: this.targetUser.discord_id})
    }

    componentWillUnmount() {
        console.log('[PrivateChatScreen] unmounted')
        socket.removeEventListener('hubapp/receivedPrivateChat', this.receivedPrivateChatListener)
        socket.removeEventListener('hubapp/receivedNewPrivateMessage', this.receivedNewPrivateMessageListener)
        socket.emit('hubapp/privateChatMarkAsRead', {discord_id_1: user_info.discord_id,discord_id_2: this.targetUser.discord_id})
    }

    componentDidUpdate() {
        console.log('[PrivateChatScreen] updated')
    }

    receivedPrivateChatListener = (data) => {
        console.log('[PrivateChatScreen] hubapp/receivedPrivateChat')
        if (data.code != 200) {
            console.log(data.response)
            return
        }
        console.log(data.response.chat_arr)
        this.setState({
            trade_active: data.response.trade_active,
            last_trading_session: data.response.last_trading_session,
            trade_receipt_id: data.response.trade_receipt_id,
            trade_type: data.response.trade_type,
            chats: [...data.response.chat_arr, ...this.state.chats], 
            loadingChat: false,
            start_limit: this.state.start_limit + 15,
            end_limit: this.state.end_limit + 15,
            end_of_chat_reached: data.response.chat_arr.length == 0 ? true:false
        });
    }
    receivedNewPrivateMessageListener = (data) => {
        console.log('[PrivateChatScreen] hubapp/receivedNewPrivateMessage')
        if (data.code != 200) {
            console.log(data.response)
            return
        }
        if (data.response.chat.discord_id != this.targetUser.discord_id && data.response.chat.discord_id != user_info.discord_id && data.response.chat.discord_id != '111111111111111111')
            return
        this.setState({chats: [...this.state.chats, data.response.chat], trade_active: data.response.trade_active, last_trading_session: data.response.last_trading_session, trade_receipt_id: data.response.trade_receipt_id, trade_type: data.response.trade_type});
        this.scrollViewRef.current.scrollToEnd({ animated: true })
    }

    displayChats = () => {
        return this.state.chats.map((chat,index) => {
            return (
                <TouchableOpacity key={index} onPress={() => {console.log(chat.discord_id);this.setState({contextModalVisible: true, contextModalTarget: chat.discord_id})}}>
                    <View style={{flex:1, flexDirection:'row',padding: 10}}>
                        <Image
                            source={{ uri: chat.avatar  }}
                            style={{ width: 50, height: 50, borderRadius: 50 }}
                        />
                        <View style={{flex:1,flexDirection: 'column', paddingLeft: 10, paddingTop: 0}}>
                            <View style={{flex:1,flexDirection: 'row'}}>
                                <Text style={{color: 'white', fontSize: 18}}>{chat.ign? chat.ign:chat.discord_username + ` [non-verified]`}</Text>
                                <Text style={{color: 'grey', paddingLeft: 10, paddingTop: 5}}>{`${new Date(Number(chat.timestamp)).getDate()}/${new Date(Number(chat.timestamp)).getMonth() + 1} ${new Date(Number(chat.timestamp)).getHours()}:${new Date(Number(chat.timestamp)).getMinutes()}`}</Text>
                            </View>
                            <Text style={{color: chat.discord_id == '111111111111111111' ? '#67e8f9':'#5eead4'}}>{chat.message}</Text>
                            {chat.attachments.length > 0 ? <Image
                                        style={{width: 350, height: 350, resizeMode: 'contain'}}
                                        source={{uri: chat.attachments[0]}}
                                    />:<></>}
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
            <View style={{flex: 1, backgroundColor: '#000e21'}}>
                {this.state.trade_active ? 
                <View style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#000a17',
                    paddingVertical: 10
                  }}>
                    <Text style={{fontSize: 16, color: 'white'}}>A trading session is active. Press success once trade finished, or click report while including reason in the chat</Text>
                    <View style={{flexDirection:'row', marginTop: 10}}>
                        <TouchableOpacity
                            onPress={() => socket.emit('hubapp/trades/closeTradeSession', {discord_id_1: user_info.discord_id, discord_id_2: this.targetUser.discord_id, status: 'successful', trade_receipt_id: this.state.trade_receipt_id, trade_type: this.state.trade_type})}
                            style={{backgroundColor: styles.viewHeader.backgroundColor, paddingVertical: 10, paddingHorizontal: 15, borderColor: 'white', borderWidth: 3, borderTopLeftRadius: 10, borderBottomLeftRadius: 10}}
                        >
                            <Text style={{color: '#48f075', fontSize: 12, textAlign: 'center'}}>✓ Success</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => socket.emit('hubapp/trades/closeTradeSession', {discord_id_1: user_info.discord_id, discord_id_2: this.targetUser.discord_id, status: 'report', trade_receipt_id: this.state.trade_receipt_id, trade_type: this.state.trade_type})}
                            style={{backgroundColor: styles.viewHeader.backgroundColor, paddingVertical: 10, paddingHorizontal: 15, borderColor: 'white', borderWidth: 3, borderLeftWidth: 0, borderTopRightRadius: 10, borderBottomRightRadius: 10}}
                        >
                            <Text style={{color: 'yellow', fontSize: 12, textAlign: 'center'}}>⚠️ Report</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                :<></>}
                <View style={{flex: 10}}>
                    {
                    this.state.loadingChat ? 
                        <View style={{position: 'absolute',alignSelf: 'center',justifyContent: 'center', alignItems:'center', marginVertical: 10}}>
                            <ActivityIndicator size='large'/>
                        </View>
                    :<></>
                    }
                    <ScrollView ref={this.scrollViewRef} onContentSizeChange={() => this.state.start_limit == 16 ? this.scrollViewRef.current.scrollToEnd({ animated: true }):true}
                    onScroll={({nativeEvent})=> {
                        if (nativeEvent.contentOffset.y == 0) {
                            console.log('is close to top')
                            if (!this.state.end_of_chat_reached) {
                                socket.emit('hubapp/getPrivateChat', {discord_id_1: user_info.discord_id,discord_id_2: this.targetUser.discord_id,start_limit: this.state.start_limit, end_limit: this.state.end_limit})
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
            </View>
        )
    }
}

export {PrivateChatScreen}