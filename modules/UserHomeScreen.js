
import { View, Text, Button, StyleSheet, TouchableOpacity, Image, Linking, Alert, Modal, ScrollView } from 'react-native';
import {styles} from './styles'
import {socket, session_key, refreshSessionKey} from './websocket_connection'
import {user_info} from './UserInfo'
import React, { Component } from 'react';
import { api_url } from './api';
import { eventHandler } from './EventHandler';

class UserHomeScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal_visible: false,
            chatMessageCounter: 0,
            notifyModal_show: false,
            notifyModal_text: '',
            notifyModal_type: '',
            notifyModal_data: {}
        }
    };

    componentDidMount() {
        console.log('[UserHomeScreen] mounted')
        socket.addEventListener('hubapp/forumsUsernameUpdate', this.forumsUsernameUpdateListener)
        socket.addEventListener('hubapp/receivedNewPrivateMessage', this.receivedNewPrivateMessageListener)
    }

    componentWillUnmount() {
        console.log('[UserHomeScreen] unmounted')
        socket.removeEventListener('hubapp/forumsUsernameUpdate', this.forumsUsernameUpdateListener)
        socket.removeEventListener('hubapp/receivedNewPrivateMessage',this.receivedNewPrivateMessageListener)
    }

    forumsUsernameUpdateListener = (data) => {
        console.log('[UserHomeScreen] hubapp/forumsUsernameUpdate')
        if (data.code != 200) {
            console.log(data.response)
            return
        }
        this.forceUpdate(() => {
            Alert.alert(
              "IGN Verified!",
              `Your IGN has been updated to ${user_info.forums_username}`,
              [
                { text: "OK", onPress: () => console.log("OK Pressed") }
              ]
            );
        })
    }

    receivedNewPrivateMessageListener = async (data) => {
        console.log('[UserHomeScreen] hubapp/receivedNewPrivateMessage')
        console.log(data)
        if (data.response.chat.discord_id == user_info.discord_id) return
        const navigation = this.props.navigation.getState(), last_route = navigation.routes[navigation.routes.length - 1];
        if (last_route.name == 'PrivateChatScreen' && last_route.params.targetUser.discord_id == data.response.chat.discord_id) return
        this.setState({notifyModal_show: true, notifyModal_text: data.response.chat.message, notifyModal_type: 'message', notifyModal_data: data.response},() => setTimeout(() => this.setState({notifyModal_show: false}), 5000))
    }

    forumVerify = () => {
        console.log('forum verify pressed')
        this.setState({modal_visible: true})
        return
    }

    render() {
        return (
            <View style={styles.viewContainer}>
                <View style={styles.viewHeader}>
                    {user_info.forums_verified? <></>:
                    <TouchableOpacity
                        onPress={() => this.forumVerify()}
                    >
                        <Text style={{color: 'yellow', fontSize: 16, textAlign: 'center'}}>You have not verified your in-game name</Text>
                        <Text style={{color: 'yellow', fontSize: 16, textAlign: 'center'}}>Please tap here to verify</Text>
                    </TouchableOpacity>
                    }
                </View>
                <View style={styles.viewBody}>
                    <Text style={styles.text}>Welcome, {user_info.forums_verified? user_info.forums_username:user_info.discord_username}!</Text>
                    <View style={{height: '3%'}}></View>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => this.props.navigation.push('ViewChatsScreen')}
                    >
                        <Text style={styles.buttonText}>View Chats</Text>
                    </TouchableOpacity>
                    <View style={{height: '3%'}}></View>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => this.props.navigation.push('RecruitmentSquads')}
                    >
                        <Text style={styles.buttonText}>Recruitment Squads</Text>
                    </TouchableOpacity>
                    <View style={{height: '3%'}}></View>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => this.props.navigation.push('Trading')}
                    >
                        <Text style={styles.buttonText}>Trading</Text>
                    </TouchableOpacity>
                    <View style={{height: '3%'}}></View>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => this.setState({modal_visible: true})}
                    >
                        <Text style={styles.buttonText}>Update IGN</Text>
                    </TouchableOpacity>
                    <View style={{height: '3%'}}></View>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => refreshSessionKey()}
                    >
                        <Text style={styles.buttonText}>Logout</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.viewFooter}>
                    {api_url == 'https://gauss-prime-api.up.railway.app/' ? 
                    <Text style={{color: 'yellow', fontSize: 16, textAlign: 'center'}}>Note: You are on the test development server. Any changes made to the app will not show up immediately</Text>
                    :<Text style={{color: 'green', fontSize: 16, textAlign: 'center'}}>You are on the live development server. Any changes made will refresh the app</Text>}
                </View>
                
      <Modal
        animationType="slide"
        transparent={true}
        visible={this.state.modal_visible}
        children={
            <View style={styles.modalContainer}>
                <View style={styles.modalBody}>
                    <View style={styles.modalHeader}>
                        <Text style={{color: 'white', fontSize: 16,paddingHorizontal:10}}>IGN Verification</Text>
                    </View>
                    <View style={{flex: 10, justifyContent: 'center'}}>
                        <ScrollView>
<Text style={{color: 'white', fontSize: 16,paddingHorizontal:10}}>{`
Please follow the steps below to verify your in-game name:

1) First make sure you are signed-in on Warframe forums by visiting this link:`}</Text>
<TouchableOpacity onPress={() => Linking.openURL('https://forums.warframe.com/')}>
<Text style={{color: '#22d3ee',textDecorationLine: 'underline', fontSize: 16,paddingHorizontal:10}}>
    https://forums.warframe.com/
</Text>
</TouchableOpacity>
<Text style={{color: 'white', fontSize: 16,paddingHorizontal:10}}>{`
2) Visit this page to compose a new message to the bot (TradeKeeper):`}</Text>
<TouchableOpacity onPress={() => Linking.openURL('https://forums.warframe.com/messenger/compose/?to=6931114')}>
<Text style={{color: '#22d3ee',textDecorationLine: 'underline', fontSize: 16,paddingHorizontal:10}}>
https://forums.warframe.com/messenger/compose/?to=6931114
</Text>
</TouchableOpacity>
<Text style={{color: 'white', fontSize: 16,paddingHorizontal:10}}>{`
3) Write the message body as given below:`}</Text>
<Text selectable={true} style={{color: '#34d399', fontSize: 16,paddingHorizontal:10}}>{`Subject: ${user_info.forums_auth_token}
Message: Hi
`}</Text>
<Text style={{color: 'white', fontSize: 16,paddingHorizontal:10}}>{`4) Click 'Send' button

5) Wait a couple seconds for the bot to verify you`}</Text>
                        </ScrollView>
                    </View>
                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            onPress={() => this.setState({modal_visible: false})}
                            style={{width: '100%',justifyContent: 'center', alignItems: 'center'}}
                        >
                            <Text style={{fontSize: 22, color: 'white', paddingHorizontal: '35%'}}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
    }
        onRequestClose={() => this.setState({modal_visible: false})}
      ></Modal>


