import axios from "axios";
import React, { Component } from "react";
import {  TouchableOpacity, View, Text, StyleSheet, FlatList, Alert } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import RatingItem from "../components/LeaderBoards/RatingItem";
import API_URL from "../constan.variables";
import formatCoinByLetter from "../modules/FormatCoinByLetter";

export default class LeaderBoards extends Component {

    state = {
        isSelectedALotOfCoin: true,
        listALotOfCoin: [],
        currentUserALotOfCoin: null,

        isSelectedWinStreak: false,
        listWinStreak: [],
        currentUserWinStreak: null,
    }

    componentDidMount() {
        axios.get(API_URL + '/get-data-for-leader-boards')
            .then((res) => {
                if (res.data.error) {
                    Alert.alert(res.data.error);
                    return;
                }
                let listData = [];

                let i, j;
                let sizeListUsers = res.data.listUsers.length;
                let sizeListStatistical = res.data.listStatistical.length;
                for (i = 0; i < sizeListUsers; i++) {
                    for (j = 0; j < sizeListStatistical; j++) {
                        if (res.data.listUsers[i].userName === res.data.listStatistical[j].userName) {
                            listData.push({
                                ...res.data.listUsers[i],
                                ...res.data.listStatistical[j]
                            })
                            break;
                        }
                    }
                }

                this.listALotOfCoin(listData);
                this.listWinStreak(listData);
            })
            .catch(err => console.log(err))
    }

    listALotOfCoin = (listData) => {
        listData.sort((a, b) => b.coin - a.coin);
        let listPlayer = [];
        listData.forEach((item, index) => {
            if (index < 100) {
                listPlayer.push({
                    value: formatCoinByLetter(item.coin),
                    avatar: item.avatar,
                    userName: item.userName,
                })
            }
            if (item.userName === this.props.route.params.userName) {
                this.setState({
                    currentUserALotOfCoin: {
                        value: formatCoinByLetter(item.coin),
                        avatar: item.avatar,
                        userName: item.userName,
                        index: index,
                    }
                })
            }
        })
        this.setState({
            listALotOfCoin: listPlayer
        })
    }

    listWinStreak = (listData) => {
        listData.sort((a, b) => b.longestWinStreak - a.longestWinStreak);
        let listWinStreak = [];
        listData.forEach((item, index) => {
            if (index < 100) {
                listWinStreak.push({
                    value: item.longestWinStreak,
                    avatar: item.avatar,
                    userName: item.userName,
                })
            }
            if (item.userName === this.props.route.params.userName) {
                this.setState({
                    currentUserWinStreak: {
                        value: item.longestWinStreak,
                        avatar: item.avatar,
                        userName: item.userName,
                        index: index,
                    }
                })
            }
        })
        this.setState({
            listWinStreak: listWinStreak
        })
    }

    clickButtonALotOfCoin = () => {
        if (this.state.isSelectedALotOfCoin === false) {
            this.setState({
                isSelectedALotOfCoin: true,
                isSelectedWinStreak: false,
            })
        }
    }

    clickButtonWinStreak = () => {
        if (this.state.isSelectedWinStreak === false) {
            this.setState({
                isSelectedALotOfCoin: false,
                isSelectedWinStreak: true,
            })
        }
    }

    rankCurrent = () => {
        if (this.state.isSelectedALotOfCoin && this.state.currentUserALotOfCoin) {
            return (
                <RatingItem item={this.state.currentUserALotOfCoin} index={this.state.currentUserALotOfCoin.index + 1} ofFlatList={false} ></RatingItem>
            )
        }

        if (this.state.isSelectedWinStreak && this.state.currentUserWinStreak) {
            return (
                <RatingItem item={this.state.currentUserWinStreak} index={this.state.currentUserWinStreak.index + 1} ofFlatList={false} ></RatingItem>
            )
        }
    }

    render() {
        return (
            <LinearGradient
                style={{ flex: 1, flexDirection: 'row' }}
                colors={['#355c7d','#6c5b7b','#c06c84']}
                start={{x: 0,y: 0}}
                end={{x: 1, y: 0}}
            >
                <View style={styles.buttonContainer} >
                    <TouchableOpacity
                        style={[
                            styles.buttonStyle,
                            {
                                marginTop: 40,
                                backgroundColor: this.state.isSelectedALotOfCoin ? '#eb4d4a' : '#95afc0',
                                borderColor: this.state.isSelectedALotOfCoin ? 'cyan' : '#f9ca24'
                            }]}
                        activeOpacity={0.7}
                        onPress={() => {
                            this.clickButtonALotOfCoin();
                        }}
                    >
                        <Text style={[
                            styles.buttonText,
                            {
                                color: this.state.isSelectedALotOfCoin ? 'white' : 'black'
                            }]}
                        >Top đại gia</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.buttonStyle,
                            {
                                backgroundColor: this.state.isSelectedWinStreak ? '#eb4d4a' : '#95afc0',
                                borderColor: this.state.isSelectedWinStreak ? 'cyan' : '#f9ca24'
                            }]}
                        activeOpacity={0.7}
                        onPress={() => {
                            this.clickButtonWinStreak();
                        }}
                    >
                        <Text style={[
                            styles.buttonText,
                            {
                                color: this.state.isSelectedWinStreak ? 'white' : 'black'
                            }]}
                        >Top chuỗi thắng</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.displayContainer} >
                    <View style={styles.headerBoard}>
                        <View style={[styles.headerComponentView, { width: '22%' }]}>
                            <Text style={[styles.headerComponentText, { left: '8%' }]} >HẠNG</Text>
                        </View>
                        <View style={[styles.headerComponentView, { width: '50%' }]}>
                            <Text style={[styles.headerComponentText, { left: '8%' }]} >NGƯỜI CHƠI</Text>
                        </View>
                        <View style={[styles.headerComponentView, { width: '28%' }]}>
                            <Text style={[styles.headerComponentText, { right: '5%' }]} >{this.state.isSelectedALotOfCoin ? 'TỔNG TIỀN' : 'CHUỖI LIÊN TIẾP'}</Text>
                        </View>
                    </View>

                    <FlatList
                        data={this.state.isSelectedALotOfCoin ? this.state.listALotOfCoin : this.state.listWinStreak}
                        renderItem={(item) => {
                            return (
                                <RatingItem item={item.item} index={item.index + 1} ofFlatList={true} userName={this.props.route.params.userName}></RatingItem>
                            )
                        }}
                        style={{ flex: 1 }}
                    ></FlatList>
                    <View style={{ height: 15 }} ></View>
                    {
                        this.rankCurrent()
                    }
                </View>
            </LinearGradient>
        )
    }
}

const styles = StyleSheet.create({
    buttonContainer: {
        width: '30%',
        height: '100%',
        alignItems: 'center'
    },
    buttonStyle: {
        width: '90%',
        height: 40,
        backgroundColor: '#95afc0',
        marginVertical: 10,
        borderRadius: 100,
        borderColor: '#f9ca24',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonText: {
        fontSize: 15,
        fontWeight: '600'
    },
    displayContainer: {
        flex: 1,
        padding: 10,
    },
    headerBoard: {
        backgroundColor: '#cedde2',
        width: '100%',
        height: 45,
        height: 30,
        flexDirection: 'row'
    },
    headerComponentView: {
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    headerComponentText: {
        color: '#34616b',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
    }
})