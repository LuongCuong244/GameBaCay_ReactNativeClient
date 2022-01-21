import axios from "axios";
import React, { Component } from "react";
import { Alert, Dimensions, View, BackHandler, ImageBackground } from "react-native";
import Toast from "react-native-simple-toast";
import GameContainer from "../components/PlayGame/GameContainer";
import ShowChangeBet from "../components/PlayGame/ShowChangeBet";
import StatusBarGame from "../components/PlayGame/StatusBarGame";
import formatCoin from "../modules/FormatCoin";
import API_URL from "../constan.variables";
import socketRoom from '../socketIO/config/RoomNamespace';
import CurrentUser from "../modules/CurrentUser";

export default class PlayGame extends Component {

    state = {
        showChangeBet: 0,
        position: this.props.route.params.position,
        coin: 0,
        currenUser: null,
    }

    async componentDidMount() {

        let user = await CurrentUser.getUserInformation();
        if (user) {
            await this.setState({
                currenUser: user,
            })
        }

        socketRoom.on('update_coin', (room) => {
            let userName = this.props.route.params.userName;
            let PLAYER_KEYS = ['firstPlayer', 'secondPlayer', 'thirdPlayer', 'fourthPlayer', 'fifthPlayer', 'sixthPlayer', 'seventhPlayer', 'eighthPlayer', 'ninthPlayer', 'ownerOfRoom'];
            PLAYER_KEYS.forEach((key) => {
                if (room[key] && room[key].userName === userName) {
                    this.setState({
                        coin: room[key].coin,
                    })
                }
            })
        })

        socketRoom.on('update_bet', (userName, bet) => {
            if (userName === this.props.route.params.userName) {
                Toast.show("Tiền cược đặt thành: " + formatCoin(bet) + " vì chủ phòng không đủ tiền !", Toast.LONG);
            }
        })

        socketRoom.on('set_position', (userName, position) => {
            if (this.props.route.params.userName === userName) {
                this.setState({
                    position: position,
                })
            }
        })

        axios.post(API_URL + '/user/get-Public-Information', {
            userName: this.props.route.params.userName,
        })
            .then((res) => {
                if (res.data.error) {
                    Toast.show(res.data.error);
                    return;
                }
                this.setState({
                    coin: res.data.information.coin,
                })
            })
            .catch(error => console.log(error, '-PlayGame-'))

        this.backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
            Alert.alert("Cảnh báo", "Bạn muốn rời phòng ư?", [
                {
                    text: "Không",
                    onPress: () => null,
                    style: "cancel"
                },
                {
                    text: "Đúng", onPress: () => {
                        this.leaveTable();
                    }
                }
            ]);
            return true;
        });
    }

    componentWillUnmount() {
        this.backHandler.remove();
        socketRoom.off('update_coin');
        socketRoom.off('set_position');
        socketRoom.off('update_bet');
    }

    showChangeBet = () => {
        this.setState({
            showChangeBet: 2,
        })
    }

    hideChangeBet = (message) => {
        this.setState({
            showChangeBet: 0,
        })
        Toast.show(message);
    }

    leaveTable = () => {
        socketRoom.emit('leave_Room', this.props.route.params.roomName, this.props.route.params.userName);
        socketRoom.emit('req_update_coin', this.props.route.params.userName);
        this.props.navigation.navigate('AllRooms');
    }

    render() {
        return (
            <ImageBackground
                style={{ flex: 1, backgroundColor: 'purple', zIndex: 1 }}
                source={require('../assets/img/Tiles.png')}
                resizeMode="repeat"
            >
                {

                    (Number.isInteger(this.state.coin) && this.state.coin >= 0) ? (
                        <View style={{ width: Dimensions.get('window').width, height: 50 }}>
                            <StatusBarGame
                                showChangeBet={this.showChangeBet}
                                coin={this.state.coin}
                                position={this.state.position}
                                roomName={this.props.route.params.roomName}
                                leaveTable={this.leaveTable}
                                currenUser = {this.state.currenUser}
                            ></StatusBarGame>
                        </View>
                    ) : null
                }
                <GameContainer
                    style={{ flex: 1, zIndex: 1 }}
                    roomName={this.props.route.params.roomName}
                    userName={this.props.route.params.userName}
                    position={this.state.position}
                    leaveTable={this.leaveTable}
                ></GameContainer>

                {
                    this.state.showChangeBet === 2 ? (
                        <View
                            style={{
                                width: '100%',
                                height: '100%',
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: 'rgba(10,10,10,0.5)',
                                zIndex: this.state.showChangeBet,
                                position: 'absolute',
                            }}
                        >
                            <ShowChangeBet
                                hideChangeBet={this.hideChangeBet}
                                roomName={this.props.route.params.roomName}
                                minBet={this.props.route.params.minBet}
                                userName={this.props.route.params.userName}
                                coin={this.state.coin}
                            ></ShowChangeBet>
                        </View>
                    ) : null
                }

            </ImageBackground>
        )
    }
}