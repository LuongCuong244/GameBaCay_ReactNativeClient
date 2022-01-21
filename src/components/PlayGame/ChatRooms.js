import React, { Component } from "react";
import { View, StyleSheet, Animated, Text, Dimensions, KeyboardAvoidingView } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { GiftedChat, Avatar, Bubble, Send, InputToolbar } from "react-native-gifted-chat/";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import socketRoom from '../../socketIO/config/RoomNamespace';

export default class ChatRoom extends Component {

    state = {
        anim: new Animated.Value(-Dimensions.get('window').width / 2),
        messages: [],
    }

    componentDidMount() {
        this.animIn();

        socketRoom.emit('get_messages', this.props.roomName);

        socketRoom.on('update_messages', (messages) => {
            if (this.state.messages.length !== 0) {
                this.setState(previousState => ({
                    messages: GiftedChat.append(previousState.messages, messages[messages.length - 1]),
                }));
            } else {
                messages.forEach((item) => {
                    this.setState(previousState => ({
                        messages: GiftedChat.append(previousState.messages, item),
                    }));
                })
            }
        })
    }

    componentWillUnmount() {
        socketRoom.off('update_messages');
    }

    animIn() {
        Animated.spring(this.state.anim, {
            toValue: 0,
            bounciness: 13,
            useNativeDriver: true,
        }).start();
    }

    animOut() {
        Animated.timing(this.state.anim, {
            toValue: -Dimensions.get('window').width / 2,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            this.props.setShowMessages(false);
        });
    }

    _onSend(messages = []) {
        let text = messages[0].text.trim();
        if (text.length < 1) {
            return false;
        }
        socketRoom.emit('sending_message_to_room', {
            _id: messages[0]._id,
            createAt: new Date(),
            user: messages[0].user,
            text: messages[0].text,
        }, this.props.roomName);
    }

    renderAvatar(props) {
        return (
            <Avatar
                {...props}
                imageStyle={{
                    left: {
                        height: 35,
                        width: 35,
                        borderRadius: 25
                    }
                }}
            ></Avatar>
        )
    }

    renderBubble(props) {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    right: {
                        backgroundColor: '#2e64e5', // màu background tin nhắn
                    }
                }}
                textStyle={{
                    right: {
                        color: '#fff', // màu chữ tin nhắn
                    },
                }}
                usernameStyle={{ color: '#009688' }}
            ></Bubble>
        )
    }

    renderSend(props) {
        return (
            <Send
                {...props}
                disabled={!props.text}
                containerStyle={{
                    width: 44,
                    height: 44,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <FontAwesome5 name="arrow-right" size={32} color={'#6666ff'} ></FontAwesome5>
            </Send>
        );
    }

    renderInputToolbar(props) {
        return (
            <InputToolbar
                {...props}
                containerStyle={{
                    backgroundColor: 'white',
                    borderRadius: 22,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
                primaryStyle={{ alignItems: 'center' }}
            />
        );
    }

    render() {
        return (
            <Animated.View
                style={[
                    styles.container,
                    {
                        transform: [{
                            translateX: this.state.anim
                        }]
                    }
                ]}
                onStartShouldSetResponder={(even) => {
                    if (even.nativeEvent.locationX > Dimensions.get('window').width / 2) {
                        this.animOut();
                    }
                }}
            >
                <LinearGradient
                    style={styles.linearBackground}
                    colors={['#d387ab', '#e899dc']}
                >
                    <LinearGradient
                        style={styles.linearTitle}
                        colors={['#7f5a83', '#2a648e']}
                    >
                        <Text style={styles.title}>Phòng chat</Text>
                    </LinearGradient>

                    <View style={styles.messageContainer}>
                        <View style={{ flex: 1 }} >
                            <GiftedChat
                                messages={this.state.messages}
                                user={{
                                    _id: this.props.currenUser.userName,
                                    name: this.props.currenUser.userName,
                                    avatar: this.props.currenUser.avatar
                                }}
                                onSend={(messages) => {
                                    this._onSend(messages);
                                }}
                                maxInputLength={50}
                                renderAvatar={this.renderAvatar}
                                renderBubble={this.renderBubble}
                                renderSend={this.renderSend}
                                renderInputToolbar={this.renderInputToolbar}
                                placeholder='Nhập tin nhắn'
                                renderUsernameOnMessage={true}
                                showAvatarForEveryMessage={false}
                                alwaysShowSend={true}
                            />
                            {
                                Platform.OS === 'android' && <KeyboardAvoidingView behavior="padding" />
                            }
                        </View>
                    </View>
                </LinearGradient>
            </Animated.View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.01)'
    },
    linearBackground: {
        width: '50%',
        height: '95%',
        borderRadius: 22,
        borderColor: 'white',
        borderWidth: 2,
    },
    linearTitle: {
        width: '100%',
        height: 60,
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        letterSpacing: 1,
        color: 'white'
    },
    messageContainer: {
        flexDirection: 'row',
        paddingTop: 10,
        flex: 1,
        width: '100%',
    },
})