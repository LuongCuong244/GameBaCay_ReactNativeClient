import React, { Component, createContext } from "react";
import { StyleSheet, View, Text, TouchableOpacity, ImageBackground, Image, Modal, Alert, BackHandler } from "react-native";
import formatCoin from "../modules/FormatCoin";
import formatCoinByLetter from "../modules/FormatCoinByLetter";
import socketRoom from '../socketIO/config/RoomNamespace';
import axios from "axios";
import API_URL from "../constan.variables";
import CurrentUser from "../modules/CurrentUser";

export default class Home extends Component {

    state = {
        heightAvatar: 50,
        user: null,
        badConnect: false,
    }

    async componentDidMount() {

        this.backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
            Alert.alert("Cảnh báo", "Bạn chắc chắn muốn đóng ứng dụng?", [
                {
                    text: "Không",
                    onPress: () => null,
                    style: "cancel"
                },
                {
                    text: "Có", onPress: () => {
                        BackHandler.exitApp();
                    }
                }
            ]);
            return true;
        });

        let user = await CurrentUser.getUserInformation();
        if (user) {
            await this.setState({
                user: user,
            })
        }
        let userName = this.state.user.userName;

        axios.post(API_URL + '/user/user-Connected', {
            userName: userName
        }).then((res) => {
            if (res.data.error) {
                Alert.alert(res.data.error);
                return;
            }
            socketRoom.emit('new_Player', userName);
        })
            .catch(err => console.log(err, 'Home.js'));

        socketRoom.on('get_user_name', () => {
            socketRoom.emit('new_Player', userName);
        })

        socketRoom.on('update_coin_home', (coin) => {
            this.setState({
                user: {
                    ...user,
                    coin: coin,
                }
            })
        })
    }

    componentWillUnmount() {
        this.backHandler.remove();
        socketRoom.off('get_user_name');
        socketRoom.off('update_coin_home');
    }

    render() {
        return (
            <ImageBackground
                style={{ flex: 1 }}
                source={require('../assets/img/Background/City.jpg')}
            >
                {this.state.user != null &&
                    <View style={styles.container}>
                        <View style={{ width: '100%', flexDirection: 'row-reverse' }}>
                            <View style={{ alignItems: 'flex-end', marginTop: 10, marginHorizontal: 10 }}>
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                >
                                    <ImageBackground
                                        style={styles.backgroundCoin}
                                        source={require('../assets/img/Container/ContainerCoin.png')}
                                    >
                                        <Text style={styles.textCoin} >{this.state.user.coin < 1000000000 ? formatCoin(this.state.user.coin) : formatCoinByLetter(this.state.user.coin)}</Text>
                                    </ImageBackground>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                >
                                    <ImageBackground
                                        style={styles.backgroundDiamond}
                                        source={require('../assets/img/Container/ContainerDiamond.png')}
                                    >
                                        <Text style={styles.textDiamond} >{this.state.user.diamond}</Text>
                                    </ImageBackground>
                                </TouchableOpacity>
                            </View>

                            <View style={{ flex: 1 }}>
                                <ImageBackground
                                    style={styles.backgroundAvatar}
                                    source={require('../assets/img/Container/ContainerAvatar.png')}
                                    onLayout={(even) => {
                                        this.setState({
                                            heightAvatar: even.nativeEvent.layout.height * 0.57,
                                        })
                                    }}
                                >
                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                    >
                                        <Image
                                            source={{ uri: this.state.user.avatar }}
                                            style={{
                                                width: this.state.heightAvatar,
                                                height: this.state.heightAvatar,
                                                top: '58%',
                                                left: '5%'
                                            }}
                                        ></Image>
                                    </TouchableOpacity>
                                    <View style={styles.containerTextName}>
                                        <Text style={styles.textName}>{this.state.user.userName}</Text>
                                    </View>
                                </ImageBackground>
                            </View>
                        </View>

                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            <View style={{ height: '100%', width: 70, }}>
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        //this.props.navigation.navigate('Achievements');
                                        Alert.alert("Chưa viết tính năng này!");
                                    }}
                                >
                                    <Image
                                        source={require('../assets/img/Icon/Cup.png')}
                                        style={{ width: 45, height: 45, marginTop: 20, marginHorizontal: 10 }}
                                    ></Image>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        //this.props.navigation.navigate('Shop');
                                        Alert.alert("Chưa viết tính năng này!");
                                    }}
                                >
                                    <Image
                                        source={require('../assets/img/Icon/Shop.png')}
                                        style={{ width: 45, height: 45, marginTop: 10, marginHorizontal: 10 }}
                                    ></Image>
                                </TouchableOpacity>
                            </View>

                            <View style={{ height: '100%', flex: 1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        this.props.navigation.navigate('AllRooms', {
                                            userName: this.state.user.userName,
                                        })
                                    }}
                                >
                                    <Image
                                        source={require('../assets/img/Icon/PlayGame.png')}
                                        style={{ width: 120, height: 120, marginTop: 10, marginHorizontal: 20 }}
                                    ></Image>
                                </TouchableOpacity>
                            </View>

                            <View style={{ height: '100%', width: 70, alignItems: 'center' }}>
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        this.props.navigation.navigate('LeaderBoards',{
                                            userName: this.state.user.userName
                                        });
                                    }}
                                >
                                    <Image
                                        source={require('../assets/img/Icon/TopPlayers.png')}
                                        style={{ width: 117 / 113 * 45, height: 45, marginTop: 10 }}
                                    ></Image>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* <View style={{ height: 60, width: '100%', flexDirection: 'row' }} >
                            <TouchableOpacity
                                activeOpacity={0.7}
                            >
                                <Image
                                    source={require('../assets/img/Icon/Settings.png')}
                                    style={{ width: 55, height: 55, marginLeft: 10 }}
                                ></Image>
                            </TouchableOpacity>
                        </View> */}
                    </View>
                }
            </ImageBackground>
        )
    }
}

const styles = StyleSheet.create({
    // layout: {
    //     flexDirection: 'row'
    // },
    // separator: {
    //     width: 3,
    //     backgroundColor: 'tomato',
    //     marginTop: 2,
    // },
    container: {
        flex: 1,
    },
    backgroundCoin: {
        width: 1300 * 40 / 300,
        height: 40,
        justifyContent: 'center'
    },
    textCoin: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffd700',
        marginLeft: '25%',
        top: '5%'
    },
    backgroundDiamond: {
        width: 1079 * 40 / 309,
        height: 40,
        marginTop: 5,
        justifyContent: 'center'
    },
    textDiamond: {
        fontSize: 19,
        fontWeight: 'bold',
        color: '#f275fd',
        marginLeft: '33%',
        bottom: '2%',
        textShadowColor: 'purple',
        textShadowRadius: 4,
    },
    backgroundAvatar: {
        width: 873 * 100 / 321,
        height: 100,
        marginLeft: 20,
    },
    containerTextName: {
        width: '55%',
        height: '25%',
        bottom: '8%',
        left: '40.5%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    textName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
    }
})