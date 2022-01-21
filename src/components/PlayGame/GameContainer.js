import React, { Component, createRef } from "react";
import { View, Text, StyleSheet, ImageBackground, Dimensions, Animated, TouchableOpacity } from "react-native";
import FirstSeat from "./ChildContainer/FirstSeat";
import SecondSeat from "./ChildContainer/SecondSeat";
import ThirdSeat from "./ChildContainer/ThirdSeat";
import FourthSeat from "./ChildContainer/FourthSeat";
import FifthSeat from "./ChildContainer/FifthSeat";
import SixthSeat from "./ChildContainer/SixthSeat";
import SeventhSeat from "./ChildContainer/SeventhSeat";
import EighthSeat from "./ChildContainer/EighthSeat";
import NinthSeat from "./ChildContainer/NinthSeat";
import TableOwner from "./ChildContainer/TableOwner";
import formatCoin from "../../modules/FormatCoin";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import socketRoom from '../../socketIO/config/RoomNamespace'
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-simple-toast';
import ShowPlayerInformation from "./ShowPlayerInformation";
import axios from "axios";
import API_URL from "../../constan.variables";

let time;
let timeRoomOwner;
let numberOfAnim = 0;

const widthScreen = Dimensions.get('window').width
const heightScreen = Dimensions.get('window').height

export default class GameContainer extends Component {

    constructor(props) {
        super(props);
        this.refPlayerInformation = React.createRef();
    }

    state = {
        widthAvatarContainer: 40,
        heightAvatarContainer: 100,

        showReadyButton: 0, // 2 là show, 0 là ẩn
        showBetTotal: 0,

        showConfirmRoomOwner: 0, // hỏi người dùng có muốn làm chủ bàn không
        qualifiedToRoomOwner: true, // xét xem người dùng đủ điều kiện để làm chủ bàn không.
        isPressButton: false,

        showPlayerInformation: 0,
        user: null,

        countDown: 5,
        countDownConfirmRoomOwner: 5,

        totalBet: 1000,
        position: this.props.position,

        roomName: this.props.roomName,
        userName: this.props.userName,

        animReady: new Animated.Value(0.9),
        animBetConfirm: new Animated.Value(-Dimensions.get('window').width * 0.8),
    }

    componentDidMount() {

        socketRoom.on('start_countdown_ofNewGame', () => {
            this.startCountDown();
        })

        socketRoom.on('hide_ready_button', () => {
            this.setState({
                showReadyButton: 0,
                countDown: 5,
            })
            if (time) {
                clearInterval(time);
            }
        })

        socketRoom.on('appear_total_bet', (totalBet) => {
            this.setState({
                totalBet: totalBet,
                showBetTotal: 2,
            }, () => {
                this.animBetConfirmIn();
            })
        })

        socketRoom.on('kick_off_room', async (response, reason) => {
            if (response === 'All') {
                if (timeRoomOwner) {
                    this.setState({
                        countDownConfirmRoomOwner: 5,
                    })
                    await clearInterval(timeRoomOwner);
                }
                this.props.leaveTable();
                Toast.show(reason, Toast.SHORT, Toast.CENTER);
                return;
            }
            if (this.state.userName === response) {
                this.props.leaveTable();
                Toast.show(reason, Toast.SHORT, Toast.CENTER);
            }
        })

        socketRoom.on('show_find_owner_room', async (qualifiedToOwnerRoom) => {
            if (timeRoomOwner) {
                this.setState({
                    countDownConfirmRoomOwner: 5,
                })
                await clearInterval(timeRoomOwner);
            }
            timeRoomOwner = setInterval(() => {
                if (this.state.countDownConfirmRoomOwner <= 0) {
                    this.setState({
                        isPressButton: true,
                    })
                    clearInterval(timeRoomOwner);
                } else {
                    this.setState({
                        countDownConfirmRoomOwner: this.state.countDownConfirmRoomOwner - 1,
                    })
                }
            }, 1000)
            if (qualifiedToOwnerRoom.indexOf(this.state.userName) !== -1) {
                this.setState({
                    showConfirmRoomOwner: 2,
                    qualifiedToRoomOwner: true,
                    isPressButton: false,
                })
            } else {
                this.setState({
                    showConfirmRoomOwner: 2,
                    qualifiedToRoomOwner: false,
                    isPressButton: false,
                })
            }
        })

        socketRoom.on('hide_confirm_owner_room', async (ownerRoomName) => {
            if (timeRoomOwner) {
                await clearInterval(timeRoomOwner);
            }
            this.setState({
                showConfirmRoomOwner: 0,
                isPressButton: false,
                countDownConfirmRoomOwner: 5
            })
            let log = ownerRoomName + ' sẽ là chủ phòng mới !';
            Toast.show(log, Toast.LONG, Toast.CENTER);
        })
    }

