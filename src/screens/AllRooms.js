import React, { Component } from "react";
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Alert, Image, BackHandler, Dimensions, Modal, ImageBackground } from "react-native";
import RoomItem from "../components/Home/RoomItem";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import CreateRoom from "../components/Home/CreateRoom";
import socketRoom from '../socketIO/config/RoomNamespace'
import axios from "axios";
import API_URL from "../constan.variables";
import LinearGradient from "react-native-linear-gradient";
import CurrentUser from "../modules/CurrentUser";
import WorldChat from "../components/AllRooms/WorldChat";
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import ShowFindRoom from "../components/AllRooms/ShowFindRoom";

export default class AllRooms extends Component {

    state = {
        rooms: [],
        listDisplayRoom: [],
        widthFlatList: 150,
        numberColumsFlatList: 4,
        widthBar: 100,

        createRoomShow: false,
        showFindRoom: 0,

        heightOptionsContainer: 250,
        isSelectedAll: true,
        isSelectedNoPassworld: false,
        isSelectedNotStart: false,
        isSelectedEnoughBets: false,
        isSelectedMultiplePlayer: false,

        currentUser: null,
        message: null,
        showWorldChat: false,
        unseenMessagesNumber: 0,
    }

    async componentDidMount() {

        let user = await CurrentUser.getUserInformation();
        if (user) {
            await this.setState({
                currentUser: user,
            })
        }

        this.backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
            this.props.navigation.navigate('Home');
            socketRoom.emit('req_update_coin', this.state.currentUser.userName);
            return true;
        });

        axios.get(API_URL + '/room/get-all-rooms')
            .then((res) => {
                if (res.data.error) {
                    Alert.alert(res.data.error);
                    return;
                }
                this.setState({
                    rooms: res.data.allRooms
                }, () => {
                    this.loadAllRooms();
                })
            })

        socketRoom.emit('get_messages_world_chat');
        socketRoom.on('set_message', message => {
            this.setMessage(message);
        })
        socketRoom.on('res_update_coin', (coin) => {
            this.setState({
                currentUser: {
                    ...this.state.currentUser,
                    coin: coin,
                },
            })
        })
        socketRoom.on('send_AllRooms', (data) => {
            this.setState({
                rooms: data.allRooms,
            }, () => {
                if (this.state.isSelectedAll) {
                    this.loadAllRooms();
                    return;
                }
                if (this.state.isSelectedNoPassworld) {
                    this.loadRoomNoPassworld();
                    return;
                }
                if (this.state.isSelectedNotStart) {
                    this.loadRoomNotStart();
                    return;
                }
                if (this.state.isSelectedEnoughBets) {
                    this.loadRoomEnoughBets();
                    return;
                }
                if (this.state.isSelectedMultiplePlayer) {
                    this.loadRoomMultiplePlayer();
                    return;
                }
            })
        })
        socketRoom.on('update_unseen_messages_number_world_chat', (message) => {
            if (this.state.showWorldChat == false) {
                this.setState({
                    unseenMessagesNumber: this.state.unseenMessagesNumber + 1,
                })
            }
            this.setMessage(message);
        })
    }

    componentWillUnmount() {
        this.backHandler.remove();
        socketRoom.off('send_AllRooms');
        socketRoom.off('res_update_coin');
        socketRoom.off('update_unseen_messages_number_world_chat');
        socketRoom.off('set_message');
    }

    isCreateRoomShow = (value) => {
        this.setState({
            createRoomShow: value
        })
    }

    setMessage = (message) => {
        this.setState({
            message: message,
        })
    }

    setShowMessages = (value) => {
        this.setState({
            showWorldChat: value,
        })
    }

    setShowFindRoom = (value, room) => {
        this.setState({
            showFindRoom: value
        })
        if (room) {
            let arr = [];
            arr.push(room);
            this.setState({
                listDisplayRoom: arr,
                isSelectedAll: true,
                isSelectedNoPassworld: false,
                isSelectedNotStart: false,
                isSelectedEnoughBets: false,
                isSelectedMultiplePlayer: false,
            })
        }
    }

    render() {
        return (
            <LinearGradient
                style={styles.viewContainer}
                colors={['#5ee7df', '#b490ca']}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 0 }}
            >
                <CreateRoom
                    isShow={this.state.createRoomShow}
                    setVisible={this.isCreateRoomShow}
                    navigation={this.props.navigation}
                ></CreateRoom>

                <View style={styles.toolBar} >
                    <View style={styles.closeView}>
                        <TouchableOpacity
                            style={styles.styleIcon}
                            activeOpacity={0.7}
                            onPress={() => {
                                this.props.navigation.navigate('Home');
                                socketRoom.emit('req_update_coin', this.state.currentUser.userName);
                            }}
                        >
                            <FontAwesome5 name='arrow-left' size={35} color='rgb(50,50,50)'></FontAwesome5>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.tool} >

                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => {
                                if (this.state.showFindRoom === 0) {
                                    this.setShowFindRoom(2);
                                }
                            }}
                            style={styles.searchButton}
                        >
                            <FontAwesome name="search" size={20} color={'white'} ></FontAwesome>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={styles.createButtonContainer}
                            onPress={() => {
                                this.isCreateRoomShow(true);
                            }}
                        >
                            <LinearGradient
                                style={styles.createButtonLinear}
                                colors={['#8430ec', '#6217bf']}
                            >
                                <Text style={styles.createButtonText} >Tạo phòng</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.coinContainer} >
                        <LinearGradient
                            style={styles.coinBackground}
                            colors={['#1e3b70', '#29539b']}
                        >
                            <Text style={styles.coinText} >{this.state.currentUser ? (this.state.currentUser.coin < 1000000000 ? formatCoin(this.state.currentUser.coin) : formatCoinByLetter(this.state.currentUser.coin)) : 0}</Text>
                        </LinearGradient>
                        <Image
                            style={styles.coinIcon}
                            source={require('../assets/img/CoinIcon.png')}
                        ></Image>
                    </View>
                </View>

                <View style={styles.mainDisplay} >
                    <View
                        style={styles.displayOptions}
                        onLayout={(even) => {
                            this.setState({
                                heightOptionsContainer: even.nativeEvent.layout.height,
                            })
                        }}
                    >
                        <TouchableOpacity
                            style={[styles.optionButton, { height: (this.state.heightOptionsContainer - 90) / 5 }]}
                            activeOpacity={0.7}
                            onPress={() => {
                                if (this.state.isSelectedAll == false) {
                                    this.setState({
                                        isSelectedMultiplePlayer: false,
                                        isSelectedAll: true,
                                        isSelectedNotStart: false,
                                        isSelectedNoPassworld: false,
                                        isSelectedEnoughBets: false,
                                    })
                                    this.loadAllRooms();
                                }
                            }}
                        >
                            <View style={this.state.isSelectedAll ? styles.optionLinear_On : styles.optionLinear_Off} >
                                <Text style={this.state.isSelectedAll ? styles.optionText_On : styles.optionText_Off} >Tất cả phòng</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.optionButton, { height: (this.state.heightOptionsContainer - 90) / 5 }]}
                            activeOpacity={0.7}
                            onPress={() => {
                                if (this.state.isSelectedNoPassworld == false) {
                                    this.setState({
                                        isSelectedMultiplePlayer: false,
                                        isSelectedAll: false,
                                        isSelectedNotStart: false,
                                        isSelectedNoPassworld: true,
                                        isSelectedEnoughBets: false,
                                    })
                                    this.loadRoomNoPassworld();
                                }
                            }}
                        >
                            <View style={this.state.isSelectedNoPassworld ? styles.optionLinear_On : styles.optionLinear_Off} >
                                <Text style={this.state.isSelectedNoPassworld ? styles.optionText_On : styles.optionText_Off} >Không mật khẩu</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.optionButton, { height: (this.state.heightOptionsContainer - 90) / 5 }]}
                            activeOpacity={0.7}
                            onPress={() => {
                                if (this.state.isSelectedNotStart == false) {
                                    this.setState({
                                        isSelectedMultiplePlayer: false,
                                        isSelectedAll: false,
                                        isSelectedNotStart: true,
                                        isSelectedNoPassworld: false,
                                        isSelectedEnoughBets: false,
                                    })
                                    this.loadRoomNotStart();
                                }
                            }}
                        >
                            <View style={this.state.isSelectedNotStart ? styles.optionLinear_On : styles.optionLinear_Off} >
                                <Text style={this.state.isSelectedNotStart ? styles.optionText_On : styles.optionText_Off} >Chưa chơi</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.optionButton, { height: (this.state.heightOptionsContainer - 90) / 5 }]}
                            activeOpacity={0.7}
                            onPress={() => {
                                if (this.state.isSelectedEnoughBets == false) {
                                    this.setState({
                                        isSelectedMultiplePlayer: false,
                                        isSelectedAll: false,
                                        isSelectedNotStart: false,
                                        isSelectedNoPassworld: false,
                                        isSelectedEnoughBets: true,
                                    })
                                    this.loadRoomEnoughBets();
                                }
                            }}
                        >
                            <View style={this.state.isSelectedEnoughBets ? styles.optionLinear_On : styles.optionLinear_Off} >
                                <Text style={this.state.isSelectedEnoughBets ? styles.optionText_On : styles.optionText_Off} >Đủ tiền cược</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.optionButton, { height: (this.state.heightOptionsContainer - 90) / 5 }]}
                            activeOpacity={0.7}
                            onPress={() => {
                                if (this.state.isSelectedMultiplePlayer == false) {
                                    this.setState({
                                        isSelectedMultiplePlayer: true,
                                        isSelectedAll: false,
                                        isSelectedNotStart: false,
                                        isSelectedNoPassworld: false,
                                        isSelectedEnoughBets: false,
                                    })
                                    this.loadRoomMultiplePlayer();
                                }
                            }}
                        >
                            <View style={this.state.isSelectedMultiplePlayer ? styles.optionLinear_On : styles.optionLinear_Off} >
                                <Text style={this.state.isSelectedMultiplePlayer ? styles.optionText_On : styles.optionText_Off} >Nhiều người chơi</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {
                        this.state.listDisplayRoom.length !== 0 ? (
                            <FlatList
                                data={this.state.listDisplayRoom}
                                numColumns={this.state.numberColumsFlatList}
                                onLayout={(even) => {
                                    this.setState({
                                        widthFlatList: even.nativeEvent.layout.width
                                    })
                                }}
                                renderItem={(roomItem) => {
                                    return (
                                        <RoomItem
                                            navigation={this.props.navigation}
                                            widthFlatList={this.state.widthFlatList}
                                            roomItem={roomItem.item}
                                            numberColums={this.state.numberColumsFlatList}
                                        ></RoomItem>
                                    )
                                }}
                                contentContainerStyle={styles.flatListStyle}
                                keyExtractor={(item) => item.roomName}
                            ></FlatList>
                        ) : (
                            <View style={[styles.flatListStyle, { justifyContent: 'center', alignItems: 'center' }]}>
                                <Text style={styles.notificationText} >Không có bàn nào được hiển thị!</Text>
                            </View>
                        )
                    }
                </View>
                <View style={styles.chatContainer} >
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => {
                            this.setShowMessages(true);
                            this.setState({
                                unseenMessagesNumber: 0,
                            })
                        }}
                    >
                        <ImageBackground
                            source={require('../assets/img/Icon/Message_Icon.png')}
                            style={styles.messageIcon}
                        >
                            {
                                this.state.unseenMessagesNumber > 0 ? (
                                    <View style={styles.unseenMessagesView}>
                                        <Text style={styles.unseenMessagesText} >{this.state.unseenMessagesNumber < 10 ? this.state.unseenMessagesNumber : '9+'}</Text>
                                    </View>
                                ) : null
                            }
                        </ImageBackground>
                    </TouchableOpacity>
                    <View style={styles.borderChat} >
                        <Modal
                            animationType='none'
                            visible={this.state.showWorldChat}
                            transparent={true}
                        >
                            <WorldChat
                                setShowMessages={this.setShowMessages}
                                setMessage={this.setMessage}
                                currenUser={this.state.currentUser}
                            ></WorldChat>
                        </Modal>
                        {
                            this.state.message ? (
                                <View style={styles.informationMessage}>
                                    <Text style={styles.userNameOfMessage} >{this.state.message.user.name}:</Text>
                                    <Text
                                        style={styles.textOfMessage}
                                        numberOfLines={1}
                                    >{this.state.message.text}</Text>
                                </View>
                            ) : (
                                <Text style={[styles.textOfMessage], { color: 'gray', fontSize: 15, fontStyle: 'italic' }}>Không có tin nhắn nào được hiển thị</Text>
                            )
                        }
                    </View>
                </View>

                {
                    this.state.showFindRoom === 2 ? (
                        <View
                            style={{
                                width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)',
                                zIndex: this.state.showFindRoom,
                                position: 'absolute',
                            }}
                        >
                            <ShowFindRoom
                                setShowFindRoom={this.setShowFindRoom}
                            ></ShowFindRoom>
                        </View>
                    ) : null
                }
            </LinearGradient>
        )
    }

    loadAllRooms = () => {
        this.setState({
            listDisplayRoom: this.state.rooms
        })
    }

    loadRoomNoPassworld = () => {
        this.setState({
            listDisplayRoom: this.state.rooms.filter(item => item.havePassword === "No")
        })
    }

    loadRoomNotStart = () => {
        this.setState({
            listDisplayRoom: this.state.rooms.filter(item => item.isRunning === false)
        })
    }

    loadRoomEnoughBets = async () => {
        this.setState({
            listDisplayRoom: this.state.rooms.filter(item => item.minBet <= this.state.currentUser.coin),
        })
    }

    loadRoomMultiplePlayer = () => {
        this.setState({
            listDisplayRoom: this.state.rooms.filter(item => item.playersInRoom.length >= 5)
        })
    }
}