<Modal
    animationType="slide"
    transparent={true}
    visible={this.state.notifyModal_show}
    children={
        <TouchableOpacity
            style={{width: '100%',height: '100%'}}
            onPress={() => this.setState({notifyModal_show: false})}
        >
            <View style={{height: 80, position: 'absolute',marginTop: 80,alignSelf: 'center',justifyContent: 'center', alignItems:'center', backgroundColor: '#404040', width: '90%'}}>
                <TouchableOpacity
                    style={{width: '100%',height: '100%'}}
                    onPress={() => {
                        this.props.navigation.push('PrivateChatScreen', {
                            title: this.state.notifyModal_data.chat.ign, 
                            targetUser: {
                                discord_id: this.state.notifyModal_data.chat.discord_id, 
                                username: this.state.notifyModal_data.chat.discord_username
                            }
                        });
                        this.setState({notifyModal_show: false})
                    }}
                >
                    {
                        this.state.notifyModal_type == 'message' ?
                        <View style={{flex:1, flexDirection:'row',padding: 10}}>
                            <Image
                                source={{ uri: this.state.notifyModal_data.chat.avatar  }}
                                style={{ width: 50, height: 50, borderRadius: 50 }}
                            />
                            <View style={{flex:1,flexDirection: 'column', paddingLeft: 10, paddingTop: 0}}>
                                <Text style={{color: 'white', fontSize: 18}}>{this.state.notifyModal_data.chat.ign? this.state.notifyModal_data.chat.ign:this.state.notifyModal_data.chat.discord_username + ` [non-verified]`}</Text>
                                <Text style={{color: 'white'}}>{this.state.notifyModal_data.chat.message}</Text>
                            </View>
                        </View>
                        :<></>
                    }
                    
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    }
    onRequestClose={() => this.setState({notifyModal_show: false})}
></Modal>


            </View>
        )
    }
}

export {UserHomeScreen}