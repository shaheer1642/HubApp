
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Image, Linking, Alert, Modal, ScrollView, FlatList, SafeAreaView, ActivityIndicator } from 'react-native';
import {styles} from './styles'
import {socket, session_key, refreshSessionKey} from './websocket_connection'
import {user_info} from './UserInfo'
import React, { Component } from 'react';
import { eventHandler } from './EventHandler';

class RecruitmentSquads extends Component {
    constructor(props) {
        super(props);
        this.searchSquadRef = React.createRef();
        this.state = {
            tabIndex: 0,
            relics: [],
            farming: [],
            progression: [],
            bosses: [],
            loadingSquads: true,
            searchSquad: ''
        }
    };

    componentDidMount() {
        console.log('[RecruitmentSquads] mounted')
        socket.emit('hubapp/recruitmentSquads/getAll')
        socket.addEventListener('hubapp/recruitmentSquads/receivedAll', this.receivedAllListener)
        socket.addEventListener('hubapp/recruitmentSquads/insertSquad', this.insertSquadListener)
        socket.addEventListener('hubapp/recruitmentSquads/updateSquad', this.updateSquadListener)
        socket.addEventListener('hubapp/recruitmentSquads/deleteSquad', this.deleteSquadListener)
    }

    componentWillUnmount() {
        console.log('[RecruitmentSquads] unmounted')
        socket.removeEventListener('hubapp/recruitmentSquads/receivedAll', this.receivedAllListener)
        socket.removeEventListener('hubapp/recruitmentSquads/insertSquad', this.insertSquadListener)
        socket.removeEventListener('hubapp/recruitmentSquads/updateSquad', this.updateSquadListener)
        socket.removeEventListener('hubapp/recruitmentSquads/deleteSquad', this.deleteSquadListener)
    }

    receivedAllListener = (data) => {
        console.log('[RecruitmentSquads] hubapp/recruitmentSquads/receivedAll')
        if (data.code != 200) {
            console.log(data.response)
            return
        }
        console.log(data)
        this.setState({
            loadingSquads: false,
            relics: [...data.response.relics],
            farming: [...data.response.farming],
            progression: [...data.response.progression],
            bosses: [...data.response.bosses]
        })
    }
    insertSquadListener = (data) => {
        console.log('[RecruitmentSquads] hubapp/recruitmentSquads/insertSquad')
        if (data.code != 200) {
            console.log(data.response)
            return
        }
        console.log(data)
        const squad = data.response
        if (squad.category == 'relics')
            this.setState({
                relics: [...this.state.relics, squad],
            })
        else if (squad.category == 'farming')
            this.setState({
                farming: [...this.state.farming, squad],
            })
        else if (squad.category == 'progression')
            this.setState({
                progression: [...this.state.progression, squad],
            })
        else if (squad.category == 'bosses')
            this.setState({
                bosses: [...this.state.bosses, squad],
            })
    }
    updateSquadListener = (data) => {
        console.log('[RecruitmentSquads] hubapp/recruitmentSquads/updateSquad')
        if (data.code != 200) {
            console.log(data.response)
            return
        }
        console.log(data)
        // note: response is an array, with 0th the new squad and 1st the old squad
        const squad = data.response
        if (squad[0].category == 'relics') {
            console.log('updating relics')
            this.setState(state => {
                const relics = state.relics.map((relicSquad, index) => {
                    console.log(relicSquad.message_id,squad[0].message_id)
                    if (relicSquad.message_id == squad[0].message_id) {
                        console.log('found squad')
                        return squad[0];
                    } else {
                        return relicSquad
                    }
                });
                return {
                    relics,
                };
            });
        }
        else if (squad[0].category == 'farming') {
            console.log('updating farming')
            this.setState(state => {
                const farming = state.farming.map((farmingSquad, index) => {
                    console.log(farmingSquad.message_id,squad[0].message_id)
                    if (farmingSquad.message_id == squad[0].message_id) {
                        console.log('found squad')
                        return squad[0];
                    } else {
                        return farmingSquad
                    }
                });
                return {
                    farming,
                };
            });
        }
        else if (squad[0].category == 'progression') {
            console.log('updating progression')
            this.setState(state => {
                const progression = state.progression.map((progressionSquad, index) => {
                    console.log(progressionSquad.message_id,squad[0].message_id)
                    if (progressionSquad.message_id == squad[0].message_id) {
                        console.log('found squad')
                        return squad[0];
                    } else {
                        return progressionSquad
                    }
                });
                return {
                    progression,
                };
            });
        }
        else if (squad[0].category == 'bosses') {
            console.log('updating bosses')
            this.setState(state => {
                const bosses = state.bosses.map((bossSquad, index) => {
                    console.log(bossSquad.message_id,squad[0].message_id)
                    if (bossSquad.message_id == squad[0].message_id) {
                        console.log('found squad')
                        return squad[0];
                    } else {
                        return bossSquad
                    }
                });
                return {
                    bosses,
                };
            });
        }
    }
    deleteSquadListener = (data) => {
        console.log('[RecruitmentSquads] hubapp/recruitmentSquads/deleteSquad')
        if (data.code != 200) {
            console.log(data.response)
            return
        }
        console.log(data)
        const squad = data.response
        if (squad.category == 'relics') {
            this.setState(state => {
              const relics = state.relics.filter((relicSquad, index) => relicSquad.message_id != squad.message_id);
              return {
                relics,
              };
            });
        }
        else if (squad.category == 'farming') {
            this.setState(state => {
              const farming = state.farming.filter((farmingSquad, index) => farmingSquad.message_id != squad.message_id);
              return {
                farming,
              };
            });
        }
        else if (squad.category == 'progression') {
            this.setState(state => {
              const progression = state.progression.filter((progressionSquad, index) => progressionSquad.message_id != squad.message_id);
              return {
                progression,
              };
            });
        }
        else if (squad.category == 'bosses') {
            this.setState(state => {
              const bosses = state.bosses.filter((bossSquad, index) => bossSquad.message_id != squad.message_id);
              return {
                bosses,
              };
            });
        }
    }

