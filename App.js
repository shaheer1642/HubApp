import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { WelcomeScreen } from './modules/WelcomeScreen'
import { UserHomeScreen } from './modules/UserHomeScreen'
import { PublicChatScreen } from './modules/PublicChatScreen'
import { PrivateChatScreen } from './modules/PrivateChatScreen'
import { ViewChatsScreen } from './modules/ViewChatsScreen'
import { RecruitmentSquads } from './modules/RecruitmentSquads'
import { Trading } from './modules/Trading'
import React from 'react';
import {Text, View, ActivityIndicator, Modal, TouchableOpacity} from 'react-native';
import {styles} from './modules/styles'
import {eventHandler} from './modules/EventHandler'

const Stack = createNativeStackNavigator()

class App extends React.Component {
  constructor(props) {
      super(props);
      this.state= {
        isLoading: true,
      }
  };

  componentDidMount() {
    console.log('[App] mounted')
    eventHandler.addListener('websocketConnected', () => {
      this.setState({
        isLoading: false
      })
    })
    eventHandler.addListener('websocketDisconnected', () => {
      this.setState({
        isLoading: true
      })
    })
  }

  componentWillUnmount() {
    console.log('[App] unmounted')
    eventHandler.removeAllListeners()
  }

  render() {
    return (
      this.state.isLoading ? 
      <View style={styles.view}>
        <Text style={{color: '#5eead4', marginBottom: 20, fontSize: 16}}>Establishing connection with the server</Text>
        <ActivityIndicator size='large' color='#5eead4'/>
      </View>:
      <NavigationContainer>
        <Stack.Navigator initialRouteName='WelcomeScreen'>
          <Stack.Screen
            name='WelcomeScreen'
            component={WelcomeScreen}
            options={{ title: 'HUB APP', ...headerStyle }}
          />
          <Stack.Screen
            name='UserHomeScreen'
            component={UserHomeScreen}
            options={{ title: 'HOME PAGE', ...headerStyle }}
          />
          <Stack.Screen
            name='ViewChatsScreen'
            component={ViewChatsScreen}
            options={{ title: 'CHATS', ...headerStyle }}
          />
          <Stack.Screen
            name='PublicChatScreen'
            component={PublicChatScreen}
            options={{ title: 'PUBLIC CHAT', ...headerStyle }}
          />
          <Stack.Screen
            name='PrivateChatScreen'
            component={PrivateChatScreen}
            options={({ route }) => ({ title: route.params.title, ...headerStyle })}
          />
          <Stack.Screen
            name='RecruitmentSquads'
            component={RecruitmentSquads}
            options={{ title: 'RECRUITMENT SQUADS', ...headerStyle }}
          />
          <Stack.Screen
            name='Trading'
            component={Trading}
            options={{ title: 'TRADING', ...headerStyle }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    )
  }
  
}

const headerStyle = {
  headerTitleAlign: 'center',
  headerStyle: {
    backgroundColor: '#0c4a6e'
  },
  headerTintColor: '#fff',
  headerTitleStyle: {
    fontWeight: 'bold',
  }
}

export default App
