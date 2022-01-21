import React, { Component } from "react";
import { View, Dimensions, StyleSheet, ImageBackground, Text, TouchableOpacity, Image, Animated } from "react-native";
import showCard from "../../../modules/ShowCard";
import formatCoinByLetter from "../../../modules/FormatCoinByLetter";
import showScore from "../../../modules/ShowScore";
import socketRoom from '../../../socketIO/config/RoomNamespace'
import axios from "axios";
import API_URL from "../../../constan.variables";
import LinearGradient from "react-native-linear-gradient";
import formatCoin from "../../../modules/FormatCoin";

export default class EighthSeat extends Component {

    _isMounted = false;

    state = {
        widthAvatarContainer: 40,
        heightAvatarContainer: 100,
        widthCardContainer: 50,
        scaleAnim: new Animated.Value(0.8),
        stopAnimation: false,

        userName: null,
        avatar: null,
        bet: null,
        cardFirst: null,
        cardSecond: null,
        cardThird: null,
        flipCardFirst: null,
        flipCardSecond: null,
        flipCardThird: null,
        status: null,
        roomName: this.props.roomName,
        confirmBet: null,

        fontSizeTextCoin: 12,
        fontSizeName: 12,
    }

    componentDidMount() {
        this._isMounted = true;

        axios.post(API_URL + '/room/get-data', { roomName: this.props.roomName })
            .then(async (res) => {
                if (res.data.error) {
                    Alert.alert(res.data.error);
                    return;
                }
                if (res.data.eighthPlayer && this._isMounted) {
                    let eighthPlayer = res.data.eighthPlayer;
                    this.updateState(eighthPlayer);
                }
            })
            .catch(err => console.log(err));

        socketRoom.on('game_room_update', (data) => {
            if (data.eighthPlayer && this._isMounted) {
                let eighthPlayer = data.eighthPlayer;
                this.updateState(eighthPlayer);
            }
        })

        socketRoom.on('set_user_null', (data) => {
            if (data === 'eighthPlayer' && this._isMounted) {
                this.updateState(null);
            }
        })

        socketRoom.on('update_entire_room', (data) => {
            if (this._isMounted) {
                this.updateState(data.eighthPlayer);
            }
        })

        this.scaleIn();
    }

    componentWillUnmount() {
        this._isMounted = false;

        socketRoom.off('game_room_update');
        socketRoom.off('update_entire_room');
        socketRoom.off('set_user_null');
    }

    updateState(value) {
        this.setState({
            userName: value ? value.userName : null,
            avatar: value ? value.avatar : null,
            bet: value ? value.bet : null,
            cardFirst: value ? value.cardFirst : null,
            cardSecond: value ? value.cardSecond : null,
            cardThird: value ? value.cardThird : null,
            flipCardFirst: value ? value.flipCardFirst : null,
            flipCardSecond: value ? value.flipCardSecond : null,
            flipCardThird: value ? value.flipCardThird : null,
            status: value ? value.status : null,
            roomName: this.props.roomName,
            confirmBet: value ? value.confirmBet : null,
        })
    }

