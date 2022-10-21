import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Button, TextInput } from "react-native";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { fetchUsersData } from "../../redux/actions/index";

function Comment(props) {
  const [comments, setComments] = useState([]);
  const [postId, setPostId] = useState("");
  const [text, setText] = useState("");

  useEffect(() => {

    getComment();

    async function matchUserToComment(comments) {
      for (let i = 0; i < comments.length; i++) {
        if (comments[i].hasOwnProperty("user")) {
          continue;
        }
        const user = await props.users.find(x => x.uid === comments[i].creator);
        if (user == undefined) {
          await props.fetchUsersData(comments[i].creator, false)
        } else {
          comments[i].user = user;
        }
      }
      setComments(comments);
    }

    async function getComment() {
      if (props.route.params.postId !== postId) {
        const db = getFirestore();
        let comments = [];
        const querySnapshot = await getDocs(
          collection(
            db,
            "posts",
            props.route.params.uid,
            "userPosts",
            props.route.params.postId,
            "comments"
          )
        );
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const id = doc.id;
          comments.push({
            id,
            ...data,
          });
        });
        await matchUserToComment(comments);
        setPostId(props.route.params.postId);
      } else {
        await matchUserToComment(comments);
      }
    }
  }, [props.route.params.postId, props.users]);

  const onCommentSend = async () => {
    const auth = getAuth();
    const db = getFirestore();
    await addDoc(
      collection(
        db,
        "posts",
        props.route.params.uid,
        "userPosts",
        props.route.params.postId,
        "comments"
      ),
      {
        creator: auth.currentUser.uid,
        text,
      }
    )
      .then(function () {
        props.navigation.popToTop();
      })
      .catch((err) => console.log(err));
  };

  return (
    <View>
      <FlatList
        numColumns={1}
        horizontal={false}
        data={comments}
        renderItem={({ item }) => (
          <View>
            {item.user !== undefined ? <Text>{item.user.name}</Text> : null}
            <Text>{item.text}</Text>
          </View>
        )}
      />

      <View>
        <TextInput
          placeholder="Comment..."
          onChangeText={(text) => setText(text)}
        />
        <Button onPress={() => onCommentSend()} title="Send" />
      </View>
    </View>
  );
}

const mapStateToProps = (store) => ({
  users: store.usersState.users,
  currentUser: store.userState.currentUser
});

const mapDispatchProps = (dispatch) =>
  bindActionCreators({ fetchUsersData }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(Comment);
