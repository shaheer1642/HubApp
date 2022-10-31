
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Image, Linking, Alert, Modal, ScrollView, FlatList, SafeAreaView, ActivityIndicator } from 'react-native';
import {styles} from './styles'
import {socket, session_key, refreshSessionKey} from './websocket_connection'
import {user_info} from './UserInfo'
import React, { Component } from 'react';
import { eventHandler } from './EventHandler';
import {convertUpper,dynamicSort,dynamicSortDesc} from './Functions'


class Trading extends Component {
    constructor(props) {
        super(props);
        this.searchItemRef = React.createRef();
        this.state = {
            showSellers: 1,
            tabIndex: 0,
            itemTrades: {},
            lichTrades: {},
            rivenTrades: {},
            loadingTrades: true,
            searchItem: '',
            formAddItem_show: false,
            formAddItem_orderType: 1,
            formAddItem_itemRank: 1,
            formAddItem_itemPrice: '',
            formAddItem_itemName: '',
            alertModal_show: false,
            alertModal_text: '',
            menuModal_show: false,
            imageModal_show: false,
            imageModal_url: ''
        }
    };

    componentDidMount() {
        console.log('[Trading] mounted')
        socket.addEventListener('hubapp/trades/receivedAll', this.receivedAllListener)
        socket.addEventListener('hubapp/trades/insertItem', this.insertItemListener)
        socket.addEventListener('hubapp/trades/updateItem', this.updateItemListener)
        socket.addEventListener('hubapp/trades/deleteItem', this.deleteItemListener)
        socket.addEventListener('hubapp/trades/addNewItem', this.addNewItemListener)
        socket.emit('hubapp/trades/getAll')
    }
    
    componentWillUnmount() {
        console.log('[Trading] unmounted')
        socket.removeEventListener('hubapp/trades/receivedAll', this.receivedAllListener)
        socket.removeEventListener('hubapp/trades/insertItem', this.insertItemListener)
        socket.removeEventListener('hubapp/trades/updateItem', this.updateItemListener)
        socket.removeEventListener('hubapp/trades/deleteItem', this.deleteItemListener)
        socket.removeEventListener('hubapp/trades/addNewItem', this.addNewItemListener)
    }

