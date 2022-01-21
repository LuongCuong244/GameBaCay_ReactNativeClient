import React, { Component } from "react";
import { StyleSheet, View, ImageBackground, Image, TouchableOpacity, Text, Dimensions, Animated, Alert } from "react-native";
import showCard from "../../../modules/ShowCard";
import showScore from "../../../modules/ShowScore";
import formatCoinByLetter from '../../../modules/FormatCoinByLetter';
import socketRoom from '../../../socketIO/config/RoomNamespace'
import axios from "axios";
import API_URL from "../../../constan.variables";

let countDown;
let timeOut;

const widthScreen = Dimensions.get('window').width;
const heightScreen = Dimensions.get('window').height;

export default class TableOwner extends Component {

    _isMounted = false;

    state = {
        widthAvatarContainer: 120,
        heightAvatarContainer: 240,

        time: 20,
        scaleAnim: new Animated.Value(0.8),
        stopAnim: false,

        tableOwnerSeat: null,
    }

    componentDidMount() {
        this._isMounted = true;

        axios.post(API_URL + '/room/get-data', { roomName: this.props.roomName })
            .then(async (res) => {
                if (res.data.error) {
                    Alert.alert(res.data.error);
                    return;
                }
                if (res.data.ownerOfRoom && this._isMounted) {
                    this.setState({
                        tableOwnerSeat: res.data.ownerOfRoom,
                    })
                }
            })
            .catch(err => console.log(err));

        socketRoom.on('start_running_game', () => {
            this.startCountDown();
        })

        socketRoom.on('hide_countdown', () => {
            this.resetCountDown();
        })

        socketRoom.on('back_to_the_room', (time) => {
            this.setState({
                time: time,
            }, () => {
                this.startCountDown();
            })
        })

        socketRoom.on('game_room_update', (data) => {
            if (data.ownerOfRoom && this._isMounted) {
                this.setState({
                    tableOwnerSeat: data.ownerOfRoom,
                })
            }
        })

        socketRoom.on('update_entire_room', (data) => {
            if (this._isMounted) {
                this.setState({
                    tableOwnerSeat: data.ownerOfRoom,
                })
            }
        })

        socketRoom.on('set_user_null', (data) => {
            if (data === 'ownerOfRoom' && this._isMounted) {
                this.setState({
                    tableOwnerSeat: null,
                })
            }
        })

        if (this.state.stopAnim) {
            if (this._isMounted) {
                this.setState({
                    stopAnim: false,
                })
            }
        }
        this.scaleIn();
    }

    componentWillUnmount() {
        this._isMounted = false;

        socketRoom.off('start_running_game');
        socketRoom.off('hide_countdown');
        socketRoom.off('game_room_update');
        socketRoom.off('update_entire_room');
        socketRoom.off('set_user_null');
        socketRoom.off('back_to_the_room');

        clearTimeout(timeOut);
        clearInterval(countDown);
    }

    resetCountDown() {
        clearInterval(countDown);
        if (this._isMounted) {
            this.setState({
                time: 20,
            })
        }
    }

    startCountDown() {
        if (countDown) {
            clearInterval(countDown);
        }
        countDown = setInterval(() => {
            if (this.state.time <= 0) {
                this.resetCountDown();
            } else {
                if (this._isMounted) {
                    this.setState({
                        time: this.state.time - 1,
                    })
                }
            }
        }, 1000)
    }

