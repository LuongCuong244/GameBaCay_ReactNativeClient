import React, { Component } from "react";
import { Modal, StyleSheet, TouchableOpacity, View, Text, TextInput, Image } from "react-native";
import AntDesign from 'react-native-vector-icons/AntDesign'
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import axios from "axios";
import API_URL from "../../constan.variables";
import CurrentUser from "../../modules/CurrentUser";
import socketRoom from '../../socketIO/config/RoomNamespace'
import Toast from 'react-native-simple-toast'
import LinearGradient from "react-native-linear-gradient";
import formatCoin from "../../modules/FormatCoin";
import formatCoinByLetter from "../../modules/FormatCoinByLetter";

let isLoadingComePlay = false;

export default class RoomShow extends Component {

    _isMounted = false;

    state = {
        heightViewInformation: 100,
        password: null,
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    _onClose() {
        if (this._isMounted) {
            this.setState({
                password: null
            })
        }
        this.props.setVisible(false);
    }

    _onChanText_Password(text) {
        if (this._isMounted) {
            this.setState({
                password: text,
            })
        }
    }

    _onVisit() {

    }

    async _onComePlay() {
        let userName = await CurrentUser.getName();
        let roomName = this.props.roomItem.roomName;
        if (isLoadingComePlay) {
            return;
        }
        isLoadingComePlay = true;
        axios.post(API_URL + '/room/join-room', {
            userName: userName,
            roomName: roomName,
            roomPassword: this.state.password,
        })
            .then((res) => {
                isLoadingComePlay = false;
                if (res.data.error) {
                    Toast.show(res.data.error);
                    return;
                }
                socketRoom.emit('join_Room', roomName);
                socketRoom.emit('update_Rooms');

                socketRoom.emit('reload_Room', roomName, res.data);

                if (res.data.isRunning === false) {  // yêu cầu reset lại bộ đếm
                    socketRoom.emit('countdown_Of_New_Game', roomName);
                }

                this.props.setVisible(false); // ẩn bảng
                this.props.navigation.navigate('PlayGame', {
                    roomName: roomName,
                    userName: userName,
                    position: res.data.position,
                    minBet: res.data.minBet,
                })
            })
            .catch(error => {
                isLoadingComePlay = false;
                console.log(error, '-RoomShow');
            });
    }

    render() {
        return (
            <Modal
                transparent={true}
                animationType='fade'
                visible={this.props.isShow}
                statusBarTranslucent={true}
            >
                <View style={styles.modalContainer} >
                    <LinearGradient
                        style={styles.viewContainer}
                        colors={['#1f61f1', '#971cb6']}
                    >
                        <View style={styles.viewContainerClose} >
                            <TouchableOpacity
                                onPress={() => {
                                    this._onClose();
                                }}
                                activeOpacity={0.7}
                            >
                                <AntDesign name='closecircle' size={45} color='red' style={{ backgroundColor: 'white', borderRadius: 50 }}></AntDesign>
                            </TouchableOpacity>
                        </View>

                        <View
                            style={styles.informationContainer}
                            onLayout={(even) => {
                                if (this._isMounted) {
                                    this.setState({
                                        heightViewInformation: even.nativeEvent.layout.height
                                    });
                                }
                            }}
                        >
                            {
                                this.props.roomItem.ownerOfRoom ? (
                                    <Image
                                        style={{
                                            width: this.props.roomItem.havePassword != 'No' ? 0.8 * this.state.heightViewInformation : 0.6 * this.state.heightViewInformation,
                                            height: this.props.roomItem.havePassword != 'No' ? 0.8 * this.state.heightViewInformation : 0.6 * this.state.heightViewInformation,
                                            marginHorizontal: 0.1 * this.state.heightViewInformation,
                                            borderRadius: this.props.roomItem.havePassword != 'No' ? 0.8 * 0.25 * this.state.heightViewInformation : 0.6 * 0.25 * this.state.heightViewInformation,
                                            alignItems: 'center',
                                            justifyContent: 'flex-end',
                                            borderColor: 'white',
                                            borderWidth: 1,
                                        }}
                                        source={{ uri: this.props.roomItem.ownerOfRoom.avatar }}
                                    ></Image>
                                ) : (
                                    <View
                                        style={{
                                            width: this.props.roomItem.havePassword != 'No' ? 0.8 * this.state.heightViewInformation : 0.6 * this.state.heightViewInformation,
                                            height: this.props.roomItem.havePassword != 'No' ? 0.8 * this.state.heightViewInformation : 0.6 * this.state.heightViewInformation,
                                            marginHorizontal: 0.1 * this.state.heightViewInformation,
                                            borderRadius: this.props.roomItem.havePassword != 'No' ? 0.8 * 0.25 * this.state.heightViewInformation : 0.6 * 0.25 * this.state.heightViewInformation,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderColor: 'white',
                                            borderWidth: 1,
                                        }}
                                    >
                                        <Text style={{ fontSize: 30, fontWeight: 'bold', color: 'white' }} >?</Text>
                                    </View>
                                )
                            }

                            <View style={styles.informationRoom} >
                                <View style={styles.rowInformation}>
                                    <Text style={[styles.textProperties, { color: '#ffd700', }]}>Tên bàn:</Text>
                                    <Text style={[styles.textProperties, { color: 'white', }]}>{this.props.roomItem.roomName}</Text>
                                </View>
                                <View style={styles.rowInformation}>
                                    <Text style={[styles.textProperties, { color: '#ffd700', }]}>Chủ phòng:</Text>
                                    <Text style={[styles.textProperties, { color: 'white', }]}>{this.props.roomItem.ownerOfRoom ? this.props.roomItem.ownerOfRoom.userName : 'Đang chờ xác nhận'}</Text>
                                </View>
                                <View style={styles.rowInformation}>
                                    <Text style={[styles.textProperties, { color: '#ffd700', }]}>Số người chơi:</Text>
                                    <Text style={[styles.textProperties, { color: 'white', }]}>{this.props.roomItem.playersInRoom.length}/10</Text>
                                </View>
                                <View style={styles.rowInformation}>
                                    <Text style={[styles.textProperties, { color: '#ffd700', }]}>Tiền cược tối thiểu:</Text>
                                    <Text style={[styles.textProperties, { color: 'white', }]}>{this.props.roomItem.minBet < 1000000 ? formatCoin(this.props.roomItem.minBet) : formatCoinByLetter(this.props.roomItem.minBet)}</Text>
                                </View>
                            </View>
                        </View>

                        {
                            this.props.roomItem.havePassword != 'No' ?
                                (
                                    <View style={styles.passwordContainer}>
                                        <Text style={styles.textPassword} >Mật khẩu:</Text>
                                        <View style={styles.viewTextInput} >
                                            <FontAwesome5 name='key' size={23} color='#e0bd01'></FontAwesome5>
                                            <View style={{ width: 1, height: '100%', backgroundColor: 'rgb(180,180,150)', marginHorizontal: 5 }} ></View>
                                            <TextInput
                                                style={styles.textInput}
                                                placeholder='Phòng này có mật khẩu'
                                                placeholderTextColor='rgba(255,255,255,0.7)'
                                                onChangeText={(text) => {
                                                    this._onChanText_Password(text);
                                                }}
                                            ></TextInput>
                                        </View>
                                    </View>

                                ) : null

                        }

                        <View style={styles.buttonContainer} >
                            <TouchableOpacity
                                style={[styles.buttonStyle, { backgroundColor: 'rgb(0,255,0)' }]}
                                activeOpacity={0.7}
                                onPress={() => {
                                    this._onComePlay()
                                }}
                            >
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={styles.textButton} >Vào chơi</Text>
                                </View>
                            </TouchableOpacity>

                            {/* <TouchableOpacity
                                style={[styles.buttonStyle, { backgroundColor: 'cyan' }]}
                                activeOpacity={0.7}
                                onPress={() => {
                                    this._onVisit()
                                }}
                            >
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={styles.textButton} >Vào xem</Text>
                                </View>
                            </TouchableOpacity> */}
                        </View>
                    </LinearGradient>
                </View>
            </Modal>
        )
    }
}

const styles = StyleSheet.create({
    modalContainer: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    viewContainer: {
        height: 280,
        width: 420,
        backgroundColor: '#535d69',
        borderRadius: 20,
        alignItems: 'center',
        borderColor: 'white',
        borderWidth: 2,
    },
    viewContainerClose: {
        width: '100%',
        alignItems: 'flex-end',
        bottom: '8%',
        left: '6%',
    },
    informationContainer: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        flexDirection: 'row',
        bottom: 20,
    },
    coinOwnerContainer: {
        height: '25%',
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(49,51,108,0.5)',
        marginBottom: '25%'
    },
    informationRoom: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 10,
        marginRight: 10,
        borderRadius: 20,
        borderColor: 'rgba(255,255,255,0.7)',
        borderWidth: 1,
    },
    rowInformation: {
        width: '100%',
        height: '22%',
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingLeft: 5,
        borderBottomColor: 'rgba(255,255,255,0.7)',
        borderBottomWidth: 1
    },
    textProperties: {
        fontWeight: 'bold',
        marginRight: 5,
        fontSize: 17,
    },
    passwordContainer: {
        width: '100%',
        height: 35,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    textPassword: {
        marginHorizontal: 10,
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold'
    },
    viewTextInput: {
        flex: 1,
        marginRight: 10,
        height: 45,
        borderRadius: 10,
        borderColor: 'gray',
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 5,
        flexDirection: 'row',
        alignItems: 'center'
    },
    textInput: {
        height: 45,
        fontSize: 20,
        fontStyle: 'italic',
        color: 'white'
    },
    buttonContainer: {
        width: '100%',
        height: 50,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonStyle: {
        height: 30,
        width: '30%',
        marginHorizontal: '5%',
        borderRadius: 100,
    },
    textButton: {
        fontSize: 15,
        fontWeight: 'bold',
        color: 'black',
    }
})