    displaySquads = (squadsArr) => {
        return (
            <FlatList 
            columnWrapperStyle={{flexWrap:'wrap',justifyContent:'space-evenly'}}
            listKey={(item, index) => `_key${index.toString()}`}
            keyExtractor={(item, index) => `_key${index.toString()}`}
            data={squadsArr}
            numColumns={5}
            renderItem={({item, index}) => {
                const channel_id = item.channel_id
                const message_id = item.message_id
                for (const [index,word] of this.state.searchSquad.toLowerCase().split(' ').entries()) {
                    if (!JSON.stringify(item).toLowerCase().match(word))
                        return (<></>)
                }
                var textColor = 'white'
                if (item.embed[0].fields[0].value.match('Lith')) textColor = '#1abc91'
                else if (item.embed[0].fields[0].value.match('Meso')) textColor = '#358bdb'
                else if (item.embed[0].fields[0].value.match('Neo')) textColor = '#e74b3d'
                else if (item.embed[0].fields[0].value.match('Axi')) textColor = '#e5c10f'
                return (
                    <View key={index} style={{borderColor: '#67e8f9',  borderRadius: 10, borderWidth: 2, marginTop: 10, marginHorizontal: 5, padding: 10}}>
                        <FlatList 
                        listKey={(item, index) => `_key${index.toString()}`}
                        keyExtractor={(item, index) => `_key${index.toString()}`}
                        numColumns={3}
                        data={item.embed[0].fields}
                        columnWrapperStyle={{justifyContent: 'space-between'}}
                        renderItem={({item, index}) => {
                            return (
                                <View style={{marginHorizontal: 10}}>
                                    <Text style={{color: '#5eead4'}}>{`${item.name == '\u200b'? '':`${item.name}:`}`}</Text>
                                    <Text style={{color: textColor}}>{item.value
                                    .replace(/<:on:908808303910469732>/g,'🟢')
                                    .replace(/<:off:908808426908446721>/g,'🔴')
                                    .replace(/<.*>/g,'')
                                    .replace(/:flag.*:/g,'') 
                                    .replace(/　/g,'')  
                                    .replace(/\n /g,'\n')
                                    .trim()}</Text>
                                </View>
                            )
                        }}
                        />
                        <TouchableOpacity
                            style={{...styles.button, backgroundColor: '#164e63', borderRadius: 10, width: 150, alignSelf: 'center'}}
                            onPress={() => Linking.openURL(`https://discordapp.com/channels/865904902941048862/${channel_id}/${message_id}`).catch(console.error)}
                        >
                            <Text style={{...styles.buttonText, color: '#67e8f9'}}>Join via Discord</Text>
                        </TouchableOpacity>
                    </View>
                )
            }}
            />
        )
    }