    receivedAllListener = (data) => {
        console.log('[Trading] hubapp/trades/receivedAll')
        if (data.code != 200) {
            console.log(data.response)
            return
        }
        console.log(JSON.stringify(data))
        var itemTrades = {}
        data.response.itemTrades.forEach(item => {
            if (!itemTrades[item.item_id])
                itemTrades[item.item_id] = {item_id: item.item_id, item_url: item.item_url,tags: item.tags, icon_url: item.icon_url, sellers: [], buyers: []}
            if (item.order_type == 'wts')
                itemTrades[item.item_id].sellers.push({discord_id: item.discord_id, ign: item.ingame_name, price: item.user_price, rank: item.order_data.rank})
            else if (item.order_type == 'wtb')
                itemTrades[item.item_id].buyers.push({discord_id: item.discord_id, ign: item.ingame_name, price: item.user_price, rank: item.order_data.rank})
        })
        var lichTrades = {}
        data.response.lichTrades.forEach(item => {
            if (!lichTrades[item.item_id])
                lichTrades[item.item_id] = {item_id: item.item_id, item_url: item.item_url, icon_url: item.icon_url, sellers: [], buyers: []}
            if (item.order_type == 'wts')
                lichTrades[item.item_id].sellers.push({discord_id: item.discord_id, ign: item.ingame_name, price: item.user_price, order_data: item.order_data})
            else if (item.order_type == 'wtb')
                lichTrades[item.item_id].buyers.push({discord_id: item.discord_id, ign: item.ingame_name, price: item.user_price, order_data: item.order_data})
        })
        console.log(JSON.stringify(lichTrades))
        this.setState({
            itemTrades: {...itemTrades},
            lichTrades: {...lichTrades},
            rivenTrades: {},
            loadingTrades: false,
        })
    }
    insertItemListener = (data) => {
        console.log('[Trading] hubapp/trades/insertItem')
        if (data.code != 200) {
            console.log(data.response)
            return
        }
        console.log(data)
        const item = data.response
        if (item.visibility == false) {
            console.log('inserted item is not visible')
            return
        }
        if (item.item_type == 'item') {
            if (!this.state.itemTrades[item.item_id]) {
                if (item.order_type == 'wts')
                    this.setState({
                        itemTrades: {
                            ...this.state.itemTrades,
                            [`${item.item_id}`]: {item_id: item.item_id, item_url: item.item_url,tags: item.tags, icon_url: item.icon_url, sellers: [{discord_id: item.discord_id, ign: item.ingame_name, price: item.user_price, rank: item.order_data.rank}], buyers: []}
                        }
                    })
                else if (item.order_type == 'wtb')
                    this.setState({
                        itemTrades: {
                            ...this.state.itemTrades,
                            [`${item.item_id}`]: {item_id: item.item_id, item_url: item.item_url,tags: item.tags, icon_url: item.icon_url, buyers: [{discord_id: item.discord_id, ign: item.ingame_name, price: item.user_price, rank: item.order_data.rank}], sellers: []}
                        }
                    })
            } else {
                if (item.order_type == 'wts')
                    this.setState({
                        itemTrades: {
                            ...this.state.itemTrades,
                            [`${item.item_id}`]: {...this.state.itemTrades[`${item.item_id}`], sellers: [...this.state.itemTrades[`${item.item_id}`].sellers, {discord_id: item.discord_id, ign: item.ingame_name, price: item.user_price, rank: item.order_data.rank}]}
                        }
                    })
                else if (item.order_type == 'wtb')
                    this.setState({
                        itemTrades: {
                            ...this.state.itemTrades,
                            [`${item.item_id}`]: {...this.state.itemTrades[`${item.item_id}`], buyers: [...this.state.itemTrades[`${item.item_id}`].buyers, {discord_id: item.discord_id, ign: item.ingame_name, price: item.user_price, rank: item.order_data.rank}]}
                        }
                    })
            }
        } else if (item.item_type == 'lich') {
            if (!this.state.lichTrades[item.item_id]) {
                if (item.order_type == 'wts')
                    this.setState({
                        lichTrades: {
                            ...this.state.lichTrades,
                            [`${item.item_id}`]: {item_id: item.item_id, item_url: item.item_url, icon_url: item.icon_url, sellers: [{discord_id: item.discord_id, ign: item.ingame_name, price: item.user_price, order_data: item.order_data}], buyers: []}
                        }
                    })
                else if (item.order_type == 'wtb')
                    this.setState({
                        lichTrades: {
                            ...this.state.lichTrades,
                            [`${item.item_id}`]: {item_id: item.item_id, item_url: item.item_url, icon_url: item.icon_url, buyers: [{discord_id: item.discord_id, ign: item.ingame_name, price: item.user_price, order_data: item.order_data}], sellers: []}
                        }
                    })
            } else {
                if (item.order_type == 'wts')
                    this.setState({
                        lichTrades: {
                            ...this.state.lichTrades,
                            [`${item.item_id}`]: {...this.state.lichTrades[`${item.item_id}`], sellers: [...this.state.lichTrades[`${item.item_id}`].sellers, {discord_id: item.discord_id, ign: item.ingame_name, price: item.user_price, order_data: item.order_data}]}
                        }
                    })
                else if (item.order_type == 'wtb')
                    this.setState({
                        lichTrades: {
                            ...this.state.lichTrades,
                            [`${item.item_id}`]: {...this.state.lichTrades[`${item.item_id}`], buyers: [...this.state.lichTrades[`${item.item_id}`].buyers, {discord_id: item.discord_id, ign: item.ingame_name, price: item.user_price, order_data: item.order_data}]}
                        }
                    })
            }
        }
    }
    updateItemListener = (data) => {
        console.log('[Trading] hubapp/trades/updateItem')
        if (data.code != 200) {
            console.log(data.response)
            return
        }
        console.log(data)
        // note: response is an array, with 0th the new squad and 1st the old squad
        const item = data.response
        if (item.item_type == 'item') {
            this.setState(state => {
                state.itemTrades[item.item_id].buyers = state.itemTrades[item.item_id].buyers.filter((buyer, index) => buyer.discord_id != item.discord_id)
                state.itemTrades[item.item_id].sellers = state.itemTrades[item.item_id].sellers.filter((seller, index) => seller.discord_id != item.discord_id)
                if (item.order_type == 'wts')
                    state.itemTrades[item.item_id].sellers = [...state.itemTrades[item.item_id].sellers, {discord_id: item.discord_id, ign: item.ingame_name, price: item.user_price, rank: item.order_data.rank}]
                else if (item.order_type == 'wtb')
                    state.itemTrades[item.item_id].buyers = [...state.itemTrades[item.item_id].buyers, {discord_id: item.discord_id, ign: item.ingame_name, price: item.user_price, rank: item.order_data.rank}]
                return {
                    state,
                };
            });
        } else if (item.item_type == 'lich') {
            this.setState(state => {
                state.lichTrades[item.item_id].buyers = state.lichTrades[item.item_id].buyers.filter((buyer, index) => buyer.discord_id != item.discord_id)
                state.lichTrades[item.item_id].sellers = state.lichTrades[item.item_id].sellers.filter((seller, index) => seller.discord_id != item.discord_id)
                if (item.order_type == 'wts')
                    state.lichTrades[item.item_id].sellers = [...state.lichTrades[item.item_id].sellers, {discord_id: item.discord_id, ign: item.ingame_name, price: item.user_price, order_data: item.order_data}]
                else if (item.order_type == 'wtb')
                    state.lichTrades[item.item_id].buyers = [...state.lichTrades[item.item_id].buyers, {discord_id: item.discord_id, ign: item.ingame_name, price: item.user_price, order_data: item.order_data}]
                return {
                    state,
                };
            });
        }
    }
    deleteItemListener = (data) => {
        console.log('[Trading] hubapp/trades/deleteItem')
        if (data.code != 200) {
            console.log(data.response)
            return
        }
        console.log(data)
        const item = data.response
        if (item.visibility == false) {
            console.log('deleted item was not visible')
            return
        }
        if (item.item_type == 'item') {
            this.setState(state => {
                if (item.order_type == 'wts')
                    state.itemTrades[item.item_id].sellers = state.itemTrades[item.item_id].sellers.filter((seller, index) => seller.discord_id != item.discord_id)
                else if (item.order_type == 'wtb')
                    state.itemTrades[item.item_id].buyers = state.itemTrades[item.item_id].buyers.filter((buyer, index) => buyer.discord_id != item.discord_id)
                return {
                    state,
                };
            });
        } else if (item.item_type == 'lich') {
            this.setState(state => {
                if (item.order_type == 'wts')
                    state.lichTrades[item.item_id].sellers = state.lichTrades[item.item_id].sellers.filter((seller, index) => seller.discord_id != item.discord_id)
                else if (item.order_type == 'wtb')
                    state.lichTrades[item.item_id].buyers = state.lichTrades[item.item_id].buyers.filter((buyer, index) => buyer.discord_id != item.discord_id)
                return {
                    state,
                };
            });
        }
    }
    addNewItemListener = (data) => {
        console.log('[Trading] hubapp/trades/addNewItem')
        this.setState({
            alertModal_show: true,
            alertModal_text: data.response
        });
    }

