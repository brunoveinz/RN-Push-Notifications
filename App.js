import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, Button, View, Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications'
import { useEffect } from 'react';


Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowAlert: true
    };
  }
});


const allowsNotificationsAsync = async () => {
  const settings = await Notifications.getPermissionsAsync();
  return (
    settings.granted ||settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
};
 
const requestPermissionsAsync = async () => {
  return await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
      allowAnnouncements: true,
    },
  });
};


export default function App() { 

  const scheduleNotificationHandler = async () => {
    //// START: CALL FUNCTIONS HERE ////
    const hasPushNotificationPermissionGranted =
      await allowsNotificationsAsync();
 
    if (!hasPushNotificationPermissionGranted) {
      await requestPermissionsAsync();
    }
    //// END: CALL FUNCTIONS HERE ////
 
    Notifications.scheduleNotificationAsync({
      content: {
        title: "My first local notification",
        body: "This is th body of the notification.",
        data: { userName: "Max" },
      },
      trigger: {
        seconds: 2,
      },
    });
  };

  useEffect(()=>{

    async function configurePushNotifications() {
      const { status } = await Notifications.getPermissionsAsync();
      let finalStatus = status;

      if (finalStatus !== 'granted'){
        const {status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      } 

      if(finalStatus !== 'granted'){
        Alert.alert('Permission required', 'Push notifications need the appropriate permissions.')
        return;
      }
      const pushTokenData = await Notifications.getExpoPushTokenAsync({projectId: 'cf8f7e69-3e45-4d62-9a09-b91a58ae5e7d'})
      console.log(pushTokenData)
      
      if (Platform.OS === 'android'){
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.DEFAULT
        })
      }
    }

    configurePushNotifications();
  },[])
  

  useEffect(()=> {
    const suscripcion1 = Notifications.addNotificationReceivedListener( (notification) => {
      console.log('Notification Received');
      console.log(notification);
      const userName = notification.request.content.data.userName;
      console.log(userName)
    });

    const suscripcion2 = Notifications.addNotificationResponseReceivedListener((response)=>{
      console.log('Notification response received')
      console.log(response)
      const userName = response.notification.request.content.data.userName;
      console.log(userName)
    });
  
    return () => {
      suscripcion1.remove();
      suscripcion2.remove();
    }

  },[])


  function sendPushNotificationAndroidHandler(){
    fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type' : 'application/json'
      },
      body: JSON.stringify({
        to : 'ExponentPushToken[86Ji6aI4IF-1gon2iSSIEt]',
        title: 'Test - sent from a device',
        body: 'This is a test!!'
      })
    });
  }

  function sendPushNotificationIphoneHandler(){
    fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type' : 'application/json'
      },
      body: JSON.stringify({
        to : 'ExponentPushToken[4tBrtRPIeYp_QWpjIl1uXO]',
        title: 'Test - sent from a device',
        body: 'This is a test!!'
      })
    });
  }
  return (
    <View style={styles.container}>
      <Text>Helo World, Push Notifications!</Text>
      <Button title='Schedule Notification' onPress={scheduleNotificationHandler}/>
      <Button title='Send Push Notification to Iphone' onPress={sendPushNotificationIphoneHandler}/>
      <Button title='Send Push Notification to Android' onPress={sendPushNotificationAndroidHandler}/>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