    componentWillUnmount() {
        socketRoom.off('start_countdown_ofNewGame');
        socketRoom.off('hide_ready_button');
        socketRoom.off('kick_off_room');
        socketRoom.off('appear_total_bet');
        socketRoom.off('show_find_owner_room');
        socketRoom.off('hide_confirm_owner_room');

        if (time) {
            clearInterval(time);
        }
    }

    async startCountDown() {
        if (time != null) {
            await clearInterval(time);
        }
        await this.setState({
            showReadyButton: 2,
            countDown: 5,
        })
        time = setInterval(() => {
            if (this.state.countDown <= 0) {
                this.setState({
                    showReadyButton: 0,
                    countDown: 5,
                })
                clearInterval(time);
            } else {
                this.setState({
                    countDown: this.state.countDown - 1,
                })
            }
        }, 1000);
    }

    showPlayerInformation = (userName) => {
        this.setState({
            showPlayerInformation: 2,
        })
        axios.post(API_URL + '/user/get-Statistical-And-Information', {
            userName: userName
        })
            .then((res) => {
                if (res.data.error) {
                    Toast.show(res.data.error);
                    this.props.hidePlayerInformation();
                    return;
                }
                let user = {
                    ...res.data.statistical,
                    ...res.data.information
                };
                this.setState({
                    user: user,
                })
            })
    }

    hidePlayerInformation = () => {
        this.setState({
            showPlayerInformation: 0,
        })
    }