    displayItemTrades = () => {
        // get list of items
        return (
            <FlatList 
            columnWrapperStyle={{flexWrap:'wrap',justifyContent:'space-evenly'}}
            listKey={(item, index) => `_key${index.toString()}`}
            keyExtractor={(item, index) => `_key${index.toString()}`}
            data={Object.keys(this.state.itemTrades).map(key => {return this.state.itemTrades[key]})}
            numColumns={5}
            renderItem={({item, index}) => {
                const itemInfo = item
                itemInfo.sellers = itemInfo.sellers.sort(dynamicSort("price"))
                itemInfo.buyers = itemInfo.buyers.sort(dynamicSortDesc("price"))

                if (this.state.showSellers == 1 && itemInfo.sellers.length == 0)
                    return (<></>)
                if (this.state.showSellers == 0 && itemInfo.buyers.length == 0)
                    return (<></>)
                return (
                    <View key={index} style={{borderColor: this.state.showSellers == 1 ? '#48f075':'#fc4444',  borderRadius: 10, borderWidth: 2, marginTop: 10, marginHorizontal: 5, padding: 10}}>
                        <View style={{marginHorizontal: 10}}>
                            <View style={{flexDirection:'row'}}>
                                <View>
                                    <Text style={{color: '#67e8f9', marginBottom: 10, fontSize:16, fontWeight: 'bold'}}>{convertUpper(itemInfo.item_url)}</Text>
                                    <FlatList 
                                    numColumns={3}
                                    listKey={(item, index) => `_key${index.toString()}`}
                                    keyExtractor={(item, index) => `_key${index.toString()}`}
                                    data={[this.state.showSellers == 1 ? 'Sellers':'Buyers','Prices','Trade']}
                                    columnWrapperStyle={{justifyContent: 'space-between'}}
                                    renderItem={({item, index}) => {
                                        return (
                                            <View style={{marginHorizontal: 10}}>
                                            <Text style={{color: '#5eead4'}}>{item}</Text>
                                            {index == 0 ? 
                                            <Text style={{color: 'white'}}>{this.state.showSellers == 1 ? itemInfo.sellers.map(seller => seller.ign).join('\n'):itemInfo.buyers.map(buyer => buyer.ign).join('\n')}</Text>
                                            :index == 1 ? 
                                            <Text style={{color: 'white'}}>{this.state.showSellers == 1 ? itemInfo.sellers.map(seller => seller.price).join('\n'):itemInfo.buyers.map(buyer => buyer.price).join('\n')}</Text>
                                            :<View style={{flexDirection: 'column'}}>
                                                {itemInfo[`${this.state.showSellers == 1 ? 'sellers':'buyers'}`].map((value,index) => 
                                                    (value.discord_id == user_info.discord_id ? 
                                                        <TouchableOpacity
                                                            key={index}
                                                            onPress={() => socket.emit('hubapp/trades/removeItem', {
                                                                discord_id: user_info.discord_id, 
                                                                item_id: itemInfo.item_id
                                                            })}
                                                        >
                                                            <Text style={{color: '#67e8f9', textDecorationLine: 'underline'}}>Remove</Text>
                                                        </TouchableOpacity>:
                                                        <TouchableOpacity
                                                        key={index}
                                                        onPress={() => {socket.emit('hubapp/trades/openTrade',{current_discord_id: user_info.discord_id,target_discord_id: value.discord_id,item_id: itemInfo.item_id})}}
                                                        >
                                                            <Text style={{color: '#67e8f9', textDecorationLine: 'underline'}}>{this.state.showSellers == 1 ? 'Buy':'Sell'}</Text>
                                                        </TouchableOpacity>
                                                    )
                                                )}
                                            </View>
                                        }
                                            </View>
                                        )
                                    }}
                                    />
                                </View>
                                <Image
                                    source={{uri: `https://warframe.market/static/assets/${itemInfo.icon_url}`}}
                                    style={{ width: 80, height: 80, resizeMode: 'contain'}}
                                />
                            </View>
                        </View>
                    </View>
                )
            }}
            />
        )
    }
    displayLichTrades = () => {
        // get list of items
        return (
            <FlatList 
            columnWrapperStyle={{flexWrap:'wrap',justifyContent:'space-evenly'}}
            listKey={(item, index) => `_key${index.toString()}`}
            keyExtractor={(item, index) => `_key${index.toString()}`}
            data={Object.keys(this.state.lichTrades).map(key => {return this.state.lichTrades[key]})}
            numColumns={5}
            renderItem={({item, index}) => {
                const itemInfo = item
                itemInfo.sellers = itemInfo.sellers.sort(dynamicSort("price"))
                itemInfo.buyers = itemInfo.buyers.sort(dynamicSortDesc("price"))

                if (this.state.showSellers == 1 && itemInfo.sellers.length == 0)
                    return (<></>)
                if (this.state.showSellers == 0 && itemInfo.buyers.length == 0)
                    return (<></>)

                return (
                    <View key={index} style={{borderColor: this.state.showSellers == 1 ? '#48f075':'#fc4444',  borderRadius: 10, borderWidth: 2, marginTop: 10, marginHorizontal: 5, padding: 10}}>
                        <View style={{marginHorizontal: 10}}>
                            <View style={{flexDirection:'row'}}>
                                <View>
                                    <Text style={{color: '#67e8f9', marginBottom: 10, fontSize:16, fontWeight: 'bold'}}>{convertUpper(itemInfo.item_url)}</Text>
                                    <FlatList 
                                    numColumns={4}
                                    listKey={(item, index) => `_key${index.toString()}`}
                                    keyExtractor={(item, index) => `_key${index.toString()}`}
                                    data={[this.state.showSellers == 1 ? 'Sellers':'Buyers','Prices','Stats','Trade']}
                                    columnWrapperStyle={{justifyContent: 'space-between'}}
                                    renderItem={({item, index}) => {
                                        return (
                                            <View style={{marginHorizontal: 10}}>
                                            <Text style={{color: '#5eead4'}}>{item}</Text>
                                            {index == 0 ? 
                                            <Text style={{color: 'white'}}>{this.state.showSellers == 1 ? itemInfo.sellers.map(seller => seller.ign).join('\n'):itemInfo.buyers.map(buyer => buyer.ign).join('\n')}</Text>
                                            :index == 1 ? 
                                            <Text style={{color: 'white'}}>{this.state.showSellers == 1 ? itemInfo.sellers.map(seller => seller.price).join('\n'):itemInfo.buyers.map(buyer => buyer.price).join('\n')}</Text>
                                            :index == 2 ? 
                                            <View style={{flexDirection: 'column'}}>
                                                {itemInfo[`${this.state.showSellers == 1 ? 'sellers':'buyers'}`].map((trader,index) => 
                                                    (
                                                        <TouchableOpacity
                                                        key={index}
                                                        onPress={() => {this.setState({imageModal_show: true, imageModal_url: trader.order_data.lich_image_url})}}
                                                        >
                                                            <Text style={{color: '#67e8f9', textDecorationLine: 'underline'}}>View</Text>
                                                        </TouchableOpacity>
                                                    )
                                                )}
                                            </View>
                                            :<View style={{flexDirection: 'column'}}>
                                                {itemInfo[`${this.state.showSellers == 1 ? 'sellers':'buyers'}`].map((value,index) => 
                                                    (value.discord_id == user_info.discord_id ? 
                                                        <TouchableOpacity
                                                            key={index}
                                                            onPress={() => socket.emit('hubapp/trades/removeLich', {
                                                                discord_id: user_info.discord_id, 
                                                                item_id: itemInfo.item_id
                                                            })}
                                                        >
                                                            <Text style={{color: '#67e8f9', textDecorationLine: 'underline'}}>Remove</Text>
                                                        </TouchableOpacity>:
                                                        <TouchableOpacity
                                                        key={index}
                                                        onPress={() => {socket.emit('hubapp/trades/openTrade',{current_discord_id: user_info.discord_id,target_discord_id: value.discord_id,item_id: itemInfo.item_id})}}
                                                        >
                                                            <Text style={{color: '#67e8f9', textDecorationLine: 'underline'}}>{this.state.showSellers == 1 ? 'Buy':'Sell'}</Text>
                                                        </TouchableOpacity>
                                                    )
                                                )}
                                            </View>
                                        }
                                            </View>
                                        )
                                    }}
                                    />
                                </View>
                                <Image
                                    source={{uri: `https://warframe.market/static/assets/${itemInfo.icon_url}`}}
                                    style={{ width: 80, height: 80, resizeMode: 'contain'}}
                                />
                            </View>
                        </View>
                    </View>
                )
            }}
            />
        )
    }
    displayRivenTrades = () => {
        return (<Text style={{fontSize: 32, color:'white'}}>This feature is under development</Text>)
    }


