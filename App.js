import React, { Component } from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';
import SetName from "./src/screens/SetName";
import Home from "./src/screens/Home";
import PlayGame from "./src/screens/PlayGame";
import AllRooms from "./src/screens/AllRooms";
import LeaderBoards from './src/screens/LeaderBoards';

const Stack = createNativeStackNavigator();

export default class App extends Component {

  render() {
    return (
      <NavigationContainer >
        <StatusBar hidden ></StatusBar>
        <Stack.Navigator initialRouteName='SetName'>
          <Stack.Screen name="SetName" component={SetName} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
          <Stack.Screen name='AllRooms' component={AllRooms} options={{ headerShown: false }} />
          <Stack.Screen name='PlayGame' component={PlayGame} options={{ headerShown: false }} />
          <Stack.Screen name='LeaderBoards' component={LeaderBoards} options={{ title: 'Bảng xếp hạng', headerTitleStyle: { fontSize: 18 } }} />
        </Stack.Navigator>
      </NavigationContainer>
    )
  }
}