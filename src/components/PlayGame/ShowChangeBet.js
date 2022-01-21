import axios from "axios";
import React, { Component } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { CircleSnail } from "react-native-progress";
import formatCoin from "../../modules/FormatCoin";
import formatCoinByLetter from "../../modules/FormatCoinByLetter";
import API_URL from "../../constan.variables";
import socketRoom from '../../socketIO/config/RoomNamespace'

export default class ShowChangeBet extends Component {

    constructor(props) {
        super(props);
    }

    state = {
        coin: this.props.coin,
        minBet: this.props.minBet,
        newBet: '',
        isLoading: false,
    }

    async checkNewBet() {
        let reg = /^[0-9]+$/;
        if (!reg.test(this.state.newBet)) {
            let message = 'Thất bại! Input không hợp lệ.'
            this.props.hideChangeBet(message);
            return;
        }

        let newBet = parseInt(this.state.newBet);
        let message = ''
        if (newBet < this.state.minBet) {
            message = 'Thất bại! Mức cược nhỏ hơn mức tối thiểu.';
        }
        else if (newBet > this.state.coin) {
            message = 'Thất bại! Bạn không đủ ' + `${formatCoinByLetter(newBet)}` + ' để cược.';
        }
        else {
            this.setState({
                isLoading: true
            })
            await axios.post(API_URL + '/room/change-bet', {
                roomName: this.props.roomName,
                userName: this.props.userName,
                newBet: newBet
            })
                .then((res) => {
                    this.setState({
                        isLoading: false
                    })
                    if (res.data.error) {
                        message = res.data.error
                    }else{
                        if(res.data.updateBet === 'Yes'){
                            socketRoom.emit('update_Change_Bet',this.props.roomName);
                        }
                        message = 'Thành công! Mức cược sẽ được áp dụng từ ván sau.'
                    }
                })
                .catch(err => {
                    console.log(err);
                    message = 'Đã có lỗi xảy ra!'
                })

        }
        this.props.hideChangeBet(message);
    }

    render() {
        return (
            <LinearGradient
                style={styles.container}
                colors={['#5e5c5c', '#9dc5c3']}
            >
                <LinearGradient
                    style={styles.titleContainer}
                    colors={['#5e5c5c', '#9dc5c3']}
                >
                    <Text style={styles.title}>Đặt lại mức cược</Text>
                </LinearGradient>

                <Text style={styles.fieldName} >Mức cược tối thiểu của phòng</Text>
                <Text style={styles.minBet} >{formatCoin(this.state.minBet)}</Text>
                <View style={{ width: '70%', height: 1, backgroundColor: 'white' }} ></View>
                <View style={styles.inputContainer}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => {
                            this.setState({
                                newBet: this.state.coin,
                            })
                        }}
                    >
                        <LinearGradient
                            style={styles.allInButton}
                            colors={['#eb4511', '#b02e0c']}
                        >
                            <Text style={styles.buttonText}>Đặt tất</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <View style={styles.textInputContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Nhập mức cược !"
                            keyboardType="numeric"
                            onSubmitEditing={(event) => {
                                this.setState({
                                    newBet: event.nativeEvent.text,
                                })
                            }}
                        >{this.state.newBet}</TextInput>
                    </View>
                </View>
                {
                    this.state.isLoading ? (
                        <CircleSnail size={28} color={['red','green','blue']} ></CircleSnail>
                    ) : (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => {
                                this.checkNewBet();
                            }}
                        >
                            <LinearGradient
                                style={styles.confirmButton}
                                colors={['#e48d2f', '#c18646']}
                            >
                                <Text style={styles.confirmText}>Xác nhận</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )
                }
            </LinearGradient>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        width: 290,
        height: 190,
        borderRadius: 10,
        borderColor: 'white',
        borderWidth: 1,
        alignItems: 'center',
    },
    titleContainer: {
        width: '100%',
        height: 35,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        letterSpacing: 1,
        fontWeight: 'bold',
        fontSize: 17,
        marginVertical: 5,
        color: '#380036',
    },
    fieldName: {
        fontSize: 12,
        fontStyle: 'italic',
        fontWeight: '600',
        color: 'black',
        marginTop: 10
    },
    minBet: {
        fontSize: 15,
        fontWeight: 'bold',
        color: 'cyan',
        marginTop: 5
    },
    inputContainer: {
        height: 60,
        width: '100%',
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    allInButton: {
        width: 65,
        height: 25,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 13,
        letterSpacing: 0.3,
        fontWeight: '700',
        color: 'white'
    },
    textInputContainer: {
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'white',
        width: 185,
        height: 35,
        marginLeft: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    textInput: {
        height: 50,
        width: 185,
        textAlign: 'center',
        fontSize: 15,
        fontWeight: 'bold',
        color: '#ffd700',
        letterSpacing: 1,
    },
    confirmButton: {
        width: 110,
        height: 25,
        marginTop: 5,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30
    },
    confirmText: {
        fontWeight: 'bold',
        fontSize: 14,
        color: 'white',
        textAlign: 'center',
    }
})