    render() {
        return (
            this.state.loadingTrades ? 
            <View style={styles.view}>
              <Text style={{color: '#5eead4', marginBottom: 20, fontSize: 16}}>Loading Trades...</Text>
              <ActivityIndicator size='large' color='#5eead4'/>
            </View>:
            <View style={styles.viewContainer}>
                <View style={{...styles.viewHeader, flex:2 }}>
                    <View style={{flexDirection:'row'}}>
                        <TouchableOpacity
                            onPress={() => this.setState({showSellers: 1})}
                            style={{borderColor: 'white', backgroundColor: this.state.showSellers == 1 ? '#164e63':styles.viewHeader.backgroundColor, paddingVertical: 10, paddingHorizontal: 30, borderColor: 'white', borderWidth: 3, borderTopLeftRadius: 10, borderBottomLeftRadius: 10}}
                        >
                            <Text style={{color: '#48f075', fontSize: 15, textAlign: 'center'}}>Sellers</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => this.setState({showSellers: 0})}
                            style={{borderColor: 'white', backgroundColor: this.state.showSellers == 0 ? '#164e63':styles.viewHeader.backgroundColor, paddingVertical: 10, paddingHorizontal: 30, borderColor: 'white', borderWidth: 3, borderLeftWidth: 0, borderTopRightRadius: 10, borderBottomRightRadius: 10}}
                        >
                            <Text style={{color: '#fc4444', fontSize: 15, textAlign: 'center'}}>Buyers</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{width: '100%', marginTop: 10}}>
                        <TextInput
                            ref={this.searchItemRef}
                            style={{...styles.textInput}}
                            placeholder="Search for an Item"
                            placeholderTextColor={'white'}
                            onChange={(event) => this.setState({searchItem: event.nativeEvent.text})}
                            onSubmitEditing={(event) => this.setState({searchItem: event.nativeEvent.text})}
                        />
                    </View>
                </View>
                <View style={styles.viewBody}>
                    {this.state.tabIndex == 0 ? this.displayItemTrades():<></>}
                    {this.state.tabIndex == 1 ? this.displayLichTrades():<></>}
                    {this.state.tabIndex == 2 ? this.displayRivenTrades():<></>}
                    <View style={{flex:1,backgroundColor: 'transparent', alignSelf: 'flex-end',alignItems: 'flex-end', justifyContent: 'flex-end', marginRight: 10}}>
                        <TouchableOpacity
                            style={{
                                borderWidth: 3,
                                borderColor: 'white',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bottom: 10,
                                right: 10,
                                width: 70,
                                height: 70,
                                backgroundColor: '#0891b2',
                                borderRadius: 100,
                                paddingBottom: 10
                            }}
                            onPress={() => this.setState({menuModal_show: true})}
                        >
                            <Text style={{fontSize: 24}}>...</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{...styles.viewFooter}}>
                    <View style={{flex:1,flexDirection: 'row',width: '100%', justifyContent: 'space-evenly', alignItems: 'center'}}>
                        <TouchableOpacity
                            active={0}
                            onPress={() => this.setState({searchItem: ''},this.setState({tabIndex: 0},this.searchItemRef.current.setNativeProps({ text: "" })))}
                            style={{flex:1,backgroundColor: this.state.tabIndex == 0 ? '#164e63':styles.view.backgroundColor,borderColor: '#0c4a6e', borderLeftWidth: 0, borderWidth: 2, height: '100%',width:'100%',alignItems:'center',justifyContent: 'center'}}
                        >
                            <View style={{flexDirection: 'column'}}>
                                <Text style={{color: 'white', fontSize: 15, textAlign: 'center', marginBottom: 5}}>💱</Text>
                                <Text style={{color: '#67e8f9', fontSize: 15, textAlign: 'center'}}>Items</Text>
                            </View>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            onPress={() => this.setState({searchItem: ''},this.setState({tabIndex: 1},this.searchItemRef.current.setNativeProps({ text: "" })))}
                            style={{flex:1,backgroundColor: this.state.tabIndex == 1 ? '#164e63':styles.view.backgroundColor,borderColor: '#0c4a6e', borderLeftWidth: 0, borderWidth: 2, height: '100%',width:'100%',alignItems:'center',justifyContent: 'center'}}
                        >
                            <View style={{flexDirection: 'column'}}>
                                <Text style={{color: 'white', fontSize: 15, textAlign: 'center', marginBottom: 5}}>🧟</Text>
                                <Text style={{color: '#67e8f9', fontSize: 15, textAlign: 'center'}}>Liches</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => this.setState({searchItem: ''},this.setState({tabIndex: 2},this.searchItemRef.current.setNativeProps({ text: "" })))}
                            style={{flex:1,backgroundColor: this.state.tabIndex == 2 ? '#164e63':styles.view.backgroundColor,borderColor: '#0c4a6e', borderLeftWidth: 0, borderWidth: 2, height: '100%',width:'100%',alignItems:'center',justifyContent: 'center'}}
                        >
                            <View style={{flexDirection: 'column'}}>
                                <Text style={{color: 'white', fontSize: 15, textAlign: 'center', marginBottom: 5}}>🎆</Text>
                                <Text style={{color: '#67e8f9', fontSize: 15, textAlign: 'center'}}>Rivens</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>




