import axios from "axios";
import React, { Component } from "react";
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { CircleSnail } from "react-native-progress";
import Toast from "react-native-simple-toast";
import API_URL from "../../constan.variables";

export default class ShowFindRoom extends Component {

    state = {
        roomName: '',
        isLoading: false,
    }

    findingRoom = () => {
        let roomName = this.state.roomName.trim();
        this.setState({
            isLoading: true,
        })
        axios.post(API_URL + '/room/find-room', {
            roomName: roomName,
        })
            .then((res) => {
                if (res.data.error) {
                    Toast.show('Không tìm thấy bàn nào có tên ' + roomName);
                    this.setState({
                        isLoading: false,
                    })
                    this.props.setShowFindRoom(0);
                    console.log(res.data.error);
                    return;
                }
                Toast.show('Đã tìm thấy bàn có tên ' + roomName);
                this.setState({
                    isLoading: false,
                })
                this.props.setShowFindRoom(0, res.data.room);
            })
            .catch(err => {
                console.log(err);
                Toast.show('Không tìm thấy bàn nào có tên ' + roomName);
                this.setState({
                    isLoading: false,
                })
                this.props.setShowFindRoom(0);
            })
    }

    render() {
        return (
            <LinearGradient
                style={styles.container}
                colors={['#1e9afe', '#60dfcd']}
            >
                <View style={styles.titleContainer}>
                    <Text style={styles.title} >TÌM PHÒNG</Text>
                </View>

                <View style={styles.viewContainer} >
                    <View style={styles.textInputContainer} >
                        <TextInput
                            style={styles.textInput}
                            placeholder="Nhập tên bàn cần tìm"
                            onChangeText={(text) => {
                                this.setState({
                                    roomName: text,
                                })
                            }}
                        ></TextInput>
                    </View>
                </View>

                {
                    this.state.isLoading ? (
                        <View style={styles.buttonContainer} >
                            <CircleSnail color={['red', 'green', 'blue']} size={35} ></CircleSnail>
                        </View>
                    ) : (
                        <View style={styles.buttonContainer} >

                            <TouchableOpacity
                                activeOpacity={0.7}
                                style={{ width: 100, height: 30, marginHorizontal: 20 }}
                                onPress={() => {
                                    this.props.setShowFindRoom(0);
                                }}
                            >
                                <LinearGradient
                                    style={styles.backgroundButton}
                                    colors={['#ff748b', '#fe7bb0']}
                                >
                                    <Text style={styles.buttonText}>Thoát</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                                activeOpacity={0.7}
                                style={{ width: 100, height: 30, marginHorizontal: 20 }}
                                onPress={() => {
                                    this.findingRoom();
                                }}
                            >
                                <LinearGradient
                                    style={styles.backgroundButton}
                                    colors={['#0bab64', '#3bb78f']}
                                >
                                    <Text style={styles.buttonText}>Tìm kiếm</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )
                }
            </LinearGradient>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        width: 330,
        height: 200,
        borderRadius: 10,
        borderColor: 'yellow',
        borderWidth: 2,
    },
    titleContainer: {
        width: '100%',
        height: 50,
        backgroundColor: '#114f84',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        fontSize: 20,
        fontWeight: '500',
        color: 'white'
    },
    viewContainer: {
        flex: 1,
        flexDirection: 'row',
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    textInputContainer: {
        width: '90%',
        height: 35,
        borderRadius: 20,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textInput: {
        fontSize: 18,
        height: 60,
        width: '100%',
        letterSpacing: 1,
        color: 'rgb(50,50,50)',
        textAlign: 'center',
        padding: 0,
    },
    buttonContainer: {
        height: 50,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backgroundButton: {
        flex: 1,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600'
    },
})