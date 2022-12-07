
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import {styles} from './styles'
import {socket, session_key} from './websocket_connection'
import React, { Component } from 'react';
import { api_url } from './api';
import {eventHandler} from './EventHandler'

class WelcomeScreen extends Component {
    constructor(props) {
        super(props);
    };

    componentDidMount() {
        console.log('[WelcomeScreen] mounted')
        eventHandler.once('hubapp/discordLoginAuthorized', (userInfo) => {
            console.log('[WelcomeScreen] hubapp/discordLoginAuthorized')
            this.props.navigation.replace('UserHomeScreen')
        })
    }

    componentWillUnmount() {
        console.log('[WelcomeScreen] unmounted')
    }

    render() {
        return (
            <View style={styles.view}>
              <Text style={styles.text}>Welcome to HubApp</Text>
              <View style={{height: '5%'}}></View>
              <TouchableOpacity
                  style={styles.button}
                  onPress={async () => {
                    await Linking.openURL(
                        'https://discord.com/api/oauth2/authorize?'+
                        new URLSearchParams({
                            client_id:'832682369831141417',
                            redirect_uri:api_url+'api/discordOAuth2/authorize',
                            response_type: 'code',
                            scope:'identify email guilds',
                            state:session_key
                        }).toString()
                    ).then(console.log)
                    .catch(console.error)
                  }}
              >
                  <Text style={styles.buttonText}>Login via Discord</Text>
              </TouchableOpacity>
            </View>
        )
    }
}

export {WelcomeScreen}