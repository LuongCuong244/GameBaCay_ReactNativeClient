import React, { Component } from "react";
import { View, Text, StyleSheet, Image } from "react-native";

export default class RatingItem extends Component {
    render() {
        return (
            <View style={styles.container}>
                <View 
                    style={{
                        flex: 1,
                        backgroundColor: (this.props.ofFlatList === false || this.props.item.userName === this.props.userName) ? '#31336c' : '#e1eaef',
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 5,
                }}>
                    <View style={styles.rankContainer} >
                        <Text style={styles.rankText}># {this.props.index}</Text>
                    </View>
                    <View style={styles.avatarContainer}>
                        <Image
                            style={{ width: 30, height: 30, marginLeft: 10, borderRadius: 8, }}
                            source={{ uri: this.props.item.avatar }}
                        ></Image>
                        <Text
                            style={{
                                fontSize: 14,
                                color: (this.props.ofFlatList === false || this.props.item.userName == this.props.userName) ? 'white' : '#34616b',
                                marginLeft: 10
                            }}
                        >{this.props.item.userName}</Text>
                    </View>
                    <View style={styles.valueContainer} >
                        <Text style={styles.valueText}>{this.props.item.value}</Text>
                    </View>
                </View>
            </View>
        )
    }
}

//'#31336c', // màu tím

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#cedde2',
        width: '100%',
        height: 45,
        padding: 1,
        paddingHorizontal: 3,
        borderColor: '#cedfe6',
        borderTopWidth: 2,
        borderBottomWidth: 2,
        backgroundColor: '#c7d4d9',
    },
    rankContainer: {
        height: '100%',
        width: '22%',
        backgroundColor: 'white',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    rankText: {
        fontSize: 18,
        fontStyle: 'italic',
        fontWeight: 'bold',
        color: '#34616b'
    },
    avatarContainer: {
        height: '100%',
        width: '50%',
        flexDirection: 'row',
        alignItems: 'center',
    },
    valueContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    },
    valueText: {
        fontSize: 19,
        fontWeight: 'bold',
        color: '#dcb109'
    }
})