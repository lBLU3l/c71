import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet, TextInput, Image, Alert} from 'react-native';
import * as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner';
import * as firebase from 'firebase';
import db from '../config.js';

export default class TransactionScreen extends React.Component {
  constructor(){
    super()
    this.state = ({
      hasCameraPermissions: null,
      scanned: false,
      scannedData: '',
      buttonState: 'normal',
      scannedButtonId: '',
      scannedStudentID: '',
      transactionMessage: '',
    })
  }
  getCameraPermission = async(Id) => {
    const {status} = await Permissions.askAsync (Permissions.CAMERA);
    this.setState ({
      hasCameraPermissions: status === 'granted',
      buttonState: Id,
      scanned: 'false',
    })
  }

  handleBarcodeScanned = async({type,data}) => {
    this.setState = ({
    scannedData: data,
    scanned: true,
    buttonState: 'normal'    
  });
}

handleTransaction = async () => {
  var transactionMessage = null;
  db.collection("Books").doc(this.state.scannedBookID).get().then((doc) => {
    var book = doc.data();
    if (book.bookAvailability){
      this.initiateBookIssue();
      transactionMessage = "Book Issued"
    }
    else {
      this.initiateBookReturn();
      transactionMessage = "Book Returned"
    }
  })
  this.setState({
    transactionMessage: transactionMessage
  })
}

initiateBookIssue = async () => {
  db.collection("Transaction").add({
    'bookID': this.state.scannedBookID,
    'studentID': this.state.scannedStudentID,
    'Date': firebase.firestore.Timestamp.now().toDate(),
    'TransactionType': 'issue',
  })
  db.collection("Books").doc(
    this.state.scannedBookID
  ).update({
    'bookAvailability': false
  })
  db.collection("Students").doc(
    this.state.scannedBookID
  ).update({
    'booksIssued': firebase.firestore.FieldValue.increment(1)
  })
  Alert.alert("Book Issued");
  this.setState({
    scannedBookID: '',
    scannedStudentID: '',
  })
}

initiateBookReturn = async () => {
  db.collection("Transaction").add({
    'bookID': this.state.scannedBookID,
    'studentID': this.state.scannedStudentID,
    'Date': firebase.firestore.Timestamp.now().toDate(),
    'TransactionType': 'return',
  })
  db.collection("Books").doc(
    this.state.scannedBookID
  ).update({
    'bookAvailability': true
  })
  db.collection("Students").doc(
    this.state.scannedBookID
  ).update({
    'booksIssued': firebase.firestore.FieldValue.increment(-1)
  })
  Alert.alert("Book Returned");
  this.setState({
    scannedBookID: '',
    scannedStudentID: '',
  })
}

    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;
      if (buttonState !== 'normal' && hasCameraPermissions) {
      return (
        <BarCodeScanner onBarCodeScanned = {scanned? undefined:this.handleBarcodeScanned}
        style = {StyleSheet.absoluteFillObject}/> 
      );
      }

    else if (buttonState === "normal") {
      return(
        <View style = {styles.container}>
          <View>
            <Image source = {require('../assets/booklogo.jpg')} 
            style = {{width:200,height:200}}/>
            <Text style = {{textAlign: 'center', fontSize: 30}}>
              WiLy
            </Text>
          </View>
          <View style = {styles.inputView}>
            <TextInput style = {styles.inputBox}
              placeholder = 'Book ID'
              value = {this.state.scannedBookID}>
            </TextInput>
            <TouchableOpacity style = {styles.scanButton}
            onPress = {() => this.getCameraPermission("BookID")}>
              <Text style = {styles.buttonText}>
                Scan
              </Text>
            </TouchableOpacity>
          </View>
          <View style = {styles.inputView}>
            <TextInput style = {styles.inputBox}
              placeholder = 'Student ID'
              value = {this.state.scannedBookID}>
            </TextInput>
            <TouchableOpacity style = {styles.scanButton}
            onPress = {() => this.getCameraPermission("StudentID")}>
              <Text style = {styles.buttonText}>
                Scan
              </Text>
            </TouchableOpacity>
          </View>
          <Text style = {styles.transactionAlert}>
            {this.state.transactionMessage}
          </Text>
          <TouchableOpacity style = {styles.submitButton}
          onPress = {async() => {
            var transactionMessage = await this.handleTransaction()}}>
            <Text style = {styles.submitButtonText}>
              Submit
            </Text>
          </TouchableOpacity>
          </View>
      )
    }
  }
}
  const styles = StyleSheet.create({
    container:{
      flex:1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: 'white',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10,
    },
    inputBox: {
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    inputView: {
      flexDirection: 'row',
      margin: 20,
    },
    scanButton:{
      backgroundColor: 'lightblue',
      width: 50,
      borderWidth: 1.5,
    },
    submitButton:{
      backgroundColor: 'lightblue',
      width: 100,
      height: 50
    },
    submitButtonText:{
      padding: 10,
      textAlign: 'center',
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white'
    },
    transactionAlert:{
      fontSize: 20,
      color: 'black'
    }
  });