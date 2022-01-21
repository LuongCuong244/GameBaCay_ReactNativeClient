import React, { Component } from "react";
import { ImageBackground, StyleSheet, View, Text, Image, TouchableOpacity } from "react-native";
import formatCoin from "../../modules/FormatCoin";
import formatCoinByLetter from "../../modules/FormatCoinByLetter";
import RoomShow from "./RoomShow";

export default class RoomItem extends Component {

    _isMounted = false;

    state = {
        showInformationRoom: false,
    }

    componentDidMount(){
        this._isMounted = true;
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    isCreateRoomShow = (value) => {
        if(this._isMounted){
            this.setState({
                showInformationRoom: value,
            })
        }
    }

    render() {
        return (
            <TouchableOpacity
                onPress={() => {
                    if(this._isMounted){
                        this.setState({
                            showInformationRoom: true,
                        })
                    }
                }}
                style={{marginRight: 20,marginBottom: 30, width: (this.props.widthFlatList / (this.props.numberColums) - 20), height: (this.props.widthFlatList / (this.props.numberColums) - 20)}}
                activeOpacity={0.5}
            >
                <RoomShow
                    isShow={this.state.showInformationRoom}
                    setVisible={this.isCreateRoomShow}
                    roomItem={this.props.roomItem}
                    navigation={this.props.navigation}
                ></RoomShow>

                <ImageBackground
                    style = {{
                        width: (this.props.widthFlatList / (this.props.numberColums) - 20), 
                        height: 0.75*(this.props.widthFlatList / (this.props.numberColums) - 20),
                        justifyContent: 'flex-end',
                        alignItems: 'flex-end',
                    }}
                    source={this.props.roomItem.havePassword === 'Yes' ? require('../../assets/img/Icon/RoomItem_Bubble_Key.png') : require('../../assets/img/Icon/RoomItem.png')}
                >
                    <Text style = {
                        {
                            width: (this.props.widthFlatList / (this.props.numberColums) - 20)*0.282,
                            height: (this.props.widthFlatList / (this.props.numberColums) - 20)*0.282,
                            paddingTop: '2%',
                            textAlign: 'center',
                            fontSize: (this.props.widthFlatList / (this.props.numberColums) - 20)*0.282*0.6,
                            fontWeight: 'bold',
                            color: 'blue',
                            opacity: 0.7,
                        }
                    }>{this.props.roomItem.playersInRoom.length}</Text>
                </ImageBackground>

                <View
                    style = {styles.coinView}
                >
                    <Text 
                        style = {[
                            styles.coinText,
                            {
                                fontSize: (this.props.widthFlatList / (this.props.numberColums) - 20)*0.25*0.6,
                                color: this.props.roomItem.minBet >= 1000000 ? '#fe4a49' : this.props.roomItem.minBet >= 100000 ? '#854442' : '#008744',
                                letterSpacing: this.props.roomItem.minBet >= 1000000 ? 1 : 0
                            }
                        ]} 
                    >{this.props.roomItem.minBet >= 1000000 ? formatCoinByLetter(this.props.roomItem.minBet) : formatCoin(this.props.roomItem.minBet)}</Text>
                </View>
            </TouchableOpacity>
        )
    }
}

const styles = StyleSheet.create({
    coinView:{
        width: '90%',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 100,
        borderWidth: 1,
        borderColor: '#2ab7ca',
        marginTop: 5,
        backgroundColor: 'white',
    },
    coinText:{
        textAlign: 'center',
        bottom: 1,
        fontWeight: 'bold'
    }
})