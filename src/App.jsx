import { useState, useEffect } from "react";
import { app } from "./configs/firebase";
import { onSnapshot, collection } from "firebase/firestore";
import "./App.css";
import Graph from "./components/Graph";

export default function Home() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({});
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
    // Function to count the true values in the level array
    if (!booleanArray) return 0; // Handle case where booleanArray is null or undefined
    let count = 0;
    for (let i = 0; i < booleanArray.length; i++) {
      if (booleanArray[i] === true) {
        count++;
      }
    }
    return count;
  }

  useEffect(() => {
    // Setting the stat count dynamically based on the number of levels
    const numberOfLevels = data.length > 0 ? data[0].level.length : 0;
    const statCount = {};
    for (let i = 1; i <= numberOfLevels; i++) {
      statCount[`l${i}`] = 0;
    }

    data.forEach((user) => {
      const levelsCompleted = user.level || Array(numberOfLevels).fill(false); // Fill with false if user.level is null or undefined
      levelsCompleted.forEach((level, index) => {
        if (level) {
          statCount[`l${index + 1}`]++;
        }
      });
    });

    setStats(statCount);
  }, [data]);

  function convertToPercentage(obj) {
    // Convert data in stats object to percentage
    const newObj = {};
    const totalCount = data.length; // Total number of users
    for (const key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        newObj[key] = ((obj[key] / totalCount) * 100).toFixed();
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
        <h3 className="reg-count">
          Registered Officers: <span> {data.length}</span>
        </h3>
        <div className="graph-container">
          <Graph
            numLevels={data.length > 0 ? data[0].level.length : 0}
            statData={convertToPercentage(stats)}
          />
        </div>
        <h1 className="heading">Presiding Officers</h1>

        <div className="table-container style-3">
          <table>
            <tbody>
              <tr className="table-header">
                <th>Rank</th>
                <th>Id</th>
                <th className="tname">Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Levels Completed</th>
              </tr>
              {data
                .filter(
                  (user) =>
                    user.username.toLowerCase().includes(searchKey) ||
                    user.email.includes(searchKey) || (user.ID && user.ID.includes(searchKey))
                )
                .map((user) => (
                  <tr key={user.id}>
                    <td>{user.index}</td>
                    <td>{user.ID}</td>
                    <td>{user.username}</td>
                    <td >{user.email}</td>
                    <td>{user.Phone}</td>
                    <td>{countTrue(user.level)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