    scaleIn = () => {
        Animated.timing(this.state.scaleAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
        }).start(() => {
            if (this.state.stopAnim == false) {
                this.scaleOut();
            }
        });
    };

    scaleOut = () => {
        Animated.timing(this.state.scaleAnim, {
            toValue: 0.8,
            duration: 500,
            useNativeDriver: true
        }).start(() => {
            if (this.state.stopAnim == false) {
                this.scaleIn();
            }
        });
    };

    render() {
        return (
            <View style={{ height: 240, width: 120 }}>
                <ImageBackground
                    style={[styles.imageTableOwner, { borderWidth: this.props.position == 10 ? 2 : 0 }]}
                    source={require('../../../assets/img/10.png')}
                >
                    {this.state.tableOwnerSeat != null && (
                        <View style={styles.imageTableOwner}>

                            <View style={styles.imageAvatarContainer}
                                onLayout={even => {
                                    if (this._isMounted) {
                                        this.setState({
                                            widthAvatarContainer: even.nativeEvent.layout.width,
                                            heightAvatarContainer: even.nativeEvent.layout.height,
                                        })
                                    }
                                }}
                            >
                                <View style={{ width: '100%', height: (this.state.heightAvatarContainer - 0.75 * this.state.widthAvatarContainer - 2) / 2, }}>

                                    <View style={styles.containerName}>
                                        <Text style={styles.textName} >{this.state.tableOwnerSeat.userName}</Text>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    style={{ height: 0.75 * this.state.widthAvatarContainer, width: 0.75 * this.state.widthAvatarContainer }}
                                    onPress={() => {
                                        this.props.showPlayerInformation(this.state.tableOwnerSeat.userName);
                                    }}
                                >
                                    <Image
                                        style={{ width: 0.75 * this.state.widthAvatarContainer, height: 0.75 * this.state.widthAvatarContainer, borderRadius: 100 }}
                                        source={{ uri: this.state.tableOwnerSeat.avatar }}
                                    ></Image>
                                </TouchableOpacity>

                                <View style={styles.coinBet} >
                                    <Text style={styles.textCoin} >{formatCoinByLetter(this.state.tableOwnerSeat.coin)}</Text>
                                </View>

                                {
                                    this.state.time < 20 && (
                                        <View
                                            style={[{
                                                width: this.state.widthAvatarContainer,
                                                height: this.state.widthAvatarContainer,
                                            }, styles.timeContainer]}
                                        >
                                            <Text style={styles.textTime} >{this.state.time}</Text>
                                        </View>
                                    )
                                }
                            </View>

                            {
                                this.state.tableOwnerSeat.cardFirst && this.state.tableOwnerSeat.cardSecond && this.state.tableOwnerSeat.cardThird && (
                                    <View style={styles.displayInformation}>
                                        <TouchableOpacity
                                            activeOpacity={this.props.position == 10 ? 0.8 : 1}
                                            onPress={() => {
                                                if (this.props.position == 10 && !this.state.tableOwnerSeat.flipCardFirst) {
                                                    socketRoom.emit('flip_Card', this.props.roomName, 'First', this.props.position)
                                                }
                                            }}
                                        >
                                            <Image
                                                style={{
                                                    width: ((widthScreen - 120) / (heightScreen - 40)) > (285 / 160) ? (0.56 * (285 / 160) * (((heightScreen - 40) - 40) / 3) - 20) / 3 : (0.56 * (((widthScreen - 120) - 40) / 3) - 20) / 3, // giải thích trong phần comment ở dưới
                                                    height: (((widthScreen - 120) / (heightScreen - 40)) > (285 / 160) ? (0.56 * (285 / 160) * (((heightScreen - 40) - 40) / 3) - 20) / 3 : (0.56 * (((widthScreen - 120) - 40) / 3) - 20) / 3) * (240 / 155),
                                                    transform: [{ rotate: '270deg' }],
                                                    marginTop: '50%'
                                                }}
                                                source={showCard(this.state.tableOwnerSeat.flipCardFirst ? this.state.tableOwnerSeat.cardFirst : 'hide')}
                                            ></Image>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            activeOpacity={this.props.position == 10 ? 0.8 : 1}
                                            onPress={() => {
                                                if (this.props.position == 10 && !this.state.tableOwnerSeat.flipCardSecond) {
                                                    socketRoom.emit('flip_Card', this.props.roomName, 'Second', this.props.position)
                                                }
                                            }}
                                        >
                                            <Image
                                                style={{
                                                    width: ((widthScreen - 120) / (heightScreen - 40)) > (285 / 160) ? (0.56 * (285 / 160) * (((heightScreen - 40) - 40) / 3) - 20) / 3 : (0.56 * (((widthScreen - 120) - 40) / 3) - 20) / 3, // giải thích trong phần comment ở dưới
                                                    height: (((widthScreen - 120) / (heightScreen - 40)) > (285 / 160) ? (0.56 * (285 / 160) * (((heightScreen - 40) - 40) / 3) - 20) / 3 : (0.56 * (((widthScreen - 120) - 40) / 3) - 20) / 3) * (240 / 155),
                                                    transform: [{ rotate: '270deg' }],
                                                    bottom: '15%',
                                                }}
                                                source={showCard(this.state.tableOwnerSeat.flipCardSecond ? this.state.tableOwnerSeat.cardSecond : 'hide')}
                                            ></Image>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            activeOpacity={this.props.position == 10 ? 0.8 : 1}
                                            onPress={() => {
                                                if (this.props.position == 10 && !this.state.tableOwnerSeat.flipCardThird) {
                                                    socketRoom.emit('flip_Card', this.props.roomName, 'Third', this.props.position)
                                                }
                                            }}
                                        >
                                            <Image
                                                style={{
                                                    width: ((widthScreen - 120) / (heightScreen - 40)) > (285 / 160) ? (0.56 * (285 / 160) * (((heightScreen - 40) - 40) / 3) - 20) / 3 : (0.56 * (((widthScreen - 120) - 40) / 3) - 20) / 3, // giải thích trong phần comment ở dưới
                                                    height: (((widthScreen - 120) / (heightScreen - 40)) > (285 / 160) ? (0.56 * (285 / 160) * (((heightScreen - 40) - 40) / 3) - 20) / 3 : (0.56 * (((widthScreen - 120) - 40) / 3) - 20) / 3) * (240 / 155),
                                                    transform: [{ rotate: '270deg' }],
                                                    bottom: '30%',
                                                }}
                                                source={showCard(this.state.tableOwnerSeat.flipCardThird ? this.state.tableOwnerSeat.cardThird : 'hide')}
                                            ></Image>
                                        </TouchableOpacity>
                                    </View>
                                )
                            }
                        </View>
                    )}
                </ImageBackground>

                {
                    this.state.tableOwnerSeat && this.state.tableOwnerSeat.cardFirst != null && this.state.tableOwnerSeat.cardSecond != null && this.state.tableOwnerSeat.cardThird != null &&
                    this.state.tableOwnerSeat.flipCardFirst && this.state.tableOwnerSeat.flipCardSecond && this.state.tableOwnerSeat.flipCardThird &&
                    (
                        <View style={[styles.styleModal, { bottom: '37%', left: '10%' }]}>
                            <View>
                                <Animated.Image
                                    style={
                                        [styles.styleImageScores,
                                        {
                                            transform: [
                                                {
                                                    scale: this.state.scaleAnim
                                                }
                                            ]
                                        }]}
                                    source={showScore(
                                        parseInt(this.state.tableOwnerSeat.cardFirst.charAt(this.state.tableOwnerSeat.cardFirst.length - 1)) +
                                        parseInt(this.state.tableOwnerSeat.cardSecond.charAt(this.state.tableOwnerSeat.cardSecond.length - 1)) +
                                        parseInt(this.state.tableOwnerSeat.cardThird.charAt(this.state.tableOwnerSeat.cardThird.length - 1))
                                    )}
                                ></Animated.Image>
                            </View>
                        </View>
                    )
                }

                {
                    this.state.tableOwnerSeat != null && this.state.tableOwnerSeat.confirmBet ?
                        (
                            <View style={styles.styleModal} >
                                <Text style={{ fontSize: 18, fontWeight: '700', color: 'yellow', right: '20%', bottom: '25%', backgroundColor: 'red', padding: 5 }}>Sẵn sàng</Text>
                            </View>
                        ) : null
                }
            </View>
        )
    }
}


