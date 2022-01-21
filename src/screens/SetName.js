import React, { Component } from "react";
import {
    View,
    Dimensions,
    ImageBackground,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Text,
    Alert
} from "react-native";
import API_URL from "../constan.variables";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CircleSnail } from "react-native-progress";
import CurrentUser from "../modules/CurrentUser";

export default class SetName extends Component {

    state = {
        textName: 'YourName',
        isLoading: true,
    }

    async componentDidMount() {
        let user = await CurrentUser.getUserInformation();
        if (user) {
            this.props.navigation.navigate('Home');
            this.setState({
                isLoading: false
            })
        } else {
            this.setState({
                isLoading: false,
            })
        }
    }

    checkName(name) {
        let reg = /^[a-zA-z][\w\_]{2,14}$/  // Ký tự đầu là chữ cái, sau đó thì tối đa 14, tối thiểu 2 ký tự là chữ cái, số và dấu gạch dưới.
        return reg.test(name);
    }

    onPressConfirm = () => {
        let name = this.state.textName.trim();
        if (!this.checkName(name)) {
            return Alert.alert("Tên không hợp lệ!");
        }
        axios.post(API_URL + '/logIn', {
            userName: name,
            //logInWith: this.props.route.params.logInWith,
            logInWith: 'No',
        }).then(async (res) => {
            if (res.data.error) {
                Alert.alert(res.data.error);
                return;
            }
            await AsyncStorage.setItem('currentUser', name);
            this.props.navigation.navigate('Home', {
                user: res.data.user,
            });
        }).catch((error) => {
            console.log(error);
            Alert.alert("Lỗi kết nối tới server!");
        })
    }

    render() {
        return (
            <View style={styles.container} >
                {
                    this.state.isLoading ? (
                        <CircleSnail size={60} color={['red', 'green', 'blue']} ></CircleSnail>
                    ) : (
                        <ImageBackground
                            style={styles.imageBackground}
                            source={require('../assets/img/YourName.jpg')}
                        >
                            <TextInput style={styles.edtText} onChangeText={(text) => this.setState({ textName: text })} >YourName</TextInput>
                            <TouchableOpacity activeOpacity={0.7} onPress={this.onPressConfirm}>
                                <View style={styles.buttonConfirm} >
                                    <Text style={styles.textConfirm} >XÁC NHẬN</Text>
                                </View>
                            </TouchableOpacity>
                        </ImageBackground>
                    )
                }
            </View>
        )
    }
}

const height = Dimensions.get('window').height;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    imageBackground: {
        height: height,
        width: (2067 / 1241) * height,
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    edtText: {
        width: 400,
        height: 100,
        fontSize: 55,
        color: 'rgb(255,148,0)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 10,
        textShadowColor: 'white',
        fontWeight: 'bold',
        bottom: '49%',
        left: '28%'
    },
    buttonConfirm: {
        backgroundColor: '#12d457',
        width: 160,
        height: 40,
        marginBottom: 10,
        borderRadius: 20,
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOpacity: 1.8,
        elevation: 6,
        shadowRadius: 15,
        shadowOffset: { width: 1, height: 13 },
        justifyContent: 'center',
        alignItems: 'center'
    },
    textConfirm: {
        fontSize: 15,
        color: 'white',
        fontWeight: 'bold'
    }
})