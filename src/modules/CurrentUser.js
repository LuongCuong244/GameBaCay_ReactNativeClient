import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import API_URL from '../constan.variables';
import Toast from 'react-native-simple-toast';
import {Alert, BackHandler} from 'react-native';

class CurrentUser {
    async getName() {
        try {
            const userName = await AsyncStorage.getItem('currentUser');
            if (userName !== null) {
                return userName;
            }
            return null;
        } catch (error) {
            console.log(error);
        }
    }

    async getUserInformation() {
        let user;
        let userName = await this.getName();
        if (!userName) {
            return;
        }
        await axios.post(API_URL + '/user/get-Public-Information', {
            userName: userName,
        }).then(res => {
            if (res.data.error) {
                return;
            }
            user = res.data.information;
        }).catch(err => Toast.show(err));
        if (!user) {
            Toast.show('Người dùng không tồn tại!');
            await AsyncStorage.removeItem('currentUser');
            Alert.alert("Cảnh báo", "Game lỗi, ảo thật đấy? Hãy thử xóa game tải lại!", [
                {
                    text: "Đóng ứng dụng",
                    onPress: () => {
                        BackHandler.exitApp();
                    }
                }
            ]);
        }
        return user;
    }
}

export default new CurrentUser();