<Modal
    animationType="fade"
    transparent={true}
    visible={this.state.formAddItem_show}
    children={
        <View style={{...styles.modalContainer}}>
            <View style={styles.modalBody}>
                <View style={styles.modalHeader}>
                    <Text style={{color: 'white', fontSize: 16,paddingHorizontal:10}}>Add New Item</Text>
                </View>
                <View style={{flex: 10, alignItems: 'flex-start', justifyContent: 'space-around', alignSelf: 'flex-start', margin: 10}}>

                    <View style={{flexDirection:'row'}}>
                        <TouchableOpacity
                            onPress={() => this.setState({formAddItem_orderType: 1})}
                            style={{borderColor: 'white', backgroundColor: this.state.formAddItem_orderType == 1 ? '#059669':styles.viewHeader.backgroundColor, paddingVertical: 10, paddingHorizontal: 15, borderColor: 'white', borderWidth: 3, borderTopLeftRadius: 10, borderBottomLeftRadius: 10}}
                        >
                            <Text style={{color: '#48f075', fontSize: 12, textAlign: 'center'}}>WTS</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => this.setState({formAddItem_orderType: 0})}
                            style={{borderColor: 'white', backgroundColor: this.state.formAddItem_orderType == 0 ? '#7f1d1d':styles.viewHeader.backgroundColor, paddingVertical: 10, paddingHorizontal: 15, borderColor: 'white', borderWidth: 3, borderLeftWidth: 0, borderTopRightRadius: 10, borderBottomRightRadius: 10}}
                        >
                            <Text style={{color: '#fc4444', fontSize: 12, textAlign: 'center'}}>WTB</Text>
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        style={{
                            color: '#5eead4',
                            borderColor: 'white',
                            height: 40,
                            borderWidth: 3,
                            padding: 10,
                            width: 250
                        }}
                        placeholder="Enter item name"
                        placeholderTextColor={'white'}
                        value={this.state.formAddItem_itemName}
                        onSubmitEditing={(event) => {}}
                        onChangeText={(text) => this.setState({formAddItem_itemName: text})}
                        blurOnSubmit={false}
                    />

                    <View style={{flexDirection:'row'}}>
                        <TouchableOpacity
                            onPress={() => this.setState({formAddItem_itemRank: 1})}
                            style={{borderColor: 'white', backgroundColor: this.state.formAddItem_itemRank == 1 ? '#059669':styles.viewHeader.backgroundColor, paddingVertical: 10, paddingHorizontal: 15, borderColor: 'white', borderWidth: 3, borderTopLeftRadius: 10, borderBottomLeftRadius: 10}}
                        >
                            <Text style={{color: '#48f075', fontSize: 12, textAlign: 'center'}}>Unranked</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => this.setState({formAddItem_itemRank: 0})}
                            style={{borderColor: 'white', backgroundColor: this.state.formAddItem_itemRank == 0 ? '#7f1d1d':styles.viewHeader.backgroundColor, paddingVertical: 10, paddingHorizontal: 15, borderColor: 'white', borderWidth: 3, borderLeftWidth: 0, borderTopRightRadius: 10, borderBottomRightRadius: 10}}
                        >
                            <Text style={{color: '#fc4444', fontSize: 12, textAlign: 'center'}}>Maxed</Text>
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        style={{
                            color: '#5eead4',
                            borderColor: 'white',
                            height: 40,
                            borderWidth: 3,
                            padding: 10,
                            width: 100
                        }}
                        placeholder="Enter price"
                        placeholderTextColor={'white'}
                        value={this.state.formAddItem_itemPrice}
                        onSubmitEditing={(event) => {}}
                        onChangeText={(text) => this.setState({formAddItem_itemPrice: text})}
                        blurOnSubmit={false}
                        keyboardType='numeric'
                    />
                    
                </View>
                <View style={styles.modalFooter}>
                    <View style={{flexDirection: 'row', height: '100%', width: '100%'}}>
                        <TouchableOpacity
                            onPress={() => socket.emit('hubapp/trades/addNewItem', {
                                discord_id: user_info.discord_id, 
                                user_price: this.state.formAddItem_itemPrice, 
                                item_name: this.state.formAddItem_itemName,
                                order_type: this.state.formAddItem_orderType == 1 ? 'wts':'wtb',
                                rank: this.state.formAddItem_itemRank == 1 ? 'unranked':'maxed',
                                auto_price: false
                            })}
                            style={{width: '50%',justifyContent: 'center', alignItems: 'center', backgroundColor: '#047857', height: '100%', borderBottomLeftRadius: 10}}
                        >
                            <Text style={{fontSize: 22, color: 'white'}}>Add</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => this.setState({formAddItem_show: false})}
                            style={{width: '50%',justifyContent: 'center',backgroundColor: '#be123c', alignItems: 'center', borderBottomRightRadius: 10}}
                        >
                            <Text style={{fontSize: 22, color: 'white'}}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    }