    render() {
        return (
            <View style={{ flex: 1 }} >
                {
                    this.state.position && (
                        <View style={{ flex: 1 }} >
                            <ImageBackground style={styles.container}>
                                <View style={styles.imageGuestContainer}>
                                    <View style={styles.viewChildTable} >
                                        <View style={styles.rowContainer} >
                                            <FirstSeat showPlayerInformation={this.showPlayerInformation} position={this.props.position} roomName={this.props.roomName}></FirstSeat>
                                            <SecondSeat showPlayerInformation={this.showPlayerInformation} position={this.props.position} roomName={this.props.roomName}></SecondSeat>
                                            <ThirdSeat showPlayerInformation={this.showPlayerInformation} position={this.props.position} roomName={this.props.roomName}></ThirdSeat>
                                        </View>

                                        <View style={styles.rowContainer} >
                                            <FourthSeat showPlayerInformation={this.showPlayerInformation} position={this.props.position} roomName={this.props.roomName}></FourthSeat>
                                            <FifthSeat showPlayerInformation={this.showPlayerInformation} position={this.props.position} roomName={this.props.roomName}></FifthSeat>
                                            <SixthSeat showPlayerInformation={this.showPlayerInformation} position={this.props.position} roomName={this.props.roomName}></SixthSeat>
                                        </View>

                                        <View style={styles.rowContainer} >
                                            <SeventhSeat showPlayerInformation={this.showPlayerInformation} position={this.props.position} roomName={this.props.roomName}></SeventhSeat>
                                            <EighthSeat showPlayerInformation={this.showPlayerInformation} position={this.props.position} roomName={this.props.roomName}></EighthSeat>
                                            <NinthSeat showPlayerInformation={this.showPlayerInformation} position={this.props.position} roomName={this.props.roomName}></NinthSeat>
                                        </View>
                                    </View>
                                </View>
                                <TableOwner
                                    showPlayerInformation={this.showPlayerInformation}
                                    roomName={this.props.roomName}
                                    userName={this.props.userName}
                                    position={this.props.position}
                                ></TableOwner>
                            </ImageBackground>

                            {
                                this.state.showReadyButton === 2 ? (
                                    <View
                                        style={{
                                            flex: 1,
                                            zIndex: this.state.showReadyButton,
                                            position: 'absolute',
                                        }}
                                    >
                                        <View style={[styles.containerModal, { backgroundColor: 'rgba(0,0,0,0)', justifyContent: 'center', padding: 10, alignItems: 'center' }]} >
                                            <View style={[styles.viewTime, { bottom: 50, width: 70, height: 70 }]}>
                                                <Text style={styles.textTime} >{this.state.countDown}</Text>
                                            </View>

                                            <TouchableOpacity
                                                style={{ width: 150, height: 50, bottom: 30 }}
                                                activeOpacity={0.7}
                                                onPress={() => {
                                                    socketRoom.emit('ready', this.state.roomName, this.state.userName);
                                                    this.setState({
                                                        showReadyButton: 0,
                                                    })
                                                }}
                                            >
                                                <Animated.View style={{ flex: 1, backgroundColor: 'red', justifyContent: 'center', alignItems: 'center', elevation: 10, borderRadius: 100, transform: [{ scale: this.state.animReady }] }}>
                                                    <Text style={{ textAlign: 'center', fontSize: 21, fontWeight: 'bold', color: 'white' }} >Sẵn sàng</Text>
                                                </Animated.View>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ) : null
                            }

                            {
                                this.state.showBetTotal === 2 ? (
                                    <View
                                        style={{
                                            flex: 1,
                                            zIndex: this.state.showBetTotal,
                                            position: 'absolute',
                                        }}
                                    >
                                        <View style={{ width: widthScreen, height: heightScreen, backgroundColor: 'rgba(0,0,0,0)' }}>
                                            <Animated.View style={{
                                                flex: 1,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transform: [{
                                                    translateY: this.state.animBetConfirm
                                                }]
                                            }}>
                                                <View
                                                    style={{ width: '100%', height: 55, bottom: '5%', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.7)' }}
                                                >
                                                    <Text style={{ textAlign: 'center', fontStyle: 'italic', color: 'white', fontSize: 22, right: '50%' }} >Tổng cược: </Text>
                                                    <Text style={{ textAlign: 'center', fontWeight: 'bold', color: '#ffd700', fontSize: 37 }} >{formatCoin(this.state.totalBet)}</Text>
                                                    <MaterialIcons name='attach-money' color='#ffd700' size={40} ></MaterialIcons>
                                                </View>
                                            </Animated.View>
                                        </View>
                                    </View>
                                ) : null
                            }

                            {
                                this.state.showConfirmRoomOwner === 2 ? (
                                    <View
                                        style={{
                                            width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center',
                                            zIndex: this.state.showConfirmRoomOwner,
                                            position: 'absolute',
                                        }}
                                    >
                                        <LinearGradient
                                            style={styles.confirmOwnerContainer}
                                            colors={['#d8ffff', '#cdcad1']}
                                        >
                                            <LinearGradient
                                                style={styles.confirmOwnerTitleContainer}
                                                colors={['#3499FF', '#3A3985']}
                                            >
                                                <Text style={styles.confirmOwnerTitle}>CHỦ PHÒNG ĐÃ RỜI BÀN</Text>
                                                <Text style={styles.confirmOwnerTime} >{this.state.countDownConfirmRoomOwner}</Text>
                                            </LinearGradient>
                                            <Text style={styles.confirmOwnerMessage} >{this.state.qualifiedToRoomOwner ? 'Bạn có muốn làm chủ phòng mới không ?' : 'Đang hỏi những người đủ điều kiện làm chủ phòng !'}</Text>
                                            {
                                                this.state.qualifiedToRoomOwner && this.state.isPressButton === false ? (
                                                    <View style={styles.confirmOwnerButtonContainer}>
                                                        <TouchableOpacity
                                                            activeOpacity={0.7}
                                                            style={styles.confirmOwnerButton}
                                                            onPress={() => {
                                                                this.setState({
                                                                    isPressButton: true,
                                                                })
                                                            }}
                                                        >
                                                            <LinearGradient style={styles.confirmOwnerLinearButton} colors={['#e10f68', '#ab3667']}>
                                                                <Text style={styles.confirmOwnerLinearText}>Không</Text>
                                                            </LinearGradient>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity
                                                            activeOpacity={0.7}
                                                            style={styles.confirmOwnerButton}
                                                            onPress={() => {
                                                                if (socketRoom.connected) {
                                                                    this.setState({
                                                                        isPressButton: true,
                                                                    })
                                                                    socketRoom.emit('set_Owner_Room', this.state.roomName, this.state.position);
                                                                }
                                                            }}
                                                        >
                                                            <LinearGradient style={styles.confirmOwnerLinearButton} colors={['#1fd906', '#15a003']}>
                                                                <Text style={styles.confirmOwnerLinearText}>Có</Text>
                                                            </LinearGradient>
                                                        </TouchableOpacity>
                                                    </View>
                                                ) : (
                                                    <View style={styles.confirmOwnerButtonContainer}>
                                                        <Text>Hãy chờ một lát ...</Text>
                                                    </View>
                                                )
                                            }
                                        </LinearGradient>
                                    </View>
                                ) : null
                            }

                            {
                                this.state.showPlayerInformation === 2 ? (
                                    <View
                                        style={{
                                            width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center',
                                            zIndex: this.state.showPlayerInformation,
                                            position: 'absolute',
                                        }}
                                    >
                                        <ShowPlayerInformation
                                            hidePlayerInformation={this.hidePlayerInformation}
                                            user={this.state.user}
                                        ></ShowPlayerInformation>
                                    </View>
                                ) : null
                            }
                        </View>
                    )
                }
            </View>
        )
    }

    animReadyIn = () => {
        Animated.timing(this.state.animReady, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
        }).start(() => {
            this.animReadyOut();
        })
    }