    scaleIn = () => {
        Animated.timing(this.state.scaleAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
        }).start(() => {
            if (this.state.stopAnimation === false) {
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
            if (this.state.stopAnimation === false) {
                this.scaleIn();
            }
        });
    };
    render() {
        return (
            <View>
                <ImageBackground
                    style={[styles.imageChildTable, { marginHorizontal: 5, borderWidth: this.props.position == 8 ? 1 : 0 }]}
                    source={require('../../../assets/img/8.png')}
                >
                    {this.state.userName != null && (
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            <View
                                style={styles.displayAvatar}
                                onLayout={even => {
                                    this.setState({
                                        widthAvatarContainer: even.nativeEvent.layout.width,
                                        heightAvatarContainer: even.nativeEvent.layout.height,
                                    })
                                }}
                            >
                                <View
                                    style={[styles.containerName, { height: (this.state.heightAvatarContainer - 0.65 * this.state.widthAvatarContainer) / 2 }, this.state.flipCardFirst && this.state.flipCardSecond && this.state.flipCardThird ? { width: '130%', left: '30%', } : { width: '210%', left: '110%', }]}
                                    onLayout={(even) => {
                                        this.setState({
                                            fontSizeName: even.nativeEvent.layout.height * 0.5
                                        })
                                    }}
                                >
                                    <Text style={[styles.textName, { fontSize: this.state.fontSizeName }]} >{this.state.userName}</Text>
                                </View>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    style={{ height: 0.55 * this.state.widthAvatarContainer, width: 0.55 * this.state.widthAvatarContainer, marginRight: 5, borderRadius: 5 }}
                                    onPress={() => {
                                        this.props.showPlayerInformation(this.state.userName);
                                    }}
                                >
                                    <Image
                                        style={{ width: '100%', height: '100%', borderRadius: 100 }}
                                        source={{ uri: this.state.avatar }}
                                    ></Image>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.displayInformation}
                                onLayout={(even) => {
                                    this.setState({
                                        widthCardContainer: even.nativeEvent.layout.width
                                    })
                                }}
                            >
                                <View style={styles.coinBetContainer} >
                                    <LinearGradient
                                        style={styles.coinBet}
                                        colors={['#045f99', '#0c86c1']}
                                        onLayout={(even) => {
                                            this.setState({
                                                fontSizeTextCoin: even.nativeEvent.layout.height * 0.65
                                            })
                                        }}
                                    >
                                        <Text style={[styles.textCoin, { fontSize: this.state.fontSizeTextCoin }]} >{this.state.bet >= 1000000 ? formatCoinByLetter(this.state.bet) : formatCoin(this.state.bet)}</Text>
                                    </LinearGradient>
                                </View>
                                {
                                    this.state.cardFirst != null && this.state.cardSecond != null && this.state.cardThird != null && (
                                        <View style={styles.containerCard}>
                                            <TouchableOpacity
                                                activeOpacity={this.props.position == 8 ? 0.8 : 1}
                                                style={{ flex: 1, alignItems: 'center' }}
                                                onPress={() => {
                                                    if (this.props.position == 8 && !this.state.flipCardFirst) {
                                                        socketRoom.emit('flip_Card', this.state.roomName, 'First', this.props.position)
                                                    }
                                                }}
                                            >
                                                <Image
                                                    style={{
                                                        width: (this.state.widthCardContainer - 20) / 3,
                                                        height: ((this.state.widthCardContainer - 20) / 3) * (240 / 155),
                                                        borderRadius: 1
                                                    }}
                                                    source={showCard(this.state.flipCardFirst ? this.state.cardFirst : 'hide')}
                                                ></Image>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                activeOpacity={this.props.position == 8 ? 0.8 : 1}
                                                style={{ flex: 1, marginLeft: 2.5 }}
                                                onPress={() => {
                                                    if (this.props.position == 8 && !this.state.flipCardSecond) {
                                                        socketRoom.emit('flip_Card', this.state.roomName, 'Second', this.props.position)
                                                    }
                                                }}
                                            >
                                                <Image
                                                    style={{
                                                        width: (this.state.widthCardContainer - 20) / 3,
                                                        height: ((this.state.widthCardContainer - 20) / 3) * (240 / 155),
                                                        borderRadius: 1
                                                    }}
                                                    source={showCard(this.state.flipCardSecond ? this.state.cardSecond : 'hide')}
                                                ></Image>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                activeOpacity={this.props.position == 8 ? 0.8 : 1}
                                                style={{ flex: 1 }}
                                                onPress={() => {
                                                    if (this.props.position == 8 && !this.state.flipCardThird) {
                                                        socketRoom.emit('flip_Card', this.state.roomName, 'Third', this.props.position)
                                                    }
                                                }}
                                            >
                                                <Image
                                                    style={{
                                                        width: (this.state.widthCardContainer - 20) / 3,
                                                        height: ((this.state.widthCardContainer - 20) / 3) * (240 / 155),
                                                        borderRadius: 1
                                                    }}
                                                    source={showCard(this.state.flipCardThird ? this.state.cardThird : 'hide')}
                                                ></Image>
                                            </TouchableOpacity>
                                        </View>
                                    )
                                }
                            </View>
                        </View>
                    )}
                </ImageBackground>
                {
                    this.state.status == 'Win' &&
                    (
                        <View style={[styles.styleModal, { left: '7%' }]}>
                            <View>
                                <Animated.Image
                                    style={
                                        [styles.imageStatusWin,
                                        {
                                            transform: [
                                                {
                                                    scale: this.state.scaleAnim
                                                }
                                            ]
                                        }]}
                                    source={require('../../../assets/img/win.png')}
                                ></Animated.Image>
                            </View>
                        </View>
                    )
                }

                {
                    this.state.status == 'Lost' &&
                    (
                        <View style={[styles.styleModal, { left: '11%' }]}>
                            <View>
                                <Animated.Image
                                    style={
                                        [styles.imageStatusLost,
                                        {
                                            transform: [
                                                {
                                                    scale: this.state.scaleAnim
                                                }
                                            ]
                                        }]}
                                    source={require('../../../assets/img/lost.png')}
                                ></Animated.Image>
                            </View>
                        </View>
                    )
                }

                {
                    this.state.cardFirst != null && this.state.cardSecond != null && this.state.cardThird != null &&
                    this.state.flipCardFirst && this.state.flipCardSecond && this.state.flipCardThird &&
                    (
                        <View style={[styles.styleModal, { right: '17%', bottom: '27%' }]}>
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
                                        parseInt(this.state.cardFirst.charAt(this.state.cardFirst.length - 1)) +
                                        parseInt(this.state.cardSecond.charAt(this.state.cardSecond.length - 1)) +
                                        parseInt(this.state.cardThird.charAt(this.state.cardThird.length - 1))
                                    )}
                                ></Animated.Image>
                            </View>
                        </View>
                    )
                }

                {
                    this.state.confirmBet ?
                        (
                            <View style={styles.styleModal} >
                                <Text style={{ fontSize: 18, fontWeight: '700', color: 'pink', right: '6%' }}>Sẵn sàng</Text>
                            </View>
                        ) : null
                }
            </View>
        )
    }
}

