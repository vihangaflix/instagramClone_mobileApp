import {
  USER_POST_STATE_CHANGE,
  USER_STATE_CHANGE,
  USER_FOLLOWING_STATE_CHANGE,
  USERS_DATA_STATE_CHANGE,
  USERS_POST_STATE_CHANGE,
  CLEAR_DATA,
  USERS_LIKES_STATE_CHANGE,
} from "../constants/index";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  onSnapshot,
} from "firebase/firestore";

export function clearData() {
  return (dispatch) => {
    dispatch({
      type: CLEAR_DATA,
    });
  };
}

export function fetchUser() {
  return async (dispatch) => {
    const auth = getAuth();
    const db = getFirestore();
    const docRef = doc(db, "users", auth.currentUser.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      await dispatch({
        type: USER_STATE_CHANGE,
        currentUser: { uid: auth.currentUser.uid, ...docSnap.data() },
      });
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
  };
}

export function fetchUserPosts() {
  return async (dispatch) => {
    const auth = getAuth();
    const db = getFirestore();
    let posts = [];
    const querySnapshot = await getDocs(
      collection(db, "posts", auth.currentUser.uid, "userPosts")
    );
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const id = doc.id;
      posts.push({
        id,
        ...data,
      });
    });
    dispatch({
      type: USER_POST_STATE_CHANGE,
      posts: posts,
    });
  };
}

export function fetchUserFollowing() {
  return async (dispatch) => {
    const auth = getAuth();
    const db = getFirestore();
    const q = query(
      collection(db, "following", auth.currentUser.uid, "userFollowing")
    );
    onSnapshot(q, async (querySnapshot) => {
      const following = [];
      querySnapshot.forEach((doc) => {
        following.push(doc.id);
      });
      await dispatch({
        type: USER_FOLLOWING_STATE_CHANGE,
        following,
      });
      for (let i = 0; i < following.length; i++) {
        dispatch(fetchUsersData(following[i], true));
      }
    });
  };
}

export function fetchUsersData(uid, getPosts) {
  return async (dispatch, getState) => {
    const found = getState().usersState.users.find((el) => el.uid === uid);

    if (!found) {
      const db = getFirestore();
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        let user = docSnap.data();
        user.uid = docSnap.id;
        dispatch({
          type: USERS_DATA_STATE_CHANGE,
          user,
        });
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
      if (getPosts) {
        dispatch(fetchUsersFollowingPosts(uid));
      }
    }
  };
}

export function fetchUsersFollowingPosts(uid) {
  return async (dispatch, getState) => {
    const db = getFirestore();
    let posts = [];
    const querySnapshot = await getDocs(
      collection(db, "posts", uid, "userPosts")
    );

    const user = getState().usersState.users.find((el) => el.uid === uid);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const id = doc.id;
      posts.push({
        id,
        ...data,
        user,
      });
    });

    for (let i = 0; i < posts.length; i++) {
      await dispatch(fetchUsersFollowingLikes(uid, posts[i].id));
    }
    await dispatch({
      type: USERS_POST_STATE_CHANGE,
      posts,
      uid,
    });
  };
}

export function fetchUsersFollowingLikes(uid, postId) {
  return async (dispatch, getState) => {
    const auth = getAuth();
    const db = getFirestore();

    let listener = onSnapshot(
      doc(db, "posts", uid, "userPosts", postId, "likes", auth.currentUser.uid),
      async (snapshot) => {
        let currentUserLike = false;

        if (snapshot.exists) {
          if(snapshot.data() != undefined) {
          currentUserLike = true;
        }
      }
        await dispatch({
          type: USERS_LIKES_STATE_CHANGE,
          postId,
          currentUserLike,
        });
      }
    );
  };
}
