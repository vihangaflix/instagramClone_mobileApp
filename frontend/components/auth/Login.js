import React, { Component } from "react";
import { Button, View, TextInput } from "react-native";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

export default class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
    };

    this.onSignUp = this.onSignUp.bind(this);
  }

  async onSignUp() {
    const { email, password } = this.state;
    const auth = getAuth();
    await signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in 
      console.log(userCredential);
      // ...
    })
    .catch((error) => {
      console.log(error);
      // ..
    });
  
  }

  render() {
    return (
      <View>
        <TextInput
          placeholder="email"
          onChangeText={(email) => this.setState({ email: email })}
        />
        <TextInput
          placeholder="password"
          secureTextEntry={true}
          onChangeText={(password) => this.setState({ password: password })}
        />
        <Button onPress={() => this.onSignUp()} title="Sign Up" />
      </View>
    );
  }
}