onRequestClose={() => this.setState({formAddItem_show: false})}
></Modal>



<Modal
    animationType="slide"
    transparent={true}
    visible={this.state.alertModal_show}
    children={
        <View style={styles.modalContainer}>
            <View style={styles.modalBody}>
                <View style={styles.modalHeader}>
                    <Text style={{color: 'white', fontSize: 16,paddingHorizontal:10}}>Server Response</Text>
                </View>
                <View style={{flex: 10, justifyContent: 'center'}}>
                    <Text style={{color: 'white', fontSize: 16,paddingHorizontal:10}}>{this.state.alertModal_text}</Text>
                </View>
                <View style={styles.modalFooter}>
                    <TouchableOpacity
                        onPress={() => this.setState({alertModal_show: false})}
                        style={{width: '100%',justifyContent: 'center', alignItems: 'center'}}
                    >
                        <Text style={{fontSize: 22, color: 'white', paddingHorizontal: '35%'}}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    }
    onRequestClose={() => this.setState({alertModal_show: false})}
></Modal>


<Modal
    animationType="slide"
    transparent={true}
    visible={this.state.menuModal_show}
    children={
        <TouchableOpacity
            style={{width: '100%',height: '100%', backgroundColor: 'black',opacity: 0.8,justifyContent: 'center',alignItems: 'center'}}
            onPress={() => this.setState({menuModal_show: false})}
        >
            <View style={{height: '30%', width: '60%',alignSelf: 'center',justifyContent: 'center', alignItems:'center', backgroundColor: '#404040',borderWidth: 5,borderColor:'grey', borderRadius: 10}}>
                    <TouchableOpacity
                        onPress={() => this.setState({formAddItem_show: true,menuModal_show: false})}
                        style={{flex:1,width: '100%',justifyContent: 'center', alignItems: 'center', backgroundColor: '#059669',borderTopLeftRadius: 5, borderTopRightRadius: 5}}
                    >
                        <Text style={{fontSize: 22, color: 'white'}}>Add New Order</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {socket.emit("hubapp/trades/activateAll", {discord_id: user_info.discord_id});this.setState({menuModal_show: false})}}
                        style={{flex:1,width: '100%',justifyContent: 'center', alignItems: 'center', backgroundColor: '#0891b2',marginTop: 3}}
                    >
                        <Text style={{fontSize: 22, color: 'white'}}>Activate Orders</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {socket.emit("hubapp/trades/closeAll", {discord_id: user_info.discord_id});this.setState({menuModal_show: false})}}
                        style={{flex:1,width: '100%',justifyContent: 'center', alignItems: 'center', backgroundColor: 'red',marginTop: 3,borderBottomLeftRadius: 5, borderBottomRightRadius: 5}}
                    >
                        <Text style={{fontSize: 22, color: 'white'}}>Close Orders</Text>
                    </TouchableOpacity>
            </View>
        </TouchableOpacity>
    }
    onRequestClose={() => this.setState({menuModal_show: false})}
></Modal>


<Modal
    animationType="none"
    transparent={true}
    visible={this.state.imageModal_show}
    children={
        <TouchableOpacity
            style={{width: '100%',height: '100%', backgroundColor: 'black',opacity: 0.9,justifyContent: 'center',alignItems: 'center'}}
            onPress={() => this.setState({imageModal_show: false})}
        >
            <Image
                style={{width: 350, height: 350, resizeMode: 'contain'}}
                source={{uri: this.state.imageModal_url}}
            />
        </TouchableOpacity>
    }
    onRequestClose={() => this.setState({imageModal_show: false})}
></Modal>


            </View>
        )
    }
}

export {Trading}