    animReadyOut = () => {
        Animated.timing(this.state.animReady, {
            toValue: 0.9,
            duration: 500,
            useNativeDriver: true
        }).start(() => {
            if (numberOfAnim > 7) {
                numberOfAnim = 0;
            } else {
                numberOfAnim++;
                this.animReadyIn();
            }
        })
    }

    animBetConfirmIn = () => {
        Animated.timing(this.state.animBetConfirm, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true
        }).start(() => {
            setTimeout(() => {
                this.animBetConfirmOut();
            }, 1000);
        });
    }

    animBetConfirmOut = () => {
        Animated.timing(this.state.animBetConfirm, {
            toValue: Dimensions.get('window').width * 0.8,
            duration: 500,
            useNativeDriver: true
        }).start(() => {
            socketRoom.emit('start_Game', this.state.roomName);
            this.setState({
                showBetTotal: 0,
                coinBetTotal: 0,
            })
        });
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 1,
    },
    imageGuestContainer: {
        height: '100%',
        flex: 1
    },
    viewChildTable: {
        width: '100%',
        height: '100%'
    },
    rowContainer: {
        width: '100%',
        height: '33.333333%',
        flexDirection: 'row',
        alignItems: 'center'
    },
    imageTableOwner: {
        height: 240,
        width: 120,
    },
    containerModal: {
        width: widthScreen,
        height: heightScreen,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    viewTime: {
        borderRadius: 100,
        width: 50,
        height: 50,
        borderColor: 'white',
        borderWidth: 4,
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center'
    },
    textTime: {
        textAlign: 'center',
        color: 'white',
        fontSize: 28,
        fontWeight: 'bold'
    },
    stackView: {
        width: '60%',
        height: '60%',
        borderRadius: 20,
        backgroundColor: 'white',
        marginTop: 10,
    },
    styleContainerView: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
        backgroundColor: 'white',
        position: 'absolute'
    },
    confirmOwnerContainer: {
        width: 290,
        height: 160,
        borderRadius: 25
    },
    confirmOwnerTitleContainer: {
        width: '100%',
        height: 40,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    },
    confirmOwnerTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        textAlign: 'center',
        color: 'white',
        letterSpacing: 1,
        flex: 1,
    },
    confirmOwnerTime: {
        width: 40,
        height: 40,
        textAlign: 'center',
        fontSize: 28,
        borderBottomRightRadius: 20,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 10,
        borderTopLeftRadius: 10,
        borderWidth: 1,
        color: 'rgb(30,30,30)',
        backgroundColor: '#ffc4a4',
    },
    confirmOwnerMessage: {
        flex: 1,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
        color: 'rgb(20,20,20)',
        padding: 10,
    },
    confirmOwnerButtonContainer: {
        width: '100%',
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    confirmOwnerButton: {
        width: 80,
        height: 35,
        marginHorizontal: 30,
    },
    confirmOwnerLinearButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    confirmOwnerLinearText: {
        fontWeight: 'bold',
        color: 'white'
    }
})