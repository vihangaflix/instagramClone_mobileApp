import { getAuth } from "firebase/auth";
import { getFirestore ,deleteDoc, doc, setDoc } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Image, FlatList, Button } from "react-native";
import { connect } from "react-redux";

function Feed(props) {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    if (
      props.usersFollowingLoaded == props.following.length &&
      props.following.length !== 0
    ) {
      props.feed.sort(function (a, b) {
        return a.creation - b.creation;
      });
      setPosts(props.feed);
    }
    console.log(posts);
  }, [props.usersFollowingLoaded, props.feed]);

  const onLikePress = async (userId, postId) => {
    const auth = getAuth();
    const db = getFirestore();

    await setDoc(doc(db, "posts", userId, "userPosts", postId, "likes", auth.currentUser.uid),{})
  };

  const onDislikePress = async (userId, postId) => {
    const auth = getAuth();
    const db = getFirestore();

    await deleteDoc(doc(db, "posts", userId, "userPosts", postId, "likes", auth.currentUser.uid))

  };

  return (
    <View style={styles.container}>
      <View style={styles.containerGalley}>
        <FlatList
          numColumns={1}
          horizontal={false}
          data={posts}
          renderItem={({ item }) => (
            <View style={styles.containerImage}>
              <Text style={styles.container}>{item.user.name}</Text>
              <Image style={styles.image} source={{ uri: item.downloadURL }} />
              { item.currentUserLike ? 
               (
                <Button title="Dislike" onPress={() => onDislikePress(item.user.uid, item.id)} />
               )  :
               (
                <Button title="Like" onPress={() => onLikePress(item.user.uid, item.id)} />
               )
              }
              <Text
                onPress={() =>
                  props.navigation.navigate("Comment", {
                    postId: item.id,
                    uid: item.user.uid,
                  })
                }
              >
                View Comments...
              </Text>
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerInfo: {
    margin: 20,
  },
  containerGalley: {
    flex: 1,
  },
  image: {
    flex: 1,
    aspectRatio: 1 / 1,
  },
  containerImage: {
    flex: 1 / 3,
  },
});

const mapStateToProps = (store) => ({
  currentUser: store.userState.currentUser,
  following: store.userState.following,
  feed: store.usersState.feed,
  usersFollowingLoaded: store.usersState.usersFollowingLoaded,
});

export default connect(mapStateToProps, null)(Feed);
