import React, { Component } from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import FormatCoin from "../../modules/FormatCoin";
import {CircleSnail} from 'react-native-progress';

export default class ShowPlayerInformation extends Component {

    render() {
        return (
            <LinearGradient
                style={styles.container}
                colors={['#6fa7db', '#4c6f8f']}
            >
                <View style={styles.titleContainer}>
                    <Text style={styles.title} >THÔNG TIN NGƯỜI CHƠI</Text>
                </View>
                {
                    this.props.user ? (
                        <View style={styles.viewContainer} >
                            <View style={styles.avatarContainer}>
                                <Image 
                                    style={styles.avatar} 
                                    source={{uri: this.props.user.avatar}}
                                ></Image>
                            </View>
                            <View style={styles.informationContainer} >
                                <View style={styles.fieldText} >
                                    <Text style={styles.headText}>ID: </Text>
                                    <Text style={styles.valueText}>{this.props.user.userName}</Text>
                                </View>
                                <View style={styles.fieldText} >
                                    <Text style={styles.headText}>Vàng: </Text>
                                    <Text style={styles.valueText}>{FormatCoin(this.props.user.coin)}</Text>
                                </View>
                                <View style={styles.fieldText} >
                                    <Text style={styles.headText}>Chiến thắng: </Text>
                                    <Text style={styles.valueText}>{this.props.user.numberOfGamesWon}/{this.props.user.numberOfGamesPlayed}</Text>
                                </View>
                                <View style={styles.fieldText} >
                                    <Text style={styles.headText}>Tỷ lệ: </Text>
                                    <Text style={styles.valueText}>{(this.props.user.numberOfGamesWon*100/this.props.user.numberOfGamesPlayed).toFixed(2)}%</Text>
                                </View>
                            </View>
                        </View>
                    ) : (
                        <View style = {{flex: 1,justifyContent: 'center', alignItems: 'center'}}>
                            <CircleSnail color={['red', 'green', 'blue']} />
                        </View>
                    )
                }
                <View style={styles.buttonContainer} >
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={{ width: 100, height: 30 }}
                        onPress={() =>{
                            this.props.hidePlayerInformation();
                            this.setState({
                                user: null,
                            })
                        }}
                    >
                        <LinearGradient
                            style={styles.backgroundButton}
                            colors={['#cf0000', '#c23232']}
                        >
                            <Text style={styles.buttonText}>Thoát</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        width: 330,
        height: 230,
        borderRadius: 30,
    },
    titleContainer: {
        width: '100%',
        height: 50,
        backgroundColor: '#114f84',
        borderRadius: 15,
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
    },
    avatarContainer: {
        height: '100%',
        width: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        width: 100,
        height: 100,
        backgroundColor: 'pink',
        borderRadius: 15,
        borderColor: 'yellow',
        borderWidth: 3,
    },
    informationContainer: {
        flex: 1,
        padding: 5,
        paddingLeft: 15
    },
    fieldText: {
        height: 28,
        width: '100%',
        flexDirection: 'row',
    },
    headText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: 'white',
        letterSpacing: 1,
    },
    valueText: {
        fontSize: 15,
        color: '#ffd700',
        letterSpacing: 1,
        fontWeight: 'bold'
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
    }
})