// width/height = 285/160
// padding 10

const widthScreen = Dimensions.get('window').width;
const heightScreen = Dimensions.get('window').height;

let heightChildTable;
let widthChildTable;

if ((widthScreen - 120) / (heightScreen - 50) > (285 / 160)) {
    // tỷ lệ height nhỏ hơn, tính theo height
    heightChildTable = ((heightScreen - 50) - 40) / 3;
    widthChildTable = (285 / 160) * heightChildTable;
} else {
    // tỷ lệ width nhỏ hơn, tính theo width
    widthChildTable = ((widthScreen - 120) - 40) / 3;
    heightChildTable = (160 / 285) * widthChildTable;
}

const styles = StyleSheet.create({
    imageChildTable: {
        width: widthChildTable,
        height: heightChildTable,
        borderColor: 'tomato',
        borderRadius: 10,
        zIndex: 0
    },
    styleModal: {
        height: heightChildTable,
        width: widthChildTable,
        justifyContent: 'center',
        alignItems: 'flex-end',
        zIndex: 1,
        position: 'absolute',
    },
    imageStatusWin: {
        width: 0.7 * widthChildTable,
        height: 0.7 * widthChildTable * (108 / 358)
    },
    imageStatusLost: {
        width: 0.75 * widthChildTable,
        height: 0.75 * widthChildTable * (108 / 448),
        shadowColor: 'black',
        shadowRadius: 100,
        shadowOffset: { width: 0, height: 10 },
    },
    displayInformation: {
        flex: 1,
        height: '100%',
        flexDirection: 'column-reverse'
    },
    containerCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end'
    },
    coinBetContainer: {
        width: '100%',
        height: '28%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    coinBet: {
        width: '90%',
        height: '90%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        borderRadius: 5,
        padding: 2,
        marginTop: 10
    },
    textCoin: {
        fontWeight: 'bold',
        color: '#ffd700',
        textAlign: 'center',
        fontSize: 12,
        height: '120%',
        letterSpacing: 1,
        top: 1,
    },
    displayAvatar: {
        width: '44%',
        height: '100%',
        alignItems: 'flex-end',
    },
    containerName: {
        // width: '210%',
        // left: '110%',
        bottom: 5,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 2,
    },
    textName: {
        height: '100%',
        width: '100%',
        backgroundColor: 'white',
        letterSpacing: 1,
        color: 'rgb(50,50,50)',
        textAlign: 'center',
        borderRadius: 100,
        fontSize: 12,
    },
    styleImageScores: {
        width: 0.25 * widthChildTable,
        height: 0.25 * widthChildTable,
        bottom: '15%',
    }
})