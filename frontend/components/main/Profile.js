import { getAuth, signOut } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  collection,
} from "firebase/firestore";

import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Image, FlatList, Button } from "react-native";

import { connect } from "react-redux";

function Profile(props) {
  const [userPosts, setUserPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    const { currentUser, posts } = props;

    async function fetchData() {
      if (props.route.params.uid === getAuth().currentUser.uid) {
        setUser(currentUser);
        setUserPosts(posts);
      } else {
        const db = getFirestore();
        const docRef = doc(db, "users", props.route.params.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUser(docSnap.data());
        } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
        }

        let posts = [];
        const querySnapshot = await getDocs(
          collection(db, "posts", props.route.params.uid, "userPosts")
        );
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const id = doc.id;
          posts.push({
            id,
            ...data,
          });
        });
        setUserPosts(posts);
      }
    }
    fetchData();

    if (props.following.indexOf(props.route.params.uid) > -1) {
      setFollowing(true);
    } else {
      setFollowing(false);
    }
  }, [props.route.params.uid, props.following]);

  const onFollow = async () => {
    await setDoc(
      doc(
        getFirestore(),
        "following",
        getAuth().currentUser.uid,
        "userFollowing",
        props.route.params.uid
      ),
      {}
    );
  };

  const onUnfollow = async () => {
    await deleteDoc(
      doc(
        getFirestore(),
        "following",
        getAuth().currentUser.uid,
        "userFollowing",
        props.route.params.uid
      ),
      {}
    );
  };

  const onLogout = async () => {
    const auth = getAuth();
    await signOut(auth)
      .then(() => {
        // Sign-out successful.
      })
      .catch((error) => {
        // An error happened.
      });
  };

  if (user === null) {
    return <View />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.containerInfo}>
        <Text>{user.name}</Text>
        <Text>{user.email}</Text>
        {props.route.params.uid !== getAuth().currentUser.uid ? (
          <View>
            {following ? (
              <Button title="Following" onPress={() => onUnfollow()} />
            ) : (
              <Button title="Follow" onPress={() => onFollow()} />
            )}
          </View>
        ) : (
          <Button title="Logout" onPress={() => onLogout()} />
        )}
      </View>

      <View style={styles.containerGalley}>
        <FlatList
          numColumns={3}
          horizontal={false}
          data={userPosts}
          renderItem={({ item }) => (
            <View style={styles.containerImage}>
              <Image style={styles.image} source={{ uri: item.downloadURL }} />
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
  posts: store.userState.posts,
  following: store.userState.following,
});

export default connect(mapStateToProps, null)(Profile);