// width/height = 285/160
// padding 10

// let heightChildTable;
// let widthChildTable;

// if ((widthScreen - 120) / (heightScreen - 40) > (285 / 160)) {
//     // tỷ lệ height nhỏ hơn, tính theo height
//     heightChildTable = ((heightScreen - 40) - 40) / 3;
//     widthChildTable = (285 / 160) * heightChildTable;
// } else {
//     // tỷ lệ width nhỏ hơn, tính theo width
//     widthChildTable = ((widthScreen - 120) - 40) / 3;
//     heightChildTable = (160 / 285) * widthChildTable;
// }

// Mục đích để lấy kích thước của quân bài width =( 0.66*widthChildTable - 20)/3
//                                        height = width*(240/155)



const styles = StyleSheet.create({
    imageTableOwner: {
        height: 240,
        width: 120,
        flexDirection: 'row-reverse',
        zIndex: 1,
        position: 'absolute',
        borderColor: 'tomato',
        borderRadius: 20,
    },
    displayInformation: {
        flex: 1,
        height: '100%',
        alignItems: 'center'
    },
    imageAvatarContainer: {
        height: '100%',
        width: '45%',
        alignItems: 'center',
    },
    containerName: {
        width: '220%',
        right: '120%',
        bottom: 10,
        height: 23,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textName: {
        height: '100%',
        width: '100%',
        backgroundColor: 'white',
        color: 'rgb(50,50,50)',
        textAlign: 'center',
        borderRadius: 100,
        fontSize: 15
    },
    coinBet: {
        width: 90,
        marginTop: 25,
        right: 25,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: 'green',
        borderRadius: 10,
        padding: 2,
        top: '20%'
    },
    textCoin: {
        fontWeight: 'bold',
        color: '#ffd700',
        textAlign: 'center',
        fontSize: 16,
        bottom: 1
    },
    timeContainer: {
        borderRadius: 200,
        backgroundColor: 'rgb(0,0,128)',
        marginRight: "90%",
        marginTop: 10,
        borderColor: 'yellow',
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        top: '5%'
    },
    textTime: {
        textAlign: 'center',
        fontSize: 25,
        fontWeight: 'bold',
        color: 'white'
    },
    styleModal: {
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'flex-end',
        zIndex: 2,
        position: 'absolute',
    },
    styleImageScores: {
        width: 90,
        height: 90,
    }
})