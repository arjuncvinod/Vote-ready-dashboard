import { useState, useEffect } from "react";
import { app } from "./configs/firebase";
import { onSnapshot, collection} from "firebase/firestore";
import "./App.css";
export default function Home() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({ l1: 0, l2: 0, l3: 0, l10: 0 });// completed level count; eg l3=atleast level 3 completed users
  const [searchKey, setSearchKey] = useState("");

  useEffect(() => {                                                 //fetching data from firebase
    const unsubscribe = onSnapshot(collection(app, "users"), (snapshot) => {
      const userData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setData(userData);
    });

    return () => unsubscribe();
  }, []);
   
  function countTrue(booleanArray) { //function to count the true values in level array
    let count = 0;
    for (let i = 0; i < booleanArray.length; i++) {
        if (booleanArray[i] === true) {
            count++;
        }
    }
    return count;
}

  useEffect(() => {    //setting the stat count
    let statCount1 = 0,
      statCount10 = 0;
    data.forEach((user) => {
      if(countTrue(user.level)>=1)
      statCount1++;
      if(countTrue(user.level)>=10)
      statCount10++;
      
    });
    setStats({ ...stats, l1: statCount1, l10: statCount10 });
  }, [data]);
  return (
  
    <>
      <nav>
        <a href="">Vote Ready</a>
        <div className="search-container">
          <input
            type="text"
            placeholder="search user"
            onChange={(e) => {
              setSearchKey(e.target.value.toLowerCase());
            }}
            value={searchKey}
          />
        </div>
      </nav>
      <main>
        <div className="tiles-container">
          <div className="stat-box">
            <div>
              <h1>{data.length}</h1>
              <h2>Total Users</h2>
            </div>
          </div>
          <div className="stat-box">
            <div>
              <h1>{(stats.l1 / data.length) * 100}%</h1>
              <h2>Lvl 1 completed</h2>
            </div>
          </div>
          <div className="stat-box">
            <div>
              <h1>{(stats.l10 / data.length) * 100}%</h1>
              <h2>Lvl 10 completed</h2>
            </div>
          </div>
        </div>
        <h1 className="heading">Presiding officers</h1>

        <div className="table-container">
          <table>
            <tbody>
              <tr className="table-header">
                <th>Name</th>
                <th>Email</th>
                <th>Current Level</th>
              </tr>
              {data                                                 //filtering data based on search key
                .filter(
                  (user) =>
                    user.username.toLowerCase().includes(searchKey) ||
                    user.email.includes(searchKey)
                )
                .sort((a, b) => a.username.localeCompare(b.username))
                .map((user) => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{countTrue(user.level)}</td>
                  </tr>
                ))}
              {/* {data.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.level}</td>
                </tr>
              ))}
              {data.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.level}</td>
                </tr>
              ))} */}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
