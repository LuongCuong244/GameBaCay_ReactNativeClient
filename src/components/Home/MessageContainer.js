import React, { Component } from "react";
import { View, StyleSheet, Platform, KeyboardAvoidingView, Image } from "react-native";
import { GiftedChat, Avatar, Bubble, Send, InputToolbar } from "react-native-gifted-chat/";

var a = 1;
let snapShot;
let isUseState = true;

export default class MessageContainer extends Component {

    state = {
        messages: [],
        user: '',
    }

    removeMessage(array) {
        array.forEach((item) => {
            console.log(item._id);
            firestore().collection(this.props.collection_Path).doc(item._id).delete();
        })

    }

    componentDidMount() {
        isUseState = true;
        firestore().collection('Users').doc(auth().currentUser.uid).get().then((queryDoc) => {
            if (queryDoc.exists) {
                if(isUseState){
                    this.setState({
                        user: queryDoc.data()
                    })
                }
            }
        })

        snapShot = firestore().collection(this.props.collection_Path).onSnapshot((querySnapShot) => {
            if (a == 1) { // Ngăn vào lần đầu
                let mes = [];
                querySnapShot.forEach((doc) => {
                    mes.push(doc.data());
                })
                mes.sort((a, b) => {
                    return b.createAt.toDate() - a.createAt.toDate();
                });
                if (mes.length > 200) { // chỉ lưu trữ 200 tin nhắn cuối
                    this.removeMessage(mes.slice(0, mes.length - 200));
                }

                if(isUseState){
                    this.setState({
                        messages: mes,
                    })
                }

                a = 2;
                return;
            }
            querySnapShot.docChanges().forEach((change) => {
                if (change.type == 'added') {
                    let data = change.doc.data();
                    data.createAt = data.createAt.toDate();
                    let message = [];
                    message.push(data);
                    if(isUseState){
                        this.setState(previousState => ({
                            messages: GiftedChat.append(previousState.messages, message),
                        }));
                    }
                }
            });
        })
    }

    componentWillUnmount() {
        isUseState = false;
        snapShot();
    }

    _onSend(messages = []) {
        firestore().collection(this.props.collection_Path).doc(messages[0]._id).set({
            _id: messages[0]._id,
            createAt: new Date(),
            user: messages[0].user,
            text: messages[0].text,
        })
    }

    renderAvatar(props) {
        return (
            <Avatar
                {...props}
                imageStyle={{
                    left: {
                        height: 25,
                        width: 25,
                        borderRadius: 12.5
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
                        backgroundColor: '#2e64e5' // màu background tin nhắn
                    }
                }}
                textStyle={{
                    right: {
                        color: '#fff', // màu chữ tin nhắn
                    }
                }}
                usernameStyle={{ color: 'tomato', fontWeight: '100' }}
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
                    marginHorizontal: 2,
                }}
            >
                <Image
                    source={require('../../assets/img/Icon/send.png')} resizeMode={'center'}
                    style={{ width: 22,height: 22,bottom: '13%' }}
                />
            </Send>
        );
    }

    renderInputToolbar(props) {
        return (
            <InputToolbar
                {...props}
                containerStyle={{
                    backgroundColor: 'white',
                    borderRadius: 100,
                    height: '18%'
                }}
                primaryStyle={{ alignItems: 'center' }}
            />
        );
    }

    render() {
        if (Platform.OS === 'android') {
            <KeyboardAvoidingView behavior="padding" enabled />
        }
        return (
            <GiftedChat
                messages={this.state.messages}
                user={{
                    _id: auth().currentUser.uid,
                    name: this.state.user.name,
                    avatar: auth().currentUser.photoURL
                }}
                onSend={(messages) => {
                    this._onSend(messages);
                }}
                maxInputLength={100}
                renderAvatar={this.renderAvatar}
                renderBubble={this.renderBubble}
                renderSend={this.renderSend}
                renderInputToolbar={this.renderInputToolbar}
                placeholder='Nhập tin nhắn'
                renderUsernameOnMessage={true}
                showAvatarForEveryMessage={false}
                alwaysShowSend={true}
            />
        )
    }
}