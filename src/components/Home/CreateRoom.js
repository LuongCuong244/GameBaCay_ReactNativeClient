import axios from "axios";
import React, { Component } from "react";
import { Modal, StyleSheet, TouchableOpacity, View, Text, TextInput, Alert } from "react-native";
import AntDesign from 'react-native-vector-icons/AntDesign'
import socketRoom from '../../socketIO/config/RoomNamespace'
import API_URL from '../../constan.variables'
import CurrentUser from '../../modules/CurrentUser'
import Toast from 'react-native-simple-toast'
import LinearGradient from "react-native-linear-gradient";
export default class CreateRoom extends Component {

    state = {
        roomName: '',
        roomPassword: '',
        minBet: '1000',
    }

    onClose() {
        this.setState({
            roomName: '',
            roomPassword: ''
        })
        this.props.setVisible(false);
    }

    onPressRoomCreate = async () => {
        let userName = await CurrentUser.getName();
        let roomName = this.state.roomName.trim();
        let roomPassword = this.state.roomPassword.trim();
        let minBet = this.state.minBet.trim();
        let reg = /^[0-9A-Za-z\_]+$/;
        if(!reg.test(roomName)){
            Toast.show('Tên bàn chỉ được bao gồm các ký tự: A-Z, a-z, 0-9 và ký tự gạch dưới _');
            return;
        }
        if(!reg.test(roomPassword) && roomPassword.length !== 0){
            Toast.show('Mật khẩu chỉ được bao gồm các ký tự: A-Z, a-z, 0-9 và ký tự gạch dưới _');
            return;
        }
        if (!userName) {
            Toast.show('Lỗi khi tạo bàn!');
            return;
        }
        if (this.state.roomName.length > 20) {
            Toast.show('Tên bàn chỉ được tối đa 20 ký tự!');
            return;
        }
        if (this.state.roomPassword.length > 20) {
            Toast.show('Mật khẩu chỉ được tối đa 20 ký tự!');
            return;
        }
        if(!/^[0-9]+$/.test(minBet)){
            Toast.show('Mức cược nhỏ nhất chỉ được bao gồm các ký tự: 0-9');
            return;
        };
        axios.post(API_URL + '/room/create-room', {
            userName: userName,
            roomName: roomName,
            roomPassword: roomPassword,
            minBet: minBet,
        }).then((res) => {
            if (res.data.error) {
                Toast.show(res.data.error,Toast.LONG);
                if(res.data.error === 'Mức tiền cược nhỏ nhất tối thiếu là: 1.000'){
                    this.setState({
                        minBet: '1000',
                    })
                }
                return;
            }
            this.onClose();
            socketRoom.emit('join_Room',roomName);
            socketRoom.emit('update_Rooms');
            socketRoom.emit('reload_Room',roomName,res.data);
            socketRoom.emit('req_Set_Position',res.data.position);
            this.props.navigation.navigate('PlayGame',{
                roomName: roomName,
                userName: userName,
                position: 10,
                minBet: minBet,
            })
            Toast.show('Tạo phòng thành công !')
        })
            .catch((error) => {
                Toast.show(error,Toast.LONG);
            })
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
                        colors={['#6dbdc0','#e0fafb']}
                    >
                        <View style={styles.viewContainerClose} >
                            <TouchableOpacity
                                onPress={() => {
                                    this.props.setVisible(false)
                                }}
                                activeOpacity={0.7}
                            >
                                <AntDesign name='closecircle' size={45} color='red' style={{ backgroundColor: 'white', borderRadius: 50 }}></AntDesign>
                            </TouchableOpacity>
                        </View>

                        <View style = {styles.inputContainer} >
                            <Text style = {styles.fieldName} >Nhập tên bàn:</Text>
                            <View style = {styles.textInputContainer} >
                                <TextInput
                                    style = {styles.textInput}
                                    placeholder="Bắt buộc"
                                    onChangeText={(text) =>{
                                        this.setState({
                                            roomName: text,
                                        })
                                    }}
                                ></TextInput>
                            </View>
                        </View>

                        <View style = {styles.inputContainer} >
                            <Text style = {styles.fieldName} >Nhập mật khẩu:</Text>
                            <View style = {styles.textInputContainer} >
                                <TextInput
                                    style = {styles.textInput}
                                    placeholder="Không bắt buộc"
                                    onChangeText={(text) =>{
                                        this.setState({
                                            roomPassword: text,
                                        })
                                    }}
                                ></TextInput>
                            </View>
                        </View>

                        <View style = {styles.inputContainer} >
                            <Text style = {styles.fieldName} >Mức tiền cược nhỏ nhất:</Text>
                            <View style = {styles.textInputContainer} >
                                <TextInput
                                    style = {[styles.textInput,{color: 'blue',fontWeight: 'bold'}]}
                                    placeholder="Tối thiểu 1000"
                                    keyboardType="numeric"
                                    onChangeText={(text) =>{
                                        this.setState({
                                            minBet: text,
                                        })
                                    }}
                                >{this.state.minBet}</TextInput>
                            </View>
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.7}
                            style = {styles.createRoomButton}
                            onPress={() =>{
                                this.onPressRoomCreate();
                            }}
                        >
                            <LinearGradient
                                style = {styles.linearButton}
                                colors={['tomato','red']}
                            >
                                <Text style = {styles.textButton}>Tạo mới</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
            </Modal>
        )
    }
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    viewContainer: {
        height: 280,
        width: 340,
        backgroundColor: '#e0fafb',
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'white',
        alignItems: 'center'
    },
    viewContainerClose: {
        width: '100%',
        alignItems: 'flex-end',
        bottom: '8%',
        left: '6%'
    },
    inputContainer:{
        width: '90%',
        height: 65,
        marginTop: 5,
        alignItems: 'flex-start',
        bottom: 40,
    },
    fieldName:{
        letterSpacing: 1,
        color: 'rgb(50,50,50)',
        fontStyle: 'italic',
        fontSize: 15,
        marginVertical: 5,
        marginLeft: 10,
        textAlign: 'center',
    },
    textInputContainer:{
        width: '100%',
        height: 35,
        borderRadius: 20,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textInput:{
        fontSize: 18,
        height: 60,
        width: '100%',
        letterSpacing: 1,
        color: 'rgb(50,50,50)',
        textAlign: 'center',
        padding: 0,
    },
    createRoomButton:{
        width: 120,
        height: 35,
        bottom: 25,
    },
    linearButton:{
        width: '100%',
        height: '100%',
        justifyContent:'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    textButton:{
        fontSize: 15,
        color: 'white',
        fontWeight: 'bold',
        letterSpacing: 0.5
    }
})