    render() {
        return (
            this.state.loadingSquads ? 
            <View style={styles.view}>
              <Text style={{color: '#5eead4', marginBottom: 20, fontSize: 16}}>Loading Squads...</Text>
              <ActivityIndicator size='large' color='#5eead4'/>
            </View>:
            <View style={styles.viewContainer}>
                <View style={styles.viewHeader}>
                    <View style={{width: '100%'}}>
                        <TextInput
                            ref={this.searchSquadRef}
                            style={styles.textInput}
                            placeholder="Search for Squad"
                            placeholderTextColor={'white'}
                            onChange={(event) => this.setState({searchSquad: event.nativeEvent.text})}
                            onSubmitEditing={(event) => this.setState({searchSquad: event.nativeEvent.text})}
                        />
                    </View>
                </View>
                <View style={styles.viewBody}>
                    {this.state.tabIndex == 0 ? this.displaySquads(this.state.relics):<></>}
                    {this.state.tabIndex == 1 ? this.displaySquads(this.state.farming):<></>}
                    {this.state.tabIndex == 2 ? this.displaySquads(this.state.progression):<></>}
                    {this.state.tabIndex == 3 ? this.displaySquads(this.state.bosses):<></>}
                </View>
                <View style={{...styles.viewFooter}}>
                    <View style={{flex:1,flexDirection: 'row',width: '100%', justifyContent: 'space-evenly', alignItems: 'center'}}>

                        <TouchableOpacity
                            active={0}
                            onPress={() => this.setState({searchSquad: ''},this.setState({tabIndex: 0},this.searchSquadRef.current.setNativeProps({ text: "" })))}
                            style={{flex:1,backgroundColor: this.state.tabIndex == 0 ? '#164e63':styles.view.backgroundColor,borderColor: '#0c4a6e', borderLeftWidth: 0, borderWidth: 2, height: '100%',width:'100%',alignItems:'center',justifyContent: 'center'}}
                        >
                            <View style={{flexDirection: 'column'}}>
                                <Text style={{color: 'white', fontSize: 15, textAlign: 'center', marginBottom: 5}}>🔮</Text>
                                <Text style={{color: '#67e8f9', fontSize: 15, textAlign: 'center'}}>Relics</Text>
                            </View>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            onPress={() => this.setState({searchSquad: ''},this.setState({tabIndex: 1},this.searchSquadRef.current.setNativeProps({ text: "" })))}
                            style={{flex:1,backgroundColor: this.state.tabIndex == 1 ? '#164e63':styles.view.backgroundColor,borderColor: '#0c4a6e', borderLeftWidth: 0, borderWidth: 2, height: '100%',width:'100%',alignItems:'center',justifyContent: 'center'}}
                        >
                            <View style={{flexDirection: 'column'}}>
                                <Text style={{color: 'white', fontSize: 15, textAlign: 'center', marginBottom: 5}}>⛏</Text>
                                <Text style={{color: '#67e8f9', fontSize: 15, textAlign: 'center'}}>Farming</Text>
                            </View>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            onPress={() => this.setState({searchSquad: ''},this.setState({tabIndex: 2},this.searchSquadRef.current.setNativeProps({ text: "" })))}
                            style={{flex:1,backgroundColor: this.state.tabIndex == 2 ? '#164e63':styles.view.backgroundColor,borderColor: '#0c4a6e', borderLeftWidth: 0, borderWidth: 2, height: '100%',width:'100%',alignItems:'center',justifyContent: 'center'}}
                        >
                            <View style={{flexDirection: 'column'}}>
                                <Text style={{color: 'white', fontSize: 15, textAlign: 'center', marginBottom: 5}}>📊</Text>
                                <Text style={{color: '#67e8f9', fontSize: 15, textAlign: 'center'}}>Leveling</Text>
                            </View>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            onPress={() => this.setState({searchSquad: ''},this.setState({tabIndex: 3},this.searchSquadRef.current.setNativeProps({ text: "" })))}
                            style={{flex:1,backgroundColor: this.state.tabIndex == 3 ? '#164e63':styles.view.backgroundColor,borderColor: '#0c4a6e', borderLeftWidth: 0, borderRightWidth: 0, borderWidth: 2, height: '100%',width:'100%',alignItems:'center',justifyContent: 'center'}}
                        >
                            <View style={{flexDirection: 'column'}}>
                                <Text style={{color: 'white', fontSize: 15, textAlign: 'center', marginBottom: 5}}>🧙</Text>
                                <Text style={{color: '#67e8f9', fontSize: 15, textAlign: 'center'}}>Bosses</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    }
}

export {RecruitmentSquads}

/*

            <View style={styles.viewContainer}>
                <View style={styles.viewBody}>
                    <ScrollView>
                        {this.displayRelicSquads()}
                        {this.displayFarmingSquads()}
                        {this.displayProgressionSquads()}
                        {this.displaybossSquads()}
                    </ScrollView>
                </View>
                <View style={styles.viewFooter}>
                </View>
            </View>
*/