const styles = StyleSheet.create({
    viewContainer: {
        backgroundColor: '#95a5a6',
        marginTop: 2,
        flex: 1,
        alignItems: 'center'
    },
    toolBar: {
        width: '100%',
        height: 60,
        justifyContent: 'center',
        flexDirection: 'row',
    },
    closeView: {
        height: '100%',
        width: 240,
        flexDirection: 'row',
    },
    styleIcon: {
        height: '100%',
        width: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    coinContainer: {
        height: '100%',
        width: 190,
        flexDirection: 'row-reverse',
        justifyContent: 'center',
        alignItems: 'center',
    },
    coinBackground: {
        flex: 1,
        height: 35,
        borderRadius: 10,
        borderColor: 'white',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        left: 15
    },
    coinText: {
        letterSpacing: 0,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffd700',
        left: 10,
    },
    coinIcon: {
        width: 40,
        height: 40,
        right: 10,
    },
    tool: {
        flex: 1,
        height: '100%',
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchButton: {
        width: 40,
        height: 40,
        marginRight: 15,
        marginLeft: 3,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#3da4ab',
        borderWidth: 1,
        borderColor: '#adcbe3'
    },
    createButtonContainer: {
        width: 120,
        height: 40,
    },
    createButtonLinear: {
        width: '100%',
        flex: 1,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    createButtonText: {
        letterSpacing: 1,
        fontSize: 16,
        fontWeight: '800',
        color: 'white',
    },
    mainDisplay: {
        flex: 1,
        width: '100%',
        flexDirection: 'row',
    },
    displayOptions: {
        height: '100%',
        width: 240,
        alignItems: 'center',
    },
    optionButton: {
        width: '80%',
        height: 33,
        marginTop: 15,
    },
    optionLinear_On: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15,
        backgroundColor: 'tomato',
        borderColor: 'white',
        borderWidth: 1,
    },
    optionLinear_Off: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15,
        backgroundColor: 'rgb(200,200,200)',
        borderColor: 'white',
        borderWidth: 1,
    },
    optionText_On: {
        letterSpacing: 1,
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    optionText_Off: {
        letterSpacing: 1,
        fontSize: 18,
        fontStyle: 'italic',
        color: 'black',
    },
    chatContainer: {
        width: '100%',
        height: 60,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    borderChat: {
        height: 45,
        width: Dimensions.get('window').width - 310,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.2)',
        backgroundColor: 'rgba(255,255,255,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    informationMessage: {
        flex: 1,
        width: '100%',
        flexDirection: 'row',
        paddingHorizontal: 10,
        alignItems: 'center'
    },
    userNameOfMessage: {
        fontSize: 20,
        color: '#005b96',
        fontWeight: 'bold',
    },
    textOfMessage: {
        fontSize: 18,
        color: 'rgb(50,50,50)',
        fontStyle: 'italic',
        marginLeft: 3,
        flex: 1,
    },
    messageIcon: {
        width: 45,
        height: 45,
        marginRight: 15,
        alignItems: 'flex-end'
    },
    unseenMessagesView: {
        width: '50%',
        height: '50%',
        backgroundColor: 'red',
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        left: '25%',
        bottom: '10%'
    },
    unseenMessagesText: {
        fontSize: 16,
        color: 'white',
        fontWeight: 'bold'
    },
    flatListStyle: {
        flex: 1,
        height: '100%',
        padding: 10,
        marginRight: 10,
        borderWidth: 3,
        borderRadius: 20,
        borderColor: 'white',
        backgroundColor: 'rgba(230,230,234,0.3)'
    },
    notificationText: {
        fontSize: 20,
        color: 'gray',
        fontStyle: 'italic',
        textAlign: 'center',
    },
})