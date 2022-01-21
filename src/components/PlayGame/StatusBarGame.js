import React, { Component } from "react";
import { StyleSheet, TouchableOpacity, View, Text, Alert, Image, Modal, ImageBackground } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import formatCoin from '../../modules/FormatCoin';
import formatCoinByLetter from '../../modules/FormatCoinByLetter';
import socketRoom from '../../socketIO/config/RoomNamespace';
import ChatRooms from "./ChatRooms";

export default class StatusBarGame extends Component {

    state = {
        showMessages: false,
        unseenMessagesNumber: 0,
    }

    setShowMessages = (value) => {
        this.setState({
            showMessages: value,
        })
    }

    componentDidMount(){
        socketRoom.on('update_unseen_messages_number', () =>{
            if(this.state.showMessages == false){
                this.setState({
                    unseenMessagesNumber: this.state.unseenMessagesNumber + 1,
                })
            }
        })
    }

    componentWillUnmount(){
        socketRoom.off('update_unseen_messages_number');
    }

    render() {
        return (
            <View style={styles.container}>
                <TouchableOpacity
                    style={styles.styleIcon}
                    activeOpacity={0.7}
                    onPress={() => {
                        Alert.alert("Cảnh báo", "Bạn có muốn rời khỏi phòng?", [
                            {
                                text: "Không",
                                onPress: () => null,
                                style: "cancel"
                            },
                            {
                                text: "Có", onPress: () => {
                                    this.props.leaveTable();
                                }
                            }
                        ]);
                    }}
                >
                    <FontAwesome5 name='arrow-left' size={32} color='white'></FontAwesome5>
                </TouchableOpacity>



                <View style={styles.messageContainer}>
                    <Modal
                        animationType='none'
                        visible={this.state.showMessages}
                        transparent={true}
                    >
                        <ChatRooms
                            setShowMessages = {this.setShowMessages}
                            currenUser = {this.props.currenUser}
                            roomName = {this.props.roomName}
                        ></ChatRooms>
                    </Modal>

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
                            source={require('../../assets/img/Icon/Message_Icon.png')}
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
                </View>

                <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.flipCardsButton}
                    onPress={() => {
                        socketRoom.emit('flip_Card', this.props.roomName, 'All', this.props.position)
                    }}
                >
                    <LinearGradient
                        style={styles.linear}
                        colors={['#e1415f', '#ee294e']}
                    >
                        <Text style={styles.text} >Lật bài</Text>
                    </LinearGradient>
                </TouchableOpacity>

                {
                    this.props.position !== 10 ? (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={styles.changeBetButton}
                            onPress={() => {
                                this.props.showChangeBet();
                            }}
                        >
                            <LinearGradient
                                style={styles.linear}
                                colors={['#26a942', '#30a348']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Text style={styles.text} >Đặt lại mức cược</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    ) : null
                }

                <View style={styles.view}>
                    <View style={styles.coinContainer} >
                        <LinearGradient
                            style={styles.coinBackground}
                            colors={['#1e3b70', '#29539b']}
                        >
                            <Text style={styles.coinText} >{this.props.coin < 1000000000 ? formatCoin(this.props.coin) : formatCoinByLetter(this.props.coin)}</Text>
                        </LinearGradient>
                        <Image
                            style={styles.coinIcon}
                            source={require('../../assets/img/CoinIcon.png')}
                        ></Image>
                    </View>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    styleIcon: {
        width: 50,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    messageContainer: {
        height: '100%',
        width: '25%',
        justifyContent: 'flex-end',
        alignItems: 'flex-end'
    },
    messageIcon: {
        width: 42,
        height: 42,
        marginRight: 30,
        top: '5%',
        alignItems: 'flex-end'
    },
    unseenMessagesView: {
        width: '60%',
        height: '60%',
        backgroundColor: 'red',
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        left: '25%',
        bottom: '10%'
    },
    unseenMessagesText: {
        fontSize: 14,
        color: 'white',
        fontWeight: 'bold'
    },
    flipCardsButton: {
        width: 80,
        height: 35,
    },
    changeBetButton: {
        width: 150,
        height: 35,
        marginHorizontal: 15,
    },
    view: {
        height: '100%',
        flex: 1,
        paddingRight: 10,
        alignItems: 'flex-end',
    },
    coinContainer: {
        height: '100%',
        width: 155,
        flexDirection: 'row-reverse',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 10,
    },
    linear: {
        flex: 1,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: 'white',
        borderWidth: 1,
    },
    text: {
        fontSize: 13,
        letterSpacing: 1,
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    coinBackground: {
        flex: 1,
        height: 27,
        borderRadius: 20,
        borderColor: 'white',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    coinText: {
        letterSpacing: 0,
        fontSize: 15,
        fontWeight: 'bold',
        color: '#ffd700',
        left: 7,
    },
    coinIcon: {
        width: 32,
        height: 32,
        right: 20
    }
})