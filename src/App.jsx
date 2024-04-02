import { useState, useEffect } from "react";
import { app } from "./configs/firebase";
import { onSnapshot, collection } from "firebase/firestore";
import "./App.css";
import Graph from "./components/Graph";
export default function Home() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({
    l1: 0,
    l2: 0,
    l3: 0,
    l4: 0,
    l5: 0,
    l6: 0,
    l7: 0,
    l8: 0,
    l9: 0,
    l10: 0,
  }); // completed level count; eg l3=atleast level 3 completed users
  // const [statData, setStatData] = useState([
  //   0,
  //   0,
  //   0,
  //   0,
  //   0,
  //   0,
  //   0,
  //   0,
  //   0,
  //   0,
  // ]);
  const [searchKey, setSearchKey] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(app, "users"), (snapshot) => {
      const userData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      let sortedData = userData.sort(
        (a, b) => countTrue(b.level) - countTrue(a.level)
      );

      // Adding index after sorting
      sortedData.forEach((item, index) => {
        item.index = index + 1;
      });

      setData(sortedData);
    });

    return () => unsubscribe();
  }, []);

  function countTrue(booleanArray) {
    //function to count the true values in level array
    let count = 0;
    for (let i = 0; i < booleanArray.length; i++) {
      if (booleanArray[i] === true) {
        count++;
      }
    }
    return count;
  }

  useEffect(() => {
    //setting the stat count
    let statCount = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    data.forEach((user) => {
      if (user.level[0] === true) statCount[0]++;
      if (user.level[1] === true) statCount[1]++;
      if (user.level[2] === true) statCount[2]++;
      if (user.level[3] === true) statCount[3]++;
      if (user.level[4] === true) statCount[4]++;
      if (user.level[5] === true) statCount[5]++;
      if (user.level[6] === true) statCount[6]++;
      if (user.level[7] === true) statCount[7]++;
      if (user.level[8] === true) statCount[8]++;
      if (user.level[9] === true) statCount[9]++;
    });
    setStats({
      ...stats,
      l1: statCount[0],
      l2: statCount[1],
      l3: statCount[2],
      l4: statCount[3],
      l5: statCount[4],
      l6: statCount[5],
      l7: statCount[6],
      l8: statCount[7],
      l9: statCount[8],
      l10: statCount[9],
    });
  }, [data]);

  function convertToPercentage(obj) {
    //convert data in stats object to percentage
    const newObj = {};
    for (const key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        newObj[key] = ((obj[key] / data.length) * 100).toFixed(2);
      }
    }
    return newObj;
  }

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
        <div className="graph-container">
          {/* <div className="stat-box">
            <div>
              <h1>{data.length}</h1>
              <h2>Total Users</h2>
            </div>
          </div>
          <div className="stat-box">
            <div>
              <h1>{(stats.l1 / data.length) * 100}%</h1>
              <h2>1 level completed</h2>
            </div>
          </div>
          <div className="stat-box">
            <div>
              <h1>{(stats.l10 / data.length) * 100}%</h1>
              <h2>10 level completed</h2>
            </div>
          </div> */}

          <Graph statData={convertToPercentage(stats)} />
        </div>
        <h1 className="heading">Presiding Officers</h1>

        <div className="table-container style-3">
          <table>
            <tbody>
              <tr className="table-header">
                <th>Rank</th>
                <th>Name</th>
                <th>Email</th>
                <th>Levels Completed</th>
              </tr>
              {data
                .filter(
                  (user) =>
                    user.username.toLowerCase().includes(searchKey) ||
                    user.email.includes(searchKey)
                )

                .map((user) => (
                  <tr key={user.id}>
                    <td>{user.index}</td>
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
